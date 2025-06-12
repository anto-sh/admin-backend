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
import { sendResponse } from "../utils/api-response";
import { handleError } from "../utils/error-handler";

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
      status: "success",
      data,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const getExerciseById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const exercise = await exerciseService.getExerciseById(id);
    console.log(exercise);

    if (!exercise) {
      handleError(res, new Error("Упражнение не найдено"), 404);
      return;
    }

    const data = toResponseDto(exercise);
    sendResponse(res, {
      status: "success",
      data,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const createExercise = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(CreateExerciseDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      handleError(res, new Error("Ошибки валидации"), 400, { errors });
      return;
    }

    const exercise = await exerciseService.createExercise(dto);
    const data = toResponseDto(exercise);
    sendResponse(res, {
      status: "success",
      code: 201,
      message: "Новое упражнение успешно добавлено",
      data,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const updateExercise = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const dto = plainToClass(UpdateExerciseDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      handleError(res, new Error("Ошибки валидации"), 400, { errors });
      return;
    }

    const updateResult = await exerciseService.updateExercise(id, dto);

    if (!updateResult?.affected) {
      handleError(res, new Error("Упражнение не найдено"), 404);
      return;
    }

    sendResponse(res, {
      status: "success",
      message: `Упражнение № ${id} успешно обновлено`,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const deleteExercise = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await exerciseService.deleteExercise(id);

    if (!success) {
      handleError(res, new Error("Упражнение не найдено"), 404);
      return;
    }

    sendResponse(res, {
      status: "success",
      message: "Упражнение успешно удалено",
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};
