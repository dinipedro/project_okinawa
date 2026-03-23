import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CasualDiningConfigScreenV2 from "@/components/mobile-preview-v2/screens/restaurant/CasualDiningConfigScreenV2";

/**
 * Tests for CasualDiningConfigScreenV2 component
 */
describe("CasualDiningConfigScreenV2", () => {
  it("should render the config screen", () => {
    render(<CasualDiningConfigScreenV2 />);
    
    expect(screen.getByText("Casual Dining")).toBeInTheDocument();
    expect(screen.getByText("Configure seu restaurante")).toBeInTheDocument();
  });

  it("should display quick stats", () => {
    render(<CasualDiningConfigScreenV2 />);
    
    expect(screen.getByText("Ticket Médio")).toBeInTheDocument();
    expect(screen.getByText("R$ 60-150")).toBeInTheDocument();
    expect(screen.getByText("Tempo Médio")).toBeInTheDocument();
    expect(screen.getByText("75 min")).toBeInTheDocument();
    expect(screen.getByText("Giros/Dia")).toBeInTheDocument();
    expect(screen.getByText("4x")).toBeInTheDocument();
  });

  it("should display all configuration sections", () => {
    render(<CasualDiningConfigScreenV2 />);
    
    expect(screen.getByText("Reservas e Entrada")).toBeInTheDocument();
    expect(screen.getByText("Serviço de Mesa")).toBeInTheDocument();
    expect(screen.getByText("Grupos")).toBeInTheDocument();
    expect(screen.getByText("Pagamento")).toBeInTheDocument();
  });

  describe("Reservations Section", () => {
    it("should display reservation settings", () => {
      render(<CasualDiningConfigScreenV2 />);
      
      expect(screen.getByText("Reserva Opcional")).toBeInTheDocument();
      expect(screen.getByText("Lista de Espera")).toBeInTheDocument();
      expect(screen.getByText("Bebidas na Fila")).toBeInTheDocument();
      expect(screen.getByText("Tempo Estimado")).toBeInTheDocument();
    });
  });

  describe("Service Section", () => {
    it("should display service settings", () => {
      render(<CasualDiningConfigScreenV2 />);
      
      expect(screen.getByText("Atendimento na Mesa")).toBeInTheDocument();
      expect(screen.getByText("Pedido pelo App")).toBeInTheDocument();
      expect(screen.getByText("Botão Chamar Garçom")).toBeInTheDocument();
      expect(screen.getByText("Pedido Parcial")).toBeInTheDocument();
    });
  });

  describe("Groups Section", () => {
    it("should display group settings", () => {
      render(<CasualDiningConfigScreenV2 />);
      
      expect(screen.getByText("Aceita Grupos")).toBeInTheDocument();
      expect(screen.getByText("Tamanho Máximo")).toBeInTheDocument();
      expect(screen.getByText("Reserva Obrigatória")).toBeInTheDocument();
    });

    it("should display default values for group settings", () => {
      render(<CasualDiningConfigScreenV2 />);
      
      // Max group size should show 20
      expect(screen.getByText("20")).toBeInTheDocument();
      // Group reservation required should show 8
      expect(screen.getByText("8")).toBeInTheDocument();
    });
  });

  describe("Payment Section", () => {
    it("should display payment settings", () => {
      render(<CasualDiningConfigScreenV2 />);
      
      expect(screen.getByText("Gorjeta Sugerida")).toBeInTheDocument();
      expect(screen.getByText("Taxa de Serviço")).toBeInTheDocument();
      expect(screen.getByText("Divisão de Conta")).toBeInTheDocument();
    });

    it("should display default tip percentage", () => {
      render(<CasualDiningConfigScreenV2 />);
      
      expect(screen.getByText("10%")).toBeInTheDocument();
    });
  });

  it("should have a save button", () => {
    render(<CasualDiningConfigScreenV2 />);
    
    expect(screen.getByText("Salvar Configurações")).toBeInTheDocument();
  });
});
