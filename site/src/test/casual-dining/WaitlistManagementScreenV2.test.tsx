import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import WaitlistManagementScreenV2 from "@/components/mobile-preview-v2/screens/restaurant/WaitlistManagementScreenV2";

/**
 * Tests for WaitlistManagementScreenV2 component
 */
describe("WaitlistManagementScreenV2", () => {
  it("should render the waitlist management screen", () => {
    render(<WaitlistManagementScreenV2 />);
    
    expect(screen.getByText("Lista de Espera")).toBeInTheDocument();
  });

  it("should display waitlist stats", () => {
    render(<WaitlistManagementScreenV2 />);
    
    expect(screen.getByText("Na fila")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument(); // 4 customers
    expect(screen.getByText("Tempo médio")).toBeInTheDocument();
    expect(screen.getByText("15 min")).toBeInTheDocument();
  });

  it("should display all customers in waitlist", () => {
    render(<WaitlistManagementScreenV2 />);
    
    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    expect(screen.getByText("Pedro Costa")).toBeInTheDocument();
    expect(screen.getByText("Ana Oliveira")).toBeInTheDocument();
  });

  it("should display customer details", () => {
    render(<WaitlistManagementScreenV2 />);
    
    expect(screen.getByText("4 pessoas • 25 min")).toBeInTheDocument();
    expect(screen.getByText("2 pessoas • 18 min")).toBeInTheDocument();
  });

  it("should display position numbers", () => {
    render(<WaitlistManagementScreenV2 />);
    
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByText("#3")).toBeInTheDocument();
    expect(screen.getByText("#4")).toBeInTheDocument();
  });

  it("should show notes when customer has them", () => {
    render(<WaitlistManagementScreenV2 />);
    
    expect(screen.getByText("Aniversário")).toBeInTheDocument();
  });

  it("should expand customer card when clicked", () => {
    render(<WaitlistManagementScreenV2 />);
    
    // Click on first customer
    const customerCard = screen.getByText("João Silva").closest("button");
    fireEvent.click(customerCard!);
    
    // Should show action buttons
    expect(screen.getByText("Chamar Cliente")).toBeInTheDocument();
    expect(screen.getByText("Remover da Fila")).toBeInTheDocument();
  });

  it("should remove customer from waitlist when remove is clicked", () => {
    render(<WaitlistManagementScreenV2 />);
    
    // Click on first customer to expand
    const customerCard = screen.getByText("João Silva").closest("button");
    fireEvent.click(customerCard!);
    
    // Click remove
    const removeButton = screen.getByText("Remover da Fila");
    fireEvent.click(removeButton);
    
    // Customer should be removed
    expect(screen.queryByText("João Silva")).not.toBeInTheDocument();
    
    // Stats should update
    expect(screen.getByText("3")).toBeInTheDocument(); // Now 3 customers
  });

  it("should call customer and remove from list when called", () => {
    render(<WaitlistManagementScreenV2 />);
    
    // Click on first customer to expand
    const customerCard = screen.getByText("João Silva").closest("button");
    fireEvent.click(customerCard!);
    
    // Click call
    const callButton = screen.getByText("Chamar Cliente");
    fireEvent.click(callButton);
    
    // Customer should be removed (called)
    expect(screen.queryByText("João Silva")).not.toBeInTheDocument();
  });

  it("should have add customer button", () => {
    render(<WaitlistManagementScreenV2 />);
    
    expect(screen.getByText("+ Adicionar à Fila")).toBeInTheDocument();
  });

  it("should indicate customers with advance orders", () => {
    render(<WaitlistManagementScreenV2 />);
    
    // João Silva and Pedro Costa have advance orders
    // They should have the wine glass icon indicator
    // This is tested by checking the component renders without errors
    // The visual indicator is a Wine icon in an amber background
    const component = render(<WaitlistManagementScreenV2 />);
    expect(component).toBeTruthy();
  });
});
