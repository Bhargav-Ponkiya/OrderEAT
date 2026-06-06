import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Order } from "@/lib/types";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { StatusStepper } from "./StatusStepper";
import { Button } from "@/components/ui/Button";

export function OrderStatusView({ initialOrder }: { initialOrder: Order }) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource(api.orderStreamUrl(initialOrder.id));
    es.addEventListener("open", () => setConnected(true));
    es.addEventListener("snapshot", (e) => {
      try {
        const parsed = JSON.parse((e as MessageEvent).data) as Order;
        setOrder(parsed);
        if (parsed.status === "DELIVERED") {
          es.close();
        }
      } catch {
        /* ignore */
      }
    });
    es.addEventListener("update", (e) => {
      try {
        const parsed = JSON.parse((e as MessageEvent).data) as Order;
        setOrder(parsed);
        if (parsed.status === "DELIVERED") {
          es.close();
        }
      } catch {
        /* ignore */
      }
    });
    es.addEventListener("error", () => setConnected(false));
    return () => es.close();
  }, [initialOrder.id]);

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
          <span>Order</span>
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono">
            {order.id.slice(0, 8)}
          </code>
          <span
            data-testid="sse-state"
            className={`ml-auto inline-flex items-center gap-1.5 text-xs ${
              connected ? "text-emerald-600" : "text-neutral-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connected
                  ? "animate-pulse bg-emerald-500"
                  : "bg-neutral-300"
              }`}
              aria-hidden
            />
            {connected ? "live" : "connecting…"}
          </span>
        </div>
        <h1 className="text-2xl font-bold">Track your order</h1>
        <p className="mt-1 text-sm text-neutral-600">
          We&rsquo;ll keep this page up to date as your order progresses. No
          need to refresh.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Status</h2>
        <StatusStepper current={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Items</h2>
          <ul className="space-y-3 text-sm">
            {order.items.map((line) => (
              <li
                key={line.menuItemId}
                className="flex justify-between gap-3 border-b border-neutral-100 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{line.name}</p>
                  <p className="text-xs text-neutral-500">
                    {formatMoney(line.unitPrice)} × {line.quantity}
                  </p>
                </div>
                <span className="font-semibold">
                  {formatMoney(line.lineTotal)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4 text-base">
            <span className="font-medium">Total</span>
            <span
              data-testid="order-total"
              className="font-bold text-neutral-900"
            >
              {formatMoney(order.total)}
            </span>
          </div>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Delivery</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-neutral-500">Recipient</dt>
              <dd className="font-medium">{order.customer.name}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Address</dt>
              <dd className="font-medium">{order.customer.address}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Phone</dt>
              <dd className="font-medium">{order.customer.phone}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="flex justify-end">
        <Link to="/">
          <Button variant="secondary">Back to menu</Button>
        </Link>
      </div>
    </div>
  );
}
