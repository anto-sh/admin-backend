import "reflect-metadata";
import { VALIDATION_CODES as VC } from "@anto-sh/admin-network-shared";
import { Transform } from "class-transformer";
import { IsString } from "class-validator";
import { describe, expect, it } from "vitest";
import {
  ValidateItems,
  validateDto,
  validationContext,
} from "../../src/shared/validation";

describe("validateDto: transformation exceptions", () => {
  it("preserves an exception thrown by an owner DTO transformation", async () => {
    const error = new Error("Owner transformation failed");

    class NamedDto {
      @Transform(() => {
        throw error;
      })
      @IsString(validationContext({ code: VC.STRING }))
      name!: string;
    }

    await expect(validateDto(NamedDto, { name: "First" })).rejects.toBe(error);
  });

  it("preserves an item transformation exception after an earlier invalid item", async () => {
    const error = new Error("Item transformation failed");

    class StringItemDto {
      @Transform(({ value }) => {
        if (value === "fail") throw error;
        return value;
      })
      @IsString(validationContext({ code: VC.STRING }))
      value!: string;
    }

    class LabelsDto {
      @ValidateItems(StringItemDto, { maxSize: 2 })
      labels!: string[];
    }

    const body = { labels: [7, "fail"] };

    await expect(validateDto(LabelsDto, body)).rejects.toBe(error);
    expect(body).toEqual({ labels: [7, "fail"] });
  });

  it("preserves a transformation exception after an earlier invalid batch DTO", async () => {
    const error = new Error("Batch DTO transformation failed");

    class NamedDto {
      @Transform(({ value }) => {
        if (value === "fail") throw error;
        return value;
      })
      @IsString(validationContext({ code: VC.STRING }))
      name!: string;
    }

    const body = [{ name: 7 }, { name: "fail" }];

    await expect(validateDto(NamedDto, body, { array: true })).rejects.toBe(error);
    expect(body).toEqual([{ name: 7 }, { name: "fail" }]);
  });

  it("preserves a thrown value that is not an Error instance", async () => {
    const failure = { reason: "Transformation failed" };

    class NamedDto {
      @Transform(() => {
        throw failure;
      })
      @IsString(validationContext({ code: VC.STRING }))
      name!: string;
    }

    await expect(validateDto(NamedDto, { name: "First" })).rejects.toBe(failure);
  });
});
