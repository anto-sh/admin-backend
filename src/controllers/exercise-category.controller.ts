import { Request, Response } from "express";
import * as exerciseCategoryService from "../services/exercise-category.service";
import {
  CreateExerciseCategoryDto,
  UpdateExerciseCategoryDto,
  ExerciseCategoryResponseDto,
} from "../models/dto/exercise-category.dto";
import { ExerciseCategory } from "../models/entities/exercise-category.entity";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { sendResponse } from "../utils/send-response";
import { handleError } from "../utils/handle-error";
import { ERROR_CODES, SUCCESS_CODES } from "../config/constants";
import { NetworkError } from "../shared/class/network-error";
import { NETWORK_MESSAGE_CODES as NMC } from "../config/network-message-codes";
import { NetworkMessageParamsFor } from "../config/network-message-params";

const toResponseDto = (
  entity: ExerciseCategory,
): ExerciseCategoryResponseDto => ({
  id: entity.id,
  name: entity.name,
  url: entity.url,
  exercises: entity.exercises,
});

export const getAllExerciseCategories = async (req: Request, res: Response) => {
  try {
    const exerciseCategories =
      await exerciseCategoryService.getAllExerciseCategories();
    const data = exerciseCategories.map(toResponseDto);

    sendResponse(res, {
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const getAllExerciseCategoriesWithExercises = async (
  req: Request,
  res: Response,
) => {
  try {
    const exerciseCategories =
      await exerciseCategoryService.getAllExerciseCategoriesWithExercises();
    const data = exerciseCategories.map(toResponseDto);

    sendResponse(res, {
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const createExerciseCategory = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(CreateExerciseCategoryDto, req.body);
    const validationErrors = await validate(dto);

    if (validationErrors.length > 0) {
      throw new NetworkError({
        statusCode: ERROR_CODES.VALIDATION,
        networkMessage: {
          code: NMC.COMMON_ERRORS.VALIDATION,
        },
        data: { validationErrors },
      });
    }

    const exerciseCategory =
      await exerciseCategoryService.createExerciseCategory(dto);
    const data = toResponseDto(exerciseCategory);

    sendResponse(res, {
      statusCode: SUCCESS_CODES.CREATED,
      message: {
        code: NMC.EXERCISE_CATEGORY.CREATED,
        params: {
          name: data.name,
          url: data.url,
        },
      },
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const updateExerciseCategory = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const dto = plainToClass(UpdateExerciseCategoryDto, req.body);
    const validationErrors = await validate(dto);

    if (validationErrors.length > 0) {
      throw new NetworkError({
        statusCode: ERROR_CODES.VALIDATION,
        networkMessage: {
          code: NMC.COMMON_ERRORS.VALIDATION,
        },
        data: { validationErrors },
      });
    }

    const updateResult = await exerciseCategoryService.updateExerciseCategory(
      id,
      dto,
    );

    if (!updateResult?.affected) {
      throw new NetworkError(
        {
          statusCode: ERROR_CODES.NOT_FOUND,
          networkMessage: {
            code: NMC.EXERCISE_CATEGORY.ERROR.NOT_FOUND,
            params: {
              id,
            },
          },
        },
        `Категория № ${id} не найдена`,
      );
    }

    sendResponse(res, {
      message: {
        code: NMC.EXERCISE_CATEGORY.UPDATED,
        //TODO: Делать ли так? Или придумать другой способ?
        params: { id } satisfies NetworkMessageParamsFor<
          typeof NMC.EXERCISE_CATEGORY.UPDATED
        >,
      },
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const deleteExerciseCategory = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await exerciseCategoryService.deleteExerciseCategory(id);

    if (!success) {
      throw new NetworkError(
        {
          statusCode: ERROR_CODES.NOT_FOUND,
          networkMessage: {
            code: NMC.EXERCISE_CATEGORY.ERROR.NOT_FOUND,
            params: {
              id,
            },
          },
        },
        `Категория № ${id} не найдена`,
      );
    }

    sendResponse(res, {
      message: {
        code: NMC.EXERCISE_CATEGORY.DELETED,
        params: {
          id,
        },
      },
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};
