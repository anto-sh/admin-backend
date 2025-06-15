import { AppDataSource } from "../config/database.config";
import { Price } from "../models/entities/price.entity";
import {
  CreatePriceDto,
  UpdatePriceDto,
  UpdatePriceBatchDto,
} from "../models/dto/price.dto";
import { UpdateResult } from "typeorm";

const priceRepository = AppDataSource.getRepository(Price);

export const getAllPrices = async (): Promise<Price[]> => {
  return await priceRepository.find();
};

export const getPriceById = async (id: number): Promise<Price | null> => {
  return await priceRepository.findOneBy({ id });
};

export const createPrice = async (dto: CreatePriceDto): Promise<Price> => {
  const price = new Price();
  price.name = dto.name;
  price.price = dto.price;
  return await priceRepository.save(price);
};

export const updatePrice = async (
  id: number,
  dto: UpdatePriceDto
): Promise<UpdateResult | null> => {
  return await priceRepository.update(id, dto);
};

export const updatePriceBatch = async (
  pricesToUpdate: UpdatePriceBatchDto[]
): Promise<void> => {
  await priceRepository.save(pricesToUpdate);
};

export const deletePrice = async (id: number): Promise<boolean> => {
  const result = await priceRepository.delete(id);
  return result.affected !== 0;
};
