import { RequestHandler, Router } from "express";
import {
  getAllExpertCategories,
  getAllExpertCategoriesWithExperts,
} from "../controllers/expert-category.controller";

const router = Router();

router.get("/", getAllExpertCategories as RequestHandler);
router.get(
  "/with-entities",
  getAllExpertCategoriesWithExperts as RequestHandler
);

export const expertCategoryRoutes = router;
