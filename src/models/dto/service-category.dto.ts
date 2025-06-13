import { IsNotEmpty, IsString } from "class-validator";
import { ServiceResponseDto } from "./service.dto";

export class CreateServiceCategoryDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  url!: string;
}

export class UpdateServiceCategoryDto {
  @IsString()
  name?: string;

  @IsString()
  url?: string;
}

export interface ServiceCategoryResponseDto {
  id: number;
  name: string;
  url: string;
  services?: ServiceResponseDto[];
}
