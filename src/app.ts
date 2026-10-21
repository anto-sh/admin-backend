import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";
import {
  ERROR_CODES,
  IMAGE_UPLOAD_DIR_NAME,
  VIDEO_UPLOAD_DIR_NAME,
} from "./config/constants";
import { NETWORK_MESSAGE_CODES as NMC } from "@anto-sh/admin-network-shared";
import { NetworkError } from "./shared/class/network-error";
import { handleError } from "./utils/handle-error";
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
app.use(bodyParser.json({ limit: "1mb" }));

// frontend static path
const frontPath = path.join(__dirname, "..", "..", "admin-frontend/dist");
// frontend static
app.use(express.static(frontPath));

// SPA history mode
app.get(/^\/(?!api|img|video).*/, (req, res) => {
  res.sendFile(path.join(frontPath, "index.html"));
});

const staticBasePath = path.join(__dirname, "..", "..", "uploads");

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
    err: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (res.headersSent) return next(err);

    if (err instanceof Error && "type" in err && "status" in err) {
      const isInvalidJson =
        err.type === "entity.parse.failed" && err.status === ERROR_CODES.BAD_REQUEST;
      const isTooLarge =
        err.type === "entity.too.large" && err.status === ERROR_CODES.PAYLOAD_TOO_LARGE;

      if (isInvalidJson || isTooLarge) {
        const message = isTooLarge
          ? "Размер JSON-тела запроса не должен превышать 1 МиБ"
          : "Тело запроса должно содержать корректный JSON";

        return handleError(res, new NetworkError(
          {
            statusCode: isTooLarge ? ERROR_CODES.PAYLOAD_TOO_LARGE : ERROR_CODES.BAD_REQUEST,
            networkMessage: { code: NMC.COMMON_ERRORS.VALIDATION },
            data: {
              validationErrors: [{
                property: "",
                constraints: { [isTooLarge ? "maxBodySize" : "isJson"]: message },
              }],
            },
          },
          message,
        ));
      }
    }

    handleError(res, err instanceof Error ? err : new Error("Неизвестная ошибка сервера"));
  }
);

export default app;
