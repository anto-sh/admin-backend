import { Response } from "express";
import { sendResponse } from "./api-response";

export function handleError(
  res: Response,
  error: Error,
  statusCode: number = 500
) {
  sendResponse(res, {
    status: "error",
    code: statusCode,
    message: error.message || "Internal server error",
  });
}
