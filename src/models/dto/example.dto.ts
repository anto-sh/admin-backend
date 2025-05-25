import { IsString, IsNumber, IsOptional } from "class-validator";

export class CreateExampleDto {
  @IsString()
  name!: string;

  @IsNumber()
  value!: number;
}

export class UpdateExampleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  value?: number;
}

export interface ExampleResponseDto {
  id: number;
  name: string;
  value: number;
  createdAt: Date;
  updatedAt: Date;
}
