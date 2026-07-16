import { Request, Response } from "express";
import * as treatmentService from "../services/treatment.service";
import {
  CreateTreatmentDto,
  UpdateTreatmentDto,
  TreatmentResponseDto,
  UpdateTreatmentBatchDto,
} from "../models/dto/treatment.dto";
import { Treatment } from "../models/entities/treatment.entity";
import { validate } from "class-validator";
import { plainToClass, plainToInstance } from "class-transformer";
import { sendResponse } from "../utils/send-response";
import { handleError } from "../utils/handle-error";
import { ERROR_CODES, SUCCESS_CODES } from "../config/constants";
import { NetworkError } from "../shared/class/network-error";
import { NETWORK_MESSAGE_CODES as NMC } from "@anto-sh/admin-network-shared";
import { NetworkMessageParamsFor } from "@anto-sh/admin-network-shared";

const toResponseDto = (entity: Treatment): TreatmentResponseDto => ({
  id: entity.id,
  name: entity.name,
});

export const getAllTreatments = async (req: Request, res: Response) => {
  try {
    const treatments = await treatmentService.getAllTreatments();
    const data = treatments.map(toResponseDto);
    sendResponse(res, {
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const createTreatment = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(CreateTreatmentDto, req.body);
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

    const treatment = await treatmentService.createTreatment(dto);
    const data = toResponseDto(treatment);
    sendResponse(res, {
      statusCode: SUCCESS_CODES.CREATED,
      message: {
        code: NMC.TREATMENT.CREATED,
        params: {
          name: data.name || "Без имени",
        } satisfies NetworkMessageParamsFor<typeof NMC.TREATMENT.CREATED>,
      },
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const updateTreatment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const dto = plainToClass(UpdateTreatmentDto, req.body);
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

    const updateResult = await treatmentService.updateTreatment(id, dto);

    if (!updateResult?.affected) {
      throw new NetworkError(
        {
          statusCode: ERROR_CODES.NOT_FOUND,
          networkMessage: {
            code: NMC.COMMON_ERRORS.NOT_FOUND,
            params: { id } satisfies NetworkMessageParamsFor<
              typeof NMC.COMMON_ERRORS.NOT_FOUND
            >,
          },
        },
        `Опция предлагамоего лечения № ${id} не найдена`,
      );
    }

    sendResponse(res, {
      statusCode: SUCCESS_CODES.OK,
      message: {
        code: NMC.TREATMENT.UPDATED,
        params: {
          id,
        } satisfies NetworkMessageParamsFor<typeof NMC.TREATMENT.UPDATED>,
      },
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const updateTreatmentBatch = async (req: Request, res: Response) => {
  try {
    const dtoArr = plainToInstance(
      UpdateTreatmentBatchDto,
      req.body as UpdateTreatmentBatchDto[],
    );

    const validationErrors = await Promise.all(
      dtoArr.map((dto) => validate(dto)),
    );

    const flatValidationErrors = validationErrors.flat();

    if (flatValidationErrors.length > 0) {
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

    // TODO: добавить проверку на корректное выполнение операции
    await treatmentService.updateTreatmentBatch(dtoArr);

    sendResponse(res, {
      statusCode: SUCCESS_CODES.OK,
      message: {
        code: NMC.TREATMENT.UPDATED_BATCH,
      },
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const deleteTreatment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const success = await treatmentService.deleteTreatment(id);

    if (!success) {
      throw new NetworkError(
        {
          statusCode: ERROR_CODES.NOT_FOUND,
          networkMessage: {
            code: NMC.COMMON_ERRORS.NOT_FOUND,
            params: { id } satisfies NetworkMessageParamsFor<
              typeof NMC.COMMON_ERRORS.NOT_FOUND
            >,
          },
        },
        `Опция предлагамоего лечения № ${id} не найдена`,
      );
    }

    sendResponse(res, {
      statusCode: SUCCESS_CODES.OK,
      message: {
        code: NMC.TREATMENT.DELETED,
        params: {
          id,
        } satisfies NetworkMessageParamsFor<typeof NMC.TREATMENT.DELETED>,
      },
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};
