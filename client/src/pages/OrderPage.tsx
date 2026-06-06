import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api, ApiException } from "@/lib/api";
import type { Order } from "@/lib/types";
import { OrderStatusView } from "@/components/orders/OrderStatusView";
import { Button } from "@/components/ui/Button";

type State =
  | { status: "loading" }
  | { status: "ready"; order: Order }
  | { status: "not-found" }
  | { status: "error"; message: string };

export function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (!id) {
      setState({ status: "not-found" });
      return;
    }
    let cancelled = false;
    api
      .getOrder(id)
      .then((order) => {
        if (!cancelled) setState({ status: "ready", order });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiException && err.status === 404) {
          setState({ status: "not-found" });
        } else {
          setState({
            status: "error",
            message: err instanceof Error ? err.message : "Failed to load.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-20" data-testid="loading-state">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        <p className="mt-4 text-sm text-neutral-500 font-medium">Loading order…</p>
      </div>
    );
  }
  if (state.status === "not-found") {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center">
        <p className="font-medium">Order not found.</p>
        <p className="mt-1 text-sm text-neutral-600">
          The order may have been deleted or the link is wrong.
        </p>
        <div className="mt-4">
          <Link to="/">
            <Button variant="secondary">Back to menu</Button>
          </Link>
        </div>
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div role="alert" className="rounded-md bg-red-50 p-4 text-sm text-red-700">
        {state.message}
      </div>
    );
  }
  return <OrderStatusView initialOrder={state.order} />;
}
