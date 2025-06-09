import { IsNotEmpty, IsString, IsNumber, IsObject } from "class-validator";

export class CreateExerciseDto {
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsNumber()
  categoryId?: number;

  @IsNotEmpty()
  @IsObject()
  contentJson: any;
}

export class UpdateExerciseDto {
  @IsString()
  name?: string;

  @IsNumber()
  categoryId?: number;

  @IsObject()
  contentJson: any;
}

export interface ExerciseResponseDto {
  id: number;
  name?: string;
  categoryId?: number;
  contentJson?: any;
}
