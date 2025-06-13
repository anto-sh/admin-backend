import { RequestHandler, Router } from "express";
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
  getServiceById,
} from "../controllers/service.controller";

const router = Router();

router.get("/", getAllServices as RequestHandler);
router.get("/:id", getServiceById as RequestHandler);
router.post("/", createService as RequestHandler);
router.put("/:id", updateService as RequestHandler);
router.delete("/:id", deleteService as RequestHandler);

export const serviceRoutes = router;
