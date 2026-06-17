import { Request, Response } from "express";
import path from "path";
import imageService from "../services/image.service";
import { sendResponse } from "../utils/send-response";
import { handleError } from "../utils/handle-error";
import { NetworkError } from "../shared/class/network-error";
import { ERROR_CODES, SUCCESS_CODES } from "../config/constants";
import { NETWORK_MESSAGE_CODES as NMC } from "../config/network-message-codes";

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
      throw new NetworkError(
        {
          statusCode: ERROR_CODES.BAD_REQUEST,
          networkMessage: {
            code: NMC.IMAGE.ERROR.N0_FILE,
          },
        },
        "Нет файла!",
      );
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
      statusCode: SUCCESS_CODES.OK,
      message: {
        code: NMC.IMAGE.UPLOADED,
      },
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};
