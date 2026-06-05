import type { CustomerInput } from "./schemas";
import type { ApiError, MenuItem, Order } from "./types";

const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
export const API_BASE = RAW_BASE.replace(/\/$/, "");

export class ApiException extends Error {
  status: number;
  body: ApiError | null;
  constructor(status: number, body: ApiError | null, message: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let body: ApiError | null = null;
    try {
      const json = (await res.json()) as { error?: ApiError };
      body = json.error ?? null;
    } catch {
      /* ignore */
    }
    throw new ApiException(
      res.status,
      body,
      body?.message ?? `HTTP ${res.status}`,
    );
  }
  return (await res.json()) as T;
}

export const api = {
  async getMenu(): Promise<MenuItem[]> {
    const res = await fetch(`${API_BASE}/api/menu`);
    const data = await handle<{ items: MenuItem[] }>(res);
    return data.items;
  },

  async createOrder(
    input: {
      items: Array<{ menuItemId: string; quantity: number }>;
      customer: CustomerInput;
    },
    idempotencyKey?: string,
  ): Promise<Order> {
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (idempotencyKey) {
      headers["x-idempotency-key"] = idempotencyKey;
    }
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify(input),
    });
    const data = await handle<{ order: Order }>(res);
    return data.order;
  },

  async getOrder(id: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/api/orders/${id}`);
    const data = await handle<{ order: Order }>(res);
    return data.order;
  },

  orderStreamUrl(id: string): string {
    return `${API_BASE}/api/orders/${id}/stream`;
  },
};
