import { RequestHandler, Router } from "express";
import {
  createExerciseCategory,
  getAllExerciseCategories,
  getAllExerciseCategoriesWithExercises,
  updateExerciseCategory,
  deleteExerciseCategory,
} from "../controllers/exercise-category.controller";

const router = Router();

router.get("/", getAllExerciseCategories as RequestHandler);
router.get(
  "/with-exercises",
  getAllExerciseCategoriesWithExercises as RequestHandler
);
router.post("/", createExerciseCategory as RequestHandler);
router.put("/:id", updateExerciseCategory as RequestHandler);
router.delete("/:id", deleteExerciseCategory as RequestHandler);

export const exerciseCategoryRoutes = router;
