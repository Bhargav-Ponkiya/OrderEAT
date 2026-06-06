import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { sendZodError } from "../lib/http.js";

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        sendZodError(res, err);
        return;
      }
      next(err);
    }
  };
};
