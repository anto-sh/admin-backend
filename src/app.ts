import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { exampleRoutes } from "./routes/example.routes";
import { treatmentRoutes } from "./routes/treatment.routes";
import { exerciseCategoryRoutes } from "./routes/exercise-category.routes";
import { exerciseRoutes } from "./routes/exercise.routes";

require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/examples", exampleRoutes);
app.use("/api/treatments", treatmentRoutes);
app.use("/api/exercise-categories", exerciseCategoryRoutes);
app.use("/api/exercises", exerciseRoutes);

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
