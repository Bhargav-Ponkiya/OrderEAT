import mongoose from "mongoose";
import { OrderModel } from "../models/Order.model.js";
import { MenuItemModel } from "../models/MenuItem.model.js";
import { cancelScheduler, scheduleNext } from "../status-scheduler.js";
import type { CreateOrderInput } from "../lib/schemas.js";
import type { Order, OrderStatus } from "../lib/types.js";

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export type CreateOrderResult =
  | { ok: true; order: Order }
  | { ok: false; code: "UNKNOWN_ITEM"; fields: Record<string, string> };

export async function createOrder(
  input: CreateOrderInput,
  idempotencyKey?: string,
): Promise<CreateOrderResult> {
  if (idempotencyKey) {
    const existing = await OrderModel.findOne({ idempotencyKey });
    if (existing) {
      return { ok: true, order: existing.toJSON() as unknown as Order };
    }
  }

  const ids = input.items.map((l) => l.menuItemId);
  const menuItems = await MenuItemModel.find({ _id: { $in: ids } }).lean();
  const byId = new Map(menuItems.map((m) => [m._id, m]));

  const fields: Record<string, string> = {};
  const lines = input.items.map((line, idx) => {
    const m = byId.get(line.menuItemId);
    if (!m) {
      fields[`items.${idx}.menuItemId`] = `Unknown menu item: ${line.menuItemId}`;
      return null;
    }
    return {
      menuItemId: m._id,
      quantity: line.quantity,
      name: m.name,
      unitPrice: m.price,
      lineTotal: m.price * line.quantity,
    };
  });

  if (Object.keys(fields).length > 0) {
    return { ok: false, code: "UNKNOWN_ITEM", fields };
  }

  const items = lines as NonNullable<(typeof lines)[number]>[];
  const total = items.reduce((s, l) => s + l.lineTotal, 0);

  const doc = await OrderModel.create({
    items,
    customer: input.customer,
    status: "RECEIVED",
    total,
    idempotencyKey,
  });

  const order = doc.toJSON() as unknown as Order;
  scheduleNext(order.id);
  return { ok: true, order };
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!isValidObjectId(id)) return null;
  const doc = await OrderModel.findById(id);
  return doc ? (doc.toJSON() as unknown as Order) : null;
}

export async function listOrders(): Promise<Order[]> {
  const docs = await OrderModel.find().sort({ createdAt: -1 });
  return docs.map((d) => d.toJSON() as unknown as Order);
}

export async function setOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order | null> {
  if (!isValidObjectId(id)) return null;
  const doc = await OrderModel.findByIdAndUpdate(
    id,
    { status },
    { new: true },
  );
  return doc ? (doc.toJSON() as unknown as Order) : null;
}

export async function deleteOrder(id: string): Promise<boolean> {
  if (!isValidObjectId(id)) return false;
  const doc = await OrderModel.findByIdAndDelete(id);
  if (!doc) return false;
  cancelScheduler(id);
  return true;
}
