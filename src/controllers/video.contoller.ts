import { Request, Response } from "express";
import path from "path";
import videoService from "../services/video.service";

class VideoController {
  async upload(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file as Express.Multer.File | undefined;
      if (!file) {
        res.status(400).json({ success: 0, error: "Нет файла" });
        return;
      }

      const url = videoService.getVideoUrl(req, file.filename);

      res.json({
        success: 1,
        file: {
          url,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          extension: path.extname(file.originalname).replace(".", ""),
          // width, height и др. можно добавить, если потребуется анализировать видео
        },
      });
    } catch (error) {
      res.status(500).json({ success: 0, error: "Internal server error" });
    }
  }
}

export default new VideoController();
