import { ERROR_CODES } from "../../config/constants";
import { NetworkMessage } from "../../models/dto/api-response.dto";

export class NetworkError extends Error {
  statusCode: ERROR_CODES;
  networkMessage: NetworkMessage;
  // Прочие данные ошибки
  // e.g. массив ошибок валидации
  data: unknown;

  constructor(
    options: {
      statusCode: ERROR_CODES;
      networkMessage: NetworkMessage;
      data?: unknown;
    },
    message?: string,
  ) {
    // Дефолтный message на фронт не уходит, только для внутреннего логгирования
    super(message);
    this.name = "NetworkError";
    this.statusCode = options.statusCode;
    this.networkMessage = options.networkMessage;
    this.data = options.data;
  }
}
