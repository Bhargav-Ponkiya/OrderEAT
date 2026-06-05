import { describe, expect, it } from "vitest";
import {
  createOrder,
  deleteOrder,
  getOrder,
  listOrders,
  setOrderStatus,
} from "./orders.service.js";

const customer = {
  name: "Jane Doe",
  address: "742 Evergreen Terrace, Springfield",
  phone: "9876543210",
};

describe("orders.service", () => {
  it("FR-ORDER-3: creates an order with RECEIVED status and computed total", async () => {
    const r = await createOrder({
      items: [
        { menuItemId: "burger-classic", quantity: 2 },
        { menuItemId: "drink-cola", quantity: 1 },
      ],
      customer,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.order.status).toBe("RECEIVED");
    // burger 999*2 = 1998 + cola 249 = 2247
    expect(r.order.total).toBe(2247);
    expect(r.order.items[0]?.name).toBe("Classic Cheeseburger");
  });

  it("computes total from menu (ignores client-supplied total)", async () => {
    const r = await createOrder({
      items: [{ menuItemId: "burger-classic", quantity: 1 }],
      customer,
      // @ts-expect-error — forged field is dropped by schema, never reaches service
      total: 1,
    });
    expect(r.ok && r.order.total).toBe(999);
  });

  it("FR-ORDER-2: rejects with UNKNOWN_ITEM if menu id missing", async () => {
    const r = await createOrder({
      items: [{ menuItemId: "not-real", quantity: 1 }],
      customer,
    });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.code).toBe("UNKNOWN_ITEM");
    expect(!r.ok && r.fields["items.0.menuItemId"]).toMatch(/Unknown/);
  });

  it("getOrder + listOrders round-trip", async () => {
    const r = await createOrder({
      items: [{ menuItemId: "drink-cola", quantity: 1 }],
      customer,
    });
    if (!r.ok) throw new Error("setup failed");
    const fetched = await getOrder(r.order.id);
    expect(fetched?.id).toBe(r.order.id);
    const list = await listOrders();
    expect(list.find((o) => o.id === r.order.id)).toBeTruthy();
  });

  it("setOrderStatus updates status (manual override)", async () => {
    const r = await createOrder({
      items: [{ menuItemId: "drink-cola", quantity: 1 }],
      customer,
    });
    if (!r.ok) throw new Error("setup failed");
    const updated = await setOrderStatus(r.order.id, "OUT_FOR_DELIVERY");
    expect(updated?.status).toBe("OUT_FOR_DELIVERY");
  });

  it("setOrderStatus returns null for missing id", async () => {
    const r = await setOrderStatus("nope-id", "PREPARING");
    expect(r).toBeNull();
  });

  it("CRUD: deleteOrder removes a persisted order", async () => {
    const r = await createOrder({
      items: [{ menuItemId: "drink-cola", quantity: 1 }],
      customer,
    });
    if (!r.ok) throw new Error("setup failed");
    const removed = await deleteOrder(r.order.id);
    expect(removed).toBe(true);
    expect(await getOrder(r.order.id)).toBeNull();
  });

  it("CRUD: deleteOrder returns false on missing id", async () => {
    const removed = await deleteOrder("507f1f77bcf86cd799439011");
    expect(removed).toBe(false);
  });

  it("CRUD: deleteOrder returns false on malformed id (no CastError)", async () => {
    const removed = await deleteOrder("garbage");
    expect(removed).toBe(false);
  });

  it("idempotency key returns existing order", async () => {
    const key = "service-idempotency-key-abc";
    const r1 = await createOrder(
      {
        items: [{ menuItemId: "burger-classic", quantity: 1 }],
        customer,
      },
      key,
    );
    expect(r1.ok).toBe(true);
    if (!r1.ok) return;

    const r2 = await createOrder(
      {
        items: [{ menuItemId: "burger-classic", quantity: 1 }],
        customer,
      },
      key,
    );
    expect(r2.ok).toBe(true);
    if (!r2.ok) return;

    expect(r2.order.id).toBe(r1.order.id);
  });
});
