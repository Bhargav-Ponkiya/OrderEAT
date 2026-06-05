import express, { type Express, type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { menuRouter } from "./routes/menu.routes.js";
import { ordersRouter } from "./routes/orders.routes.js";
import { sendError } from "./lib/http.js";

export function createApp(options?: { allowedOrigins?: string[] }): Express {
  const app = express();

  const origins = options?.allowedOrigins ?? ["http://localhost:5173"];
  app.use(
    cors({
      origin: origins.length === 1 && origins[0] === "*" ? true : origins,
      credentials: false,
    }),
  );

  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ ok: true, uptime: process.uptime() });
  });

  app.use("/api/menu", menuRouter);
  app.use("/api/orders", ordersRouter);

  app.use((_req, res) => {
    sendError(res, 404, "NOT_FOUND", "Route not found.");
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);
    sendError(res, 500, "INTERNAL_ERROR", "Something went wrong.");
  });

  return app;
}
