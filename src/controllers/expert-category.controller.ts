import { Request, Response } from "express";
import * as expertCategoryService from "../services/expert-category.service";
import { ExpertCategoryResponseDto } from "../models/dto/expert-category.dto";
import { ExpertCategory } from "../models/entities/expert-category.entity";
import { sendResponse } from "../utils/send-response";
import { handleError } from "../utils/handle-error";
import { NetworkError } from "../shared/class/network-error";

const toResponseDto = (entity: ExpertCategory): ExpertCategoryResponseDto => ({
  id: entity.id,
  name: entity.name,
  url: entity.url,
  experts: entity.experts,
});

export const getAllExpertCategories = async (req: Request, res: Response) => {
  try {
    const categories = await expertCategoryService.getAllExpertCategories();
    const data = categories.map(toResponseDto);

    sendResponse(res, {
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};

export const getAllExpertCategoriesWithExperts = async (
  req: Request,
  res: Response,
) => {
  try {
    const categories =
      await expertCategoryService.getAllExpertCategoriesWithExperts();
    const data = categories.map(toResponseDto);

    sendResponse(res, {
      data,
    });
  } catch (error) {
    handleError(res, error as NetworkError | Error);
  }
};
