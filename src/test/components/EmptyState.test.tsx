import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "@/components/ui/EmptyState";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="Nenhum resultado" description="Tente novamente" />);
    expect(screen.getByText("Nenhum resultado")).toBeInTheDocument();
    expect(screen.getByText("Tente novamente")).toBeInTheDocument();
  });

  it("renders with search variant", () => {
    render(<EmptyState title="Sem resultados" variant="search" />);
    expect(screen.getByLabelText("Sem resultados")).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    render(
      <EmptyState title="Vazio" action={<button>Criar novo</button>} />
    );
    expect(screen.getByText("Criar novo")).toBeInTheDocument();
  });

  it("has role=status for accessibility", () => {
    render(<EmptyState title="Vazio" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
