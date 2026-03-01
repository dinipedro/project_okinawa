import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SkipNavLink from "@/components/a11y/SkipNavLink";

describe("SkipNavLink", () => {
  it("renders skip navigation link", () => {
    render(<SkipNavLink />);
    const link = screen.getByText("Pular para o conteúdo principal");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("is visually hidden by default (sr-only)", () => {
    render(<SkipNavLink />);
    const link = screen.getByText("Pular para o conteúdo principal");
    expect(link.className).toContain("sr-only");
  });
});
