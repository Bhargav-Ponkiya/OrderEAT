import type { Request, Response } from "express";
import { orderEventBus } from "./event-bus.js";
import { getOrder } from "../services/orders.service.js";
import { sendError } from "../lib/http.js";

export async function streamOrder(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const initial = await getOrder(id);
  if (!initial) {
    sendError(res, 404, "NOT_FOUND", "Order not found.");
    return;
  }

  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const write = (event: string, data: unknown): void => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  write("snapshot", initial);

  const unsubscribe = orderEventBus.onUpdate((order) => {
    if (order.id !== id) return;
    write("update", order);
    if (order.status === "DELIVERED") {
      cleanup();
      res.end();
    }
  });

  const heartbeat = setInterval(() => {
    res.write(`: ping\n\n`);
  }, 15_000);

  const cleanup = (): void => {
    unsubscribe();
    clearInterval(heartbeat);
  };

  req.on("close", () => {
    cleanup();
  });
}
