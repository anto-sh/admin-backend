import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { CreateTreatmentDto } from "../dto/treatment.dto";

// Что лечим
@Entity()
export class Treatment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  static fromDto(dto: CreateTreatmentDto): Treatment {
    const treatment = new Treatment();
    treatment.name = dto.name;
    return treatment;
  }
}
