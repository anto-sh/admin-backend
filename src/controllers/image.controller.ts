import { Request, Response } from "express";
import path from "path";
import imageService from "../services/image.service";
import { sendResponse } from "../utils/api-response";
import { handleError } from "../utils/error-handler";

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

export const upload = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file as MulterFile | undefined;

    if (!file) {
      handleError(res, new Error("Нет файла!"), 400);
      return;
    }

    const url = imageService.getImageUrl(req, file.filename);
    const data = {
      url,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      extension: path.extname(file.originalname).replace(".", ""),
    };

    sendResponse(res, {
      status: "success",
      data,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};
