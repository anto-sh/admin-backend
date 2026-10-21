import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  RelationId,
  DeepPartial,
} from "typeorm";
import {
  ArrayMaxSize,
  IsNotEmpty,
  IsString,
  IsArray,
  IsInt,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ServiceCategory } from "./service-category.entity";
import {
  CreateServiceDto,
  UpdateServiceDto,
  SERVICE_LIMITS,
  SERVICE_IMAGE_URL_PATTERN,
} from "../dto/service.dto";

@Entity("service")
export class Service {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  @MaxLength(SERVICE_LIMITS.maxNameLength)
  name!: string;

  @Column({ name: "image_url" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(SERVICE_LIMITS.maxImageUrlLength)
  @Matches(SERVICE_IMAGE_URL_PATTERN)
  imageUrl!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  @IsInt()
  @Min(0)
  @Max(SERVICE_LIMITS.maxPrice)
  price!: number;

  @Column("simple-json")
  @IsArray()
  @ArrayMaxSize(SERVICE_LIMITS.maxProcedures)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(SERVICE_LIMITS.maxProcedureLength, { each: true })
  procedures!: string[];

  @ManyToOne(() => ServiceCategory, (category) => category.services, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "category_id" })
  @ValidateNested()
  @Type(() => ServiceCategory)
  category!: ServiceCategory;

  @RelationId((service: Service) => service.category)
  categoryId!: number;

  static fromDto(dto: CreateServiceDto | UpdateServiceDto): DeepPartial<Service> {
    return {
      name: dto.name,
      imageUrl: dto.imageUrl,
      price: dto.price,
      procedures: dto.procedures,
      category:
        dto.categoryId === undefined ? undefined : { id: dto.categoryId },
    };
  }
}
