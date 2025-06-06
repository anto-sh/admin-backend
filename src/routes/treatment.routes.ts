import { RequestHandler, Router } from "express";
import {
  getAllTreatments,
  createTreatment,
  updateTreatment,
  deleteTreatment,
  updateTreatmentBatch,
} from "../controllers/treatment.controller";

const router = Router();

router.get("/", getAllTreatments as RequestHandler);
router.post("/", createTreatment as RequestHandler);
router.put("/:id", updateTreatment as RequestHandler);
router.patch("/", updateTreatmentBatch as RequestHandler);
router.delete("/:id", deleteTreatment as RequestHandler);

export const treatmentRoutes = router;
