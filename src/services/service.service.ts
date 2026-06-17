import { AppDataSource } from "../config/database.config";
import { Service } from "../models/entities/service.entity";
import { CreateServiceDto, UpdateServiceDto } from "../models/dto/service.dto";
import { UpdateResult } from "typeorm";

const serviceRepository = AppDataSource.getRepository(Service);

export const getAllServices = () => {
  return serviceRepository.find({ relations: ["category"] });
};

export const getServiceById = (id: number) => {
  return serviceRepository.findOne({
    where: { id },
    relations: ["category"],
  });
};

export const createService = (dto: CreateServiceDto) => {
  const service = Service.fromDto(dto);
  return serviceRepository.save(service);
};

export const updateService = (id: number, dto: UpdateServiceDto) => {
  const service = Service.fromDto(dto);
  return serviceRepository.update(id, service);
};

export const deleteService = async (id: number) => {
  const result = await serviceRepository.delete(id);
  return result.affected !== 0;
};
