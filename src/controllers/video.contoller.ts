import { Request, Response } from "express";
import path from "path";
import videoService from "../services/video.service";
import { sendResponse } from "../utils/api-response";
import { handleError } from "../utils/error-handler";

export const upload = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file as Express.Multer.File | undefined;

    if (!file) {
      res.status(400).json({ success: 0, error: "Нет файла" });
      return;
    }

    const url = videoService.getVideoUrl(req, file.filename);
    const data = {
      url,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      extension: path.extname(file.originalname).replace(".", ""),
      // width, height, etc. можно добавить, если потребуется анализировать видео
    };

    sendResponse(res, {
      status: "success",
      data,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};
