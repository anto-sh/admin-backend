import "reflect-metadata";
import { DataSource } from "typeorm";
import { Treatment } from "../models/entities/treatment.entity";
import { ExerciseCategory } from "../models/entities/exercise-category.entity";
import { Exercise } from "../models/entities/exercise.entity";
import { Service } from "../models/entities/service.entity";
import { ServiceCategory } from "../models/entities/service-category.entity";
import { Expert } from "../models/entities/expert.entity";
import { ExpertCategory } from "../models/entities/expert-category.entity";
import { Price } from "../models/entities/price.entity";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  //path relative to root
  database: process.env.DB_PATH!,
  synchronize: true,
  logging: true,
  entities: [
    Treatment,
    Exercise,
    ExerciseCategory,
    Service,
    ServiceCategory,
    Expert,
    ExpertCategory,
    Price,
  ],
});
