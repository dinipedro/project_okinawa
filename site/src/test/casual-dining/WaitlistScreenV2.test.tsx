import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import WaitlistScreenV2 from "@/components/mobile-preview-v2/screens/WaitlistScreenV2";

const mockOnNavigate = vi.fn();
const mockOnBack = vi.fn();

const defaultProps = {
  onNavigate: mockOnNavigate,
  onBack: mockOnBack,
};

/**
 * Tests for WaitlistScreenV2 component
 */
describe("WaitlistScreenV2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the waitlist screen", () => {
    render(<WaitlistScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Lista de Espera")).toBeInTheDocument();
    expect(screen.getByText("Você está na fila!")).toBeInTheDocument();
  });

  it("should display position in queue", () => {
    render(<WaitlistScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("#4")).toBeInTheDocument();
    expect(screen.getByText("sua posição na fila")).toBeInTheDocument();
  });

  it("should display estimated wait time", () => {
    render(<WaitlistScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Tempo estimado")).toBeInTheDocument();
    expect(screen.getByText("~15 minutos")).toBeInTheDocument();
  });

  it("should display party size", () => {
    render(<WaitlistScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Tamanho do grupo")).toBeInTheDocument();
    expect(screen.getByText("4 pessoas")).toBeInTheDocument();
  });

  it("should show order drinks option", () => {
    render(<WaitlistScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Pedir Bebidas")).toBeInTheDocument();
    expect(screen.getByText("Valores vão para sua comanda")).toBeInTheDocument();
  });

  it("should show walk around option with notifications", () => {
    render(<WaitlistScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Passear por perto")).toBeInTheDocument();
  });

  it("should toggle notifications when clicking walk around option", () => {
    render(<WaitlistScreenV2 {...defaultProps} />);
    
    const walkAroundButton = screen.getByText("Passear por perto").closest("button");
    expect(walkAroundButton).toBeInTheDocument();
    
    // Initially notifications are enabled
    expect(screen.getByText("Você será notificado quando a mesa estiver próxima")).toBeInTheDocument();
    
    // Click to toggle
    fireEvent.click(walkAroundButton!);
    
    // Notifications should now be disabled
    expect(screen.getByText("Ative notificações para ser avisado")).toBeInTheDocument();
  });

  it("should display info about estimation method", () => {
    render(<WaitlistScreenV2 {...defaultProps} />);
    
    expect(screen.getByText(/estimativa de tempo é baseada na ocupação atual/i)).toBeInTheDocument();
  });
});
