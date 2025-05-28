import { IsString } from "class-validator";

export class CreateTreatmentDto {
  @IsString()
  name!: string;
}

export class UpdateTreatmentDto {
  @IsString()
  name!: string;
}

export interface TreatmentResponseDto {
  id: number;
  name: string;
}
