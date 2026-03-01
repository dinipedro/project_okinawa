import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CallWaiterCasualScreenV2 from "@/components/mobile-preview-v2/screens/CallWaiterCasualScreenV2";

const mockOnNavigate = vi.fn();
const mockOnBack = vi.fn();

const defaultProps = {
  onNavigate: mockOnNavigate,
  onBack: mockOnBack,
};

/**
 * Tests for CallWaiterCasualScreenV2 component
 */
describe("CallWaiterCasualScreenV2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the call waiter screen", () => {
    render(<CallWaiterCasualScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Chamar Garçom")).toBeInTheDocument();
    expect(screen.getByText("Por que você precisa de ajuda?")).toBeInTheDocument();
  });

  it("should display all 6 call reason options", () => {
    render(<CallWaiterCasualScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Pedir mais")).toBeInTheDocument();
    expect(screen.getByText("Dúvida")).toBeInTheDocument();
    expect(screen.getByText("Refil")).toBeInTheDocument();
    expect(screen.getByText("Sobremesa/Café")).toBeInTheDocument();
    expect(screen.getByText("Problema")).toBeInTheDocument();
    expect(screen.getByText("Outro")).toBeInTheDocument();
  });

  it("should have disabled send button initially", () => {
    render(<CallWaiterCasualScreenV2 {...defaultProps} />);
    
    const sendButton = screen.getByText("Selecione um motivo");
    expect(sendButton).toBeInTheDocument();
    expect(sendButton).toBeDisabled();
  });

  it("should enable send button when a reason is selected", () => {
    render(<CallWaiterCasualScreenV2 {...defaultProps} />);
    
    const orderMoreButton = screen.getByText("Pedir mais").closest("button");
    fireEvent.click(orderMoreButton!);
    
    // Use getAllByText since there's a title and a button with same text
    const sendButtons = screen.getAllByText("Chamar Garçom");
    const buttonElement = sendButtons.find(el => el.tagName === "BUTTON");
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).not.toBeDisabled();
  });

  it("should show textarea for custom message when reason is selected", () => {
    render(<CallWaiterCasualScreenV2 {...defaultProps} />);
    
    // Initially no textarea
    expect(screen.queryByPlaceholderText(/Preciso de mais guardanapos/)).not.toBeInTheDocument();
    
    // Select a reason
    const duvidasButton = screen.getByText("Dúvida").closest("button");
    fireEvent.click(duvidasButton!);
    
    // Textarea should appear
    expect(screen.getByPlaceholderText(/Preciso de mais guardanapos/)).toBeInTheDocument();
  });

  it("should show success message after sending call", async () => {
    render(<CallWaiterCasualScreenV2 {...defaultProps} />);
    
    // Select a reason
    const refilButton = screen.getByText("Refil").closest("button");
    fireEvent.click(refilButton!);
    
    // Click send - use role to find button
    const sendButton = screen.getByRole("button", { name: "Chamar Garçom" });
    fireEvent.click(sendButton);
    
    // Should show success message
    expect(screen.getByText("Chamada Enviada!")).toBeInTheDocument();
    expect(screen.getByText("Seu garçom foi notificado e virá em breve.")).toBeInTheDocument();
  });

  it("should display info about smartwatch notification", () => {
    render(<CallWaiterCasualScreenV2 {...defaultProps} />);
    
    expect(screen.getByText(/garçom receberá sua chamada instantaneamente no smartwatch/i)).toBeInTheDocument();
  });
});
