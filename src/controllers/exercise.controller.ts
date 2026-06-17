import { Request, Response } from "express";
import * as exerciseService from "../services/exercise.service";
import {
  CreateExerciseDto,
  UpdateExerciseDto,
  ExerciseResponseDto,
} from "../models/dto/exercise.dto";
import { Exercise } from "../models/entities/exercise.entity";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { sendResponse } from "../utils/send-response";
import { handleError } from "../utils/handle-error";
import { ERROR_CODES, SUCCESS_CODES } from "../config/constants";
import { NetworkError } from "../shared/class/network-error";
import { NETWORK_MESSAGE_CODES as NMC } from "../config/network-message-codes";
import { NetworkMessageParamsFor } from "../config/network-message-params";

const toResponseDto = (entity: Exercise): ExerciseResponseDto => ({
  id: entity.id,
  name: entity.name,
  categoryId: entity.category?.id,
  contentJson: entity.contentJson,
});

export const getAllExercises = async (req: Request, res: Response) => {
  try {
    const exercises = await exerciseService.getAllExercises();
    const data = exercises.map(toResponseDto);
    sendResponse(res, {
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const getExerciseById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const exercise = await exerciseService.getExerciseById(id);
    console.log(exercise);

    if (!exercise) {
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
        `Упражнение № ${id} не найдено`,
      );
    }

    const data = toResponseDto(exercise);
    sendResponse(res, {
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const createExercise = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(CreateExerciseDto, req.body);
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

    const exercise = await exerciseService.createExercise(dto);
    const data = toResponseDto(exercise);
    sendResponse(res, {
      statusCode: SUCCESS_CODES.CREATED,
      message: {
        code: NMC.EXERCISE.CREATED,
        params: {
          name: data.name || "Без имени",
        } satisfies NetworkMessageParamsFor<typeof NMC.EXERCISE.CREATED>,
      },
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const updateExercise = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const dto = plainToClass(UpdateExerciseDto, req.body);
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

    const updateResult = await exerciseService.updateExercise(id, dto);

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
        `Упражнение № ${id} не найдено`,
      );
    }

    sendResponse(res, {
      statusCode: SUCCESS_CODES.OK,
      message: {
        code: NMC.EXERCISE.UPDATED,
        params: {
          id,
        } satisfies NetworkMessageParamsFor<typeof NMC.EXERCISE.UPDATED>,
      },
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const deleteExercise = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await exerciseService.deleteExercise(id);

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
        `Упражнение № ${id} не найдено`,
      );
    }

    sendResponse(res, {
      statusCode: SUCCESS_CODES.OK,
      message: {
        code: NMC.EXERCISE.DELETED,
        params: {
          id,
        } satisfies NetworkMessageParamsFor<typeof NMC.EXERCISE.DELETED>,
      },
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};
