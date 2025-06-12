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
import { sendResponse } from "../utils/api-response";
import { handleError } from "../utils/error-handler";

const toResponseDto = (
  entity: ExerciseCategory
): ExerciseCategoryResponseDto => ({
  id: entity.id,
  name: entity.name,
  url: entity.url,
  exercises: entity.exercises,
});

export const getAllExerciseCategories = async (req: Request, res: Response) => {
  try {
    const exerciseCategories =
      await exerciseCategoryService.getAllExerciseCategoriesWithExercises();
    const data = exerciseCategories.map(toResponseDto);

    sendResponse(res, {
      status: "success",
      data,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const getAllExerciseCategoriesWithExercises = async (
  req: Request,
  res: Response
) => {
  try {
    const exerciseCategories =
      await exerciseCategoryService.getAllExerciseCategoriesWithExercises();
    const data = exerciseCategories.map(toResponseDto);

    sendResponse(res, {
      status: "success",
      data,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const createExerciseCategory = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(CreateExerciseCategoryDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      handleError(res, new Error("Ошибки валидации"), 400, { errors });
      return;
    }

    const exerciseCategory =
      await exerciseCategoryService.createExerciseCategory(dto);
    const data = toResponseDto(exerciseCategory);
    sendResponse(res, {
      status: "success",
      code: 201,
      message: "Новая категория успешно добавлена",
      data,
    });
  } catch (error) {
    if ((error as Error).cause === 409) handleError(res, error as Error, 409);
    else handleError(res, error as Error);
  }
};

export const updateExerciseCategory = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const dto = plainToClass(UpdateExerciseCategoryDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      handleError(res, new Error("Ошибки валидации"), 400, { errors });
      return;
    }

    const updateResult = await exerciseCategoryService.updateExerciseCategory(
      id,
      dto
    );

    if (!updateResult?.affected) {
      handleError(res, new Error("Категория не найдена"), 404);
      return;
    }

    sendResponse(res, {
      status: "success",
      message: `Категория № ${id} успешно обновлена`,
    });
  } catch (error) {
    if ((error as Error).cause === 409) handleError(res, error as Error, 409);
    else handleError(res, error as Error);
  }
};

export const deleteExerciseCategory = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await exerciseCategoryService.deleteExerciseCategory(id);

    if (!success) {
      handleError(res, new Error("Категория не найдена"), 404);
      return;
    }

    sendResponse(res, {
      status: "success",
      message: "Категория успешно удалена",
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};
