import { AppDataSource } from "../config/database.config";
import { Price } from "../models/entities/price.entity";
import {
  CreatePriceDto,
  UpdatePriceDto,
  UpdatePriceBatchDto,
} from "../models/dto/price.dto";

const priceRepository = AppDataSource.getRepository(Price);

export const getAllPrices = () => {
  return priceRepository.find();
};

export const getPriceById = (id: number) => {
  return priceRepository.findOneBy({ id });
};

export const createPrice = (dto: CreatePriceDto): Promise<Price> => {
  const price = new Price();
  price.name = dto.name;
  price.price = dto.price;
  return priceRepository.save(price);
};

export const updatePrice = (id: number, dto: UpdatePriceDto) => {
  return priceRepository.update(id, dto);
};

export const updatePriceBatch = (pricesToUpdate: UpdatePriceBatchDto[]) => {
  return priceRepository.save(pricesToUpdate);
};

export const deletePrice = async (id: number) => {
  const result = await priceRepository.delete(id);
  return result.affected !== 0;
};
