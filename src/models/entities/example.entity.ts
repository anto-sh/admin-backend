import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { CreateExampleDto } from "../dto/example.dto";

@Entity()
export class Example {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  // @Column({ nullable: true })
  // description!: string | null;

  @Column("float")
  value!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  static fromDto(dto: CreateExampleDto): Example {
    const example = new Example();
    example.name = dto.name;
    // example.description = dto.description || null;
    example.value = dto.value;
    return example;
  }
}
