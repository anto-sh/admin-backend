import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsNotEmpty, IsString, IsInt } from "class-validator";

@Entity("price")
export class Price {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  @IsNotEmpty()
  @IsInt()
  price!: number;
}
