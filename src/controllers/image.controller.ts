import { Request, Response } from "express";
import path from "path";
import imageService from "../services/image.service";

// Типизация Multer file
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

class ImageController {
  async upload(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file as MulterFile | undefined;
      if (!file) {
        res.status(400).json({ success: 0, error: "Нет файла" });
        return;
      }

      const url = imageService.getImageUrl(req, file.filename);

      res.json({
        success: 1,
        file: {
          url,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          extension: path.extname(file.originalname).replace(".", ""),
        },
      });
    } catch (error) {
      res.status(500).json({ success: 0, error: "Internal server error" });
    }
  }
}

export default new ImageController();
