import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Unique,
} from "typeorm";
import { Service } from "./service.entity";
import { CreateServiceCategoryDto } from "../dto/service-category.dto";
import { IsNotEmpty, IsString } from "class-validator";

@Entity("service_category")
@Unique(["name"])
@Unique(["url"])
export class ServiceCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsNotEmpty()
  name!: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  url!: string;

  @OneToMany(() => Service, (service) => service.category)
  services?: Service[];

  static fromDto(dto: CreateServiceCategoryDto): ServiceCategory {
    const category = new ServiceCategory();
    category.name = dto.name;
    category.url = dto.url;
    return category;
  }
}
