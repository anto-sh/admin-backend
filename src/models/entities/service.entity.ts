import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import {
  IsNotEmpty,
  IsString,
  IsUrl,
  IsArray,
  ArrayNotEmpty,
  IsInt,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ServiceCategory } from "./service-category.entity";
import { CreateServiceDto } from "../dto/service.dto";

@Entity("service")
export class Service {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Column({ name: "image_url" })
  @IsNotEmpty()
  @IsUrl({
    require_tld: false, // не требовать домен верхнего уровня
  })
  imageUrl!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  @IsNotEmpty()
  @IsInt()
  price!: number;

  @Column("simple-array")
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  procedures!: string[];

  @ManyToOne(() => ServiceCategory, (category) => category.services, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "category_id" })
  @ValidateNested()
  @Type(() => ServiceCategory)
  category!: ServiceCategory;

  static fromDto(dto: CreateServiceDto): Service {
    const service = new Service();
    service.name = dto.name;
    service.imageUrl = dto.imageUrl;
    service.price = dto.price;
    service.procedures = dto.procedures;
    service.category = new ServiceCategory();
    service.category.id = dto.categoryId;
    return service;
  }
}
