import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ZodError } from "zod";
import { CustomerSchema } from "@/lib/schemas";
import { subtotalOf, useCartStore } from "@/lib/cart-store";
import { api, ApiException } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type FormState = { name: string; address: string; phone: string };

export function CheckoutForm() {
  const navigate = useNavigate();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const [form, setForm] = useState<FormState>({
    name: "",
    address: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [idempotencyKey] = useState(() => window.crypto.randomUUID());

  const subtotal = subtotalOf(lines);

  const update = <K extends keyof FormState>(key: K, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => {
      if (!p[key]) return p;
      const next = { ...p };
      delete next[key];
      return next;
    });
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setErrors({});

    if (lines.length === 0) {
      setSubmitError("Your cart is empty.");
      return;
    }

    try {
      const customer = CustomerSchema.parse(form);
      setSubmitting(true);
      const order = await api.createOrder(
        {
          items: lines.map((l) => ({
            menuItemId: l.menuItemId,
            quantity: l.quantity,
          })),
          customer,
        },
        idempotencyKey,
      );
      clear();
      navigate(`/orders/${order.id}`);
    } catch (err) {
      if (err instanceof ZodError) {
        const next: Record<string, string> = {};
        for (const i of err.issues) {
          const k = i.path.join(".");
          if (k && !next[k]) next[k] = i.message;
        }
        setErrors(next);
        return;
      }
      if (err instanceof ApiException && err.body?.fields) {
        setErrors(
          Object.fromEntries(
            Object.entries(err.body.fields).map(([k, v]) => [
              k.replace(/^customer\./, ""),
              v,
            ]),
          ),
        );
        return;
      }
      setSubmitError(
        err instanceof Error ? err.message : "Could not place order.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center">
        <p className="text-neutral-700">
          Your cart is empty. Add items from the menu first.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="grid gap-8 lg:grid-cols-[1fr_360px]"
    >
      <section className="space-y-5 rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Delivery details</h2>

        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Full name
          </label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            autoComplete="name"
          />
          {errors.name && (
            <p id="name-error" className="text-xs text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="address" className="text-sm font-medium">
            Delivery address
          </label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            invalid={Boolean(errors.address)}
            aria-describedby={errors.address ? "address-error" : undefined}
            autoComplete="street-address"
          />
          {errors.address && (
            <p id="address-error" className="text-xs text-red-600">
              {errors.address}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone number
          </label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            inputMode="tel"
            autoComplete="tel"
            placeholder="9876543210"
          />
          {errors.phone && (
            <p id="phone-error" className="text-xs text-red-600">
              {errors.phone}
            </p>
          )}
        </div>

        {submitError && (
          <p
            data-testid="submit-error"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {submitError}
          </p>
        )}
      </section>

      <aside className="h-fit space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <ul className="space-y-2 text-sm">
          {lines.map((line) => (
            <li key={line.menuItemId} className="flex justify-between gap-3">
              <span className="text-neutral-700">
                {line.name}{" "}
                <span className="text-neutral-400">× {line.quantity}</span>
              </span>
              <span className="font-medium">
                {formatMoney(line.unitPrice * line.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-neutral-200 pt-3">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Subtotal</span>
            <span className="font-semibold">{formatMoney(subtotal)}</span>
          </div>
        </div>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? "Placing order…" : "Place order"}
        </Button>
      </aside>
    </form>
  );
}
