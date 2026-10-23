import {
  NETWORK_MESSAGE_CODES as NMC,
  VALIDATION_CODES as VC,
  ValidationErrorData,
  ValidationIssue,
  ValidationPath,
} from "@anto-sh/admin-network-shared";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate, ValidatorOptions } from "class-validator";
import { ERROR_CODES } from "../../config/constants";
import { NetworkError } from "../class/network-error";
import { getRequestStructureIssue } from "./request-structure";
import { getArrayItemRules } from "./validate-items";
import { getOwnPropertyValue, getPathSegment } from "./property-utils";
import {
  filterValidationIssues,
  normalizeValidationErrors,
  ValidationDiagnostic,
} from "./validation-errors";

const validatorOptions: ValidatorOptions = {
  // Reject undecorated fields, collect all errors, and omit submitted values.
  whitelist: true,
  forbidNonWhitelisted: true,
  stopAtFirstError: false,
  validationError: { target: false, value: false },
};

export interface ValidateDtoOptions {
  /** Skips omitted owner fields; supplied array elements are validated in full. */
  partial?: boolean;
  onDiagnostic?: (diagnostic: ValidationDiagnostic) => void;
}

/**
 * Finds input keys removed by class-transformer before the whitelist check.
 * Comparing both structures prevents these fields from being silently accepted.
 */
// TODO: Reconsider key comparison for @Expose aliases and transforms that reshape
// objects; a supported input key can disappear without being an unknown field.
const collectDroppedProperties = (
  source: unknown,
  transformed: unknown,
  path: ValidationPath = [],
): ValidationIssue[] => {
  if (
    source === null ||
    typeof source !== "object" ||
    transformed === null ||
    typeof transformed !== "object" ||
    Array.isArray(source) !== Array.isArray(transformed)
  )
    return [];

  const issues: ValidationIssue[] = [];
  for (const property of Object.keys(source)) {
    const propertyPath = [...path, getPathSegment(source, property)];
    if (!Object.hasOwn(transformed, property)) {
      issues.push({ path: propertyPath, code: VC.UNKNOWN_FIELD });
    } else {
      issues.push(
        ...collectDroppedProperties(
          (source as Record<PropertyKey, unknown>)[property],
          (transformed as Record<PropertyKey, unknown>)[property],
          propertyPath,
        ),
      );
    }
  }
  return issues;
};

/**
 * Creates the shared HTTP validation error for DTOs and manual checks, such as references.
 * Filters cascading errors before sending; an empty issue list produces a fallback.
 */
export const createValidationError = (
  issues: readonly ValidationIssue[],
  statusCode: ERROR_CODES = ERROR_CODES.VALIDATION,
): NetworkError => {
  const validationErrors = filterValidationIssues(issues);
  const data: ValidationErrorData = {
    validationErrors: validationErrors.length
      ? validationErrors
      : [{ path: [], code: VC.INVALID_VALUE }],
  };
  return new NetworkError(
    {
      statusCode,
      networkMessage: { code: NMC.COMMON_ERRORS.VALIDATION },
      data,
    },
    "Ошибки валидации",
  );
};

/**
 * Validates a root DTO array and returns transformed instances in the same order.
 * Error paths include each DTO's numeric index; persist the returned transformed values.
 * Invalid input becomes a NetworkError with status 422; programming errors propagate.
 */
export function validateDto<T extends object>(
  Dto: ClassConstructor<T>,
  body: unknown,
  options: ValidateDtoOptions & { array: true },
): Promise<T[]>;
/**
 * Validates a single DTO and returns its transformed instance for persistence.
 * With partial: true, omitted fields are skipped and an empty update is rejected.
 * Invalid input becomes a NetworkError with status 422; programming errors propagate.
 */
export function validateDto<T extends object>(
  Dto: ClassConstructor<T>,
  body: unknown,
  options?: ValidateDtoOptions & { array?: false },
): Promise<T>;

