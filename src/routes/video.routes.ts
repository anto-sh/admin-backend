import { Router } from "express";
import uploadVideo from "../config/multer-video.config";
import videoController from "../controllers/video.contoller";

const router = Router();

router.post("/upload", uploadVideo.single("video"), (req, res) =>
  videoController.upload(req, res)
);

export const videoRoutes = router;
