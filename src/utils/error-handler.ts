import { Response } from "express";
import { sendResponse } from "./api-response";

export function handleError(
  res: Response,
  error: Error,
  statusCode: number = 500,
  data?: unknown
) {
  sendResponse<unknown>(res, {
    status: "error",
    code: statusCode,
    message: error.message || "Internal server error",
    data,
  });
  console.log(
    `ERROR!
     STATUS: ${statusCode}
     ERROR OBJECT: ${error}
     ERROR DATA: ${JSON.stringify(data)}`
  );
}
