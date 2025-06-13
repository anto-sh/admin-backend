import "reflect-metadata";
import { DataSource } from "typeorm";
import { Example } from "../models/entities/example.entity";
import { Treatment } from "../models/entities/treatment.entity";
import { ExerciseCategory } from "../models/entities/exercise-category.entity";
import { Exercise } from "../models/entities/exercise.entity";
import { Service } from "../models/entities/service.entity";
import { ServiceCategory } from "../models/entities/service-category.entity";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  //path relative to root
  database: "../db/db.sqlite",
  synchronize: true,
  logging: true,
  entities: [
    Example,
    Treatment,
    Exercise,
    ExerciseCategory,
    Service,
    ServiceCategory,
  ],
});
