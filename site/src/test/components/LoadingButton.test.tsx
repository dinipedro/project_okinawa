import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LoadingButton from "@/components/ui/LoadingButton";

describe("LoadingButton", () => {
  it("renders children when not loading", () => {
    render(<LoadingButton>Salvar</LoadingButton>);
    expect(screen.getByText("Salvar")).toBeInTheDocument();
  });

  it("shows spinner and is disabled when loading", () => {
    render(<LoadingButton loading>Salvar</LoadingButton>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("shows loadingText when loading", () => {
    render(<LoadingButton loading loadingText="Salvando...">Salvar</LoadingButton>);
    expect(screen.getByText("Salvando...")).toBeInTheDocument();
  });

  it("handles click when not loading", () => {
    let clicked = false;
    render(<LoadingButton onClick={() => { clicked = true; }}>OK</LoadingButton>);
    fireEvent.click(screen.getByRole("button"));
    expect(clicked).toBe(true);
  });
});
