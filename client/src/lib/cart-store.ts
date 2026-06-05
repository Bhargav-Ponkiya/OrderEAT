import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartLine = {
  menuItemId: string;
  name: string;
  unitPrice: number;
  imageUrl: string;
  quantity: number;
};

export type CartState = {
  lines: CartLine[];
  add(line: Omit<CartLine, "quantity">, quantity?: number): void;
  setQuantity(menuItemId: string, quantity: number): void;
  remove(menuItemId: string): void;
  clear(): void;
};

export const subtotalOf = (lines: CartLine[]): number =>
  lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add(line, quantity = 1) {
        set((state) => {
          const existing = state.lines.find(
            (l) => l.menuItemId === line.menuItemId,
          );
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.menuItemId === line.menuItemId
                  ? { ...l, quantity: l.quantity + quantity }
                  : l,
              ),
            };
          }
          return { lines: [...state.lines, { ...line, quantity }] };
        });
      },
      setQuantity(menuItemId, quantity) {
        set((state) => {
          if (quantity <= 0) {
            return {
              lines: state.lines.filter((l) => l.menuItemId !== menuItemId),
            };
          }
          return {
            lines: state.lines.map((l) =>
              l.menuItemId === menuItemId ? { ...l, quantity } : l,
            ),
          };
        });
      },
      remove(menuItemId) {
        set((state) => ({
          lines: state.lines.filter((l) => l.menuItemId !== menuItemId),
        }));
      },
      clear() {
        set({ lines: [] });
      },
    }),
    {
      name: "raft-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
