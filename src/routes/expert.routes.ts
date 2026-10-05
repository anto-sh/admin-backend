import { RequestHandler, Router } from "express";
import {
  getAllExperts,
  getExpertById,
  createExpert,
  updateExpert,
  deleteExpert,
} from "../controllers/expert.controller";

const router = Router();

router.get("/", getAllExperts as RequestHandler);
router.get("/:id", getExpertById as RequestHandler);
router.post("/", createExpert as RequestHandler);
router.patch("/:id", updateExpert as RequestHandler);
router.delete("/:id", deleteExpert as RequestHandler);

export const expertRoutes = router;
