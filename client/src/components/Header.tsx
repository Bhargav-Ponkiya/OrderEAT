import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { CartDrawer } from "@/components/cart/CartDrawer";

export function Header() {
  const lines = useCartStore((s) => s.lines);
  const [open, setOpen] = useState(false);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-brand-600"
          >
            OrderEAT
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden />
            <span>Cart</span>
            {itemCount > 0 && (
              <span
                data-testid="cart-badge"
                className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-semibold text-white"
              >
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
