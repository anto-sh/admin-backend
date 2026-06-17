import { Request, Response } from "express";
import path from "path";
import videoService from "../services/video.service";
import { sendResponse } from "../utils/send-response";
import { handleError } from "../utils/handle-error";
import { NetworkError } from "../shared/class/network-error";
import { ERROR_CODES, SUCCESS_CODES } from "../config/constants";
import { NETWORK_MESSAGE_CODES as NMC } from "../config/network-message-codes";

export const upload = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file as Express.Multer.File | undefined;

    if (!file) {
      throw new NetworkError(
        {
          statusCode: ERROR_CODES.BAD_REQUEST,
          networkMessage: {
            code: NMC.VIDEO.ERROR.N0_FILE,
          },
        },
        "Нет файла!",
      );
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
      statusCode: SUCCESS_CODES.OK,
      message: {
        code: NMC.VIDEO.UPLOADED,
      },
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};
