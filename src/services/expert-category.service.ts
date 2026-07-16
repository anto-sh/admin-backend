import { AppDataSource } from "../config/database.config";
import { ExpertCategory } from "../models/entities/expert-category.entity";

const expertCategoryRepository = AppDataSource.getRepository(ExpertCategory);

export const getAllExpertCategories = () => {
  return expertCategoryRepository.find();
};

export const getAllExpertCategoriesWithExperts = () => {
  return expertCategoryRepository.find({ relations: ["experts"] });
};
