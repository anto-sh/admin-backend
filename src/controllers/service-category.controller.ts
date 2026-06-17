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
import { sendResponse } from "../utils/send-response";
import { handleError } from "../utils/handle-error";
import { ERROR_CODES, SUCCESS_CODES } from "../config/constants";
import { NetworkError } from "../shared/class/network-error";
import { NETWORK_MESSAGE_CODES as NMC } from "../config/network-message-codes";
import { NetworkMessageParamsFor } from "../config/network-message-params";

const toResponseDto = (
  entity: ServiceCategory,
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
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const getAllServiceCategoriesWithServices = async (
  req: Request,
  res: Response,
) => {
  try {
    const categories =
      await serviceCategoryService.getAllServiceCategoriesWithServices();
    const data = categories.map(toResponseDto);

    sendResponse(res, {
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const createServiceCategory = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(CreateServiceCategoryDto, req.body);
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

    const category = await serviceCategoryService.createServiceCategory(dto);
    const data = toResponseDto(category);

    sendResponse(res, {
      statusCode: SUCCESS_CODES.CREATED,
      message: {
        code: NMC.SERVICE_CATEGORY.CREATED,
        params: {
          name: data.name,
          url: data.url,
        } satisfies NetworkMessageParamsFor<
          typeof NMC.SERVICE_CATEGORY.CREATED
        >,
      },
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const updateServiceCategory = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const dto = plainToClass(UpdateServiceCategoryDto, req.body);
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

    const updateResult = await serviceCategoryService.updateServiceCategory(
      id,
      dto,
    );

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
        `Категория № ${id} не найдена`,
      );
    }

    sendResponse(res, {
      message: {
        code: NMC.SERVICE_CATEGORY.UPDATED,
        params: { id } satisfies NetworkMessageParamsFor<
          typeof NMC.SERVICE_CATEGORY.UPDATED
        >,
      },
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const deleteServiceCategory = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await serviceCategoryService.deleteServiceCategory(id);

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
        `Категория № ${id} не найдена`,
      );
    }

    sendResponse(res, {
      message: {
        code: NMC.SERVICE_CATEGORY.DELETED,
        params: { id } satisfies NetworkMessageParamsFor<
          typeof NMC.SERVICE_CATEGORY.DELETED
        >,
      },
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};
