import { beforeEach, describe, expect, it } from "vitest";
import { subtotalOf, useCartStore } from "./cart-store";

const margherita = {
  menuItemId: "pizza-margherita",
  name: "Margherita",
  unitPrice: 1299,
  imageUrl: "https://x.test/m.jpg",
};
const cola = {
  menuItemId: "drink-cola",
  name: "Cola",
  unitPrice: 249,
  imageUrl: "https://x.test/c.jpg",
};

describe("cart-store", () => {
  beforeEach(() => {
    useCartStore.getState().clear();
  });

  it("FR-CART-1: adding an existing item increments quantity", () => {
    useCartStore.getState().add(margherita);
    useCartStore.getState().add(margherita);
    const lines = useCartStore.getState().lines;
    expect(lines).toHaveLength(1);
    expect(lines[0]?.quantity).toBe(2);
  });

  it("FR-CART-2: setting quantity 0 removes the line", () => {
    useCartStore.getState().add(margherita, 3);
    useCartStore.getState().setQuantity(margherita.menuItemId, 0);
    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  it("FR-CART-2: negative quantity removes the line", () => {
    useCartStore.getState().add(margherita, 2);
    useCartStore.getState().setQuantity(margherita.menuItemId, -1);
    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  it("remove() drops only the targeted line", () => {
    useCartStore.getState().add(margherita);
    useCartStore.getState().add(cola, 2);
    useCartStore.getState().remove(margherita.menuItemId);
    const lines = useCartStore.getState().lines;
    expect(lines).toHaveLength(1);
    expect(lines[0]?.menuItemId).toBe(cola.menuItemId);
  });

  it("FR-CART-4: subtotal multiplies unit price by quantity", () => {
    useCartStore.getState().add(margherita, 2); // 2598
    useCartStore.getState().add(cola, 3); // 747
    expect(subtotalOf(useCartStore.getState().lines)).toBe(3345);
  });
});
