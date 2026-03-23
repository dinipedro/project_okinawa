import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import LiveRegion from "@/components/a11y/LiveRegion";

describe("LiveRegion", () => {
  it("renders with aria-live attribute", () => {
    const { container } = render(<LiveRegion message="Updated" />);
    const el = container.querySelector('[aria-live="polite"]');
    expect(el).toBeTruthy();
  });

  it("supports assertive politeness", () => {
    const { container } = render(<LiveRegion message="Error!" politeness="assertive" />);
    const el = container.querySelector('[aria-live="assertive"]');
    expect(el).toBeTruthy();
  });

  it("is visually hidden (sr-only)", () => {
    const { container } = render(<LiveRegion message="Test" />);
    const el = container.querySelector('[aria-live]');
    expect(el?.className).toContain("sr-only");
  });
});
