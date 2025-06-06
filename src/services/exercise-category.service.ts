import { AppDataSource } from "../config/database.config";
import { ExerciseCategory } from "../models/entities/exercise-category.entity";
import {
  CreateExerciseCategoryDto,
  UpdateExerciseCategoryDto,
} from "../models/dto/exercise-category.dto";
import { UpdateResult } from "typeorm";

const exerciseCategoryRepository =
  AppDataSource.getRepository(ExerciseCategory);

export const getAllExerciseCategoriesWithExercises = async (): Promise<
  ExerciseCategory[]
> => {
  return await exerciseCategoryRepository.find({ relations: ["exercises"] });
};

export const createExerciseCategory = async (
  dto: CreateExerciseCategoryDto
): Promise<ExerciseCategory> => {
  const exerciseCategory = ExerciseCategory.fromDto(dto);
  return await exerciseCategoryRepository.save(exerciseCategory);
};

export const updateExerciseCategory = async (
  id: number,
  dto: UpdateExerciseCategoryDto
): Promise<UpdateResult | null> => {
  return await exerciseCategoryRepository.update(id, dto);
};

export const deleteExerciseCategory = async (id: number): Promise<boolean> => {
  const result = await exerciseCategoryRepository.delete(id);
  return result.affected !== 0;
};
