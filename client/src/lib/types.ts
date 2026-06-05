export const MENU_CATEGORIES = ["pizza", "burger", "drink", "dessert"] as const;
export type MenuCategory = (typeof MENU_CATEGORIES)[number];

export const ORDER_STATUSES = [
  "RECEIVED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: MenuCategory;
};

export type OrderLine = {
  menuItemId: string;
  quantity: number;
  name: string;
  unitPrice: number;
  lineTotal: number;
};

export type Customer = {
  name: string;
  address: string;
  phone: string;
};

export type Order = {
  id: string;
  items: OrderLine[];
  customer: Customer;
  status: OrderStatus;
  total: number;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string>;
};
