import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsObject,
  IsUrl,
} from "class-validator";

export class CreateExpertDto {
  @IsNotEmpty()
  @IsString()
  fullName?: string;

  @IsNotEmpty()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  imageUrl?: string;

  @IsNotEmpty()
  @IsNumber()
  categoryId?: number;

  @IsNotEmpty()
  @IsObject()
  contentJson: any;
}

export class UpdateExpertDto {
  @IsString()
  fullName?: string;

  @IsString()
  description?: string;

  @IsUrl({ require_tld: false })
  imageUrl?: string;

  @IsNumber()
  categoryId?: number;

  @IsObject()
  contentJson: any;
}

export interface ExpertResponseDto {
  id: number;
  fullName?: string;
  description?: string;
  imageUrl?: string;
  categoryId?: number;
  contentJson: any;
}
