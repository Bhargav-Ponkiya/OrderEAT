import type { OrderStatus } from "./lib/types.js";
import { OrderModel } from "./models/Order.model.js";
import { orderEventBus } from "./realtime/event-bus.js";

function parseOverride(raw: string | undefined): Partial<Record<Exclude<OrderStatus, "DELIVERED">, number>> {
  if (!raw) return {};
  const out: Partial<Record<Exclude<OrderStatus, "DELIVERED">, number>> = {};
  for (const pair of raw.split(",")) {
    const [k, v] = pair.split(":").map((s) => s.trim());
    const n = Number(v);
    if (
      (k === "RECEIVED" || k === "PREPARING" || k === "OUT_FOR_DELIVERY") &&
      Number.isFinite(n) &&
      n >= 0
    ) {
      out[k] = n;
    }
  }
  return out;
}

const override = parseOverride(process.env.STATUS_DELAYS_OVERRIDE);

export const STATUS_TRANSITION_DELAYS_MS: Record<
  Exclude<OrderStatus, "DELIVERED">,
  number
> = {
  RECEIVED: override.RECEIVED ?? 10_000,
  PREPARING: override.PREPARING ?? 20_000,
  OUT_FOR_DELIVERY: override.OUT_FOR_DELIVERY ?? 30_000,
};

const NEXT_STATUS: Record<Exclude<OrderStatus, "DELIVERED">, OrderStatus> = {
  RECEIVED: "PREPARING",
  PREPARING: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

const timers = new Map<string, ReturnType<typeof setTimeout>>();

async function advance(orderId: string): Promise<void> {
  const doc = await OrderModel.findById(orderId);
  if (!doc) return;
  if (doc.status === "DELIVERED") return;
  const current = doc.status as Exclude<OrderStatus, "DELIVERED">;
  const next = NEXT_STATUS[current];
  doc.status = next;
  await doc.save();
  const order = doc.toJSON() as unknown as import("./lib/types.js").Order;
  orderEventBus.emitUpdate(order);
  timers.delete(orderId);
  if (next !== "DELIVERED") scheduleNext(orderId);
}

export function scheduleNext(orderId: string): void {
  void (async () => {
    const doc = await OrderModel.findById(orderId).lean();
    if (!doc || doc.status === "DELIVERED") return;
    const status = doc.status as Exclude<OrderStatus, "DELIVERED">;
    const delay = STATUS_TRANSITION_DELAYS_MS[status];
    const t = setTimeout(() => {
      void advance(orderId);
    }, delay);
    timers.set(orderId, t);
  })();
}

export function cancelScheduler(orderId: string): void {
  const t = timers.get(orderId);
  if (t) {
    clearTimeout(t);
    timers.delete(orderId);
  }
}

export function _clearAllTimersForTests(): void {
  for (const t of timers.values()) clearTimeout(t);
  timers.clear();
}
