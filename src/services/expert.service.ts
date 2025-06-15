import { AppDataSource } from "../config/database.config";
import { Expert } from "../models/entities/expert.entity";
import { CreateExpertDto, UpdateExpertDto } from "../models/dto/expert.dto";
import { UpdateResult } from "typeorm";

const expertRepository = AppDataSource.getRepository(Expert);

export const getAllExperts = async (): Promise<Expert[]> => {
  return await expertRepository.find({
    relations: ["category"],
    order: { id: "ASC" },
  });
};

export const getExpertById = async (id: number): Promise<Expert | null> => {
  return await expertRepository.findOne({
    where: { id },
    relations: ["category"],
  });
};

export const createExpert = async (dto: CreateExpertDto): Promise<Expert> => {
  const expert = Expert.fromDto(dto);
  return await expertRepository.save(expert);
};

export const updateExpert = async (
  id: number,
  dto: UpdateExpertDto
): Promise<UpdateResult | null> => {
  const expert = Expert.fromDto(dto);
  return await expertRepository.update(id, expert);
};

export const deleteExpert = async (id: number): Promise<boolean> => {
  const result = await expertRepository.delete(id);
  return result.affected !== 0;
};
