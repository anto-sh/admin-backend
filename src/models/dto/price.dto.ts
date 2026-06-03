import { IsNotEmpty, IsString, IsNumber, IsInt } from "class-validator";

export class CreatePriceDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsInt()
  price!: number;
}

export class UpdatePriceDto {
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsInt()
  price?: number;
}

export class UpdatePriceBatchDto {
  @IsNumber()
  id!: number;

  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsInt()
  price?: number;
}

export interface PriceResponseDto {
  id: number;
  name: string;
  price: number;
}
