import { AppDataSource } from "../config/database.config";
import { ExerciseCategory } from "../models/entities/exercise-category.entity";
import {
  CreateExerciseCategoryDto,
  UpdateExerciseCategoryDto,
} from "../models/dto/exercise-category.dto";
import { NetworkError } from "../shared/class/network-error";
import { ERROR_CODES } from "../config/constants";
import { NETWORK_MESSAGE_CODES as NMC } from "@anto-sh/admin-network-shared";
 
import { NetworkMessageParamsFor } from "@anto-sh/admin-network-shared";

const exerciseCategoryRepository =
  AppDataSource.getRepository(ExerciseCategory);

export const getAllExerciseCategories = async (): Promise<
  ExerciseCategory[]
> => {
  return await exerciseCategoryRepository.find();
};

export const getAllExerciseCategoriesWithExercises = () => {
  return exerciseCategoryRepository.find({ relations: ["exercises"] });
};

export const createExerciseCategory = async (
  dto: CreateExerciseCategoryDto,
) => {
  // Проверка уникальности name
  const nameExists = await exerciseCategoryRepository.findOneBy({
    name: dto.name,
  });
  if (nameExists) {
    throw new NetworkError(
      {
        statusCode: ERROR_CODES.CONFLICT,
        networkMessage: {
          code: NMC.EXERCISE_CATEGORY.ERROR.DUPLICATE_NAME,
          params: {
            name: dto.name,
          } satisfies NetworkMessageParamsFor<
            typeof NMC.EXERCISE_CATEGORY.ERROR.DUPLICATE_NAME
          >,
        },
      },
      "Категория с таким названием уже существует",
    );
  }

  // Проверка уникальности url
  const urlExists = await exerciseCategoryRepository.findOneBy({
    url: dto.url,
  });
  if (urlExists) {
    throw new NetworkError(
      {
        statusCode: ERROR_CODES.CONFLICT,
        networkMessage: {
          code: NMC.EXERCISE_CATEGORY.ERROR.DUPLICATE_URL,
          params: {
            url: dto.url,
          } satisfies NetworkMessageParamsFor<
            typeof NMC.EXERCISE_CATEGORY.ERROR.DUPLICATE_URL
          >,
        },
      },
      "Категория с таким url уже существует",
    );
  }

  const exerciseCategory = ExerciseCategory.fromDto(dto);
  return await exerciseCategoryRepository.save(exerciseCategory);
};

export const updateExerciseCategory = (
  id: number,
  dto: UpdateExerciseCategoryDto,
) => {
  return exerciseCategoryRepository.update(id, dto);
};

export const deleteExerciseCategory = async (id: number) => {
  const result = await exerciseCategoryRepository.delete(id);
  return result.affected !== 0;
};
