import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from "typeorm";
import { Exercise } from "./exercise.entity";
import { CreateExerciseCategoryDto } from "../dto/exercise-category.dto";

@Entity("exercise_category")
@Unique(["name"])
@Unique(["url"])
export class ExerciseCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  url!: string;

  @OneToMany(() => Exercise, (exercise) => exercise.category)
  exercises?: Exercise[];

  static fromDto(dto: CreateExerciseCategoryDto): ExerciseCategory {
    const category = new ExerciseCategory();
    category.name = dto.name;
    category.url = dto.url;
    return category;
  }
}
