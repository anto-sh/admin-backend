import "reflect-metadata";
import { VALIDATION_CODES as VC } from "@anto-sh/admin-network-shared";
import { Transform, type TransformFnParams } from "class-transformer";
import { ArrayUnique, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { describe, expect, it, vi } from "vitest";
import { NetworkError } from "../../src/shared/class/network-error";
import { trimStringTransform } from "../../src/shared/transformers/trim-string";
import {
  ValidateItems,
  validateDto,
  validationContext,
} from "../../src/shared/validation";

const MAX_LABELS = 3;

class StringItemDto {
  @Transform(trimStringTransform)
  @IsNotEmpty(validationContext({ code: VC.REQUIRED }))
  @IsString(validationContext({ code: VC.STRING }))
  value!: string;
}

class LabelsDto {
  @ValidateItems(StringItemDto, { maxSize: MAX_LABELS })
  labels!: string[];
}

class OptionalLabelsDto {
  @IsOptional()
  @ValidateItems(StringItemDto, { maxSize: MAX_LABELS })
  labels?: string[] | null;
}

describe("validateDto: array fields", () => {
  it("reports numeric item indices without the wrapper property", async () => {
    const body = { labels: [7, null, "   "] };
    const validation = validateDto(LabelsDto, body);

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: {
        validationErrors: [
          { path: ["labels", 0], code: VC.STRING },
          { path: ["labels", 1], code: VC.REQUIRED },
          { path: ["labels", 2], code: VC.REQUIRED },
        ],
      },
    });
    expect(body).toStrictEqual({ labels: [7, null, "   "] });
  });

  it("fully validates supplied PATCH items instead of skipping undefined", async () => {
    const validation = validateDto(
      LabelsDto,
      { labels: [undefined] },
      { partial: true },
    );

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: { validationErrors: [{ path: ["labels", 0], code: VC.REQUIRED }] },
    });
  });

  it.each([false, true])(
    "allows an explicitly null optional array with partial=%s",
    async (partial) => {
      const body = { labels: null };

      const dto = await validateDto(OptionalLabelsDto, body, { partial });

      expect(dto).toBeInstanceOf(OptionalLabelsDto);
      expect(dto.labels).toBeNull();
      expect(body).toStrictEqual({ labels: null });
    },
  );

  it.each([false, true])(
    "rejects a supplied non-array optional field with partial=%s",
    async (partial) => {
      const validation = validateDto(
        OptionalLabelsDto,
        { labels: "First" },
        { partial },
      );

      await expect(validation).rejects.toBeInstanceOf(NetworkError);
      await expect(validation).rejects.toMatchObject({
        statusCode: 422,
        data: { validationErrors: [{ path: ["labels"], code: VC.ARRAY }] },
      });
    },
  );

  it.each([false, true])(
    "validates supplied optional array items with partial=%s",
    async (partial) => {
      const validation = validateDto(
        OptionalLabelsDto,
        { labels: [undefined] },
        { partial },
      );

      await expect(validation).rejects.toBeInstanceOf(NetworkError);
      await expect(validation).rejects.toMatchObject({
        statusCode: 422,
        data: { validationErrors: [{ path: ["labels", 0], code: VC.REQUIRED }] },
      });
    },
  );

  it.each([
    { label: "a string", labels: "First" },
    { label: "an object", labels: { value: "First" } },
    { label: "a number", labels: 1 },
    { label: "a boolean", labels: false },
    { label: "null", labels: null },
    { label: "undefined", labels: undefined },
  ])("rejects $label as an array field", async ({ labels }) => {
    const validation = validateDto(LabelsDto, { labels });

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: { validationErrors: [{ path: ["labels"], code: VC.ARRAY }] },
    });
  });

  it.each([
    { label: "an empty array", labels: [], expected: [] },
    {
      label: "an array at the size limit",
      labels: ["  First  ", "Second", "Third"],
      expected: ["First", "Second", "Third"],
    },
  ])("accepts $label", async ({ labels, expected }) => {
    const dto = await validateDto(LabelsDto, { labels });

    expect(dto).toBeInstanceOf(LabelsDto);
    expect(dto.labels).toEqual(expected);
  });

  it.each([
    {
      label: "before owner transformation",
      labels: ["First", "Second", "Third"],
      ownerCalls: 0,
    },
    {
      label: "after owner transformation",
      labels: ["First", "Second"],
      ownerCalls: 1,
    },
  ])(
    "rejects excessive size $label without transforming items",
    async ({ labels, ownerCalls }) => {
      const transformItem = vi.fn(trimStringTransform);
      const transformOwner = vi.fn(({ value }: TransformFnParams) => [
        ...value,
        "Extra",
      ]);

      class CountedItemDto {
        @Transform(transformItem)
        @IsString(validationContext({ code: VC.STRING }))
        value!: string;
      }

      class LimitedLabelsDto {
        @Transform(transformOwner)
        @ValidateItems(CountedItemDto, { maxSize: 2 })
        labels!: string[];
      }

      const body = { labels };
      const originalLabels = [...labels];
      const validation = validateDto(LimitedLabelsDto, body);

      await expect(validation).rejects.toBeInstanceOf(NetworkError);
      await expect(validation).rejects.toMatchObject({
        statusCode: 422,
        data: {
          validationErrors: [
            { path: ["labels"], code: VC.ARRAY_MAX_SIZE, params: { max: 2 } },
          ],
        },
      });
      expect(transformOwner).toHaveBeenCalledTimes(ownerCalls);
      expect(transformItem).not.toHaveBeenCalled();
      expect(body.labels).toEqual(originalLabels);
    },
  );

  it("rejects excessive raw size before traversing unsafe item structures", async () => {
    const body = {
      labels: ["First", "Second", "Third", { constructor: "unsafe" }],
    };
    const validation = validateDto(LabelsDto, body);

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: {
        validationErrors: [
          {
            path: ["labels"],
            code: VC.ARRAY_MAX_SIZE,
            params: { max: MAX_LABELS },
          },
        ],
      },
    });
  });

  it("runs owner validation against transformed item values", async () => {
    class UniqueLabelsDto {
      @ValidateItems(StringItemDto, { maxSize: MAX_LABELS })
      @ArrayUnique(validationContext({ code: VC.FORMAT }))
      labels!: string[];
    }

    const body = { labels: ["  First  ", "First"] };
    const validation = validateDto(UniqueLabelsDto, body);

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: { validationErrors: [{ path: ["labels"], code: VC.FORMAT }] },
    });
    expect(body).toEqual({ labels: ["  First  ", "First"] });
  });
});

