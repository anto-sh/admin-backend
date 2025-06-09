import { Request } from "express";
import { VIDEO_UPLOAD_DIR_NAME } from "../config/constants";

class VideoService {
  getVideoUrl(req: Request, filename: string): string {
    return `${req.protocol}://${req.get(
      "host"
    )}/${VIDEO_UPLOAD_DIR_NAME}/${filename}`;
  }
}

export default new VideoService();
