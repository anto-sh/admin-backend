import { Request, Response } from "express";
import * as serviceCategoryService from "../services/service-category.service";
import {
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
  ServiceCategoryResponseDto,
} from "../models/dto/service-category.dto";
import { ServiceCategory } from "../models/entities/service-category.entity";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { sendResponse } from "../utils/api-response";
import { handleError } from "../utils/error-handler";

const toResponseDto = (
  entity: ServiceCategory
): ServiceCategoryResponseDto => ({
  id: entity.id,
  name: entity.name,
  url: entity.url,
  services: entity.services,
});

export const getAllServiceCategories = async (req: Request, res: Response) => {
  try {
    const categories = await serviceCategoryService.getAllServiceCategories();
    const data = categories.map(toResponseDto);

    sendResponse(res, {
      status: "success",
      data,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const getAllServiceCategoriesWithServices = async (
  req: Request,
  res: Response
) => {
  try {
    const categories =
      await serviceCategoryService.getAllServiceCategoriesWithServices();
    const data = categories.map(toResponseDto);

    sendResponse(res, {
      status: "success",
      data,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const createServiceCategory = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(CreateServiceCategoryDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      handleError(res, new Error("Ошибки валидации"), 400, { errors });
      return;
    }

    const category = await serviceCategoryService.createServiceCategory(dto);
    const data = toResponseDto(category);

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

export const updateServiceCategory = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const dto = plainToClass(UpdateServiceCategoryDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      handleError(res, new Error("Ошибки валидации"), 400, { errors });
      return;
    }

    const updateResult = await serviceCategoryService.updateServiceCategory(
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

export const deleteServiceCategory = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await serviceCategoryService.deleteServiceCategory(id);

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
