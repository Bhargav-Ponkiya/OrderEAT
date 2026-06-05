import type { Response } from "express";
import { ZodError } from "zod";
import type { ApiErrorBody } from "./types.js";

type Code = ApiErrorBody["error"]["code"];

export function sendError(
  res: Response,
  status: number,
  code: Code,
  message: string,
  fields?: Record<string, string>,
): Response {
  const body: ApiErrorBody = { error: { code, message, ...(fields ? { fields } : {}) } };
  return res.status(status).json(body);
}

export function sendZodError(res: Response, err: ZodError): Response {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    const path = issue.path.join(".");
    if (path && !fields[path]) fields[path] = issue.message;
  }
  return sendError(res, 400, "VALIDATION_ERROR", "Request failed validation.", fields);
}
