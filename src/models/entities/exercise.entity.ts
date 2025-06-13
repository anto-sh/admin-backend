import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { IsNotEmpty, IsString, IsJSON, IsObject } from "class-validator";
import { ExerciseCategory } from "./exercise-category.entity";
import { CreateExerciseDto } from "../dto/exercise.dto";

@Entity("exercise")
export class Exercise {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ManyToOne(() => ExerciseCategory, (category) => category.exercises, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "category_id" })
  category?: ExerciseCategory;

  @Column({ name: "content_json", type: "json" })
  @IsNotEmpty()
  @IsObject()
  contentJson: any;

  static fromDto(dto: CreateExerciseDto): Exercise {
    const exercise = new Exercise();
    exercise.name = dto.name;
    exercise.category = new ExerciseCategory();
    exercise.category.id = dto.categoryId || 0;
    exercise.contentJson = dto.contentJson;
    return exercise;
  }
}
