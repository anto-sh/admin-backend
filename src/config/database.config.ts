import "reflect-metadata";
import { DataSource } from "typeorm";
import { Example } from "../models/entities/example.entity";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  //path relative to root
  database: "../db/db.sqlite",
  synchronize: true,
  logging: true,
  entities: [Example],
});
