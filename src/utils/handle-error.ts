import { Response } from "express";
import { sendResponse } from "./send-response";
import { NetworkMessage } from "../models/dto/api-response.dto";
import { NetworkError } from "../shared/class/network-error";
import { NETWORK_MESSAGE_CODES as NMC } from "../config/network-message-codes";
import { ERROR_CODES } from "../config/constants";

export function handleError(res: Response, error: NetworkError | Error) {
  let statusCode = ERROR_CODES.INTERNAL_SERVER,
    message: NetworkMessage = { code: NMC.COMMON_ERRORS.UNKNOWN },
    data: unknown;

  if (error instanceof NetworkError) {
    ({ statusCode, networkMessage: message, data } = error);
  }

  sendResponse<unknown>(res, {
    status: "error",
    statusCode,
    message,
    data,
  });

  console.log(
    `ERROR!
     STATUS: ${statusCode}
     ERROR OBJECT: ${error}
     ERROR DATA: ${JSON.stringify(data)}`,
  );
}
