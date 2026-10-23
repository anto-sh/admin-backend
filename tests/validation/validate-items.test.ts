import "reflect-metadata";
import { VALIDATION_CODES as VC } from "@anto-sh/admin-network-shared";
import { Transform } from "class-transformer";
import { IsNumber, IsString } from "class-validator";
import { describe, expect, it } from "vitest";
import { NetworkError } from "../../src/shared/class/network-error";
import { trimStringTransform } from "../../src/shared/transformers/trim-string";
import {
  ValidateItems,
  validateDto,
  validationContext,
} from "../../src/shared/validation";

class StringItemDto {
  @Transform(trimStringTransform)
  @IsString(validationContext({ code: VC.STRING }))
  value!: string;
}

class ParentDto {
  @ValidateItems(StringItemDto, { maxSize: 1 })
  items!: unknown[];
}

describe("ValidateItems: configuration", () => {
  it.each([-1, 0.5, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid maxSize %s",
    (maxSize) => {
      expect(() => ValidateItems(StringItemDto, { maxSize })).toThrow(Error);
    },
  );

  it("rejects a static property", () => {
    class RequestDto {}
    const decorate = ValidateItems(StringItemDto, { maxSize: 1 });

    expect(() => decorate(RequestDto, "items")).toThrow(Error);
  });

  it("rejects a symbol property", () => {
    class RequestDto {}
    const decorate = ValidateItems(StringItemDto, { maxSize: 1 });

    expect(() => decorate(RequestDto.prototype, Symbol("items"))).toThrow(Error);
  });

  it("rejects a second rule on the same property", () => {
    class RequestDto {}
    const decorate = ValidateItems(StringItemDto, { maxSize: 1 });
    decorate(RequestDto.prototype, "items");

    expect(() => decorate(RequestDto.prototype, "items")).toThrow(Error);
  });

  it("allows maxSize zero and rejects any supplied item", async () => {
    class EmptyDto {
      @ValidateItems(StringItemDto, { maxSize: 0 })
      items!: string[];
    }

    const dto = await validateDto(EmptyDto, { items: [] });
    expect(dto.items).toEqual([]);
    const validation = validateDto(EmptyDto, { items: ["First"] });

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: {
        validationErrors: [
          { path: ["items"], code: VC.ARRAY_MAX_SIZE, params: { max: 0 } },
        ],
      },
    });
  });
});

describe("ValidateItems: inheritance", () => {
  it("keeps independent inherited and own array rules", async () => {
    class ChildDto extends ParentDto {
      @ValidateItems(StringItemDto, { maxSize: 2 })
      labels!: string[];
    }

    const body = { items: ["  Parent  "], labels: ["  Child  "] };
    const dto = await validateDto(ChildDto, body);

    expect(dto).toBeInstanceOf(ChildDto);
    expect(dto.items).toEqual(["Parent"]);
    expect(dto.labels).toEqual(["Child"]);
    expect(body).toEqual({ items: ["  Parent  "], labels: ["  Child  "] });

    const validation = validateDto(ChildDto, { items: [1], labels: [2] });

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toHaveProperty("statusCode", 422);
    await expect(validation).rejects.toHaveProperty("data", {
      validationErrors: expect.arrayContaining([
        { path: ["items", 0], code: VC.STRING },
        { path: ["labels", 0], code: VC.STRING },
      ]),
    });
    await expect(validation).rejects.toHaveProperty(
      "data.validationErrors.length",
      2,
    );
  });

  it("inherits item transformations, validation, and size limits", async () => {
    class ChildDto extends ParentDto {}

    const body = { items: ["  First  "] };
    const dto = await validateDto(ChildDto, body);

    expect(dto).toBeInstanceOf(ChildDto);
    expect(dto.items).toEqual(["First"]);
    expect(body).toEqual({ items: ["  First  "] });
    const invalidItem = validateDto(ChildDto, { items: [1] });
    await expect(invalidItem).rejects.toBeInstanceOf(NetworkError);
    await expect(invalidItem).rejects.toMatchObject({
      statusCode: 422,
      data: { validationErrors: [{ path: ["items", 0], code: VC.STRING }] },
    });
    const oversized = validateDto(ChildDto, { items: ["First", "Second"] });
    await expect(oversized).rejects.toBeInstanceOf(NetworkError);
    await expect(oversized).rejects.toMatchObject({
      statusCode: 422,
      data: {
        validationErrors: [
          { path: ["items"], code: VC.ARRAY_MAX_SIZE, params: { max: 1 } },
        ],
      },
    });
  });

  it("uses a child's wrapper and size limit without changing the parent", async () => {
    class NumberItemDto {
      @IsNumber({}, validationContext({ code: VC.NUMBER }))
      value!: number;
    }

    class ChildDto extends ParentDto {
      @ValidateItems(NumberItemDto, { maxSize: 2 })
      declare items: unknown[];
    }

    const child = await validateDto(ChildDto, { items: [1, 2] });
    expect(child).toBeInstanceOf(ChildDto);
    expect(child.items).toEqual([1, 2]);
    const parent = await validateDto(ParentDto, { items: ["  Parent  "] });
    expect(parent.items).toEqual(["Parent"]);
    const invalidItem = validateDto(ChildDto, { items: ["First"] });
    await expect(invalidItem).rejects.toBeInstanceOf(NetworkError);
    await expect(invalidItem).rejects.toMatchObject({
      statusCode: 422,
      data: { validationErrors: [{ path: ["items", 0], code: VC.NUMBER }] },
    });
    const oversized = validateDto(ChildDto, { items: [1, 2, 3] });
    await expect(oversized).rejects.toBeInstanceOf(NetworkError);
    await expect(oversized).rejects.toMatchObject({
      statusCode: 422,
      data: {
        validationErrors: [
          { path: ["items"], code: VC.ARRAY_MAX_SIZE, params: { max: 2 } },
        ],
      },
    });
  });
});
