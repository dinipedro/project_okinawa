import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GroupBookingScreenV2 from "@/components/mobile-preview-v2/screens/GroupBookingScreenV2";

const mockOnNavigate = vi.fn();
const mockOnBack = vi.fn();

const defaultProps = {
  onNavigate: mockOnNavigate,
  onBack: mockOnBack,
};

describe("GroupBookingScreenV2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the group booking screen", () => {
    render(<GroupBookingScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Reserva de Grupo")).toBeInTheDocument();
    expect(screen.getByText("Quantas pessoas?")).toBeInTheDocument();
  });

  it("should display party size selector with initial value of 6", () => {
    render(<GroupBookingScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("pessoas")).toBeInTheDocument();
  });

  it("should increase party size when clicking plus button", () => {
    render(<GroupBookingScreenV2 {...defaultProps} />);
    
    const plusButtons = screen.getAllByRole("button");
    const plusButton = plusButtons.find(btn => btn.querySelector('svg.lucide-plus'));
    fireEvent.click(plusButton!);
    
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("should show reservation required notice for groups >= 8", () => {
    render(<GroupBookingScreenV2 {...defaultProps} />);
    
    // Increase to 8
    const plusButtons = screen.getAllByRole("button");
    const plusButton = plusButtons.find(btn => btn.querySelector('svg.lucide-plus'));
    fireEvent.click(plusButton!);
    fireEvent.click(plusButton!);
    
    expect(screen.getByText(/Grupos com 8\+ pessoas precisam de reserva/)).toBeInTheDocument();
  });

  it("should show walk-in option for smaller groups", () => {
    render(<GroupBookingScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Walk-in disponível!")).toBeInTheDocument();
    expect(screen.getByText("Entrar na fila agora")).toBeInTheDocument();
  });

  it("should display special requests textarea", () => {
    render(<GroupBookingScreenV2 {...defaultProps} />);
    
    expect(screen.getByPlaceholderText(/Mesas juntas, cadeirões/)).toBeInTheDocument();
  });

  it("should show benefits cards", () => {
    render(<GroupBookingScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Divisão de conta facilitada")).toBeInTheDocument();
    expect(screen.getByText("Pedidos individuais")).toBeInTheDocument();
  });
});
