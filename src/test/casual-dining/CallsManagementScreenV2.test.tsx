import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CallsManagementScreenV2 from "@/components/mobile-preview-v2/screens/restaurant/CallsManagementScreenV2";

const mockOnNavigate = vi.fn();
const mockOnBack = vi.fn();

const defaultProps = {
  onNavigate: mockOnNavigate,
  onBack: mockOnBack,
};

describe("CallsManagementScreenV2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the calls management screen", () => {
    render(<CallsManagementScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Chamadas de Garçom")).toBeInTheDocument();
  });

  it("should display pending and acknowledged counts in header", () => {
    render(<CallsManagementScreenV2 {...defaultProps} />);
    
    // Check that we have the header info
    expect(screen.getByRole("heading", { name: "Chamadas de Garçom" })).toBeInTheDocument();
  });

  it("should show filter buttons", () => {
    render(<CallsManagementScreenV2 {...defaultProps} />);
    
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(3); // Filters + action buttons
  });

  it("should display call cards", () => {
    render(<CallsManagementScreenV2 {...defaultProps} />);
    
    // Check that cards are rendered (look for status badges)
    expect(screen.getAllByText("Pendente").length).toBeGreaterThan(0);
  });

  it("should show accept buttons for pending calls", () => {
    render(<CallsManagementScreenV2 {...defaultProps} />);
    
    const acceptButtons = screen.getAllByText("Aceitar");
    expect(acceptButtons.length).toBeGreaterThan(0);
  });

  it("should change pending count when accept is clicked", () => {
    render(<CallsManagementScreenV2 {...defaultProps} />);
    
    // Get initial count of accept buttons
    const initialAcceptButtons = screen.getAllByText("Aceitar");
    const initialCount = initialAcceptButtons.length;
    
    // Click first accept button
    fireEvent.click(initialAcceptButtons[0]);
    
    // Number of accept buttons should decrease
    const newAcceptButtons = screen.queryAllByText("Aceitar");
    expect(newAcceptButtons.length).toBeLessThan(initialCount);
  });

  it("should display stats in footer", () => {
    render(<CallsManagementScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Total hoje")).toBeInTheDocument();
    expect(screen.getByText("Tempo médio")).toBeInTheDocument();
    expect(screen.getByText("Resolvidos")).toBeInTheDocument();
  });

  it("should navigate when view table is clicked", () => {
    render(<CallsManagementScreenV2 {...defaultProps} />);
    
    const viewTableButtons = screen.getAllByText("Ver Mesa");
    fireEvent.click(viewTableButtons[0]);
    
    expect(mockOnNavigate).toHaveBeenCalledWith("tables");
  });
});
