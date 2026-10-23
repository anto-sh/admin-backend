/** Reads an own property without assuming the type of its value. */
export const getOwnPropertyValue = (
  source: unknown,
  property: PropertyKey,
): unknown =>
  source !== null &&
  typeof source === "object" &&
  Object.hasOwn(source, property)
    ? (source as Record<PropertyKey, unknown>)[property]
    : undefined;

/** Uses numeric segments for array indices and preserves object keys such as "0". */
export const getPathSegment = (
  source: unknown,
  property: string,
): string | number => {
  const index = Number(property);
  return Array.isArray(source) &&
    Number.isSafeInteger(index) &&
    index >= 0 &&
    String(index) === property
    ? index
    : property;
};
