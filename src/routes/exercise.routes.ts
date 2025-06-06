import { RequestHandler, Router } from "express";
import {
  getAllExercises,
  createExercise,
  updateExercise,
  deleteExercise,
  getExerciseById,
} from "../controllers/exercise.controller";

const router = Router();
router.get("/", getAllExercises as RequestHandler);
router.get("/:id", getExerciseById as RequestHandler);
router.post("/", createExercise as RequestHandler);
router.put("/:id", updateExercise as RequestHandler);
router.delete("/:id", deleteExercise as RequestHandler);

export const exerciseRoutes = router;
