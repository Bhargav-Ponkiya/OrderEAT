import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Header } from "@/components/Header";
import { MenuPage } from "@/pages/MenuPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { OrderPage } from "@/pages/OrderPage";

export function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="container-page py-8">
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/:id" element={<OrderPage />} />
          <Route
            path="*"
            element={
              <p className="text-center text-sm text-neutral-500">
                Page not found.
              </p>
            }
          />
        </Routes>
      </main>
      <footer className="container-page mt-16 border-t border-neutral-200 py-6 text-center text-xs text-neutral-500">
        OrderEAT · Food Delivery App
      </footer>
    </BrowserRouter>
  );
}
