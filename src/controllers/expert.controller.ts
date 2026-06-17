import { Request, Response } from "express";
import * as expertService from "../services/expert.service";
import {
  CreateExpertDto,
  UpdateExpertDto,
  ExpertResponseDto,
} from "../models/dto/expert.dto";
import { Expert } from "../models/entities/expert.entity";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { sendResponse } from "../utils/send-response";
import { handleError } from "../utils/handle-error";
import { ERROR_CODES, SUCCESS_CODES } from "../config/constants";
import { NetworkError } from "../shared/class/network-error";
import { NETWORK_MESSAGE_CODES as NMC } from "../config/network-message-codes";
import { NetworkMessageParamsFor } from "../config/network-message-params";

const toResponseDto = (entity: Expert): ExpertResponseDto => ({
  id: entity.id,
  fullName: entity.fullName,
  description: entity.description,
  imageUrl: entity.imageUrl,
  categoryId: entity.category?.id,
  contentJson: entity.contentJson,
});

export const getAllExperts = async (req: Request, res: Response) => {
  try {
    const experts = await expertService.getAllExperts();
    const data = experts.map(toResponseDto);
    sendResponse(res, {
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const getExpertById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const expert = await expertService.getExpertById(id);

    if (!expert) {
      throw new NetworkError(
        {
          statusCode: ERROR_CODES.NOT_FOUND,
          networkMessage: {
            code: NMC.COMMON_ERRORS.NOT_FOUND,
            params: {
              id,
            } satisfies NetworkMessageParamsFor<
              typeof NMC.COMMON_ERRORS.NOT_FOUND
            >,
          },
        },
        `Специалист № ${id} не найден`,
      );
    }

    const data = toResponseDto(expert);
    sendResponse(res, {
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const createExpert = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(CreateExpertDto, req.body);
    const validationErrors = await validate(dto);

    if (validationErrors.length > 0) {
      throw new NetworkError(
        {
          statusCode: ERROR_CODES.VALIDATION,
          networkMessage: {
            code: NMC.COMMON_ERRORS.VALIDATION,
          },
          data: { validationErrors },
        },
        "Ошибки валидации",
      );
    }

    const expert = await expertService.createExpert(dto);
    const data = toResponseDto(expert);

    sendResponse(res, {
      statusCode: SUCCESS_CODES.CREATED,
      message: {
        code: NMC.EXPERT.CREATED,
        params: {
          name: data.fullName || "Без имени",
        } satisfies NetworkMessageParamsFor<typeof NMC.EXPERT.CREATED>,
      },
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const updateExpert = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const dto = plainToClass(UpdateExpertDto, req.body);
    const validationErrors = await validate(dto);

    if (validationErrors.length > 0) {
      throw new NetworkError(
        {
          statusCode: ERROR_CODES.VALIDATION,
          networkMessage: {
            code: NMC.COMMON_ERRORS.VALIDATION,
          },
          data: { validationErrors },
        },
        "Ошибки валидации",
      );
    }

    const updateResult = await expertService.updateExpert(id, dto);

    if (!updateResult?.affected) {
      throw new NetworkError(
        {
          statusCode: ERROR_CODES.NOT_FOUND,
          networkMessage: {
            code: NMC.COMMON_ERRORS.NOT_FOUND,
            params: {
              id,
            } satisfies NetworkMessageParamsFor<
              typeof NMC.COMMON_ERRORS.NOT_FOUND
            >,
          },
        },
        `Специалист № ${id} не найден`,
      );
    }

    sendResponse(res, {
      statusCode: SUCCESS_CODES.OK,
      message: {
        code: NMC.EXPERT.UPDATED,
        params: {
          id,
        } satisfies NetworkMessageParamsFor<typeof NMC.EXPERT.UPDATED>,
      },
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const deleteExpert = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await expertService.deleteExpert(id);

    if (!success) {
      throw new NetworkError(
        {
          statusCode: ERROR_CODES.NOT_FOUND,
          networkMessage: {
            code: NMC.COMMON_ERRORS.NOT_FOUND,
            params: {
              id,
            } satisfies NetworkMessageParamsFor<
              typeof NMC.COMMON_ERRORS.NOT_FOUND
            >,
          },
        },
        `Специалист № ${id} не найден`,
      );
    }

    sendResponse(res, {
      statusCode: SUCCESS_CODES.OK,
      message: {
        code: NMC.EXPERT.DELETED,
        params: {
          id,
        } satisfies NetworkMessageParamsFor<typeof NMC.EXPERT.DELETED>,
      },
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};
