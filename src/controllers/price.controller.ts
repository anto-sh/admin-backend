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
import { sendResponse } from "../utils/api-response";
import { handleError } from "../utils/error-handler";
import { Price } from "../models/entities/price.entity";

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
      status: "success",
      data,
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const getPriceById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const price = await priceService.getPriceById(id);

    if (!price) {
      handleError(res, new Error("Цена не найдена"), 404);
      return;
    }

    sendResponse(res, {
      status: "success",
      data: toResponseDto(price),
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const createPrice = async (req: Request, res: Response) => {
  try {
    const dto = plainToClass(CreatePriceDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      handleError(res, new Error("Ошибки валидации"), 400, { errors });
      return;
    }

    const price = await priceService.createPrice(dto);
    sendResponse(res, {
      status: "success",
      code: 201,
      message: "Новая цена успешно добавлена",
      data: toResponseDto(price),
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const updatePrice = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const dto = plainToClass(UpdatePriceDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      handleError(res, new Error("Ошибки валидации"), 400, { errors });
      return;
    }

    await priceService.updatePrice(id, dto);
    sendResponse(res, {
      status: "success",
      message: "Цена успешно обновлена",
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const updatePriceBatch = async (req: Request, res: Response) => {
  try {
    const dtoArr = plainToInstance(
      UpdatePriceBatchDto,
      req.body as UpdatePriceBatchDto[]
    );

    const errors = await Promise.all(dtoArr.map((dto) => validate(dto)));
    const flatErrors = errors.flat();

    if (flatErrors.length > 0) {
      handleError(res, new Error("Ошибки валидации"), 400, {
        errors: flatErrors,
      });
      return;
    }

    await priceService.updatePriceBatch(dtoArr);

    sendResponse(res, {
      status: "success",
      message: "Таблица цен успешно обновлена",
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};

export const deletePrice = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await priceService.deletePrice(id);
    sendResponse(res, {
      status: "success",
      message: "Цена успешно удалена",
    });
  } catch (error) {
    handleError(res, error as Error);
  }
};
