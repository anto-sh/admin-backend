import { IsNotEmpty, IsString } from "class-validator";
import { ExerciseResponseDto } from "./exercise.dto";

export class CreateExerciseCategoryDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  url!: string;
}

export class UpdateExerciseCategoryDto {
  @IsString()
  name?: string;

  @IsString()
  url?: string;
}

export interface ExerciseCategoryResponseDto {
  id: number;
  name: string;
  url: string;
  exercises?: ExerciseResponseDto[];
}
