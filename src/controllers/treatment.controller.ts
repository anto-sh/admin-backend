import { Request, Response } from "express";
import * as treatmentService from "../services/treatment.service";
import {
  CreateTreatmentDto,
  UpdateTreatmentDto,
  TreatmentResponseDto,
} from "../models/dto/treatment.dto";
import { Treatment } from "../models/entities/treatment.entity";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
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
      return res.status(400).json({ errors });
    }

    const treatment = await treatmentService.createTreatment(dto);
    const data = toResponseDto(treatment);
    sendResponse(res, {
      status: "success",
      code: 201,
      message: "Data retrieved successfully",
      data,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const getAllTreatments = async (req: Request, res: Response) => {
  try {
    const treatments = await treatmentService.getAllTreatments();
    console.log(treatments);
    const data = treatments.map(toResponseDto);
    sendResponse(res, {
      status: "success",
      message: "Data retrieved successfully",
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
      return res.status(400).json({ errors });
    }

    const treatment = await treatmentService.updateTreatment(id, dto);

    if (!treatment) {
      return res.status(404).json({ message: "Treatment not found" });
    }

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
      return res.status(404).json({ message: "Treatment not found" });
    }

    res.status(204).send();
  } catch (error) {
    handleError(res, error as Error);
  }
};
