import { Router } from "express";
import {
  deleteOrderById,
  getOrderById,
  getOrders,
  patchOrderStatus,
  postOrder,
  streamOrderUpdates,
} from "../controllers/orders.controller.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import { CreateOrderInputSchema, UpdateStatusInputSchema } from "../lib/schemas.js";

export const ordersRouter = Router();

ordersRouter.get("/", getOrders);
ordersRouter.post("/", validateBody(CreateOrderInputSchema), postOrder);
ordersRouter.get("/:id", getOrderById);
ordersRouter.patch("/:id/status", validateBody(UpdateStatusInputSchema), patchOrderStatus);
ordersRouter.delete("/:id", deleteOrderById);
ordersRouter.get("/:id/stream", streamOrderUpdates);
