import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
} from "class-validator";

export class CreateServiceDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsUrl({
    require_tld: false, // не требовать домен верхнего уровня
  })
  imageUrl!: string;

  @IsNotEmpty()
  @IsInt()
  price!: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  procedures!: string[];

  @IsNotEmpty()
  @IsInt()
  categoryId!: number;
}

export class UpdateServiceDto {
  @IsString()
  name!: string;

  @IsUrl({
    require_tld: false, // не требовать домен верхнего уровня
  })
  imageUrl!: string;

  @IsInt()
  price!: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  procedures!: string[];

  @IsNotEmpty()
  @IsInt()
  categoryId!: number;
}

export interface ServiceResponseDto {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  procedures: string[];
  categoryId?: number;
}
