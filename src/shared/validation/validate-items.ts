import { VALIDATION_CODES as VC } from "@anto-sh/admin-network-shared";
import { ClassConstructor } from "class-transformer";
import { ArrayMaxSize, IsArray } from "class-validator";
import { validationContext } from "./validation-context";

export interface ValidateItemsOptions {
  maxSize: number;
}

interface ItemRuleMetadata extends ValidateItemsOptions {
  dto: ClassConstructor<{ value: unknown }>;
}

interface ArrayItemRule extends ItemRuleMetadata {
  property: string;
}

// Own metadata avoids library internals; each prototype has independent rules.
const itemRules = new WeakMap<object, Map<string, ItemRuleMetadata>>();

/**
 * Declares an array whose elements are validated through a wrapper DTO's value field.
 * Registers IsArray and ArrayMaxSize so the field is recognized by the whitelist
 * and the early size check uses the same limit as class-validator.
 * Supplied arrays are always checked; ValidateIf and validation groups are not applied.
 * Configure requiredness and null handling separately on the owning DTO's field.
 */
export const ValidateItems = (
  dto: ClassConstructor<{ value: unknown }>,
  options: ValidateItemsOptions,
): PropertyDecorator => {
  // Capture the limit so later options mutations cannot desynchronize the checks.
  const { maxSize } = options;
  if (!Number.isSafeInteger(maxSize) || maxSize < 0) {
    throw new Error(
      "ValidateItems requires a non-negative safe integer maxSize",
    );
  }

  return (target, propertyKey) => {
    if (typeof target === "function" || typeof propertyKey !== "string") {
      throw new Error(
        "ValidateItems supports only instance properties with string names",
      );
    }

    const rules = itemRules.get(target) ?? new Map<string, ItemRuleMetadata>();
    if (rules.has(propertyKey)) {
      throw new Error(
        `ValidateItems is already declared for property ${propertyKey}`,
      );
    }
    rules.set(propertyKey, { dto, maxSize });
    itemRules.set(target, rules);

    IsArray(validationContext({ code: VC.ARRAY }))(target, propertyKey);
    ArrayMaxSize(
      maxSize,
      validationContext({ code: VC.ARRAY_MAX_SIZE, params: { max: maxSize } }),
    )(target, propertyKey);
  };
};

/**
 * Reads direct-field rules from the DTO and its ancestors, preferring child rules.
 * Does not discover rules inside nested DTOs or traverse the entire model graph.
 */
export const getArrayItemRules = (
  Dto: ClassConstructor<object>,
): ArrayItemRule[] => {
  const rules = new Map<string, ItemRuleMetadata>();
  for (
    let prototype: object | null = Dto.prototype;
    prototype && prototype !== Object.prototype;
    prototype = Object.getPrototypeOf(prototype)
  ) {
    for (const [property, rule] of itemRules.get(prototype) ?? []) {
      if (!rules.has(property)) rules.set(property, rule);
    }
  }

  // Return copies to keep callers from mutating stored rules.
  return Array.from(rules, ([property, rule]) => ({
    property,
    ...rule,
  }));
};
