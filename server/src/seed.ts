import type { MenuItem } from "./lib/types.js";

export const seedMenu: MenuItem[] = [
  {
    id: "pizza-margherita",
    name: "Margherita Pizza",
    description:
      "San Marzano tomato, fresh mozzarella, basil, extra virgin olive oil.",
    price: 1299,
    imageUrl:
      "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&q=80",
    category: "pizza",
  },
  {
    id: "pizza-pepperoni",
    name: "Pepperoni Pizza",
    description:
      "Tomato, mozzarella, spicy pepperoni — a classic done right.",
    price: 1499,
    imageUrl:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80",
    category: "pizza",
  },
  {
    id: "pizza-veggie",
    name: "Garden Veggie Pizza",
    description: "Bell peppers, mushrooms, onions, olives, mozzarella.",
    price: 1399,
    imageUrl:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    category: "pizza",
  },
  {
    id: "burger-classic",
    name: "Classic Cheeseburger",
    description:
      "Beef patty, cheddar, lettuce, tomato, pickles, house sauce on brioche.",
    price: 999,
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    category: "burger",
  },
  {
    id: "burger-bbq-bacon",
    name: "BBQ Bacon Burger",
    description: "Smoked bacon, cheddar, crispy onions, smoky BBQ sauce.",
    price: 1199,
    imageUrl:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80",
    category: "burger",
  },
  {
    id: "drink-cola",
    name: "Cola",
    description: "Chilled 330ml can.",
    price: 249,
    imageUrl:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80",
    category: "drink",
  },
  {
    id: "drink-lemonade",
    name: "Fresh Lemonade",
    description: "Hand-squeezed lemons, lightly sweet, served over ice.",
    price: 349,
    imageUrl:
      "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800&q=80",
    category: "drink",
  },
  {
    id: "dessert-brownie",
    name: "Chocolate Brownie",
    description: "Warm, fudgy brownie with a scoop of vanilla ice cream.",
    price: 599,
    imageUrl:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80",
    category: "dessert",
  },
];