// Overloads return an array only when array: true is supplied.
export async function validateDto<T extends object>(
  Dto: ClassConstructor<T>,
  body: unknown,
  options: ValidateDtoOptions & { array?: boolean } = {},
): Promise<T | T[]> {
  if (
    options.array
      ? !Array.isArray(body)
      : body === null || typeof body !== "object" || Array.isArray(body)
  ) {
    throw createValidationError([
      { path: [], code: options.array ? VC.ARRAY : VC.INVALID_REQUEST },
    ]);
  }

  const bodies: readonly unknown[] = Array.isArray(body) ? body : [body];

  // Reject oversized arrays before traversal and transforms create work for each item.
  const arrayItems = getArrayItemRules(Dto);
  const oversizedArrays: ValidationIssue[] = [];
  for (const rule of arrayItems) {
    for (const [index, value] of bodies.entries()) {
      const items = getOwnPropertyValue(value, rule.property);
      if (Array.isArray(items) && items.length > rule.maxSize) {
        oversizedArrays.push({
          path: options.array ? [index, rule.property] : [rule.property],
          code: VC.ARRAY_MAX_SIZE,
          params: { max: rule.maxSize },
        });
      }
    }
  }
  if (oversizedArrays.length) throw createValidationError(oversizedArrays);

  // Check before transformation, which can throw on unsafe input before validators run.
  // Inspect the entire batch so structural limits apply to the whole request.
  const structureIssue = getRequestStructureIssue(body);
  if (structureIssue) throw createValidationError([structureIssue]);

  const dtos: T[] = [];
  const issues: ValidationIssue[] = [];
  for (const [index, value] of bodies.entries()) {
    // The batch index belongs to the request path, outside the DTO fields.
    const path: ValidationPath = options.array ? [index] : [];
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      issues.push({ path, code: VC.OBJECT });
      continue;
    }
    if (options.partial && Object.keys(value).length === 0) {
      issues.push({ path, code: VC.EMPTY_UPDATE });
      continue;
    }

    // Instantiate and transform before running class-validator.
    const dto = plainToInstance(Dto, value);
    issues.push(...collectDroppedProperties(value, dto, path));
    for (const rule of arrayItems) {
      const items = getOwnPropertyValue(dto, rule.property);
      if (!Array.isArray(items)) {
        // Child validators can shadow an inherited IsArray; still enforce array type.
        // The owning DTO handles null and undefined through requiredness and IsOptional.
        if (items !== undefined && items !== null) {
          issues.push({ path: [...path, rule.property], code: VC.ARRAY });
        }
        continue;
      }
      // The owner's Transform may have enlarged the array.
      if (items.length > rule.maxSize) {
        issues.push({
          path: [...path, rule.property],
          code: VC.ARRAY_MAX_SIZE,
          params: { max: rule.maxSize },
        });
        continue;
      }

      for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        const itemPath = [...path, rule.property, itemIndex];
        // Unlike each: true, a wrapper DTO gives the exact index and supports Transform.
        const itemDto = plainToInstance(rule.dto, { value: items[itemIndex] });
        issues.push(
          ...collectDroppedProperties(items[itemIndex], itemDto.value, itemPath),
        );
        // Partial updates may omit a field, but supplied elements require full validation.
        const itemErrors = await validate(itemDto, validatorOptions);
        issues.push(
          ...normalizeValidationErrors(itemErrors, {
            source: itemDto,
            path: itemPath,
            // Report ["items", 2], without the technical "value" segment.
            unwrapRootProperty: "value",
            onDiagnostic: options.onDiagnostic,
          }),
        );
        // Owner validators and callers must receive the transformed element.
        items[itemIndex] = itemDto.value;
      }
    }

    // Owner checks such as ArrayUnique use transformed items. Skip undefined, not null.
    const errors = await validate(dto, {
      ...validatorOptions,
      skipUndefinedProperties: options.partial ?? false,
    });
    issues.push(
      ...normalizeValidationErrors(errors, {
        source: dto,
        path,
        onDiagnostic: options.onDiagnostic,
      }),
    );
    dtos.push(dto);
  }

  // Reject on the complete issue list, before createValidationError filters messages.
  if (issues.length > 0) throw createValidationError(issues);
  return options.array ? dtos : dtos[0];
}
