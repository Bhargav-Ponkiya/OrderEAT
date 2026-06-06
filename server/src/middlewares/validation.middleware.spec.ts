import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import { z } from "zod";
import { validateBody } from "./validation.middleware.js";

const schema = z.object({
  name: z.string().min(2),
  count: z.number().int().positive(),
});

describe("validation.middleware", () => {
  it("calls next() if request body is valid", () => {
    const req = { body: { name: "John", count: 5 } } as Request;
    const res = {} as Response;
    const next = vi.fn();

    const middleware = validateBody(schema);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("returns HTTP 400 with validation errors if body is invalid", () => {
    const req = { body: { name: "J", count: -1 } } as Request;
    
    // Mock response methods that get called on error (sendZodError calls status().json())
    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    const res = { status: statusMock } as unknown as Response;
    const next = vi.fn();

    const middleware = validateBody(schema);
    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalled();
    
    const call = jsonMock.mock.calls[0];
    expect(call).toBeDefined();
    
    const errorBody = call![0];
    expect(errorBody.error.code).toBe("VALIDATION_ERROR");
    expect(errorBody.error.fields["name"]).toBeDefined();
    expect(errorBody.error.fields["count"]).toBeDefined();
  });
});
