import { AppDataSource } from "../config/database.config";
import { Exercise } from "../models/entities/exercise.entity";
import {
  CreateExerciseDto,
  UpdateExerciseDto,
} from "../models/dto/exercise.dto";
import { UpdateResult } from "typeorm";

const exerciseRepository = AppDataSource.getRepository(Exercise);

export const getAllExercises = async (): Promise<Exercise[]> => {
  return await exerciseRepository.find({ relations: ["category"] });
};
export const getExerciseById = async (id: number): Promise<Exercise | null> => {
  return await exerciseRepository.findOne({
    where: { id },
    relations: ["category"],
  });
};

export const createExercise = async (
  dto: CreateExerciseDto
): Promise<Exercise> => {
  const exercise = Exercise.fromDto(dto);
  return await exerciseRepository.save(exercise);
};

export const updateExercise = async (
  id: number,
  dto: UpdateExerciseDto
): Promise<UpdateResult | null> => {
  return await exerciseRepository.update(id, dto);
};

export const deleteExercise = async (id: number): Promise<boolean> => {
  const result = await exerciseRepository.delete(id);
  return result.affected !== 0;
};
