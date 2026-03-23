import { describe, it, expect } from "vitest";
import { ServiceType } from "@/components/mobile-preview/context/MobilePreviewContext";

/**
 * Tests for ServiceType enum to verify Casual Dining is correctly defined
 */
describe("ServiceType Enum", () => {
  it("should have all expected service types", () => {
    const serviceTypes = Object.values(ServiceType);
    expect(serviceTypes.length).toBeGreaterThanOrEqual(9);
  });

  it("should include CASUAL_DINING", () => {
    expect(ServiceType.CASUAL_DINING).toBe("casual_dining");
  });

  it("should have correct values for all types", () => {
    expect(ServiceType.FINE_DINING).toBe("fine_dining");
    expect(ServiceType.QUICK_SERVICE).toBe("quick_service");
    expect(ServiceType.FAST_CASUAL).toBe("fast_casual");
    expect(ServiceType.COFFEE_SHOP).toBe("coffee_shop");
    expect(ServiceType.BUFFET).toBe("buffet");
    expect(ServiceType.DRIVE_THRU).toBe("drive_thru");
    expect(ServiceType.FOOD_TRUCK).toBe("food_truck");
    expect(ServiceType.CHEFS_TABLE).toBe("chefs_table");
    expect(ServiceType.CASUAL_DINING).toBe("casual_dining");
  });
});
