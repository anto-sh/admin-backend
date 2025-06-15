import { IsNotEmpty, IsString } from "class-validator";
import { ExpertResponseDto } from "./expert.dto";

export class CreateExpertCategoryDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  url!: string;
}

export class UpdateExpertCategoryDto {
  @IsString()
  name?: string;

  @IsString()
  url?: string;
}

export interface ExpertCategoryResponseDto {
  id: number;
  name?: string;
  url: string;
  experts?: ExpertResponseDto[];
}
