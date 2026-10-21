import { AppDataSource } from "../config/database.config";
import { Service } from "../models/entities/service.entity";
import { ServiceCategory } from "../models/entities/service-category.entity";
import { CreateServiceDto, UpdateServiceDto } from "../models/dto/service.dto";
import { QueryFailedError } from "typeorm";
import { NetworkError } from "../shared/class/network-error";
import { ERROR_CODES } from "../config/constants";
import { NETWORK_MESSAGE_CODES as NMC } from "@anto-sh/admin-network-shared";

const serviceRepository = AppDataSource.getRepository(Service);
const serviceCategoryRepository = AppDataSource.getRepository(ServiceCategory);

const categoryNotFoundError = () => new NetworkError(
  {
    statusCode: ERROR_CODES.VALIDATION,
    networkMessage: { code: NMC.COMMON_ERRORS.VALIDATION },
    data: {
      validationErrors: [{
        property: "categoryId",
        constraints: { categoryNotFound: "Категория не существует" },
      }],
    },
  },
  "Категория услуги не найдена",
);

const ensureCategoryExists = async (categoryId: number) => {
  if (!await serviceCategoryRepository.existsBy({ id: categoryId })) {
    throw categoryNotFoundError();
  }
};

const isForeignKeyViolation = (error: unknown): boolean =>
  error instanceof QueryFailedError &&
  error.driverError?.code === "SQLITE_CONSTRAINT_FOREIGNKEY";

export const getAllServices = () => {
  return serviceRepository.find({ relations: ["category"] });
};

export const getServiceById = (id: number) => {
  return serviceRepository.findOne({
    where: { id },
    relations: ["category"],
  });
};

export const createService = async (dto: CreateServiceDto) => {
  await ensureCategoryExists(dto.categoryId);
  const service = Service.fromDto(dto);
  try {
    return await serviceRepository.save(service);
  } catch (error) {
    if (isForeignKeyViolation(error)) throw categoryNotFoundError();
    throw error;
  }
};

export const updateService = async (
  id: number,
  dto: UpdateServiceDto,
): Promise<Service | null> => {
  if (dto.categoryId !== undefined) await ensureCategoryExists(dto.categoryId);
  const service = Service.fromDto(dto);
  try {
    const result = await serviceRepository.update(id, service);
    if (!result.affected) return null;
    return getServiceById(id);
  } catch (error) {
    if (dto.categoryId !== undefined && isForeignKeyViolation(error)) {
      throw categoryNotFoundError();
    }
    throw error;
  }
};

export const deleteService = async (id: number) => {
  const result = await serviceRepository.delete(id);
  return result.affected !== 0;
};
