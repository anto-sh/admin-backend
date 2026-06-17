import { Request, Response } from "express";
import path from "path";
import videoService from "../services/video.service";
import { sendResponse } from "../utils/send-response";
import { handleError } from "../utils/handle-error";

export const upload = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file as Express.Multer.File | undefined;

    if (!file) {
      handleError(res, new Error("Нет файла!"), 400);
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
