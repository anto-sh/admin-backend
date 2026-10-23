import {
  VALIDATION_CODES,
  ValidationCode,
  ValidationIssueDetails,
  ValidationParamsFor,
} from "@anto-sh/admin-network-shared";
import { ValidationOptions } from "class-validator";

const codes = new Set<string>(Object.values(VALIDATION_CODES));
// Codes without parameters have ValidationParamsFor<Code> = never.
type ParameterizedCode = {
  [Code in ValidationCode]: [ValidationParamsFor<Code>] extends [never]
    ? never
    : Code;
}[ValidationCode];

// Each current parameterized code takes one number; satisfies checks catalog coverage.
const parameterKeys = {
  [VALIDATION_CODES.MAX_LENGTH]: "max",
  [VALIDATION_CODES.MIN]: "min",
  [VALIDATION_CODES.MAX]: "max",
  [VALIDATION_CODES.ARRAY_MAX_SIZE]: "max",
  [VALIDATION_CODES.REQUEST_TOO_LARGE]: "maxBytes",
} satisfies { [Code in ParameterizedCode]: keyof ValidationParamsFor<Code> };

/** Narrows a non-null, non-array object for reading validation metadata. */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Builds a class-validator context containing an error code and its parameters.
 * For example, MaxLength receives our code and { max: limit }, not a user-facing message.
 * ValidationIssueDetails checks the code/parameter combination at compile time.
 */
export const validationContext = (
  details: ValidationIssueDetails,
): Pick<ValidationOptions, "context"> => ({ context: details });

/**
 * Reads an untyped context from a class-validator result and checks its code and parameters.
 * Returns undefined for invalid metadata so the normalizer can emit a fallback
 * and report the incorrectly configured rule.
 */
export const readValidationContext = (
  context: unknown,
): ValidationIssueDetails | undefined => {
  if (
    !isRecord(context) ||
    !Object.hasOwn(context, "code") ||
    typeof context.code !== "string" ||
    !codes.has(context.code)
  ) {
    return undefined;
  }

  const code = context.code as ValidationCode;
  const parameterKey = Object.hasOwn(parameterKeys, code)
    ? parameterKeys[code as ParameterizedCode]
    : undefined;
  if (!parameterKey) {
    // Parameterless codes must not carry params.
    return context.params === undefined
      ? ({ code } as ValidationIssueDetails)
      : undefined;
  }

  if (
    !Object.hasOwn(context, "params") ||
    !isRecord(context.params) ||
    Object.keys(context.params).length !== 1 ||
    !Object.hasOwn(context.params, parameterKey)
  ) {
    return undefined;
  }

  const parameter = context.params[parameterKey];
  if (typeof parameter !== "number" || !Number.isFinite(parameter))
    return undefined;

  // Return only checked fields, never the original context object.
  return {
    code,
    params: { [parameterKey]: parameter },
  } as ValidationIssueDetails;
};
