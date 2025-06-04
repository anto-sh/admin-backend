import { Response } from "express";
import { ApiResponse } from "../models/dto/api-response.dto";

export function sendResponse<T>(
  res: Response,
  options: {
    status?: "success" | "error";
    code?: number;
    message?: string;
    data?: T;
    headers?: Record<string, string>;
  }
) {
  const {
    status = "success",
    code = 200,
    message = "",
    data,
    headers = {},
  } = options;

  const response: ApiResponse<T> = {
    status,
    code,
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

  return res.status(code).json(response);
}
