import { Schema, model, type InferSchemaType } from "mongoose";
import { MENU_CATEGORIES } from "../lib/types.js";

const MenuItemSchemaMongo = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    category: { type: String, enum: MENU_CATEGORIES, required: true },
  },
  { _id: false, versionKey: false, timestamps: false },
);

export type MenuItemDoc = InferSchemaType<typeof MenuItemSchemaMongo> & {
  _id: string;
};

export const MenuItemModel = model<MenuItemDoc>(
  "MenuItem",
  MenuItemSchemaMongo,
);
