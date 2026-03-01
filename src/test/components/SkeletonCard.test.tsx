import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SkeletonCard from "@/components/ui/SkeletonCard";

describe("SkeletonCard", () => {
  it("renders with role=status", () => {
    render(<SkeletonCard />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders correct number of skeleton lines", () => {
    const { container } = render(<SkeletonCard lines={4} />);
    const lines = container.querySelectorAll(".bg-muted.h-4");
    expect(lines.length).toBe(4);
  });

  it("renders image placeholder when hasImage is true", () => {
    const { container } = render(<SkeletonCard hasImage />);
    expect(container.querySelector(".h-40")).toBeInTheDocument();
  });

  it("has aria-label for screen readers", () => {
    render(<SkeletonCard />);
    expect(screen.getByLabelText("Carregando conteúdo")).toBeInTheDocument();
  });
});
