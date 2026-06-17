import {
  NETWORK_MESSAGE_CODES as NMC,
  NetworkMessageCode,
} from "./network-message-codes";

export interface NetworkMessageParams {
  // Для сообщений без параметров - never

  // EXERCISE_CATEGORY
  [NMC.EXERCISE_CATEGORY.CREATED]: { name: string; url: string };
  [NMC.EXERCISE_CATEGORY.UPDATED]: { id: number };
  [NMC.EXERCISE_CATEGORY.DELETED]: { id: number };

  [NMC.EXERCISE_CATEGORY.ERROR.DUPLICATE_NAME]: { name: string };
  [NMC.EXERCISE_CATEGORY.ERROR.DUPLICATE_URL]: { url: string };
  [NMC.EXERCISE_CATEGORY.ERROR.VALIDATION]: never;
  [NMC.EXERCISE_CATEGORY.ERROR.NOT_FOUND]: { id: number };
}

// Вспомогательный тип
export type NetworkMessageParamsFor<C extends NetworkMessageCode> =
  C extends keyof NetworkMessageParams ? NetworkMessageParams[C] : never;

export type NetworkMessageParamsValue =
  NetworkMessageParams[keyof NetworkMessageParams];
