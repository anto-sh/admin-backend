import { RequestHandler, Router } from "express";
import {
  getAllExpertCategories,
  getAllExpertCategoriesWithExperts,
} from "../controllers/expert-category.controller";

const router = Router();

router.get("/", getAllExpertCategories as RequestHandler);
router.get(
  "/with-experts",
  getAllExpertCategoriesWithExperts as RequestHandler
);

export const expertCategoryRoutes = router;
