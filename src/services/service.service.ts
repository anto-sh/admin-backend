import { AppDataSource } from "../config/database.config";
import { Service } from "../models/entities/service.entity";
import { CreateServiceDto, UpdateServiceDto } from "../models/dto/service.dto";
import { UpdateResult } from "typeorm";

const serviceRepository = AppDataSource.getRepository(Service);

export const getAllServices = async (): Promise<Service[]> => {
  return await serviceRepository.find({ relations: ["category"] });
};

export const getServiceById = async (id: number): Promise<Service | null> => {
  return await serviceRepository.findOne({
    where: { id },
    relations: ["category"],
  });
};

export const createService = async (
  dto: CreateServiceDto
): Promise<Service> => {
  const service = Service.fromDto(dto);
  return await serviceRepository.save(service);
};

export const updateService = async (
  id: number,
  dto: UpdateServiceDto
): Promise<UpdateResult | null> => {
  const service = Service.fromDto(dto);
  return await serviceRepository.update(id, service);
};

export const deleteService = async (id: number): Promise<boolean> => {
  const result = await serviceRepository.delete(id);
  return result.affected !== 0;
};
