import { describe, it, expect } from "vitest";
import { SERVICE_TYPE_CONFIG, ServiceType } from "@/components/mobile-preview/context/MobilePreviewContext";

/**
 * Tests for SERVICE_TYPE_CONFIG to verify Casual Dining configuration
 */
describe("SERVICE_TYPE_CONFIG", () => {
  describe("Casual Dining Configuration", () => {
    const casualDiningConfig = SERVICE_TYPE_CONFIG[ServiceType.CASUAL_DINING];

    it("should have correct label", () => {
      expect(casualDiningConfig.label).toBe("Casual Dining");
    });

    it("should have correct description", () => {
      expect(casualDiningConfig.description).toContain("tradicional");
    });

    it("should have an icon", () => {
      expect(casualDiningConfig.icon).toBeDefined();
      expect(casualDiningConfig.icon.length).toBeGreaterThan(0);
    });

    it("should have correct features list", () => {
      expect(casualDiningConfig.features).toContain("Reserva Opcional");
      expect(casualDiningConfig.features).toContain("Lista de Espera Inteligente");
      expect(casualDiningConfig.features).toContain("Chamar Garçom");
      expect(casualDiningConfig.features).toContain("Pedido Parcial");
      expect(casualDiningConfig.features).toContain("Suporte a Grupos");
    });

    it("should have table service enabled", () => {
      expect(casualDiningConfig.hasTableService).toBe(true);
    });

    it("should have reservations enabled (optional)", () => {
      expect(casualDiningConfig.hasReservations).toBe(true);
    });

    it("should have queue/waitlist enabled", () => {
      expect(casualDiningConfig.hasQueue).toBe(true);
    });

    it("should have delivery to table enabled", () => {
      expect(casualDiningConfig.hasDeliveryToTable).toBe(true);
    });

    it("should NOT have dish builder", () => {
      expect(casualDiningConfig.hasDishBuilder).toBe(false);
    });

    it("should NOT have geolocation", () => {
      expect(casualDiningConfig.hasGeolocation).toBe(false);
    });

    it("should NOT have sommelier", () => {
      expect(casualDiningConfig.hasSommelier).toBe(false);
    });

    it("should NOT have buffet scale", () => {
      expect(casualDiningConfig.hasBuffetScale).toBe(false);
    });

    // Casual Dining specific flags
    it("should have waitlist advance drinks enabled", () => {
      expect(casualDiningConfig.hasWaitlistAdvanceDrinks).toBe(true);
    });

    it("should have call waiter enabled", () => {
      expect(casualDiningConfig.hasCallWaiter).toBe(true);
    });

    it("should have partial ordering enabled", () => {
      expect(casualDiningConfig.hasPartialOrdering).toBe(true);
    });

    it("should have group support enabled", () => {
      expect(casualDiningConfig.hasGroupSupport).toBe(true);
    });
  });

  describe("All Service Types Comparison", () => {
    it("should have Casual Dining between Fine Dining and Fast Casual in terms of features", () => {
      const fineDining = SERVICE_TYPE_CONFIG[ServiceType.FINE_DINING];
      const casualDining = SERVICE_TYPE_CONFIG[ServiceType.CASUAL_DINING];
      const fastCasual = SERVICE_TYPE_CONFIG[ServiceType.FAST_CASUAL];

      // Casual Dining has table service like Fine Dining
      expect(casualDining.hasTableService).toBe(fineDining.hasTableService);
      
      // But doesn't have sommelier like Fine Dining
      expect(casualDining.hasSommelier).toBe(false);
      expect(fineDining.hasSommelier).toBe(true);
      
      // Has queue like Fast Casual
      expect(casualDining.hasQueue).toBe(true);
      expect(fastCasual.hasQueue).toBe(true);
      
      // But Fast Casual doesn't have table service
      expect(fastCasual.hasTableService).toBe(false);
    });

    it("should have unique feature set compared to other types", () => {
      const casualDining = SERVICE_TYPE_CONFIG[ServiceType.CASUAL_DINING];
      
      // Only Casual Dining has this specific combination
      const hasUniqueCombo = 
        casualDining.hasTableService &&
        casualDining.hasQueue &&
        casualDining.hasReservations &&
        !casualDining.hasSommelier &&
        casualDining.hasCallWaiter;
      
      expect(hasUniqueCombo).toBe(true);
    });
  });
});
