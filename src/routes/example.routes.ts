import { RequestHandler, Router } from "express";
import {
  createExample,
  getAllExamples,
  getExample,
  updateExample,
  deleteExample,
} from "../controllers/example.controller";

const router = Router();

router.post("/", createExample as RequestHandler);
router.get("/", getAllExamples as RequestHandler);
router.get("/:id", getExample as RequestHandler);
router.put("/:id", updateExample as RequestHandler);
router.delete("/:id", deleteExample as RequestHandler);

export const exampleRoutes = router;
