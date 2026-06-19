import { Response } from "express";
import { ApiResponse, NetworkMessage } from "@anto-sh/admin-network-shared";
import { ERROR_CODES, SUCCESS_CODES } from "../config/constants";

export function sendResponse<T>(
  res: Response,
  options: {
    status?: "success" | "error";
    statusCode?: ERROR_CODES | SUCCESS_CODES;
    message?: NetworkMessage;
    data?: T;
    headers?: Record<string, string>;
  },
) {
  const {
    status = "success",
    statusCode = SUCCESS_CODES.OK,
    message,
    data,
    headers = {},
  } = options;

  const response: ApiResponse<T> = {
    status,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  // Устанавливаем заголовки
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
  }

  return res.status(statusCode).json(response);
}
