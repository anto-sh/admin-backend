import "reflect-metadata";
import { VALIDATION_CODES as VC } from "@anto-sh/admin-network-shared";
import { Transform } from "class-transformer";
import { ValidateBy } from "class-validator";
import { describe, expect, it, vi } from "vitest";
import { NetworkError } from "../../src/shared/class/network-error";
import { trimStringTransform } from "../../src/shared/transformers/trim-string";
import {
  ValidateItems,
  validateDto,
  validationContext,
} from "../../src/shared/validation";

describe("validateDto: asynchronous validation", () => {
  it.each([true, false])(
    "awaits an owner validator resolving to %s",
    async (isValid) => {
      let completeRule!: (result: boolean) => void;
      const ruleResult = new Promise<boolean>((resolve) => {
        completeRule = resolve;
      });
      let markRuleStarted!: () => void;
      const ruleStarted = new Promise<void>((resolve) => {
        markRuleStarted = resolve;
      });
      const validateName = vi.fn((_value: unknown) => {
        markRuleStarted();
        return ruleResult;
      });

      class NameDto {
        @Transform(trimStringTransform)
        @ValidateBy(
          {
            name: "delayedName",
            async: true,
            validator: { validate: validateName },
          },
          validationContext({ code: VC.FORMAT }),
        )
        name!: string;
      }

      const body = { name: "  First  " };
      const validation = validateDto(NameDto, body);
      const onSettled = vi.fn();
      void validation.then(onSettled, onSettled);

      await ruleStarted;
      expect(validateName.mock.calls.map(([value]) => value)).toEqual(["First"]);
      expect(onSettled).not.toHaveBeenCalled();

      completeRule(isValid);
      if (isValid) {
        const dto = await validation;
        expect(dto).toBeInstanceOf(NameDto);
        expect(dto.name).toBe("First");
      } else {
        await expect(validation).rejects.toBeInstanceOf(NetworkError);
        await expect(validation).rejects.toHaveProperty("statusCode", 422);
        await expect(validation).rejects.toHaveProperty("data", {
          validationErrors: [{ path: ["name"], code: VC.FORMAT }],
        });
      }
      expect(body).toEqual({ name: "  First  " });
    },
  );

  it.each([true, false])(
    "awaits an item validator resolving to %s before checking the owner",
    async (isValid) => {
      let completeRule!: (result: boolean) => void;
      const ruleResult = new Promise<boolean>((resolve) => {
        completeRule = resolve;
      });
      let markRuleStarted!: () => void;
      const ruleStarted = new Promise<void>((resolve) => {
        markRuleStarted = resolve;
      });
      const validateItem = vi.fn((_value: unknown) => {
        markRuleStarted();
        return ruleResult;
      });
      const validateOwner = vi.fn((_value: unknown) => isValid);

      class ItemDto {
        @Transform(trimStringTransform)
        @ValidateBy(
          {
            name: "delayedItem",
            async: true,
            validator: { validate: validateItem },
          },
          validationContext({ code: VC.FORMAT }),
        )
        value!: string;
      }

      class RequestDto {
        @ValidateItems(ItemDto, { maxSize: 1 })
        @ValidateBy(
          {
            name: "ownerItems",
            validator: { validate: validateOwner },
          },
          {
            ...validationContext({ code: VC.FORMAT }),
            message: "Owner item rule failed",
          },
        )
        items!: string[];
      }

      const body = { items: ["  First  "] };
      const validation = validateDto(RequestDto, body);
      const onSettled = vi.fn();
      void validation.then(onSettled, onSettled);

      await ruleStarted;
      expect(validateItem.mock.calls.map(([value]) => value)).toEqual(["First"]);
      expect(validateOwner).not.toHaveBeenCalled();
      expect(onSettled).not.toHaveBeenCalled();

      completeRule(isValid);
      if (isValid) {
        const dto = await validation;
        expect(dto).toBeInstanceOf(RequestDto);
        expect(dto.items).toEqual(["First"]);
      } else {
        await expect(validation).rejects.toBeInstanceOf(NetworkError);
        await expect(validation).rejects.toHaveProperty("statusCode", 422);
        await expect(validation).rejects.toHaveProperty("data", {
          validationErrors: expect.arrayContaining([
            { path: ["items", 0], code: VC.FORMAT },
            { path: ["items"], code: VC.FORMAT },
          ]),
        });
        await expect(validation).rejects.toHaveProperty(
          "data.validationErrors.length",
          2,
        );
      }
      expect(validateOwner.mock.calls.map(([value]) => value)).toEqual([
        ["First"],
      ]);
      expect(body).toEqual({ items: ["  First  "] });
    },
  );

  it.each([true, false])(
    "awaits a later batch validator resolving to %s",
    async (isValid) => {
      let completeFirst!: (result: boolean) => void;
      const firstResult = new Promise<boolean>((resolve) => {
        completeFirst = resolve;
      });
      let completeSecond!: (result: boolean) => void;
      const secondResult = new Promise<boolean>((resolve) => {
        completeSecond = resolve;
      });
      let markSecondStarted!: () => void;
      const secondStarted = new Promise<void>((resolve) => {
        markSecondStarted = resolve;
      });

      class NameDto {
        @Transform(trimStringTransform)
        @ValidateBy(
          {
            name: "delayedBatchName",
            async: true,
            validator: {
              validate(value: unknown) {
                if (value === "First") return firstResult;
                markSecondStarted();
                return secondResult;
              },
            },
          },
          validationContext({ code: VC.FORMAT }),
        )
        name!: string;
      }

      const body = [{ name: "  First  " }, { name: "  Second  " }];
      const validation = validateDto(NameDto, body, { array: true });
      const onSettled = vi.fn();
      void validation.then(onSettled, onSettled);

      completeFirst(true);
      await secondStarted;
      await Promise.resolve();
      expect(onSettled).not.toHaveBeenCalled();

      completeSecond(isValid);
      if (isValid) {
        const dtos = await validation;
        expect(dtos).toHaveLength(2);
        expect(dtos[0]).toBeInstanceOf(NameDto);
        expect(dtos[1]).toBeInstanceOf(NameDto);
        expect(dtos.map((dto) => dto.name)).toEqual(["First", "Second"]);
      } else {
        await expect(validation).rejects.toBeInstanceOf(NetworkError);
        await expect(validation).rejects.toHaveProperty("statusCode", 422);
        await expect(validation).rejects.toHaveProperty("data", {
          validationErrors: [{ path: [1, "name"], code: VC.FORMAT }],
        });
      }
      expect(body).toEqual([{ name: "  First  " }, { name: "  Second  " }]);
    },
  );
});
