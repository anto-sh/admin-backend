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
  IsObject,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ExpertCategory } from "./expert-category.entity";
import { CreateExpertDto } from "../dto/expert.dto";

@Entity("expert")
export class Expert {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  fullName?: string; // ФИО

  @Column()
  @IsNotEmpty()
  @IsString()
  description?: string; // Описание (должность)

  @Column({ name: "image_url" })
  @IsNotEmpty()
  @IsUrl({
    require_tld: false,
  })
  imageUrl?: string;

  @Column({ name: "content_json", type: "json" })
  @IsNotEmpty()
  @IsObject()
  contentJson: any;

  @ManyToOne(() => ExpertCategory, (category) => category.experts, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "category_id" })
  @ValidateNested()
  @Type(() => ExpertCategory)
  category?: ExpertCategory;

  static fromDto(dto: CreateExpertDto): Expert {
    const expert = new Expert();
    expert.fullName = dto.fullName;
    expert.description = dto.description;
    expert.imageUrl = dto.imageUrl;
    expert.contentJson = dto.contentJson;
    expert.category = new ExpertCategory();
    expert.category.id = dto.categoryId || 0;
    return expert;
  }
}
