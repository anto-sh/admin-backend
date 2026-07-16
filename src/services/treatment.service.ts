import { AppDataSource } from "../config/database.config";
import { Treatment } from "../models/entities/treatment.entity";
import {
  CreateTreatmentDto,
  UpdateTreatmentBatchDto,
  UpdateTreatmentDto,
} from "../models/dto/treatment.dto";
import { UpdateResult } from "typeorm";

const treatmentRepository = AppDataSource.getRepository(Treatment);

export const getAllTreatments = () => {
  return treatmentRepository.find();
};

export const createTreatment = (dto: CreateTreatmentDto) => {
  const treatment = Treatment.fromDto(dto);
  return treatmentRepository.save(treatment);
};

export const updateTreatment = (id: number, dto: UpdateTreatmentDto) => {
  return treatmentRepository.update(id, dto);
};

export const updateTreatmentBatch = (
  treatmentsToUpdate: UpdateTreatmentBatchDto[],
) => {
  return treatmentRepository.save(treatmentsToUpdate);
};

export const deleteTreatment = async (id: number): Promise<boolean> => {
  const result = await treatmentRepository.delete(id);
  return result.affected !== 0;
};
