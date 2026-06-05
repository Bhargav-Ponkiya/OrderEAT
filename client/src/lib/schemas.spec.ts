import { describe, expect, it } from "vitest";
import { CustomerSchema } from "./schemas";

const ok = {
  name: "Jane Doe",
  address: "742 Evergreen Terrace, Springfield",
  phone: "9876543210",
};

describe("client CustomerSchema (mirrors server)", () => {
  it("accepts valid", () => {
    expect(CustomerSchema.parse(ok)).toEqual(ok);
  });
  it("rejects short name", () => {
    expect(CustomerSchema.safeParse({ ...ok, name: "J" }).success).toBe(false);
  });
  it("rejects short address", () => {
    expect(CustomerSchema.safeParse({ ...ok, address: "x" }).success).toBe(
      false,
    );
  });
  it("rejects junk phone", () => {
    expect(CustomerSchema.safeParse({ ...ok, phone: "abc" }).success).toBe(
      false,
    );
  });
  it("rejects phone shorter than 10 digits", () => {
    expect(CustomerSchema.safeParse({ ...ok, phone: "98765" }).success).toBe(
      false,
    );
  });
  it("rejects phone not starting with 6–9", () => {
    expect(CustomerSchema.safeParse({ ...ok, phone: "1234567890" }).success).toBe(
      false,
    );
  });
});
