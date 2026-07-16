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
import { sendResponse } from "../utils/send-response";
import { handleError } from "../utils/handle-error";
import { ERROR_CODES, SUCCESS_CODES } from "../config/constants";
import { NetworkError } from "../shared/class/network-error";
import { NETWORK_MESSAGE_CODES as NMC } from "@anto-sh/admin-network-shared";
 
import { NetworkMessageParamsFor } from "@anto-sh/admin-network-shared";

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
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const getServiceById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const service = await serviceService.getServiceById(id);

    if (!service) {
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
        `Услуга № ${id} не найдена`,
      );
    }

    const data = toResponseDto(service);
    sendResponse(res, {
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(CreateServiceDto, req.body);
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

    const service = await serviceService.createService(dto);
    const data = toResponseDto(service);

    sendResponse(res, {
      statusCode: SUCCESS_CODES.CREATED,
      message: {
        code: NMC.SERVICE.CREATED,
        params: {
          name: data.name,
        } satisfies NetworkMessageParamsFor<typeof NMC.SERVICE.CREATED>,
      },
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const dto = plainToClass(UpdateServiceDto, req.body);
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

    const updateResult = await serviceService.updateService(id, dto);

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
        `Услуга № ${id} не найдена`,
      );
    }

    sendResponse(res, {
      statusCode: SUCCESS_CODES.OK,
      message: {
        code: NMC.SERVICE.UPDATED,
        params: {
          id,
        } satisfies NetworkMessageParamsFor<typeof NMC.SERVICE.UPDATED>,
      },
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const success = await serviceService.deleteService(id);

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
        `Услуга № ${id} не найдена`,
      );
    }

    sendResponse(res, {
      statusCode: SUCCESS_CODES.OK,
      message: {
        code: NMC.SERVICE.DELETED,
        params: {
          id,
        } satisfies NetworkMessageParamsFor<typeof NMC.SERVICE.DELETED>,
      },
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};
