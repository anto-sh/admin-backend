export const PORT = process.env.PORT || 3001;
export const IMAGE_UPLOAD_DIR_NAME = "img";
export const VIDEO_UPLOAD_DIR_NAME = "video";

export enum ERROR_CODES {
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  CONFLICT = 409,
  VALIDATION = 422,
  INTERNAL_SERVER = 500,
}

export enum SUCCESS_CODES {
  OK = 200,
  CREATED = 201,
}
