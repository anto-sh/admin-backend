export const NETWORK_MESSAGE_CODES = {
  // Entities
  EXERCISE_CATEGORY: {
    CREATED: "exerciseCategory.created",
    UPDATED: "exerciseCategory.updated",
    DELETED: "exerciseCategory.deleted",
    ERROR: {
      DUPLICATE_NAME: "exerciseCategory.error.duplicateName",
      DUPLICATE_URL: "exerciseCategory.error.duplicateUrl",
      VALIDATION: "exerciseCategory.error.validation",
      NOT_FOUND: "exerciseCategory.error.notFound",
    },
  },

  // Others
  COMMON_ERRORS: {
    UNKNOWN: "commonErrors.unknown",
    VALIDATION: "commonErrors.validation",
  },
} as const;

export type NetworkMessageCode = DeepValueOf<typeof NETWORK_MESSAGE_CODES>;
