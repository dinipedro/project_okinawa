import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SplitBillCasualScreenV2 from "@/components/mobile-preview-v2/screens/SplitBillCasualScreenV2";

const mockOnNavigate = vi.fn();
const mockOnBack = vi.fn();

const defaultProps = {
  onNavigate: mockOnNavigate,
  onBack: mockOnBack,
};

describe("SplitBillCasualScreenV2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the split bill screen", () => {
    render(<SplitBillCasualScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Dividir Conta")).toBeInTheDocument();
    expect(screen.getByText("Como dividir?")).toBeInTheDocument();
  });

  it("should show three split mode options", () => {
    render(<SplitBillCasualScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Igual")).toBeInTheDocument();
    expect(screen.getByText("Individual")).toBeInTheDocument();
    expect(screen.getByText("Customizado")).toBeInTheDocument();
  });

  it("should display tip percentage options", () => {
    render(<SplitBillCasualScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Gorjeta sugerida")).toBeInTheDocument();
    expect(screen.getByText("5%")).toBeInTheDocument();
    expect(screen.getByText("10%")).toBeInTheDocument();
    expect(screen.getByText("15%")).toBeInTheDocument();
  });

  it("should show equal split by default", () => {
    render(<SplitBillCasualScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Divisão igual")).toBeInTheDocument();
  });

  it("should switch to individual mode when clicked", () => {
    render(<SplitBillCasualScreenV2 {...defaultProps} />);
    
    const individualButton = screen.getByText("Individual").closest("button");
    fireEvent.click(individualButton!);
    
    expect(screen.getByText("Cada um paga o seu")).toBeInTheDocument();
  });

  it("should switch to custom mode when clicked", () => {
    render(<SplitBillCasualScreenV2 {...defaultProps} />);
    
    const customButton = screen.getByText("Customizado").closest("button");
    fireEvent.click(customButton!);
    
    expect(screen.getByText("Selecione quem vai dividir com você")).toBeInTheDocument();
  });

  it("should display pay button", () => {
    render(<SplitBillCasualScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Você vai pagar")).toBeInTheDocument();
    expect(screen.getByText("Pagar minha parte")).toBeInTheDocument();
  });

  it("should navigate to checkout when pay button is clicked", () => {
    render(<SplitBillCasualScreenV2 {...defaultProps} />);
    
    const payButton = screen.getByText("Pagar minha parte");
    fireEvent.click(payButton);
    
    expect(mockOnNavigate).toHaveBeenCalledWith("checkout");
  });
});
