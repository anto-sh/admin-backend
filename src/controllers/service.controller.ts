import { Request, Response } from "express";
import * as serviceService from "../services/service.service";
import {
  CreateServiceDto,
  UpdateServiceDto,
  ServiceResponseDto,
} from "../models/dto/service.dto";
import { Service } from "../models/entities/service.entity";
import { validate, ValidationError, ValidatorOptions } from "class-validator";
import { ClassConstructor, plainToClass } from "class-transformer";
import { sendResponse } from "../utils/send-response";
import { handleError } from "../utils/handle-error";
import { ERROR_CODES, SUCCESS_CODES } from "../config/constants";
import { NetworkError } from "../shared/class/network-error";
import { NETWORK_MESSAGE_CODES as NMC } from "@anto-sh/admin-network-shared";
 
import { NetworkMessageParamsFor } from "@anto-sh/admin-network-shared";

const parseServiceId = (value: unknown): number => {
  const id = typeof value === "string" ? Number(value) : NaN;

  if (!Number.isSafeInteger(id) || id < 1 || String(id) !== value) {
    throw new NetworkError(
      {
        statusCode: ERROR_CODES.BAD_REQUEST,
        networkMessage: { code: NMC.COMMON_ERRORS.VALIDATION },
        data: {
          validationErrors: [{
            property: "id",
            constraints: {
              isInt: "ID услуги должен быть положительным целым числом без ведущих нулей",
            },
          }],
        },
      },
      "Некорректный ID услуги",
    );
  }

  return id;
};

const validateServiceDto = async <T extends object>(
  Dto: ClassConstructor<T>,
  body: unknown,
  options: Pick<ValidatorOptions, "skipUndefinedProperties"> = {},
): Promise<T> => {
  const validationErrors: ValidationError[] = [];
  const isObjectBody = body !== null && typeof body === "object" && !Array.isArray(body);
  const dto = plainToClass(Dto, isObjectBody ? body : {});

  if (!isObjectBody) {
    validationErrors.push({
      property: "",
      constraints: { isObject: "Тело запроса должно быть объектом" },
    });
  } else {
    validationErrors.push(...await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false, value: false },
      ...options,
    }));

    const fields = Object.keys(body);
    for (const property of fields) {
      if (!Object.prototype.hasOwnProperty.call(dto, property)) {
        validationErrors.push({
          property,
          constraints: { whitelistValidation: `Неизвестное поле: ${property}` },
        });
      }
    }

    if (options.skipUndefinedProperties && fields.length === 0) {
      validationErrors.push({
        property: "",
        constraints: { isNotEmptyObject: "Укажите хотя бы одно изменение" },
      });
    }
  }

  if (validationErrors.length > 0) {
    throw new NetworkError(
      {
        statusCode: ERROR_CODES.VALIDATION,
        networkMessage: { code: NMC.COMMON_ERRORS.VALIDATION },
        data: { validationErrors },
      },
      "Ошибки валидации",
    );
  }

  return dto;
};

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
    const id = parseServiceId(req.params.id);
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
    const dto = await validateServiceDto(CreateServiceDto, req.body);

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
    const id = parseServiceId(req.params.id);
    const dto = await validateServiceDto(UpdateServiceDto, req.body, {
      skipUndefinedProperties: true,
    });

    const service = await serviceService.updateService(id, dto);

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
      statusCode: SUCCESS_CODES.OK,
      message: {
        code: NMC.SERVICE.UPDATED,
        params: {
          id,
        } satisfies NetworkMessageParamsFor<typeof NMC.SERVICE.UPDATED>,
      },
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const id = parseServiceId(req.params.id);
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
