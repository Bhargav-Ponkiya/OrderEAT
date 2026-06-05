import { z } from "zod";

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

export type CustomerInput = z.infer<typeof CustomerSchema>;
