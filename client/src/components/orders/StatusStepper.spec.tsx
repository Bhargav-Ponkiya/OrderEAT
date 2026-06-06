import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusStepper } from "./StatusStepper";

describe("StatusStepper", () => {
  it("marks the current step and earlier steps as done", () => {
    render(<StatusStepper current="OUT_FOR_DELIVERY" />);
    expect(screen.getByTestId("step-RECEIVED")).toHaveAttribute(
      "data-state",
      "done",
    );
    expect(screen.getByTestId("step-PREPARING")).toHaveAttribute(
      "data-state",
      "done",
    );
    expect(screen.getByTestId("step-OUT_FOR_DELIVERY")).toHaveAttribute(
      "data-state",
      "current",
    );
    expect(screen.getByTestId("step-DELIVERED")).toHaveAttribute(
      "data-state",
      "pending",
    );
  });

  it("treats DELIVERED as the final completed step where all steps are done", () => {
    render(<StatusStepper current="DELIVERED" />);
    expect(screen.getByTestId("step-DELIVERED")).toHaveAttribute(
      "data-state",
      "done",
    );
    expect(screen.getByTestId("step-OUT_FOR_DELIVERY")).toHaveAttribute(
      "data-state",
      "done",
    );
  });
});
