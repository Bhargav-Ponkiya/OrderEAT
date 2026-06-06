import { describe, expect, it, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { MenuGrid } from "./MenuGrid";
import type { MenuItem } from "@/lib/types";

const items: MenuItem[] = [
  {
    id: "pizza-margherita",
    name: "Margherita Pizza",
    description: "Simple and classic",
    price: 1299,
    imageUrl: "http://example.com/pizza.jpg",
    category: "pizza",
  },
];

describe("MenuGrid", () => {
  it("renders menu items and displays 'Added' feedback briefly on add to cart", () => {
    render(<MenuGrid items={items} />);

    // Check item rendering
    expect(screen.getByText("Margherita Pizza")).toBeInTheDocument();
    
    // Check initial Add button state
    const addButton = screen.getByRole("button", { name: /Add Margherita Pizza/i });
    expect(addButton).toHaveTextContent("Add");

    // Mock timers for setTimeout
    vi.useFakeTimers();

    // Click Add
    fireEvent.click(addButton);

    // Verify feedback state
    expect(screen.getByRole("button", { name: /Margherita Pizza added/i })).toHaveTextContent("Added");

    // Advance timers by 800ms
    act(() => {
      vi.advanceTimersByTime(800);
    });

    // Verify button reverts to Add
    expect(screen.getByRole("button", { name: /Add Margherita Pizza/i })).toHaveTextContent("Add");

    vi.useRealTimers();
  });
});
