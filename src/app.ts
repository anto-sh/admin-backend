import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";
import {
  IMAGE_UPLOAD_DIR_NAME,
  VIDEO_UPLOAD_DIR_NAME,
} from "./config/constants";
//routes
import { treatmentRoutes } from "./routes/treatment.routes";
import { exerciseCategoryRoutes } from "./routes/exercise-category.routes";
import { exerciseRoutes } from "./routes/exercise.routes";
import { imageRoutes } from "./routes/image.routes";
import { videoRoutes } from "./routes/video.routes";
import { serviceCategoryRoutes } from "./routes/service-category.routes";
import { serviceRoutes } from "./routes/service.routes";
import { expertCategoryRoutes } from "./routes/expert-category.routes";
import { expertRoutes } from "./routes/expert.routes";
import { priceRoutes } from "./routes/price.routes";

const app = express();

// middleware
app.use(cors());
app.use(bodyParser.json());

// frontend static path
const frontPath = path.join(__dirname, "..", "..", "admin-frontend/dist");
// frontend static
app.use(express.static(frontPath));

// SPA history mode
app.get(/^\/(?!api|img|video).*/, (req, res) => {
  res.sendFile(path.join(frontPath, "index.html"));
});

const staticBasePath =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "..", "uploads")
    : path.join(__dirname, "..", "..", "uploads");

const imageDir = path.join(staticBasePath, IMAGE_UPLOAD_DIR_NAME);
const videoDir = path.join(staticBasePath, VIDEO_UPLOAD_DIR_NAME);

// if upload dirs doesn't exist, create it
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

// image hosting
app.use("/img", express.static(imageDir));
console.log("Image path:", imageDir);
// video hosting
app.use("/video", express.static(videoDir));
console.log("Video path:", videoDir);

// routes
app.use("/api/treatments", treatmentRoutes);
app.use("/api/exercise-categories", exerciseCategoryRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/img", imageRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/service-categories", serviceCategoryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/expert-categories", expertCategoryRoutes);
app.use("/api/experts", expertRoutes);
app.use("/api/prices", priceRoutes);

// error handling
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  }
);

export default app;
