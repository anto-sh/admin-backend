import { AppDataSource } from "../config/database.config";
import { Expert } from "../models/entities/expert.entity";
import { CreateExpertDto, UpdateExpertDto } from "../models/dto/expert.dto";
import { UpdateResult } from "typeorm";

const expertRepository = AppDataSource.getRepository(Expert);

export const getAllExperts = () => {
  return expertRepository.find({
    relations: ["category"],
    order: { id: "ASC" },
  });
};

export const getExpertById = (id: number) => {
  return expertRepository.findOne({
    where: { id },
    relations: ["category"],
  });
};

export const createExpert = (dto: CreateExpertDto) => {
  const expert = Expert.fromDto(dto);
  return expertRepository.save(expert);
};

export const updateExpert = (id: number, dto: UpdateExpertDto) => {
  const expert = Expert.fromDto(dto);
  return expertRepository.update(id, expert);
};

export const deleteExpert = async (id: number) => {
  const result = await expertRepository.delete(id);
  return result.affected !== 0;
};
