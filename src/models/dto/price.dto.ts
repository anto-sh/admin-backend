import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsInt,
} from "class-validator";

export class CreatePriceDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsInt()
  price!: number;
}

export class UpdatePriceDto {
  @IsString()
  name?: string;

  @IsInt()
  price?: number;
}

export class UpdatePriceBatchDto {
  @IsNumber()
  id!: number;

  @IsString()
  name?: string;

  @IsInt()
  price?: number;
}

export interface PriceResponseDto {
  id: number;
  name: string;
  price: number;
}
