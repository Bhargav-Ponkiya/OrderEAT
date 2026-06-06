import type { Request, Response, NextFunction } from "express";
import {
  createOrder,
  deleteOrder,
  getOrder,
  listOrders,
  setOrderStatus,
} from "../services/orders.service.js";
import { streamOrder } from "../realtime/sse.js";
import { sendError } from "../lib/http.js";

export async function getOrders(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const orders = await listOrders();
    res.status(200).json({ orders });
  } catch (err) {
    next(err);
  }
}

export async function postOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body;
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
    next(err);
  }
}

export async function getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await getOrder(req.params.id as string);
    if (!order) {
      sendError(res, 404, "NOT_FOUND", "Order not found.");
      return;
    }
    res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function patchOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.body;
    const order = await setOrderStatus(req.params.id as string, status);
    if (!order) {
      sendError(res, 404, "NOT_FOUND", "Order not found.");
      return;
    }
    res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function deleteOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const removed = await deleteOrder(req.params.id as string);
    if (!removed) {
      sendError(res, 404, "NOT_FOUND", "Order not found.");
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function streamOrderUpdates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await streamOrder(req, res);
  } catch (err) {
    next(err);
  }
}
