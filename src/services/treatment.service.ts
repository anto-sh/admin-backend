import { AppDataSource } from "../config/database.config";
import { Treatment } from "../models/entities/treatment.entity";
import {
  CreateTreatmentDto,
  UpdateTreatmentBatchDto,
  UpdateTreatmentDto,
} from "../models/dto/treatment.dto";
import { UpdateResult } from "typeorm";

const treatmentRepository = AppDataSource.getRepository(Treatment);

export const createTreatment = async (
  dto: CreateTreatmentDto
): Promise<Treatment> => {
  const treatment = Treatment.fromDto(dto);
  return await treatmentRepository.save(treatment);
};

export const getAllTreatments = async (): Promise<Treatment[]> => {
  return await treatmentRepository.find();
};

export const updateTreatment = async (
  id: number,
  dto: UpdateTreatmentDto
): Promise<UpdateResult | null> => {
  return await treatmentRepository.update(id, dto);
};

export const updateTreatmentBatch = async (
  treatmentsToUpdate: UpdateTreatmentBatchDto[]
): Promise<void> => {
  await treatmentRepository.save(treatmentsToUpdate);
};

export const deleteTreatment = async (id: number): Promise<boolean> => {
  const result = await treatmentRepository.delete(id);
  return result.affected !== 0;
};
