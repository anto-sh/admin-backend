import { RequestHandler, Router } from "express";
import {
  createServiceCategory,
  getAllServiceCategories,
  getAllServiceCategoriesWithServices,
  updateServiceCategory,
  deleteServiceCategory,
} from "../controllers/service-category.controller";

const router = Router();

router.get("/", getAllServiceCategories as RequestHandler);
router.get(
  "/with-services",
  getAllServiceCategoriesWithServices as RequestHandler
);
router.post("/", createServiceCategory as RequestHandler);
router.put("/:id", updateServiceCategory as RequestHandler);
router.delete("/:id", deleteServiceCategory as RequestHandler);

export const serviceCategoryRoutes = router;
