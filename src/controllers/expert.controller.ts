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
import { sendResponse } from "../utils/api-response";
import { handleError } from "../utils/error-handler";

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
      status: "success",
      data,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const getExpertById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const expert = await expertService.getExpertById(id);

    if (!expert) {
      handleError(res, new Error("Специалист не найден"), 404);
      return;
    }

    const data = toResponseDto(expert);
    sendResponse(res, {
      status: "success",
      data,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const createExpert = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(CreateExpertDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      handleError(res, new Error("Ошибки валидации"), 400, { errors });
      return;
    }

    const expert = await expertService.createExpert(dto);
    const data = toResponseDto(expert);

    sendResponse(res, {
      status: "success",
      code: 201,
      message: "Новый специалист успешно добавлен",
      data,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const updateExpert = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const dto = plainToClass(UpdateExpertDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      handleError(res, new Error("Ошибки валидации"), 400, { errors });
      return;
    }

    const updateResult = await expertService.updateExpert(id, dto);

    if (!updateResult?.affected) {
      handleError(res, new Error("Специалист не найден"), 404);
      return;
    }

    sendResponse(res, {
      status: "success",
      message: `Специалист № ${id} успешно обновлен`,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const deleteExpert = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await expertService.deleteExpert(id);

    if (!success) {
      handleError(res, new Error("Специалист не найден"), 404);
      return;
    }

    sendResponse(res, {
      status: "success",
      message: "Специалист успешно удален",
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};
