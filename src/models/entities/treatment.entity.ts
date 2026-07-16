import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { CreateTreatmentDto } from "../dto/treatment.dto";
import { IsNotEmpty, IsString } from "class-validator";

// Что лечим
@Entity()
export class Treatment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  name!: string;

  static fromDto(dto: CreateTreatmentDto): Treatment {
    const treatment = new Treatment();
    treatment.name = dto.name;
    return treatment;
  }
}
