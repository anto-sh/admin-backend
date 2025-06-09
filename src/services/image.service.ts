import { Request } from "express";
import { IMAGE_UPLOAD_DIR_NAME } from "../config/constants";

class ImageService {
  getImageUrl(req: Request, filename: string): string {
    return `${req.protocol}://${req.get(
      "host"
    )}/${IMAGE_UPLOAD_DIR_NAME}/${filename}`;
  }
}

export default new ImageService();
