import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { Transform } from "class-transformer";
import { VALIDATION_CODES as VC } from "@anto-sh/admin-network-shared";
import { ValidateItems, validationContext } from "../../shared/validation";
import { trimStringTransform } from "../../shared/transformers/trim-string";

export const SERVICE_LIMITS = {
  maxPrice: 10_000_000,
  maxNameLength: 200,
  maxProcedures: 100,
  maxProcedureLength: 500,
  maxImageUrlLength: 2048,
} as const;

export const SERVICE_IMAGE_URL_PATTERN =
  /^\/img\/[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$/;

export class ServiceProcedureDto {
  @Transform(trimStringTransform)
  @IsNotEmpty(validationContext({ code: VC.REQUIRED }))
  @IsString(validationContext({ code: VC.STRING }))
  @MaxLength(
    SERVICE_LIMITS.maxProcedureLength,
    validationContext({
      code: VC.MAX_LENGTH,
      params: { max: SERVICE_LIMITS.maxProcedureLength },
    }),
  )
  value!: string;
}

export class CreateServiceDto {
  @Transform(trimStringTransform)
  @IsNotEmpty(validationContext({ code: VC.REQUIRED }))
  @IsString(validationContext({ code: VC.STRING }))
  @MaxLength(
    SERVICE_LIMITS.maxNameLength,
    validationContext({
      code: VC.MAX_LENGTH,
      params: { max: SERVICE_LIMITS.maxNameLength },
    }),
  )
  name!: string;

  @Transform(trimStringTransform)
  @IsNotEmpty(validationContext({ code: VC.REQUIRED }))
  @IsString(validationContext({ code: VC.STRING }))
  @MaxLength(
    SERVICE_LIMITS.maxImageUrlLength,
    validationContext({
      code: VC.MAX_LENGTH,
      params: { max: SERVICE_LIMITS.maxImageUrlLength },
    }),
  )
  @Matches(
    SERVICE_IMAGE_URL_PATTERN,
    validationContext({ code: VC.IMAGE_PATH }),
  )
  imageUrl!: string;

  @IsNotEmpty(validationContext({ code: VC.REQUIRED }))
  @IsNumber({}, validationContext({ code: VC.NUMBER }))
  @IsInt(validationContext({ code: VC.INTEGER }))
  @Min(0, validationContext({ code: VC.MIN, params: { min: 0 } }))
  @Max(
    SERVICE_LIMITS.maxPrice,
    validationContext({
      code: VC.MAX,
      params: { max: SERVICE_LIMITS.maxPrice },
    }),
  )
  price!: number;

  @IsNotEmpty(validationContext({ code: VC.REQUIRED }))
  @ValidateItems(ServiceProcedureDto, { maxSize: SERVICE_LIMITS.maxProcedures })
  procedures!: string[];

  @IsNotEmpty(validationContext({ code: VC.REQUIRED }))
  @IsNumber({}, validationContext({ code: VC.NUMBER }))
  @IsInt(validationContext({ code: VC.INTEGER }))
  @Min(1, validationContext({ code: VC.MIN, params: { min: 1 } }))
  categoryId!: number;
}

export class UpdateServiceDto {
  @Transform(trimStringTransform)
  @IsNotEmpty(validationContext({ code: VC.REQUIRED }))
  @IsString(validationContext({ code: VC.STRING }))
  @MaxLength(
    SERVICE_LIMITS.maxNameLength,
    validationContext({
      code: VC.MAX_LENGTH,
      params: { max: SERVICE_LIMITS.maxNameLength },
    }),
  )
  name?: string;

  @Transform(trimStringTransform)
  @IsNotEmpty(validationContext({ code: VC.REQUIRED }))
  @IsString(validationContext({ code: VC.STRING }))
  @MaxLength(
    SERVICE_LIMITS.maxImageUrlLength,
    validationContext({
      code: VC.MAX_LENGTH,
      params: { max: SERVICE_LIMITS.maxImageUrlLength },
    }),
  )
  @Matches(
    SERVICE_IMAGE_URL_PATTERN,
    validationContext({ code: VC.IMAGE_PATH }),
  )
  imageUrl?: string;

  @IsNotEmpty(validationContext({ code: VC.REQUIRED }))
  @IsNumber({}, validationContext({ code: VC.NUMBER }))
  @IsInt(validationContext({ code: VC.INTEGER }))
  @Min(0, validationContext({ code: VC.MIN, params: { min: 0 } }))
  @Max(
    SERVICE_LIMITS.maxPrice,
    validationContext({
      code: VC.MAX,
      params: { max: SERVICE_LIMITS.maxPrice },
    }),
  )
  price?: number;

  @IsNotEmpty(validationContext({ code: VC.REQUIRED }))
  @ValidateItems(ServiceProcedureDto, { maxSize: SERVICE_LIMITS.maxProcedures })
  procedures?: string[];

  @IsNotEmpty(validationContext({ code: VC.REQUIRED }))
  @IsNumber({}, validationContext({ code: VC.NUMBER }))
  @IsInt(validationContext({ code: VC.INTEGER }))
  @Min(1, validationContext({ code: VC.MIN, params: { min: 1 } }))
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
