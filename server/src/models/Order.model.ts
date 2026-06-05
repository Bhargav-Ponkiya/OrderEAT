import { Schema, model, type InferSchemaType } from "mongoose";
import { ORDER_STATUSES } from "../lib/types.js";

const OrderLineSchema = new Schema(
  {
    menuItemId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const CustomerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const OrderSchemaMongo = new Schema(
  {
    items: { type: [OrderLineSchema], required: true, default: undefined },
    customer: { type: CustomerSchema, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: "RECEIVED", required: true },
    total: { type: Number, required: true, min: 0 },
    idempotencyKey: { type: String, required: false, index: true },
  },
  { timestamps: true, versionKey: false },
);

OrderSchemaMongo.set("toJSON", {
  virtuals: false,
  versionKey: false,
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    if (ret.createdAt instanceof Date) ret.createdAt = ret.createdAt.toISOString();
    if (ret.updatedAt instanceof Date) ret.updatedAt = ret.updatedAt.toISOString();
    return ret;
  },
});

export type OrderDoc = InferSchemaType<typeof OrderSchemaMongo>;
export const OrderModel = model<OrderDoc>("Order", OrderSchemaMongo);
