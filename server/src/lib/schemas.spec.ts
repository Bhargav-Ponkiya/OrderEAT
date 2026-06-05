import { describe, expect, it } from "vitest";
import { CreateOrderInputSchema, CustomerSchema } from "./schemas.js";

const validCustomer = {
  name: "Jane Doe",
  address: "742 Evergreen Terrace, Springfield",
  phone: "9876543210",
};

describe("CustomerSchema (FR-ORDER-2)", () => {
  it("accepts a valid customer", () => {
    expect(() => CustomerSchema.parse(validCustomer)).not.toThrow();
  });

  it("rejects a short name", () => {
    const r = CustomerSchema.safeParse({ ...validCustomer, name: "J" });
    expect(r.success).toBe(false);
  });

  it("rejects a short address", () => {
    const r = CustomerSchema.safeParse({ ...validCustomer, address: "x" });
    expect(r.success).toBe(false);
  });

  it("rejects a junk phone", () => {
    const r = CustomerSchema.safeParse({ ...validCustomer, phone: "abc" });
    expect(r.success).toBe(false);
  });

  it("rejects a phone that is not 10 digits", () => {
    const r = CustomerSchema.safeParse({ ...validCustomer, phone: "98765" });
    expect(r.success).toBe(false);
  });

  it("rejects a phone starting with a digit below 6", () => {
    const r = CustomerSchema.safeParse({ ...validCustomer, phone: "1234567890" });
    expect(r.success).toBe(false);
  });

  it("trims whitespace from name", () => {
    const r = CustomerSchema.safeParse({ ...validCustomer, name: "  Jane  " });
    expect(r.success && r.data.name).toBe("Jane");
  });
});

describe("CreateOrderInputSchema (FR-ORDER-1, FR-ORDER-2)", () => {
  it("accepts a valid payload", () => {
    const r = CreateOrderInputSchema.safeParse({
      items: [{ menuItemId: "burger-classic", quantity: 2 }],
      customer: validCustomer,
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty items", () => {
    const r = CreateOrderInputSchema.safeParse({
      items: [],
      customer: validCustomer,
    });
    expect(r.success).toBe(false);
  });

  it("rejects quantity 0", () => {
    const r = CreateOrderInputSchema.safeParse({
      items: [{ menuItemId: "burger-classic", quantity: 0 }],
      customer: validCustomer,
    });
    expect(r.success).toBe(false);
  });

  it("rejects absurd quantity", () => {
    const r = CreateOrderInputSchema.safeParse({
      items: [{ menuItemId: "burger-classic", quantity: 999 }],
      customer: validCustomer,
    });
    expect(r.success).toBe(false);
  });
});
