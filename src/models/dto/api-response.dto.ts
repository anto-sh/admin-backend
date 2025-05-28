export interface ApiResponse<T = any> {
  status: "success" | "error";
  code: number; // HTTP статус-код
  headers?: Record<string, string>; // Дополнительные заголовки
  message: string;
  data?: T; // Основные данные ответа
  timestamp?: string; // Дата формирования ответа
}
