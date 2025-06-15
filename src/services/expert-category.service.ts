import { AppDataSource } from "../config/database.config";
import { ExpertCategory } from "../models/entities/expert-category.entity";

const expertCategoryRepository = AppDataSource.getRepository(ExpertCategory);

export const getAllExpertCategories = async (): Promise<ExpertCategory[]> => {
  return await expertCategoryRepository.find();
};

export const getAllExpertCategoriesWithExperts = async (): Promise<
  ExpertCategory[]
> => {
  return await expertCategoryRepository.find({ relations: ["experts"] });
};
