export interface ApiResponse<T = any> {
  status: "success" | "error";
  message: string;
  data?: T; // Основные данные ответа
  timestamp?: string; // Дата формирования ответа
}
