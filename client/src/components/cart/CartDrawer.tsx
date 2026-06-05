import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { subtotalOf, useCartStore } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/Button";

type Props = { open: boolean; onClose(): void };

export function CartDrawer({ open, onClose }: Props) {
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const subtotal = subtotalOf(lines);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-40 transition-opacity ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <button
        type="button"
        aria-label="Close cart"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <h2 className="text-lg font-semibold">Your cart</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {lines.length === 0 ? (
            <p className="py-12 text-center text-sm text-neutral-500">
              Your cart is empty. Add something tasty from the menu.
            </p>
          ) : (
            <ul className="space-y-4">
              {lines.map((line) => (
                <li
                  key={line.menuItemId}
                  data-testid={`cart-line-${line.menuItemId}`}
                  className="flex gap-3 rounded-lg border border-neutral-200 p-3"
                >
                  <img
                    src={line.imageUrl}
                    alt={line.name}
                    loading="lazy"
                    className="h-16 w-16 shrink-0 rounded-md object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">
                        {line.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => remove(line.menuItemId)}
                        className="text-neutral-400 hover:text-red-600"
                        aria-label={`Remove ${line.name}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-md border border-neutral-200">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(line.menuItemId, line.quantity - 1)
                          }
                          className="flex h-8 w-8 items-center justify-center text-neutral-600 hover:bg-neutral-100"
                          aria-label={`Decrease ${line.name} quantity`}
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden />
                        </button>
                        <span
                          data-testid={`cart-qty-${line.menuItemId}`}
                          className="w-8 text-center text-sm font-medium"
                        >
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(line.menuItemId, line.quantity + 1)
                          }
                          className="flex h-8 w-8 items-center justify-center text-neutral-600 hover:bg-neutral-100"
                          aria-label={`Increase ${line.name} quantity`}
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatMoney(line.unitPrice * line.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-neutral-200 px-4 py-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-neutral-600">Subtotal</span>
            <span
              data-testid="cart-subtotal"
              className="font-semibold text-neutral-900"
            >
              {formatMoney(subtotal)}
            </span>
          </div>
          <Link to="/checkout" onClick={onClose}>
            <Button
              size="lg"
              className="w-full"
              disabled={lines.length === 0}
              aria-disabled={lines.length === 0}
            >
              Checkout
            </Button>
          </Link>
        </footer>
      </aside>
    </div>
  );
}
