import { AppDataSource } from "../config/database.config";
import { ServiceCategory } from "../models/entities/service-category.entity";
import {
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
} from "../models/dto/service-category.dto";
import { NetworkError } from "../shared/class/network-error";
import { NETWORK_MESSAGE_CODES as NMC } from "../config/network-message-codes";
import { ERROR_CODES } from "../config/constants";
import { NetworkMessageParamsFor } from "../config/network-message-params";

const serviceCategoryRepository = AppDataSource.getRepository(ServiceCategory);

export const getAllServiceCategories = () => {
  return serviceCategoryRepository.find();
};

export const getAllServiceCategoriesWithServices = () => {
  return serviceCategoryRepository.find({ relations: ["services"] });
};

export const createServiceCategory = async (
  dto: CreateServiceCategoryDto,
): Promise<ServiceCategory> => {
  // Проверка уникальности name
  const nameExists = await serviceCategoryRepository.findOneBy({
    name: dto.name,
  });
  if (nameExists) {
    throw new NetworkError(
      {
        statusCode: ERROR_CODES.CONFLICT,
        networkMessage: {
          code: NMC.SERVICE_CATEGORY.ERROR.DUPLICATE_NAME,
          params: {
            name: dto.name,
          } satisfies NetworkMessageParamsFor<
            typeof NMC.SERVICE_CATEGORY.ERROR.DUPLICATE_NAME
          >,
        },
      },
      "Категория с таким названием уже существует",
    );
  }

  // Проверка уникальности url
  const urlExists = await serviceCategoryRepository.findOneBy({
    url: dto.url,
  });
  if (urlExists) {
    throw new NetworkError(
      {
        statusCode: ERROR_CODES.CONFLICT,
        networkMessage: {
          code: NMC.SERVICE_CATEGORY.ERROR.DUPLICATE_URL,
          params: {
            url: dto.url,
          } satisfies NetworkMessageParamsFor<
            typeof NMC.SERVICE_CATEGORY.ERROR.DUPLICATE_URL
          >,
        },
      },
      "Категория с таким url уже существует",
    );
  }

  const category = ServiceCategory.fromDto(dto);
  return await serviceCategoryRepository.save(category);
};

export const updateServiceCategory = (
  id: number,
  dto: UpdateServiceCategoryDto,
) => {
  return serviceCategoryRepository.update(id, dto);
};

export const deleteServiceCategory = async (id: number) => {
  const result = await serviceCategoryRepository.delete(id);
  return result.affected !== 0;
};
