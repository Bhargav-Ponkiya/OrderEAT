import { useMemo } from "react";
import { Plus } from "lucide-react";
import { MENU_CATEGORIES, type MenuCategory, type MenuItem } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/Button";

const CATEGORY_LABEL: Record<MenuCategory, string> = {
  pizza: "Pizza",
  burger: "Burgers",
  drink: "Drinks",
  dessert: "Desserts",
};

export function MenuGrid({ items }: { items: MenuItem[] }) {
  const add = useCartStore((s) => s.add);

  const groups = useMemo(() => {
    const map = new Map<MenuCategory, MenuItem[]>();
    for (const cat of MENU_CATEGORIES) map.set(cat, []);
    for (const item of items) map.get(item.category)?.push(item);
    return map;
  }, [items]);

  return (
    <div className="space-y-12">
      {MENU_CATEGORIES.map((category) => {
        const group = groups.get(category) ?? [];
        if (group.length === 0) return null;
        return (
          <section key={category} aria-labelledby={`section-${category}`}>
            <h2
              id={`section-${category}`}
              className="mb-4 text-2xl font-bold tracking-tight"
            >
              {CATEGORY_LABEL[category]}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((item) => (
                <article
                  key={item.id}
                  data-testid={`menu-item-${item.id}`}
                  className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col gap-3 p-4">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {item.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-lg font-semibold text-neutral-900">
                        {formatMoney(item.price)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() =>
                          add({
                            menuItemId: item.id,
                            name: item.name,
                            unitPrice: item.price,
                            imageUrl: item.imageUrl,
                          })
                        }
                        aria-label={`Add ${item.name} to cart`}
                      >
                        <Plus className="mr-1 h-4 w-4" aria-hidden /> Add
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
