import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Unique,
} from "typeorm";
import { Expert } from "./expert.entity";
import { CreateExpertCategoryDto } from "../dto/expert-category.dto";

@Entity("expert_category")
@Unique(["name"])
@Unique(["url"])
export class ExpertCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  url!: string;

  @OneToMany(() => Expert, (expert) => expert.category)
  experts?: Expert[];

  static fromDto(dto: CreateExpertCategoryDto): ExpertCategory {
    const category = new ExpertCategory();
    category.name = dto.name;
    category.url = dto.url;
    return category;
  }
}
