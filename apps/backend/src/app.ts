import cors from "cors";
import express from "express";
import orgainizationRoutes from "./routes/organization.routes";
import { errorHandler } from "./middleware/error.middleware";
import authRouter from "./routes/auth.routes";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/organization", orgainizationRoutes);
app.use("/auth", authRouter);
app.use(errorHandler);
app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});
export default app;
