import {
  NETWORK_MESSAGE_CODES as NMC,
  NetworkMessageCode,
} from "./network-message-codes";

export interface NetworkMessageParams {
  // Для сообщений без параметров - never

  /* ───────────────────────── OTHERS ──────────────────────── */
  // COMMON
  [NMC.COMMON_ERRORS.VALIDATION]: never;
  [NMC.COMMON_ERRORS.NOT_FOUND]: { id: number };

  // IMAGE
  [NMC.IMAGE.UPLOADED]: never;
  [NMC.IMAGE.ERROR.N0_FILE]: never;

  // VIDEO
  [NMC.VIDEO.UPLOADED]: never;
  [NMC.VIDEO.ERROR.N0_FILE]: never;

  /* ────────────────────────  ENTITIES ─────────────────────── */
  // EXERCISE_CATEGORY
  [NMC.EXERCISE_CATEGORY.CREATED]: { name: string; url: string };
  [NMC.EXERCISE_CATEGORY.UPDATED]: { id: number };
  [NMC.EXERCISE_CATEGORY.DELETED]: { id: number };

  [NMC.EXERCISE_CATEGORY.ERROR.DUPLICATE_NAME]: { name: string };
  [NMC.EXERCISE_CATEGORY.ERROR.DUPLICATE_URL]: { url: string };

  // SERVICE_CATEGORY
  [NMC.SERVICE_CATEGORY.CREATED]: { name: string; url: string };
  [NMC.SERVICE_CATEGORY.UPDATED]: { id: number };
  [NMC.SERVICE_CATEGORY.DELETED]: { id: number };

  [NMC.SERVICE_CATEGORY.ERROR.DUPLICATE_NAME]: { name: string };
  [NMC.SERVICE_CATEGORY.ERROR.DUPLICATE_URL]: { url: string };

  // EXERCISE
  [NMC.EXERCISE.CREATED]: { name: string };
  [NMC.EXERCISE.UPDATED]: { id: number };
  [NMC.EXERCISE.DELETED]: { id: number };

  // EXPERT
  [NMC.EXPERT.CREATED]: { name: string };
  [NMC.EXPERT.UPDATED]: { id: number };
  [NMC.EXPERT.DELETED]: { id: number };

  // PRICE
  [NMC.PRICE.CREATED]: { name: string };
  [NMC.PRICE.UPDATED]: { id: number };
  [NMC.PRICE.UPDATED_BATCH]: never;
  [NMC.PRICE.DELETED]: { id: number };

  // SERVICE
  [NMC.SERVICE.CREATED]: { name: string };
  [NMC.SERVICE.UPDATED]: { id: number };
  [NMC.SERVICE.DELETED]: { id: number };

  // TREATMENT
  [NMC.TREATMENT.CREATED]: { name: string };
  [NMC.TREATMENT.UPDATED]: { id: number };
  [NMC.TREATMENT.UPDATED_BATCH]: never;
  [NMC.TREATMENT.DELETED]: { id: number };
}

// Вспомогательный тип
export type NetworkMessageParamsFor<C extends NetworkMessageCode> =
  C extends keyof NetworkMessageParams ? NetworkMessageParams[C] : never;

export type NetworkMessageParamsValue =
  NetworkMessageParams[keyof NetworkMessageParams];
