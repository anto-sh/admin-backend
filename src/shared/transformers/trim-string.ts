import type { TransformFnParams } from "class-transformer";

/**
 * Trims string values passed to a class-transformer Transform callback.
 * Preserves other values so DTO validators can report missing values and wrong types.
 */
export const trimStringTransform = ({ value }: TransformFnParams): unknown =>
  typeof value === "string" ? value.trim() : value;
