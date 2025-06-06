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
import { sendResponse } from "../utils/api-response";
import { handleError } from "../utils/error-handler";

const toResponseDto = (entity: Treatment): TreatmentResponseDto => ({
  id: entity.id,
  name: entity.name,
});

export const createTreatment = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(CreateTreatmentDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      handleError(res, new Error("Ошибки валидации"), 400, { errors });
      return;
    }

    const treatment = await treatmentService.createTreatment(dto);
    const data = toResponseDto(treatment);
    sendResponse(res, {
      status: "success",
      code: 201,
      message: "Новая опция предлагаемого лечения успешно добавлена",
      data,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const getAllTreatments = async (req: Request, res: Response) => {
  try {
    const treatments = await treatmentService.getAllTreatments();
    const data = treatments.map(toResponseDto);
    sendResponse(res, {
      status: "success",
      data,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const updateTreatment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const dto = plainToClass(UpdateTreatmentDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      handleError(res, new Error("Ошибки валидации"), 400, { errors });
      return;
    }

    const updateResult = await treatmentService.updateTreatment(id, dto);

    if (!updateResult?.affected) {
      handleError(res, new Error("Опция не найдена"), 404);
      return;
    }

    sendResponse(res, {
      status: "success",
      message: `Опция предлагаемого лечения № ${id} успешно обновлена`,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const updateTreatmentBatch = async (req: Request, res: Response) => {
  try {
    const dtoArr = plainToInstance(
      UpdateTreatmentBatchDto,
      req.body as UpdateTreatmentBatchDto[]
    );

    const errors = await Promise.all(dtoArr.map((dto) => validate(dto)));

    if (errors.flat().length > 0) {
      handleError(res, new Error("Ошибки валидации"), 400, { errors });
      return;
    }

    await treatmentService.updateTreatmentBatch(dtoArr);

    sendResponse(res, {
      status: "success",
      message: "Список предлагаемого лечения успешно обновлён",
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const deleteTreatment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await treatmentService.deleteTreatment(id);

    if (!success) {
      handleError(res, new Error("Опция не найдена"), 404);
      return;
    }

    sendResponse(res, {
      status: "success",
      message: "Опция предлагаемого лечения успешно удалена",
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};
