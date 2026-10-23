import "reflect-metadata";
import { Transform } from "class-transformer";
import { IsObject } from "class-validator";
import { describe, expect, it, vi } from "vitest";
import { VALIDATION_CODES as VC } from "@anto-sh/admin-network-shared";
import { NetworkError } from "../../src/shared/class/network-error";
import { validateDto, validationContext } from "../../src/shared/validation";

class PayloadDto {
  @IsObject(validationContext({ code: VC.OBJECT }))
  payload!: Record<string, unknown>;
}

describe("validateDto: request structure limits", () => {
  it("accepts a value at depth 64", async () => {
    const payload: Record<string, unknown> = {};
    let branch = payload;
    // The request root is depth 0 and payload is depth 1.
    for (let depth = 2; depth <= 64; depth++) {
      const next = {};
      branch.next = next;
      branch = next;
    }

    const dto = await validateDto(PayloadDto, { payload });

    expect(dto).toBeInstanceOf(PayloadDto);
    expect(dto.payload).toEqual(payload);
  });

  it("rejects a value at depth 65", async () => {
    const payload: Record<string, unknown> = {};
    let branch = payload;
    for (let depth = 2; depth <= 65; depth++) {
      const next = {};
      branch.next = next;
      branch = next;
    }

    const validation = validateDto(PayloadDto, { payload });

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: { validationErrors: [{ path: [], code: VC.INVALID_REQUEST }] },
    });
  });

  it("accepts 10,000 nodes including the request root", async () => {
    // The request and payload objects account for the other two nodes.
    const payload = Object.fromEntries(
      Array.from({ length: 9_998 }, (_, index) => [index, true]),
    );

    const dto = await validateDto(PayloadDto, { payload });

    expect(dto).toBeInstanceOf(PayloadDto);
    expect(dto.payload).toEqual(payload);
  });

  it("rejects 10,001 nodes", async () => {
    const payload = Object.fromEntries(
      Array.from({ length: 9_999 }, (_, index) => [index, true]),
    );
    const validation = validateDto(PayloadDto, { payload });

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: { validationErrors: [{ path: [], code: VC.INVALID_REQUEST }] },
    });
  });

  it("accepts a batch with 10,000 nodes including its array root", async () => {
    // 1 batch root + 2 DTOs + 2 payloads + 9,995 properties = 10,000.
    const body = [4_998, 4_997].map((size) => ({
      payload: Object.fromEntries(
        Array.from({ length: size }, (_, index) => [index, true]),
      ),
    }));

    const dtos = await validateDto(PayloadDto, body, { array: true });

    expect(dtos).toHaveLength(2);
    expect(dtos.every((dto) => dto instanceof PayloadDto)).toBe(true);
    expect(dtos.map((dto) => dto.payload)).toEqual(
      body.map((dto) => dto.payload),
    );
  });

  it("rejects a 10,001-node batch even when each DTO fits the node limit", async () => {
    const body = [4_998, 4_998].map((size) => ({
      payload: Object.fromEntries(
        Array.from({ length: size }, (_, index) => [index, true]),
      ),
    }));

    for (const item of body) {
      await expect(validateDto(PayloadDto, item)).resolves.toBeInstanceOf(
        PayloadDto,
      );
    }
    const validation = validateDto(PayloadDto, body, { array: true });

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: { validationErrors: [{ path: [], code: VC.INVALID_REQUEST }] },
    });
  });

  it("includes the batch array root when enforcing the depth limit", async () => {
    const payload: Record<string, unknown> = {};
    let branch = payload;
    for (let depth = 2; depth <= 64; depth++) {
      const next = {};
      branch.next = next;
      branch = next;
    }
    const body = { payload };

    await expect(validateDto(PayloadDto, body)).resolves.toBeInstanceOf(
      PayloadDto,
    );
    const validation = validateDto(PayloadDto, [body], { array: true });

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: { validationErrors: [{ path: [], code: VC.INVALID_REQUEST }] },
    });
  });
});

describe("validateDto: unsafe request structures", () => {
  class CustomPayload {}

  it.each([
    { label: "a Date", value: new Date("2026-01-01T00:00:00.000Z") },
    { label: "a Map", value: new Map([["name", "First"]]) },
    { label: "a class instance", value: new CustomPayload() },
    { label: "a bigint", value: 1n },
  ])("rejects $label before transforming the owner", async ({ value }) => {
    const transformPayload = vi.fn(({ value }) => value);

    class RequestDto {
      @Transform(transformPayload)
      @IsObject(validationContext({ code: VC.OBJECT }))
      payload!: Record<string, unknown>;
    }

    const validation = validateDto(RequestDto, { payload: { nested: value } });

    await expect(validation).rejects.toBeInstanceOf(NetworkError);
    await expect(validation).rejects.toMatchObject({
      statusCode: 422,
      data: { validationErrors: [{ path: [], code: VC.INVALID_REQUEST }] },
    });
    expect(transformPayload).not.toHaveBeenCalled();
  });

  it.each(["constructor", "__proto__"])(
    "rejects a nested own %s key before transforming the owner",
    async (key) => {
      const transformPayload = vi.fn(({ value }) => value);

      class RequestDto {
        @Transform(transformPayload)
        @IsObject(validationContext({ code: VC.OBJECT }))
        payload!: Record<string, unknown>;
      }

      const body = { payload: { nested: { [key]: true } } };
      const validation = validateDto(RequestDto, body);

      await expect(validation).rejects.toBeInstanceOf(NetworkError);
      await expect(validation).rejects.toMatchObject({
        statusCode: 422,
        data: {
          validationErrors: [
            { path: ["payload", "nested", key], code: VC.UNKNOWN_FIELD },
          ],
        },
      });
      expect(transformPayload).not.toHaveBeenCalled();
      expect(body).toStrictEqual({ payload: { nested: { [key]: true } } });
    },
  );
});
