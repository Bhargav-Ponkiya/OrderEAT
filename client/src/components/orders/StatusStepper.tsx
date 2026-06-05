import { Check } from "lucide-react";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";

const LABELS: Record<OrderStatus, string> = {
  RECEIVED: "Order received",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
};

export function StatusStepper({ current }: { current: OrderStatus }) {
  const currentIdx = ORDER_STATUSES.indexOf(current);

  return (
    <ol
      data-testid="status-stepper"
      data-current={current}
      className="grid grid-cols-1 gap-3 sm:grid-cols-4"
    >
      {ORDER_STATUSES.map((s, idx) => {
        const isDone = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <li
            key={s}
            data-testid={`step-${s}`}
            data-state={isCurrent ? "current" : isDone ? "done" : "pending"}
            className={[
              "flex items-center gap-3 rounded-lg border px-3 py-3",
              isCurrent
                ? "border-brand-500 bg-brand-50"
                : isDone
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-neutral-200 bg-white",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                isCurrent
                  ? "bg-brand-500 text-white"
                  : isDone
                    ? "bg-emerald-500 text-white"
                    : "bg-neutral-200 text-neutral-600",
              ].join(" ")}
              aria-hidden
            >
              {isDone ? <Check className="h-4 w-4" /> : idx + 1}
            </span>
            <span
              className={[
                "text-sm font-medium",
                isCurrent
                  ? "text-brand-700"
                  : isDone
                    ? "text-emerald-700"
                    : "text-neutral-700",
              ].join(" ")}
            >
              {LABELS[s]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
