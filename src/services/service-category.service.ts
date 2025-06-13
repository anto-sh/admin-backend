import { AppDataSource } from "../config/database.config";
import { ServiceCategory } from "../models/entities/service-category.entity";
import {
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
} from "../models/dto/service-category.dto";
import { UpdateResult } from "typeorm";

const serviceCategoryRepository = AppDataSource.getRepository(ServiceCategory);

export const getAllServiceCategories = async (): Promise<ServiceCategory[]> => {
  return await serviceCategoryRepository.find();
};

export const getAllServiceCategoriesWithServices = async (): Promise<
  ServiceCategory[]
> => {
  return await serviceCategoryRepository.find({ relations: ["services"] });
};

export const createServiceCategory = async (
  dto: CreateServiceCategoryDto
): Promise<ServiceCategory> => {
  // Проверка уникальности name
  const nameExists = await serviceCategoryRepository.findOneBy({
    name: dto.name,
  });
  if (nameExists) {
    throw new Error("Категория с таким названием уже существует", {
      cause: 409,
    });
  }

  // Проверка уникальности url
  const urlExists = await serviceCategoryRepository.findOneBy({
    url: dto.url,
  });
  if (urlExists) {
    throw new Error("Категория с таким url уже существует", { cause: 409 });
  }

  const category = ServiceCategory.fromDto(dto);
  return await serviceCategoryRepository.save(category);
};

export const updateServiceCategory = async (
  id: number,
  dto: UpdateServiceCategoryDto
): Promise<UpdateResult | null> => {
  // Проверка уникальности name (если передан)
  if (dto.name) {
    const nameExists = await serviceCategoryRepository
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
    const urlExists = await serviceCategoryRepository
      .createQueryBuilder("category")
      .where("category.url = :url", { url: dto.url })
      .andWhere("category.id != :id", { id })
      .getOne();
    if (urlExists) {
      throw new Error("Категория с таким url уже существует", { cause: 409 });
    }
  }

  return await serviceCategoryRepository.update(id, dto);
};

export const deleteServiceCategory = async (id: number): Promise<boolean> => {
  const result = await serviceCategoryRepository.delete(id);
  return result.affected !== 0;
};
