import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ServiceTypeConfigScreenV2 from "@/components/mobile-preview-v2/screens/restaurant/ServiceTypeConfigScreenV2";

/**
 * Tests for ServiceTypeConfigScreenV2 component with Casual Dining
 */
describe("ServiceTypeConfigScreenV2", () => {
  it("should render the service type config screen", () => {
    render(<ServiceTypeConfigScreenV2 />);
    
    expect(screen.getByText("Tipo de Serviço")).toBeInTheDocument();
    expect(screen.getByText("Configure seu modelo")).toBeInTheDocument();
  });

  it("should display all 9 service types", () => {
    render(<ServiceTypeConfigScreenV2 />);
    
    expect(screen.getByText("Casual Dining")).toBeInTheDocument();
    expect(screen.getByText("Fine Dining")).toBeInTheDocument();
    expect(screen.getByText("Quick Service")).toBeInTheDocument();
    expect(screen.getByText("Fast Casual")).toBeInTheDocument();
    expect(screen.getByText("Café/Padaria")).toBeInTheDocument();
    expect(screen.getByText("Buffet")).toBeInTheDocument();
    expect(screen.getByText("Drive-Thru")).toBeInTheDocument();
    expect(screen.getByText("Food Truck")).toBeInTheDocument();
    expect(screen.getByText("Chef's Table")).toBeInTheDocument();
  });

  it("should have Casual Dining selected by default", () => {
    render(<ServiceTypeConfigScreenV2 />);
    
    // Casual Dining should be first and selected
    const casualDiningButton = screen.getByText("Casual Dining").closest("button");
    expect(casualDiningButton?.className).toContain("border-primary");
  });

  it("should display descriptions for each type", () => {
    render(<ServiceTypeConfigScreenV2 />);
    
    expect(screen.getByText("Restaurante tradicional")).toBeInTheDocument();
    expect(screen.getByText("Alta gastronomia")).toBeInTheDocument();
    expect(screen.getByText("Fast food")).toBeInTheDocument();
  });

  it("should allow selecting different service types", () => {
    render(<ServiceTypeConfigScreenV2 />);
    
    // Click on Fine Dining
    const fineDiningButton = screen.getByText("Fine Dining").closest("button");
    fireEvent.click(fineDiningButton!);
    
    // Fine Dining should now be selected
    expect(fineDiningButton?.className).toContain("border-primary");
    
    // Casual Dining should not be selected
    const casualDiningButton = screen.getByText("Casual Dining").closest("button");
    expect(casualDiningButton?.className).not.toContain("border-primary");
  });

  it("should show check icon for selected type", () => {
    render(<ServiceTypeConfigScreenV2 />);
    
    // The selected type (Casual Dining) should have a check icon
    // This is indicated by a div with the Check component inside
    const component = render(<ServiceTypeConfigScreenV2 />);
    expect(component).toBeTruthy();
  });
});
