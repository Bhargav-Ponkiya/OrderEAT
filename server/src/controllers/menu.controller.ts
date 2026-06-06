import type { Request, Response, NextFunction } from "express";
import { listMenu } from "../services/menu.service.js";

export async function getMenu(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await listMenu();
    res.status(200).json({ items });
  } catch (err) {
    next(err);
  }
}
