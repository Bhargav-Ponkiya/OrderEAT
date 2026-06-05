import { Router, type Request, type Response, type NextFunction } from "express";
import { listMenu } from "../services/menu.service.js";

export const menuRouter = Router();

menuRouter.get(
  "/",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await listMenu();
      res.status(200).json({ items });
    } catch (err) {
      next(err);
    }
  },
);
