import { Router, type Request, type Response, type NextFunction } from "express";
import { ZodError } from "zod";
import {
  CreateOrderInputSchema,
  UpdateStatusInputSchema,
} from "../lib/schemas.js";
import {
  createOrder,
  deleteOrder,
  getOrder,
  listOrders,
  setOrderStatus,
} from "../services/orders.service.js";
import { streamOrder } from "../realtime/sse.js";
import { sendError, sendZodError } from "../lib/http.js";

export const ordersRouter = Router();

ordersRouter.get("/", async (_req, res, next) => {
  try {
    const orders = await listOrders();
    res.status(200).json({ orders });
  } catch (err) {
    next(err);
  }
});

ordersRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = CreateOrderInputSchema.parse(req.body);
      const idempotencyKey = req.headers["x-idempotency-key"];
      const keyStr = typeof idempotencyKey === "string" ? idempotencyKey : undefined;
      const result = await createOrder(input, keyStr);
      if (!result.ok) {
        sendError(
          res,
          400,
          "VALIDATION_ERROR",
          "One or more cart items are not on the menu.",
          result.fields,
        );
        return;
      }
      res.status(201).json({ order: result.order });
    } catch (err) {
      if (err instanceof ZodError) {
        sendZodError(res, err);
        return;
      }
      next(err);
    }
  },
);

ordersRouter.get("/:id", async (req, res, next) => {
  try {
    const order = await getOrder(req.params.id);
    if (!order) {
      sendError(res, 404, "NOT_FOUND", "Order not found.");
      return;
    }
    res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
});

ordersRouter.patch("/:id/status", async (req, res, next) => {
  try {
    const { status } = UpdateStatusInputSchema.parse(req.body);
    const order = await setOrderStatus(req.params.id, status);
    if (!order) {
      sendError(res, 404, "NOT_FOUND", "Order not found.");
      return;
    }
    res.status(200).json({ order });
  } catch (err) {
    if (err instanceof ZodError) {
      sendZodError(res, err);
      return;
    }
    next(err);
  }
});

ordersRouter.delete("/:id", async (req, res, next) => {
  try {
    const removed = await deleteOrder(req.params.id);
    if (!removed) {
      sendError(res, 404, "NOT_FOUND", "Order not found.");
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

ordersRouter.get("/:id/stream", async (req, res, next) => {
  try {
    await streamOrder(req, res);
  } catch (err) {
    next(err);
  }
});
