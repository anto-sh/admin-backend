import { RequestHandler, Router } from "express";
import {
  createTreatment,
  getAllTreatments,
  updateTreatment,
  deleteTreatment,
} from "../controllers/treatment.controller";

const router = Router();

router.post("/", createTreatment as RequestHandler);
router.get("/", getAllTreatments as RequestHandler);
router.put("/:id", updateTreatment as RequestHandler);
router.delete("/:id", deleteTreatment as RequestHandler);

export const treatmentRoutes = router;
