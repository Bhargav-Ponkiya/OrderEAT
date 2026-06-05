import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

const app = createApp({ allowedOrigins: ["*"] });

const validCustomer = {
  name: "Jane Doe",
  address: "742 Evergreen Terrace, Springfield",
  phone: "9876543210",
};

describe("POST /api/orders", () => {
  it("FR-ORDER-1/3: 201 + order on valid payload", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [{ menuItemId: "burger-classic", quantity: 1 }],
        customer: validCustomer,
      });
    expect(res.status).toBe(201);
    expect(res.body.order.id).toBeTruthy();
    expect(res.body.order.status).toBe("RECEIVED");
    expect(res.body.order.total).toBe(999);
  });

  it("FR-ORDER-4: 400 + field-level error on invalid phone", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [{ menuItemId: "burger-classic", quantity: 1 }],
        customer: { ...validCustomer, phone: "abc" },
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.fields["customer.phone"]).toBeTruthy();
  });

  it("400 on empty items array", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ items: [], customer: validCustomer });
    expect(res.status).toBe(400);
  });

  it("400 on unknown menu item", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [{ menuItemId: "ghost", quantity: 1 }],
        customer: validCustomer,
      });
    expect(res.status).toBe(400);
    expect(res.body.error.fields["items.0.menuItemId"]).toMatch(/Unknown/);
  });

  it("returns the same order on duplicate POST with x-idempotency-key", async () => {
    const key = "test-idempotency-key-123";
    const res1 = await request(app)
      .post("/api/orders")
      .set("x-idempotency-key", key)
      .send({
        items: [{ menuItemId: "burger-classic", quantity: 1 }],
        customer: validCustomer,
      });
    expect(res1.status).toBe(201);
    const order1Id = res1.body.order.id;

    const res2 = await request(app)
      .post("/api/orders")
      .set("x-idempotency-key", key)
      .send({
        items: [{ menuItemId: "burger-classic", quantity: 1 }],
        customer: validCustomer,
      });
    expect(res2.status).toBe(201);
    expect(res2.body.order.id).toBe(order1Id);

    // Verify only one order was created in DB
    const listRes = await request(app).get("/api/orders");
    const matching = listRes.body.orders.filter((o: { id: string }) => o.id === order1Id);
    expect(matching.length).toBe(1);
  });
});

describe("GET /api/orders/:id (FR-STATUS-3)", () => {
  it("returns the order on a known id", async () => {
    const created = await request(app)
      .post("/api/orders")
      .send({
        items: [{ menuItemId: "drink-cola", quantity: 2 }],
        customer: validCustomer,
      });
    const id = created.body.order.id;
    const res = await request(app).get(`/api/orders/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.order.id).toBe(id);
  });

  it("404 on unknown id", async () => {
    const res = await request(app).get("/api/orders/507f1f77bcf86cd799439011");
    expect(res.status).toBe(404);
  });

  it("404 on malformed id", async () => {
    const res = await request(app).get("/api/orders/not-an-id");
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/orders/:id/status (CRUD: update)", () => {
  it("manually updates status", async () => {
    const created = await request(app)
      .post("/api/orders")
      .send({
        items: [{ menuItemId: "drink-cola", quantity: 1 }],
        customer: validCustomer,
      });
    const id = created.body.order.id;
    const res = await request(app)
      .patch(`/api/orders/${id}/status`)
      .send({ status: "OUT_FOR_DELIVERY" });
    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe("OUT_FOR_DELIVERY");
  });

  it("400 on an invalid status value", async () => {
    const created = await request(app)
      .post("/api/orders")
      .send({
        items: [{ menuItemId: "drink-cola", quantity: 1 }],
        customer: validCustomer,
      });
    const res = await request(app)
      .patch(`/api/orders/${created.body.order.id}/status`)
      .send({ status: "ARGUING_WITH_DRIVER" });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/orders/:id (CRUD: delete)", () => {
  it("204 + removes a persisted order", async () => {
    const created = await request(app)
      .post("/api/orders")
      .send({
        items: [{ menuItemId: "drink-cola", quantity: 1 }],
        customer: validCustomer,
      });
    const id = created.body.order.id;

    const del = await request(app).delete(`/api/orders/${id}`);
    expect(del.status).toBe(204);

    const getRes = await request(app).get(`/api/orders/${id}`);
    expect(getRes.status).toBe(404);
  });

  it("404 on a well-formed but missing id", async () => {
    const res = await request(app).delete(
      "/api/orders/507f1f77bcf86cd799439011",
    );
    expect(res.status).toBe(404);
  });

  it("404 on a malformed id", async () => {
    const res = await request(app).delete("/api/orders/garbage");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/orders (list)", () => {
  it("returns an orders array", async () => {
    await request(app)
      .post("/api/orders")
      .send({
        items: [{ menuItemId: "drink-cola", quantity: 1 }],
        customer: validCustomer,
      });
    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.orders)).toBe(true);
    expect(res.body.orders.length).toBeGreaterThan(0);
  });
});
