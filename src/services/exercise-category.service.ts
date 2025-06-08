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
  // Проверка уникальности name
  const nameExists = await exerciseCategoryRepository.findOneBy({
    name: dto.name,
  });
  if (nameExists) {
    throw new Error("Категория с таким названием уже существует", {
      cause: 409,
    });
  }
  // Проверка уникальности url
  const urlExists = await exerciseCategoryRepository.findOneBy({
    url: dto.url,
  });
  if (urlExists) {
    throw new Error("Категория с таким url уже существует", { cause: 409 });
  }

  const exerciseCategory = ExerciseCategory.fromDto(dto);
  return await exerciseCategoryRepository.save(exerciseCategory);
};

export const updateExerciseCategory = async (
  id: number,
  dto: UpdateExerciseCategoryDto
): Promise<UpdateResult | null> => {
  // Проверка уникальности name (если передан)
  if (dto.name) {
    const nameExists = await exerciseCategoryRepository
      .createQueryBuilder("category")
      .where("category.name = :name", { name: dto.name })
      .andWhere("category.id != :id", { id })
      .getOne();
    if (nameExists) {
      throw new Error("Категория с таким именем уже существует", {
        cause: 409,
      });
    }
  }

  // Проверка уникальности url (если передан)
  if (dto.url) {
    const urlExists = await exerciseCategoryRepository
      .createQueryBuilder("category")
      .where("category.url = :url", { url: dto.url })
      .andWhere("category.id != :id", { id })
      .getOne();
    if (urlExists) {
      throw new Error("Категория с таким url уже существует", { cause: 409 });
    }
  }

  return await exerciseCategoryRepository.update(id, dto);
};

export const deleteExerciseCategory = async (id: number): Promise<boolean> => {
  const result = await exerciseCategoryRepository.delete(id);
  return result.affected !== 0;
};
