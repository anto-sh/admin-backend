import { Router } from "express";
import uploadImage from "../config/multer-image.config";
import imageController from "../controllers/image.controller";

const router = Router();

router.post("/upload", uploadImage.single("image"), (req, res) =>
  imageController.upload(req, res)
);

export const imageRoutes = router;