describe("validateDto: root batches", () => {
  it.each([
    { label: "null", body: null },
    { label: "undefined", body: undefined },
    { label: "a string", body: "[]" },
    { label: "a number", body: 1 },
    { label: "a boolean", body: false },
    { label: "an object", body: { labels: [] } },
  ])("rejects $label as a batch root", async ({ body }) => {
    const validation = validateDto(LabelsDto, body, { array: true });

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: { validationErrors: [{ path: [], code: VC.ARRAY }] },
    });
  });

  it.each([false, true])("accepts an empty batch with partial=%s", async (partial) => {
    const dtos = await validateDto(LabelsDto, [], { array: true, partial });

    expect(dtos).toEqual([]);
  });

  it("reports each invalid DTO root at its batch index", async () => {
    const body = [{ labels: ["First"] }, null, [], 1, "invalid", false];
    const validation = validateDto(LabelsDto, body, { array: true });

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: {
        validationErrors: [
          { path: [1], code: VC.OBJECT },
          { path: [2], code: VC.OBJECT },
          { path: [3], code: VC.OBJECT },
          { path: [4], code: VC.OBJECT },
          { path: [5], code: VC.OBJECT },
        ],
      },
    });
  });

  it("combines the batch index, field name, and item index in error paths", async () => {
    const body = [
      { labels: ["First"] },
      { labels: [7] },
      { labels: [null] },
    ];
    const validation = validateDto(LabelsDto, body, { array: true });

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: {
        validationErrors: [
          { path: [1, "labels", 0], code: VC.STRING },
          { path: [2, "labels", 0], code: VC.REQUIRED },
        ],
      },
    });
  });

  it("includes the batch index when an array exceeds its size limit", async () => {
    const body = [
      { labels: [] },
      { labels: ["First", "Second", "Third", "Fourth"] },
    ];
    const validation = validateDto(LabelsDto, body, { array: true });

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: {
        validationErrors: [
          {
            path: [1, "labels"],
            code: VC.ARRAY_MAX_SIZE,
            params: { max: MAX_LABELS },
          },
        ],
      },
    });
  });

  it("applies PATCH rules to each DTO while fully validating supplied items", async () => {
    const validation = validateDto(
      LabelsDto,
      [{}, { labels: [undefined] }],
      { array: true, partial: true },
    );

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: {
        validationErrors: [
          { path: [0], code: VC.EMPTY_UPDATE },
          { path: [1, "labels", 0], code: VC.REQUIRED },
        ],
      },
    });
  });
});
