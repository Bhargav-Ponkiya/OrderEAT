import { Router } from "express";
import {
  deleteOrderById,
  getOrderById,
  getOrders,
  patchOrderStatus,
  postOrder,
  streamOrderUpdates,
} from "../controllers/orders.controller.js";

export const ordersRouter = Router();

ordersRouter.get("/", getOrders);
ordersRouter.post("/", postOrder);
ordersRouter.get("/:id", getOrderById);
ordersRouter.patch("/:id/status", patchOrderStatus);
ordersRouter.delete("/:id", deleteOrderById);
ordersRouter.get("/:id/stream", streamOrderUpdates);
