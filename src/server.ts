require("dotenv").config();

import { AppDataSource } from "./config/database.config";
import app from "./app";
import { PORT } from "./config/constants";

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err: any) => {
    console.error("Database connection error", err);
    process.exit(1);
  });
