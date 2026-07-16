import { AppDataSource } from "../config/database.config";
import { Exercise } from "../models/entities/exercise.entity";
import {
  CreateExerciseDto,
  UpdateExerciseDto,
} from "../models/dto/exercise.dto";

const exerciseRepository = AppDataSource.getRepository(Exercise);

export const getAllExercises = () => {
  return exerciseRepository.find({ relations: ["category"] });
};
export const getExerciseById = (id: number) => {
  return exerciseRepository.findOne({
    where: { id },
    relations: ["category"],
  });
};

export const createExercise = (dto: CreateExerciseDto) => {
  const exercise = Exercise.fromDto(dto);
  return exerciseRepository.save(exercise);
};

export const updateExercise = (id: number, dto: UpdateExerciseDto) => {
  const exercise = Exercise.fromDto(dto);
  return exerciseRepository.update(id, exercise);
};

export const deleteExercise = async (id: number) => {
  const result = await exerciseRepository.delete(id);
  return result.affected !== 0;
};
