import "reflect-metadata";
import {
  NETWORK_MESSAGE_CODES as NMC,
  VALIDATION_CODES as VC,
  type ValidationErrorData,
  type ValidationIssue,
} from "@anto-sh/admin-network-shared";
import { describe, expect, it } from "vitest";
import { ERROR_CODES } from "../../src/config/constants";
import { NetworkError } from "../../src/shared/class/network-error";
import { createValidationError } from "../../src/shared/validation";

describe("createValidationError", () => {
  it("returns a NetworkError with HTTP 422, the common message, and validation data", () => {
    const issues: ValidationIssue[] = [
      { path: ["name"], code: VC.MAX_LENGTH, params: { max: 20 } },
    ];

    const error = createValidationError(issues);

    expect(error).toBeInstanceOf(NetworkError);
    expect(error.statusCode).toBe(422);
    expect(error.networkMessage).toStrictEqual({
      code: NMC.COMMON_ERRORS.VALIDATION,
    });
    expect(error.data).toStrictEqual({ validationErrors: issues });
  });

  it.each([
    {
      status: ERROR_CODES.BAD_REQUEST,
      issue: { path: [], code: VC.INVALID_JSON } satisfies ValidationIssue,
    },
    {
      status: ERROR_CODES.PAYLOAD_TOO_LARGE,
      issue: {
        path: [],
        code: VC.REQUEST_TOO_LARGE,
        params: { maxBytes: 1024 },
      } satisfies ValidationIssue,
    },
  ])("preserves explicit HTTP status $status", ({ status, issue }) => {
    const error = createValidationError([issue], status);

    expect(error).toBeInstanceOf(NetworkError);
    expect(error.statusCode).toBe(status);
    expect(error.networkMessage).toStrictEqual({
      code: NMC.COMMON_ERRORS.VALIDATION,
    });
    expect(error.data).toStrictEqual({ validationErrors: [issue] });
  });

  it("uses a root INVALID_VALUE issue when no issues are supplied", () => {
    const error = createValidationError([]);

    expect(error.data).toStrictEqual({
      validationErrors: [{ path: [], code: VC.INVALID_VALUE }],
    });
  });

  it("keeps requiredness ahead of type and value errors at the same path", () => {
    const error = createValidationError([
      { path: ["name"], code: VC.MAX_LENGTH, params: { max: 20 } },
      { path: ["name"], code: VC.STRING },
      { path: ["name"], code: VC.REQUIRED },
    ]);

    expect(error.data).toStrictEqual({
      validationErrors: [{ path: ["name"], code: VC.REQUIRED }],
    });
  });

  it("keeps all winning type errors and suppresses value errors at their path", () => {
    const error = createValidationError([
      { path: ["value"], code: VC.MIN, params: { min: 0 } },
      { path: ["value"], code: VC.STRING },
      { path: ["value"], code: VC.INTEGER },
      { path: ["value"], code: VC.NUMBER },
    ]);
    const data = error.data as ValidationErrorData;

    expect(data.validationErrors).toHaveLength(2);
    expect(data.validationErrors).toEqual(
      expect.arrayContaining([
        { path: ["value"], code: VC.STRING },
        { path: ["value"], code: VC.NUMBER },
      ]),
    );
  });

  it("preserves multiple value errors, independent fields, and descendants of value errors", () => {
    const issues: ValidationIssue[] = [
      { path: ["amount"], code: VC.INTEGER },
      { path: ["amount"], code: VC.MIN, params: { min: 0 } },
      { path: ["labels"], code: VC.ARRAY_MAX_SIZE, params: { max: 2 } },
      { path: ["labels", 0], code: VC.FORMAT },
      { path: ["name"], code: VC.REQUIRED },
    ];
    const data = createValidationError(issues).data as ValidationErrorData;

    expect(data.validationErrors).toHaveLength(issues.length);
    expect(data.validationErrors).toEqual(expect.arrayContaining(issues));
  });

  it.each([VC.REQUIRED, VC.ARRAY] as const)(
    "suppresses descendants of %s without suppressing siblings or prefix-like names",
    (code) => {
      const error = createValidationError([
        { path: ["labels", 0, "name"], code: VC.FORMAT },
        { path: ["labelsExtra"], code: VC.STRING },
        { path: ["labels"], code },
        { path: ["note"], code: VC.MAX_LENGTH, params: { max: 10 } },
      ]);
      const data = error.data as ValidationErrorData;

      expect(data.validationErrors).toHaveLength(3);
      expect(data.validationErrors).toEqual(
        expect.arrayContaining([
          { path: ["labels"], code },
          { path: ["labelsExtra"], code: VC.STRING },
          { path: ["note"], code: VC.MAX_LENGTH, params: { max: 10 } },
        ]),
      );
    },
  );

  it("suppresses field and batch descendants of a root type error", () => {
    const error = createValidationError([
      { path: ["name"], code: VC.REQUIRED },
      { path: [], code: VC.INVALID_REQUEST },
      { path: [0, "labels", 1], code: VC.STRING },
    ]);

    expect(error.data).toStrictEqual({
      validationErrors: [{ path: [], code: VC.INVALID_REQUEST }],
    });
  });

  it("deduplicates exact issues while retaining different params and typed path segments", () => {
    const expected: ValidationIssue[] = [
      { path: ["name"], code: VC.MAX_LENGTH, params: { max: 10 } },
      { path: ["name"], code: VC.MAX_LENGTH, params: { max: 20 } },
      { path: ["labels", 0], code: VC.STRING },
      { path: ["labels", "0"], code: VC.STRING },
    ];
    const data = createValidationError([
      ...expected,
      { path: ["name"], code: VC.MAX_LENGTH, params: { max: 10 } },
      { path: ["labels", 0], code: VC.STRING },
    ]).data as ValidationErrorData;

    expect(data.validationErrors).toHaveLength(expected.length);
    expect(data.validationErrors).toEqual(expect.arrayContaining(expected));
  });

  it("keeps priorities separate for numeric indices and numeric object keys", () => {
    const data = createValidationError([
      { path: ["items", 0], code: VC.REQUIRED },
      { path: ["items", "0"], code: VC.STRING },
    ]).data as ValidationErrorData;

    expect(data.validationErrors).toHaveLength(2);
    expect(data.validationErrors).toEqual(
      expect.arrayContaining([
        { path: ["items", 0], code: VC.REQUIRED },
        { path: ["items", "0"], code: VC.STRING },
      ]),
    );
  });

  it("does not suppress string-key descendants of a numeric-index error", () => {
    const data = createValidationError([
      { path: ["items", 0], code: VC.OBJECT },
      { path: ["items", "0", "name"], code: VC.FORMAT },
    ]).data as ValidationErrorData;

    expect(data.validationErrors).toHaveLength(2);
    expect(data.validationErrors).toEqual(
      expect.arrayContaining([
        { path: ["items", 0], code: VC.OBJECT },
        { path: ["items", "0", "name"], code: VC.FORMAT },
      ]),
    );
  });

  it("preserves INVALID_VALUE fallbacks at a winning path and beneath blocked ancestors", () => {
    const expected: ValidationIssue[] = [
      { path: [], code: VC.INVALID_REQUEST },
      { path: [], code: VC.INVALID_VALUE },
      { path: ["labels", 0], code: VC.INVALID_VALUE },
    ];
    const data = createValidationError([
      ...expected,
      { path: ["labels", 0], code: VC.REQUIRED },
      { path: ["labels", 0], code: VC.INVALID_VALUE },
    ]).data as ValidationErrorData;

    expect(data.validationErrors).toHaveLength(expected.length);
    expect(data.validationErrors).toEqual(expect.arrayContaining(expected));
  });
});
