import "reflect-metadata";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { describe, expect, it } from "vitest";
import { VALIDATION_CODES as VC } from "@anto-sh/admin-network-shared";
import {
  ValidateItems,
  validateDto,
  validationContext,
} from "../../src/shared/validation";
import { trimStringTransform } from "../../src/shared/transformers/trim-string";
import { NetworkError } from "../../src/shared/class/network-error";

class NamedDto {
  @Transform(trimStringTransform)
  @IsNotEmpty(validationContext({ code: VC.REQUIRED }))
  @IsString(validationContext({ code: VC.STRING }))
  name!: string;

  @Transform(trimStringTransform)
  @IsOptional()
  @IsString(validationContext({ code: VC.STRING }))
  note?: string | null;
}

class StringItemDto {
  @Transform(trimStringTransform)
  @IsString(validationContext({ code: VC.STRING }))
  value!: string;
}

class LabelsDto {
  @ValidateItems(StringItemDto, { maxSize: 5 })
  labels!: string[];
}

describe("validateDto: successful validation", () => {
  it("returns a transformed DTO instance without changing the input object", async () => {
    const body = { name: "  Massage  " };

    const dto = await validateDto(NamedDto, body);

    expect(dto).toBeInstanceOf(NamedDto);
    expect(dto.name).toBe("Massage");
    expect(dto).not.toBe(body);
    expect(body).toEqual({ name: "  Massage  " });
  });

  it("returns transformed array values without exposing item wrappers or changing the input", async () => {
    const body = { labels: ["  First  ", "  Second  "] };

    const dto = await validateDto(LabelsDto, body);

    expect(dto).toBeInstanceOf(LabelsDto);
    expect(dto.labels).toEqual(["First", "Second"]);
    expect(dto.labels).not.toBe(body.labels);
    expect(body).toEqual({ labels: ["  First  ", "  Second  "] });
  });

  it("returns transformed DTO instances in the original batch order", async () => {
    const body = [{ name: "  First  " }, { name: "  Second  " }];

    const dtos = await validateDto(NamedDto, body, { array: true });

    expect(dtos).toHaveLength(2);
    expect(dtos[0]).toBeInstanceOf(NamedDto);
    expect(dtos[1]).toBeInstanceOf(NamedDto);
    expect(dtos.map((dto) => dto.name)).toEqual(["First", "Second"]);
    expect(body).toEqual([{ name: "  First  " }, { name: "  Second  " }]);
  });
});

describe("validateDto: required fields and PATCH", () => {
  it.each([
    { label: "an omitted field", body: {} },
    { label: "undefined", body: { name: undefined } },
    { label: "null", body: { name: null } },
    { label: "an empty string", body: { name: "" } },
    { label: "a whitespace-only string", body: { name: "   " } },
  ])("rejects $label for a required field", async ({ body }) => {
    const validation = validateDto(NamedDto, body);

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: { validationErrors: [{ path: ["name"], code: VC.REQUIRED }] },
    });
  });

  it.each([
    { label: "omitted", body: { note: "  Updated  " } },
    { label: "undefined", body: { name: undefined, note: "  Updated  " } },
  ])("skips an $label required field in PATCH", async ({ body }) => {
    const dto = await validateDto(NamedDto, body, { partial: true });

    expect(dto).toBeInstanceOf(NamedDto);
    expect(dto.name).toBeUndefined();
    expect(dto.note).toBe("Updated");
    expect(body.note).toBe("  Updated  ");
  });

  it("accepts an explicitly undefined PATCH field without treating it as an empty object", async () => {
    const body = { name: undefined };

    const dto = await validateDto(NamedDto, body, { partial: true });

    expect(dto).toBeInstanceOf(NamedDto);
    expect(dto.name).toBeUndefined();
    expect(body).toStrictEqual({ name: undefined });
  });

  it("rejects an empty PATCH object", async () => {
    const validation = validateDto(NamedDto, {}, { partial: true });

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: { validationErrors: [{ path: [], code: VC.EMPTY_UPDATE }] },
    });
  });

  it.each([
    { label: "null", name: null },
    { label: "an empty string", name: "" },
    { label: "a whitespace-only string", name: "   " },
  ])("rejects $label for a supplied required PATCH field", async ({ name }) => {
    const validation = validateDto(NamedDto, { name }, { partial: true });

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: { validationErrors: [{ path: ["name"], code: VC.REQUIRED }] },
    });
  });

  it.each([
    { label: "full validation", partial: false },
    { label: "PATCH", partial: true },
  ])("allows null when the DTO declares it optional in $label", async ({ partial }) => {
    const dto = await validateDto(
      NamedDto,
      { name: "Massage", note: null },
      { partial },
    );

    expect(dto).toBeInstanceOf(NamedDto);
    expect(dto.note).toBeNull();
  });
});

describe("validateDto: request roots and unknown fields", () => {
  it.each([
    { label: "null", body: null },
    { label: "undefined", body: undefined },
    { label: "a string", body: "Massage" },
    { label: "a number", body: 1 },
    { label: "a boolean", body: false },
    { label: "an array", body: [] },
  ])("rejects $label as a single DTO root", async ({ body }) => {
    const validation = validateDto(NamedDto, body);

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: { validationErrors: [{ path: [], code: VC.INVALID_REQUEST }] },
    });
  });

  it.each(["extra", "", "toString", "constructor", "__proto__"])(
    "rejects an unknown own field %j and preserves its key in the error path",
    async (key) => {
      const body = { name: "Massage", [key]: 1 };
      const validation = validateDto(NamedDto, body);

      await expect(validation).rejects.toBeInstanceOf(NetworkError);
      await expect(validation).rejects.toMatchObject({
        statusCode: 422,
        data: { validationErrors: [{ path: [key], code: VC.UNKNOWN_FIELD }] },
      });
      expect(body).toStrictEqual({ name: "Massage", [key]: 1 });
    },
  );

  it("rejects an unknown PATCH field even when its value is undefined", async () => {
    const validation = validateDto(
      NamedDto,
      { extra: undefined },
      { partial: true },
    );

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: { validationErrors: [{ path: ["extra"], code: VC.UNKNOWN_FIELD }] },
    });
  });
});
