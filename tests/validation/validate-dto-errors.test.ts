import "reflect-metadata";
import {
  NETWORK_MESSAGE_CODES as NMC,
  VALIDATION_CODES as VC,
  type ValidationIssue,
} from "@anto-sh/admin-network-shared";
import { Type } from "class-transformer";
import {
  IsAlpha,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { describe, expect, it, vi } from "vitest";
import { NetworkError } from "../../src/shared/class/network-error";
import {
  ValidateItems,
  validateDto,
  validationContext,
} from "../../src/shared/validation";

class AmountDto {
  @IsNotEmpty(validationContext({ code: VC.REQUIRED }))
  @IsNumber({}, validationContext({ code: VC.NUMBER }))
  @IsInt(validationContext({ code: VC.INTEGER }))
  @Min(0, validationContext({ code: VC.MIN, params: { min: 0 } }))
  amount!: number;
}

describe("validateDto: error format and selection", () => {
  it("returns only public issue fields, without submitted values or rule messages", async () => {
    class NameDto {
      @MaxLength(3, {
        ...validationContext({ code: VC.MAX_LENGTH, params: { max: 3 } }),
        message: "Internal rule detail: $value",
      })
      name!: string;
    }

    const onDiagnostic = vi.fn();
    const validation = validateDto(
      NameDto,
      { name: "synthetic-submitted-value" },
      { onDiagnostic },
    );

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      networkMessage: { code: NMC.COMMON_ERRORS.VALIDATION },
    });
    await expect(validation).rejects.toHaveProperty("data", {
      validationErrors: [
        { path: ["name"], code: VC.MAX_LENGTH, params: { max: 3 } },
      ],
    });
    expect(onDiagnostic).not.toHaveBeenCalled();
  });

  it("removes extra metadata from an otherwise valid rule context", async () => {
    class NameDto {
      @MaxLength(3, {
        context: {
          code: VC.MAX_LENGTH,
          params: { max: 3 },
          internal: "synthetic-internal-marker",
        },
      })
      name!: string;
    }

    const onDiagnostic = vi.fn();
    const error: unknown = await validateDto(
      NameDto,
      { name: "synthetic-submitted-value" },
      { onDiagnostic },
    ).catch((error: unknown) => error);

    expect(error).toBeInstanceOf(NetworkError);
    expect((error as NetworkError).data).toStrictEqual({
      validationErrors: [
        { path: ["name"], code: VC.MAX_LENGTH, params: { max: 3 } },
      ],
    });
    expect(onDiagnostic).not.toHaveBeenCalled();
  });

  it.each([
    {
      label: "requiredness before type and value checks",
      amount: null,
      issues: [{ path: ["amount"], code: VC.REQUIRED }],
    },
    {
      label: "number type before numeric constraints",
      amount: "-1.5",
      issues: [{ path: ["amount"], code: VC.NUMBER }],
    },
    {
      label: "both independent numeric constraints",
      amount: -1.5,
      issues: [
        { path: ["amount"], code: VC.INTEGER },
        { path: ["amount"], code: VC.MIN, params: { min: 0 } },
      ],
    },
  ])("keeps $label", async ({ amount, issues }) => {
    const validation = validateDto(AmountDto, { amount });

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toHaveProperty("statusCode", 422);
    await expect(validation).rejects.toHaveProperty("data", {
      validationErrors: expect.arrayContaining<ValidationIssue>(issues),
    });
    await expect(validation).rejects.toHaveProperty(
      "data.validationErrors.length",
      issues.length,
    );
  });

  it("deduplicates identical public issues produced by different rules", async () => {
    class LettersDto {
      @IsAlpha("en-US", validationContext({ code: VC.FORMAT }))
      @Matches(/^[A-Z]/, validationContext({ code: VC.FORMAT }))
      value!: string;
    }

    const validation = validateDto(LettersDto, { value: "123" });

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toHaveProperty("data", {
      validationErrors: [{ path: ["value"], code: VC.FORMAT }],
    });
  });

  it("keeps a missing-context fallback beside a higher-priority error", async () => {
    class NameDto {
      @IsNotEmpty(validationContext({ code: VC.REQUIRED }))
      @IsString()
      name!: string;
    }

    const onDiagnostic = vi.fn();
    const validation = validateDto(NameDto, { name: null }, { onDiagnostic });

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toHaveProperty("data", {
      validationErrors: expect.arrayContaining([
        { path: ["name"], code: VC.REQUIRED },
        { path: ["name"], code: VC.INVALID_VALUE },
      ]),
    });
    await expect(validation).rejects.toHaveProperty(
      "data.validationErrors.length",
      2,
    );
    expect(onDiagnostic.mock.calls).toEqual([
      [{ path: ["name"], constraint: "isString" }],
    ]);
  });
});

