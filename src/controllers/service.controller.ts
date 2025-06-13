import { Request, Response } from "express";
import * as serviceService from "../services/service.service";
import {
  CreateServiceDto,
  UpdateServiceDto,
  ServiceResponseDto,
} from "../models/dto/service.dto";
import { Service } from "../models/entities/service.entity";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { sendResponse } from "../utils/api-response";
import { handleError } from "../utils/error-handler";

const toResponseDto = (entity: Service): ServiceResponseDto => ({
  id: entity.id,
  name: entity.name,
  imageUrl: entity.imageUrl,
  price: entity.price,
  procedures: entity.procedures,
  categoryId: entity.category?.id,
});

export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await serviceService.getAllServices();
    const data = services.map(toResponseDto);

    sendResponse(res, {
      status: "success",
      data,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const getServiceById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const service = await serviceService.getServiceById(id);

    if (!service) {
      handleError(res, new Error("Услуга не найдена"), 404);
      return;
    }

    const data = toResponseDto(service);
    sendResponse(res, {
      status: "success",
      data,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(CreateServiceDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      handleError(res, new Error("Ошибки валидации"), 400, { errors });
      return;
    }

    const service = await serviceService.createService(dto);
    const data = toResponseDto(service);

    sendResponse(res, {
      status: "success",
      code: 201,
      message: "Новая услуга успешно добавлена",
      data,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const dto = plainToClass(UpdateServiceDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      handleError(res, new Error("Ошибки валидации"), 400, { errors });
      return;
    }

    const updateResult = await serviceService.updateService(id, dto);

    if (!updateResult?.affected) {
      handleError(res, new Error("Услуга не найдена"), 404);
      return;
    }

    sendResponse(res, {
      status: "success",
      message: `Услуга № ${id} успешно обновлена`,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await serviceService.deleteService(id);

    if (!success) {
      handleError(res, new Error("Услуга не найдена"), 404);
      return;
    }

    sendResponse(res, {
      status: "success",
      message: "Услуга успешно удалена",
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};
