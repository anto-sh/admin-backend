import { AppDataSource } from "../config/database.config";
import { Example } from "../models/entities/example.entity";
import { CreateExampleDto, UpdateExampleDto } from "../models/dto/example.dto";

const exampleRepository = AppDataSource.getRepository(Example);

export const createExample = async (
  dto: CreateExampleDto
): Promise<Example> => {
  const example = Example.fromDto(dto);
  return await exampleRepository.save(example);
};

export const getExampleById = async (id: number): Promise<Example | null> => {
  return await exampleRepository.findOneBy({ id });
};

export const getAllExamples = async (): Promise<Example[]> => {
  return await exampleRepository.find();
};

export const updateExample = async (
  id: number,
  dto: UpdateExampleDto
): Promise<Example | null> => {
  await exampleRepository.update(id, dto);
  return await getExampleById(id);
};

export const deleteExample = async (id: number): Promise<boolean> => {
  const result = await exampleRepository.delete(id);
  return result.affected !== 0;
};
