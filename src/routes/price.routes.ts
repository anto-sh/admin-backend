import { Router, RequestHandler } from "express";
import {
  getAllPrices,
  getPriceById,
  createPrice,
  updatePrice,
  deletePrice,
  updatePriceBatch,
} from "../controllers/price.controller";

const router = Router();

router.get("/", getAllPrices as RequestHandler);
router.get("/:id", getPriceById as RequestHandler);
router.post("/", createPrice as RequestHandler);
router.put("/:id", updatePrice as RequestHandler);
router.patch("/batch", updatePriceBatch as RequestHandler);
router.delete("/:id", deletePrice as RequestHandler);

export const priceRoutes = router;
