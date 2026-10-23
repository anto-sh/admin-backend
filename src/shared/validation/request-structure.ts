import {
  VALIDATION_CODES as VC,
  ValidationIssue,
  ValidationPath,
} from "@anto-sh/admin-network-shared";
import { getPathSegment } from "./property-utils";

// Structural limits protect class-transformer; DTOs define business limits.
const MAX_REQUEST_DEPTH = 64;
const MAX_REQUEST_NODES = 10_000;

/**
 * Checks that the input structure is safe to traverse before class-transformer runs.
 * Returns the first issue; DTO validators check field types and required values.
 */
export const getRequestStructureIssue = (
  body: unknown,
): ValidationIssue | undefined => {
  // An explicit stack prevents the depth check itself from overflowing the call stack.
  const pending: { value: unknown; path: ValidationPath }[] = [
    { value: body, path: [] },
  ];
  // Count the root once, then each property or array element.
  let remainingNodes = MAX_REQUEST_NODES - 1;

  while (pending.length) {
    const { value, path } = pending.pop()!;
    if (path.length > MAX_REQUEST_DEPTH) {
      return { path: [], code: VC.INVALID_REQUEST };
    }
    // Field validators handle null; partial updates can contain undefined.
    if (value === null || value === undefined) continue;
    if (typeof value !== "object") {
      if (!["string", "number", "boolean"].includes(typeof value)) {
        return { path: [], code: VC.INVALID_REQUEST };
      }
      continue;
    }

    const isArray = Array.isArray(value);
    const prototype = Object.getPrototypeOf(value);
    // Accept plain JSON objects, not class instances, Dates, or Maps.
    if (!isArray && prototype !== Object.prototype && prototype !== null) {
      return { path: [], code: VC.INVALID_REQUEST };
    }

    const properties = Object.keys(value);
    // Check the full width before pushing children onto the stack.
    remainingNodes -= properties.length;
    if (remainingNodes < 0) {
      return { path: [], code: VC.INVALID_REQUEST };
    }

    for (const property of properties) {
      const propertyPath = [...path, getPathSegment(value, property)];
      // constructor can affect type detection; class-transformer silently skips __proto__.
      if (property === "constructor" || property === "__proto__") {
        return { path: propertyPath, code: VC.UNKNOWN_FIELD };
      }
      pending.push({
        value: (value as Record<PropertyKey, unknown>)[property],
        path: propertyPath,
      });
    }
  }
  return undefined;
};
