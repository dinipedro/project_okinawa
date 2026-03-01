import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PartialOrderScreenV2 from "@/components/mobile-preview-v2/screens/PartialOrderScreenV2";

const mockOnNavigate = vi.fn();
const mockOnBack = vi.fn();

const defaultProps = {
  onNavigate: mockOnNavigate,
  onBack: mockOnBack,
};

/**
 * Tests for PartialOrderScreenV2 component
 */
describe("PartialOrderScreenV2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the partial order screen", () => {
    render(<PartialOrderScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Adicionar ao Pedido")).toBeInTheDocument();
    expect(screen.getByText("Peça mais sem esperar o garçom")).toBeInTheDocument();
  });

  it("should display current order items", () => {
    render(<PartialOrderScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Seu pedido atual")).toBeInTheDocument();
    expect(screen.getByText("Picanha ao ponto")).toBeInTheDocument();
    expect(screen.getByText("Arroz + Feijão")).toBeInTheDocument();
    expect(screen.getByText("Coca-Cola")).toBeInTheDocument();
  });

  it("should display order status for each item", () => {
    render(<PartialOrderScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Preparando")).toBeInTheDocument();
    expect(screen.getByText("Pronto")).toBeInTheDocument();
    expect(screen.getByText("Entregue")).toBeInTheDocument();
  });

  it("should display quick add categories", () => {
    render(<PartialOrderScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Adicionar rapidamente")).toBeInTheDocument();
    expect(screen.getByText("Bebidas")).toBeInTheDocument();
    expect(screen.getByText("Sobremesas")).toBeInTheDocument();
    expect(screen.getByText("Café/Digestivo")).toBeInTheDocument();
  });

  it("should show category items when category is selected", () => {
    render(<PartialOrderScreenV2 {...defaultProps} />);
    
    // Click on Bebidas category
    const bebidasButton = screen.getByText("Bebidas").closest("button");
    fireEvent.click(bebidasButton!);
    
    // Should show drink items
    expect(screen.getByText("Suco Natural")).toBeInTheDocument();
    expect(screen.getByText("Água")).toBeInTheDocument();
    expect(screen.getByText("Cerveja")).toBeInTheDocument();
  });

  it("should add item to cart when clicked", () => {
    render(<PartialOrderScreenV2 {...defaultProps} />);
    
    // Open Bebidas category
    const bebidasButton = screen.getByText("Bebidas").closest("button");
    fireEvent.click(bebidasButton!);
    
    // Click on Cerveja
    const cervejaButton = screen.getByText("Cerveja").closest("button");
    fireEvent.click(cervejaButton!);
    
    // Should show items to add section
    expect(screen.getByText("Itens a adicionar")).toBeInTheDocument();
    expect(screen.getByText("1x Cerveja")).toBeInTheDocument();
  });

  it("should display send mode options", () => {
    render(<PartialOrderScreenV2 {...defaultProps} />);
    
    expect(screen.getByText("Modo de envio")).toBeInTheDocument();
    expect(screen.getByText("Enviar direto")).toBeInTheDocument();
    expect(screen.getByText("Confirmar")).toBeInTheDocument();
  });

  it("should toggle between send modes", () => {
    render(<PartialOrderScreenV2 {...defaultProps} />);
    
    // Default is "confirm" mode
    const directButton = screen.getByText("Enviar direto").closest("button");
    const confirmButton = screen.getByText("Confirmar").closest("button");
    
    // Click direct mode
    fireEvent.click(directButton!);
    
    // Now direct should be selected (has primary border)
    expect(directButton?.className).toContain("border-primary");
  });

  it("should show send button with total when items are added", () => {
    render(<PartialOrderScreenV2 {...defaultProps} />);
    
    // Add an item
    const bebidasButton = screen.getByText("Bebidas").closest("button");
    fireEvent.click(bebidasButton!);
    
    const aguaButton = screen.getByText("Água").closest("button");
    fireEvent.click(aguaButton!);
    
    // Should show send button with price (R$ 5.00)
    expect(screen.getByText(/Chamar Garçom.*5\.00/)).toBeInTheDocument();
  });

  it("should show success state after sending order", () => {
    render(<PartialOrderScreenV2 {...defaultProps} />);
    
    // Add an item
    const bebidasButton = screen.getByText("Bebidas").closest("button");
    fireEvent.click(bebidasButton!);
    
    const aguaButton = screen.getByText("Água").closest("button");
    fireEvent.click(aguaButton!);
    
    // Click send button
    const sendButton = screen.getByText(/Chamar Garçom.*5\.00/);
    fireEvent.click(sendButton);
    
    // Should show success
    expect(screen.getByText("Aguardando Garçom")).toBeInTheDocument();
  });
});
