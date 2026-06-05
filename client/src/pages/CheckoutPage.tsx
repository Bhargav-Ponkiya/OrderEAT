import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export function CheckoutPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="text-sm text-neutral-600">
          A few details and your food is on its way.
        </p>
      </header>
      <CheckoutForm />
    </div>
  );
}
