import { NetworkMessageCode } from "../../config/network-message-codes";
import { NetworkMessageParamsValue } from "../../config/network-message-params";

export interface ApiResponse<T> {
  status: "success" | "error";
  message: NetworkMessage | undefined;
  data?: T; // Основные данные ответа
  timestamp?: string; // Дата формирования ответа
}

export interface NetworkMessage {
  code: NetworkMessageCode;
  params?: NetworkMessageParamsValue;
}
