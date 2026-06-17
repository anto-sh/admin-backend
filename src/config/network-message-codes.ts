export const NETWORK_MESSAGE_CODES = {
  /* ───────────────────────── Others ──────────────────────── */
  COMMON_ERRORS: {
    UNKNOWN: "commonErrors.unknown",
    VALIDATION: "commonErrors.validation",
    NOT_FOUND: "commonErrors.notFound",
  },

  IMAGE: {
    UPLOADED: "image.uploaded",
    ERROR: {
      N0_FILE: "image.error.noFile",
    },
  },

  VIDEO: {
    UPLOADED: "video.uploaded",
    ERROR: {
      N0_FILE: "video.error.noFile",
    },
  },

  /* ──────────────────────── Entities ─────────────────────── */
  EXERCISE_CATEGORY: {
    CREATED: "exerciseCategory.created",
    UPDATED: "exerciseCategory.updated",
    DELETED: "exerciseCategory.deleted",
    ERROR: {
      DUPLICATE_NAME: "exerciseCategory.error.duplicateName",
      DUPLICATE_URL: "exerciseCategory.error.duplicateUrl",
    },
  },

  SERVICE_CATEGORY: {
    CREATED: "serviceCategory.created",
    UPDATED: "serviceCategory.updated",
    DELETED: "serviceCategory.deleted",
    ERROR: {
      DUPLICATE_NAME: "serviceCategory.error.duplicateName",
      DUPLICATE_URL: "serviceCategory.error.duplicateUrl",
    },
  },

  EXERCISE: {
    CREATED: "exercise.created",
    UPDATED: "exercise.updated",
    DELETED: "exercise.deleted",
    ERROR: {},
  },

  EXPERT: {
    CREATED: "expert.created",
    UPDATED: "expert.updated",
    DELETED: "expert.deleted",
    ERROR: {},
  },

  PRICE: {
    CREATED: "price.created",
    UPDATED: "price.updated",
    UPDATED_BATCH: "price.updatedBatch",
    DELETED: "price.deleted",
    ERROR: {},
  },

  SERVICE: {
    CREATED: "service.created",
    UPDATED: "service.updated",
    DELETED: "service.deleted",
    ERROR: {},
  },

  TREATMENT: {
    CREATED: "treatment.created",
    UPDATED: "treatment.updated",
    UPDATED_BATCH: "treatment.updatedBatch",
    DELETED: "treatment.deleted",
    ERROR: {},
  },
} as const;

export type NetworkMessageCode = DeepValueOf<typeof NETWORK_MESSAGE_CODES>;

// utility types
type DeepValueOf<T> = T extends object ? DeepValueOf<T[keyof T]> : T;
