import {
  VALIDATION_CODES as VC,
  ValidationCode,
  ValidationIssue,
  ValidationPath,
} from "@anto-sh/admin-network-shared";
import { ValidationError } from "class-validator";
import { readValidationContext } from "./validation-context";

type ValidationStage = "required" | "type" | "constraint";

// A path tree finds blocking ancestors without comparing every pair of issues.
interface BlockingPathNode {
  blocksDescendants: boolean;
  children: Map<string | number, BlockingPathNode>;
}

// Requiredness precedes type checks, then value constraints.
// INTEGER is a numeric constraint: -1.5 can fail INTEGER and MIN; a string fails NUMBER.
const stages: Record<ValidationCode, ValidationStage | undefined> = {
  [VC.REQUIRED]: "required",
  [VC.STRING]: "type",
  [VC.NUMBER]: "type",
  [VC.INTEGER]: "constraint",
  [VC.OBJECT]: "type",
  [VC.ARRAY]: "type",
  [VC.MAX_LENGTH]: "constraint",
  [VC.MIN]: "constraint",
  [VC.MAX]: "constraint",
  [VC.ARRAY_MAX_SIZE]: "constraint",
  [VC.FORMAT]: "constraint",
  [VC.IMAGE_PATH]: "constraint",
  [VC.UNKNOWN_FIELD]: "constraint",
  [VC.INVALID_REQUEST]: "type",
  [VC.EMPTY_UPDATE]: "constraint",
  [VC.INVALID_ID]: "constraint",
  [VC.INVALID_JSON]: "constraint",
  [VC.REQUEST_TOO_LARGE]: "constraint",
  [VC.REFERENCE_NOT_FOUND]: "constraint",
  // Keep missing-context fallbacks visible regardless of other error priorities.
  [VC.INVALID_VALUE]: undefined,
};

const priorities: Record<ValidationStage, number> = {
  required: 0,
  type: 1,
  constraint: 2,
};

/** Reports only the path and rule name, without submitted values or validator messages. */
export interface ValidationDiagnostic {
  path: ValidationPath;
  constraint: string;
}

export interface NormalizeValidationOptions {
  /** Original structure used to distinguish array index 0 from object key "0". */
  source?: unknown;
  /** Prefix for a separately validated request fragment, such as ["items", 0]. */
  path?: ValidationPath;
  /** Removes a technical wrapper field, such as value, only at the root level. */
  unwrapRootProperty?: string;
  onDiagnostic?: (diagnostic: ValidationDiagnostic) => void;
}

/** Logs a missing or invalid rule context without including submitted values. */
const reportDiagnostic = (diagnostic: ValidationDiagnostic): void => {
  console.warn("Validation rule has no valid error context", diagnostic);
};

/** Reads a value at the given path without accessing inherited properties. */
export const getValidationValue = (
  source: unknown,
  path: ValidationPath,
): unknown => {
  let value = source;
  for (const segment of path) {
    if (
      value === null ||
      typeof value !== "object" ||
      !Object.hasOwn(value, segment)
    ) {
      return undefined;
    }
    value = (value as Record<PropertyKey, unknown>)[segment];
  }
  return value;
};

/**
 * Flattens a class-validator error tree into path + code + params issues.
 * Omits constraint messages; the frontend generates messages from our codes.
 * Priority filtering is performed separately by filterValidationIssues.
 */
export const normalizeValidationErrors = (
  errors: readonly ValidationError[],
  options: NormalizeValidationOptions = {},
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const diagnose = options.onDiagnostic ?? reportDiagnostic;

  /** Walks one error subtree while preserving its request path and source structure. */
  const visit = (
    nodes: readonly ValidationError[],
    prefix: ValidationPath,
    source: unknown,
    unwrapRootProperty?: string,
  ): void => {
    for (const error of nodes) {
      const property = error.property;
      // Missing property means the validation root; "" remains a valid JSON key.
      const hasProperty = typeof property === "string";
      const index = hasProperty ? Number(property) : NaN;
      const segment =
        Array.isArray(source) &&
        Number.isSafeInteger(index) &&
        index >= 0 &&
        String(index) === property
          ? index
          : property;
      const path =
        hasProperty && property !== unwrapRootProperty
          ? [...prefix, segment]
          : [...prefix];
      const constraints = Object.keys(error.constraints ?? {});

      for (const constraint of constraints) {
        if (constraint === "whitelistValidation") {
          issues.push({ path, code: VC.UNKNOWN_FIELD });
          continue;
        }

        const context =
          error.contexts && Object.hasOwn(error.contexts, constraint)
            ? (error.contexts[constraint] as unknown)
            : undefined;
        const details = readValidationContext(context);
        if (details) {
          issues.push({ path, ...details });
        } else {
          issues.push({ path, code: VC.INVALID_VALUE });
          diagnose({ path: [...path], constraint });
        }
      }

      if (error.children?.length) {
        // Unwrapping changes the output path, not the actual source property.
        const childSource = hasProperty
          ? getValidationValue(source, [property])
          : source;
        // Nested fields named value are real fields and must not be unwrapped.
        visit(error.children, path, childSource);
      } else if (constraints.length === 0) {
        issues.push({ path, code: VC.INVALID_VALUE });
        diagnose({ path: [...path], constraint: "unknownValidationError" });
      }
    }
  };

  visit(errors, options.path ?? [], options.source, options.unwrapRootProperty);
  return issues;
};

/**
 * Keeps all issues from each field's highest-priority category, then removes
 * descendant issues blocked by a required/type error and deduplicates exact matches.
 */
export const filterValidationIssues = (
  issues: readonly ValidationIssue[],
): ValidationIssue[] => {
  const fieldPriorities = new Map<string, number>();
  for (const issue of issues) {
    const stage = stages[issue.code];
    if (!stage) continue;
    // JSON preserves segment boundaries and types: ["items", 0] != ["items", "0"].
    const key = JSON.stringify(issue.path);
    fieldPriorities.set(
      key,
      Math.min(fieldPriorities.get(key) ?? Infinity, priorities[stage]),
    );
  }

  // Keep the category, not a single issue: INTEGER and MIN can remain together.
  const selected = issues.filter((issue) => {
    const stage = stages[issue.code];
    return (
      !stage ||
      priorities[stage] === fieldPriorities.get(JSON.stringify(issue.path))
    );
  });
  // A parent type error blocks child issues. Size errors do not;
  // validateDto rejects oversized configured arrays before item validation.
  const blockedRoot: BlockingPathNode = {
    blocksDescendants: false,
    children: new Map(),
  };
  for (const issue of selected) {
    const stage = stages[issue.code];
    if (stage !== "required" && stage !== "type") continue;

    let node = blockedRoot;
    for (const segment of issue.path) {
      let child = node.children.get(segment);
      if (!child) {
        child = { blocksDescendants: false, children: new Map() };
        node.children.set(segment, child);
      }
      node = child;
    }
    node.blocksDescendants = true;
  }

  /** Checks strict ancestors only, keeping the selected issues for the field itself. */
  const hasBlockingParent = (path: ValidationPath): boolean => {
    let node: BlockingPathNode | undefined = blockedRoot;
    for (const segment of path) {
      if (node.blocksDescendants) return true;
      node = node.children.get(segment);
      if (!node) return false;
    }
    return false;
  };
  const seen = new Set<string>();

  return selected.filter((issue) => {
    // Preserve INVALID_VALUE under blocked parents to expose missing rule contexts.
    if (stages[issue.code] && hasBlockingParent(issue.path)) return false;

    // Different rules can produce the same network issue.
    const key = JSON.stringify([issue.path, issue.code, issue.params]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
