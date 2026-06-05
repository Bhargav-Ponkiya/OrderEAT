import { MenuItemModel } from "../models/MenuItem.model.js";
import { seedMenu } from "../seed.js";
import type { MenuItem } from "../lib/types.js";

function fromDoc(doc: { _id: string; name: string; description: string; price: number; imageUrl: string; category: string }): MenuItem {
  return {
    id: doc._id,
    name: doc.name,
    description: doc.description,
    price: doc.price,
    imageUrl: doc.imageUrl,
    category: doc.category as MenuItem["category"],
  };
}

export async function listMenu(): Promise<MenuItem[]> {
  const docs = await MenuItemModel.find().lean();
  return docs.map(fromDoc);
}

export async function findMenuItem(id: string): Promise<MenuItem | null> {
  const doc = await MenuItemModel.findById(id).lean();
  return doc ? fromDoc(doc) : null;
}

export async function ensureMenuSeeded(): Promise<void> {
  const count = await MenuItemModel.estimatedDocumentCount();
  if (count > 0) return;
  await MenuItemModel.insertMany(
    seedMenu.map((m) => ({ _id: m.id, ...m, id: undefined })),
  );
}
