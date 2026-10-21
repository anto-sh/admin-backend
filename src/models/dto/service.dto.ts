import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";

export const SERVICE_LIMITS = {
  maxPrice: 10_000_000,
  maxNameLength: 200,
  maxProcedures: 100,
  maxProcedureLength: 500,
  maxImageUrlLength: 2048,
} as const;

export const SERVICE_IMAGE_URL_PATTERN = /^\/img\/[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$/;

const trimString = ({ value }: TransformFnParams): unknown =>
  typeof value === "string" ? value.trim() : value;

const trimProcedures = ({ value }: TransformFnParams): unknown =>
  Array.isArray(value)
    ? value.map((procedure: unknown) =>
        typeof procedure === "string" ? procedure.trim() : procedure,
      )
    : value;

export class CreateServiceDto {
  @Transform(trimString)
  @IsNotEmpty()
  @IsString()
  @MaxLength(SERVICE_LIMITS.maxNameLength, {
    message: "Название не должно превышать $constraint1 символов",
  })
  name!: string;

  @Transform(trimString)
  @IsNotEmpty()
  @IsString()
  @MaxLength(SERVICE_LIMITS.maxImageUrlLength, {
    message: "Путь к изображению не должен превышать $constraint1 символов",
  })
  @Matches(SERVICE_IMAGE_URL_PATTERN, {
    message: "Укажите локальный путь к изображению в формате /img/имя-файла",
  })
  imageUrl!: string;

  @IsInt()
  @Min(0)
  @Max(SERVICE_LIMITS.maxPrice, {
    message: "Цена не должна превышать $constraint1 ₽",
  })
  price!: number;

  @Transform(trimProcedures)
  @IsArray()
  @ArrayMaxSize(SERVICE_LIMITS.maxProcedures, {
    message: "Количество процедур не должно превышать $constraint1",
  })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(SERVICE_LIMITS.maxProcedureLength, {
    each: true,
    message: "Название процедуры не должно превышать $constraint1 символов",
  })
  procedures!: string[];

  @IsInt()
  @Min(1)
  categoryId!: number;
}

export class UpdateServiceDto {
  @Transform(trimString)
  @IsNotEmpty()
  @IsString()
  @MaxLength(SERVICE_LIMITS.maxNameLength, {
    message: "Название не должно превышать $constraint1 символов",
  })
  name?: string;

  @Transform(trimString)
  @IsNotEmpty()
  @IsString()
  @MaxLength(SERVICE_LIMITS.maxImageUrlLength, {
    message: "Путь к изображению не должен превышать $constraint1 символов",
  })
  @Matches(SERVICE_IMAGE_URL_PATTERN, {
    message: "Укажите локальный путь к изображению в формате /img/имя-файла",
  })
  imageUrl?: string;

  @IsInt()
  @Min(0)
  @Max(SERVICE_LIMITS.maxPrice, {
    message: "Цена не должна превышать $constraint1 ₽",
  })
  price?: number;

  @Transform(trimProcedures)
  @IsArray()
  @ArrayMaxSize(SERVICE_LIMITS.maxProcedures, {
    message: "Количество процедур не должно превышать $constraint1",
  })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(SERVICE_LIMITS.maxProcedureLength, {
    each: true,
    message: "Название процедуры не должно превышать $constraint1 символов",
  })
  procedures?: string[];

  @IsInt()
  @Min(1)
  categoryId?: number;
}

export interface ServiceResponseDto {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  procedures: string[];
  categoryId: number;
}
