import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import {
  IMAGE_UPLOAD_DIR_NAME,
  VIDEO_UPLOAD_DIR_NAME,
} from "./config/constants";
//routes
import { exampleRoutes } from "./routes/example.routes";
import { treatmentRoutes } from "./routes/treatment.routes";
import { exerciseCategoryRoutes } from "./routes/exercise-category.routes";
import { exerciseRoutes } from "./routes/exercise.routes";
import { imageRoutes } from "./routes/image.routes";
import { videoRoutes } from "./routes/video.routes";
import { serviceCategoryRoutes } from "./routes/service-category.routes";
import { serviceRoutes } from "./routes/service.routes";

require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Image hosting
app.use(
  "/img",
  express.static(path.join(__dirname, `../../uploads/${IMAGE_UPLOAD_DIR_NAME}`))
);

// Video hosting
app.use(
  "/video",
  express.static(path.join(__dirname, `../../uploads/${VIDEO_UPLOAD_DIR_NAME}`))
);

// Routes
app.use("/api/examples", exampleRoutes);
app.use("/api/treatments", treatmentRoutes);
app.use("/api/exercise-categories", exerciseCategoryRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/img", imageRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/service-categories", serviceCategoryRoutes);
app.use("/api/services", serviceRoutes);

// Error handling
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
