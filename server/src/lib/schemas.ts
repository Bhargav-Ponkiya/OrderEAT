import { z } from "zod";
import { MENU_CATEGORIES, ORDER_STATUSES } from "./types.js";

export const MenuItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  description: z.string().min(1).max(280),
  price: z.number().int().nonnegative(),
  imageUrl: z.string().url(),
  category: z.enum(MENU_CATEGORIES),
});

export const OrderLineInputSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

// Indian 10-digit mobile: starts with 6–9, exactly 10 digits
const PHONE_REGEX = /^[6-9]\d{9}$/;

export const CustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or fewer"),
  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be 200 characters or fewer"),
  phone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "Enter a valid 10-digit Indian mobile number (e.g. 9876543210)"),
});

export const CreateOrderInputSchema = z.object({
  items: z.array(OrderLineInputSchema).min(1, "Cart cannot be empty"),
  customer: CustomerSchema,
});

export const UpdateStatusInputSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;
export type UpdateStatusInput = z.infer<typeof UpdateStatusInputSchema>;
