import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import type { MenuItem } from "@/lib/types";
import { MenuGrid } from "@/components/menu/MenuGrid";
import { Button } from "@/components/ui/Button";

type State =
  | { status: "loading" }
  | { status: "ready"; items: MenuItem[] }
  | { status: "error" };

export function MenuPage() {
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(() => {
    let cancelled = false;
    setState({ status: "loading" });
    api
      .getMenu()
      .then((items) => {
        if (!cancelled) setState({ status: "ready", items });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => load(), [load]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Today&rsquo;s menu
        </h1>
        <p className="text-sm text-neutral-600">
          Fresh pizzas, juicy burgers, drinks and dessert. Tap{" "}
          <strong>Add</strong> to drop something in your cart.
        </p>
      </header>

      {state.status === "loading" && (
        <p className="text-sm text-neutral-500">Loading menu…</p>
      )}

      {state.status === "error" && (
        <div
          role="alert"
          className="flex flex-col items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700"
        >
          <p className="font-medium">We couldn&rsquo;t load the menu.</p>
          <p className="text-red-600/80">
            Something went wrong on our side. Please try again in a moment.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => load()}
            aria-label="Try again"
          >
            <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden /> Try again
          </Button>
        </div>
      )}

      {state.status === "ready" && state.items.length === 0 && (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-600">
          <p className="font-medium">No items on the menu right now.</p>
          <p className="mt-1 text-neutral-500">Please check back soon.</p>
        </div>
      )}

      {state.status === "ready" && state.items.length > 0 && (
        <MenuGrid items={state.items} />
      )}
    </div>
  );
}