describe("validateDto: fallback and diagnostics", () => {
  it.each([
    { label: "missing context", context: undefined },
    { label: "missing code", context: {} },
    { label: "unknown code", context: { code: "validation.unrecognized" } },
    { label: "missing params", context: { code: VC.MAX_LENGTH } },
    {
      label: "wrong parameter type",
      context: { code: VC.MAX_LENGTH, params: { max: "3" } },
    },
    {
      label: "NaN parameter",
      context: { code: VC.MAX_LENGTH, params: { max: NaN } },
    },
    {
      label: "infinite parameter",
      context: { code: VC.MAX_LENGTH, params: { max: Infinity } },
    },
    { label: "null params", context: { code: VC.MAX_LENGTH, params: null } },
    { label: "array params", context: { code: VC.MAX_LENGTH, params: [] } },
    {
      label: "wrong parameter key",
      context: { code: VC.MAX_LENGTH, params: { min: 3 } },
    },
    {
      label: "extra parameter",
      context: { code: VC.MAX_LENGTH, params: { max: 3, detail: "private" } },
    },
    {
      label: "params on a parameterless code",
      context: { code: VC.STRING, params: { max: 3 } },
    },
  ])("rejects the value with a fallback for $label", async ({ context }) => {
    class NameDto {
      // Raw decorator options deliberately bypass validationContext's type checks.
      @MaxLength(3, { context, message: "Internal rule detail: $value" })
      value!: string;
    }

    const onDiagnostic = vi.fn();
    const validation = validateDto(
      NameDto,
      { value: "synthetic-submitted-value" },
      { onDiagnostic },
    );

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toHaveProperty("statusCode", 422);
    await expect(validation).rejects.toHaveProperty("data", {
      validationErrors: [{ path: ["value"], code: VC.INVALID_VALUE }],
    });
    expect(onDiagnostic.mock.calls).toEqual([
      [{ path: ["value"], constraint: "maxLength" }],
    ]);
  });

  it("preserves real value, empty, and numeric object keys inside a wrapped batch item", async () => {
    class FieldsDto {
      @IsString()
      value!: string;

      @IsString(validationContext({ code: VC.STRING }))
      [""]!: string;

      @IsString(validationContext({ code: VC.STRING }))
      ["0"]!: string;
    }

    class ItemDto {
      @Type(() => FieldsDto)
      @ValidateNested(validationContext({ code: VC.OBJECT }))
      value!: FieldsDto;
    }

    class RequestDto {
      @ValidateItems(ItemDto, { maxSize: 1 })
      items!: FieldsDto[];
    }

    const onDiagnostic = vi.fn();
    const validation = validateDto(
      RequestDto,
      [{ items: [{ value: 1, "": 2, "0": 3 }] }],
      { array: true, onDiagnostic },
    );

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toHaveProperty("data", {
      validationErrors: expect.arrayContaining([
        { path: [0, "items", 0, "value"], code: VC.INVALID_VALUE },
        { path: [0, "items", 0, ""], code: VC.STRING },
        { path: [0, "items", 0, "0"], code: VC.STRING },
      ]),
    });
    await expect(validation).rejects.toHaveProperty(
      "data.validationErrors.length",
      3,
    );
    expect(onDiagnostic.mock.calls).toEqual([
      [{ path: [0, "items", 0, "value"], constraint: "isString" }],
    ]);
  });

  it("reports numeric indices from an ordinary ValidateNested array", async () => {
    class ChildDto {
      @IsString(validationContext({ code: VC.STRING }))
      value!: string;
    }

    class RequestDto {
      @Type(() => ChildDto)
      @ValidateNested({ each: true, ...validationContext({ code: VC.OBJECT }) })
      children!: ChildDto[];
    }

    const onDiagnostic = vi.fn();
    const validation = validateDto(
      RequestDto,
      { children: [{ value: "valid" }, { value: 1 }] },
      { onDiagnostic },
    );

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toHaveProperty("data", {
      validationErrors: [{ path: ["children", 1, "value"], code: VC.STRING }],
    });
    expect(onDiagnostic).not.toHaveBeenCalled();
  });

  it("warns without submitted values when no diagnostic callback is supplied", async () => {
    class NameDto {
      @MaxLength(3)
      name!: string;
    }

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const validation = validateDto(NameDto, {
        name: "synthetic-submitted-value",
      });

      await expect(validation).rejects.toBeInstanceOf(NetworkError);
      await expect(validation).rejects.toHaveProperty("data", {
        validationErrors: [{ path: ["name"], code: VC.INVALID_VALUE }],
      });
      expect(warn.mock.calls).toEqual([
        [expect.any(String), { path: ["name"], constraint: "maxLength" }],
      ]);
      expect(JSON.stringify(warn.mock.calls)).not.toContain(
        "synthetic-submitted-value",
      );
    } finally {
      warn.mockRestore();
    }
  });
});
