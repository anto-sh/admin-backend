import { Request, Response } from "express";
import * as priceService from "../services/price.service";
import {
  CreatePriceDto,
  UpdatePriceDto,
  PriceResponseDto,
  UpdatePriceBatchDto,
} from "../models/dto/price.dto";
import { validate } from "class-validator";
import { plainToClass, plainToInstance } from "class-transformer";
import { sendResponse } from "../utils/send-response";
import { handleError } from "../utils/handle-error";
import { Price } from "../models/entities/price.entity";
import { ERROR_CODES, SUCCESS_CODES } from "../config/constants";
import { NetworkError } from "../shared/class/network-error";
import { NetworkMessageParamsFor } from "../config/network-message-params";
import { NETWORK_MESSAGE_CODES as NMC } from "../config/network-message-codes";

const toResponseDto = (entity: Price): PriceResponseDto => ({
  id: entity.id,
  name: entity.name,
  price: entity.price,
});

export const getAllPrices = async (req: Request, res: Response) => {
  try {
    const prices = await priceService.getAllPrices();
    const data = prices.map(toResponseDto);
    sendResponse(res, {
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const getPriceById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const price = await priceService.getPriceById(id);

    if (!price) {
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
        `Цена № ${id} не найдено`,
      );
    }

    sendResponse(res, {
      data: toResponseDto(price),
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const createPrice = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(CreatePriceDto, req.body);
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

    const price = await priceService.createPrice(dto);
    const data = toResponseDto(price);

    sendResponse(res, {
      statusCode: SUCCESS_CODES.CREATED,
      message: {
        code: NMC.PRICE.CREATED,
        params: {
          name: data.name,
        } satisfies NetworkMessageParamsFor<typeof NMC.PRICE.CREATED>,
      },
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const updatePrice = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const dto = plainToClass(UpdatePriceDto, req.body);
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

    const updateResult = await priceService.updatePrice(id, dto);
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
        `Цена № ${id} не найдена`,
      );
    }

    sendResponse(res, {
      statusCode: SUCCESS_CODES.OK,
      message: {
        code: NMC.PRICE.UPDATED,
        params: {
          id,
        } satisfies NetworkMessageParamsFor<typeof NMC.PRICE.UPDATED>,
      },
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const updatePriceBatch = async (req: Request, res: Response) => {
  try {
    const dtoArr = plainToInstance(
      UpdatePriceBatchDto,
      req.body as UpdatePriceBatchDto[],
    );

    const validationErrors = await Promise.all(
      dtoArr.map((dto) => validate(dto)),
    );
    const flatValidationErrors = validationErrors.flat();

    if (flatValidationErrors.length > 0) {
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

    // TODO: добавить проверку на корректное выполнение операции
    await priceService.updatePriceBatch(dtoArr);

    sendResponse(res, {
      statusCode: SUCCESS_CODES.OK,
      message: {
        code: NMC.PRICE.UPDATED_BATCH,
      },
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const deletePrice = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await priceService.deletePrice(id);

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
        `Цена № ${id} не найдена`,
      );
    }

    sendResponse(res, {
      statusCode: SUCCESS_CODES.OK,
      message: {
        code: NMC.PRICE.DELETED,
        params: {
          id,
        } satisfies NetworkMessageParamsFor<typeof NMC.PRICE.DELETED>,
      },
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};
