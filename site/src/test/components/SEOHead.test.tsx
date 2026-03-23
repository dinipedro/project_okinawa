import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import SEOHead from "@/components/seo/SEOHead";

const renderWithHelmet = (ui: React.ReactElement) =>
  render(ui, { wrapper: ({ children }) => <HelmetProvider>{children}</HelmetProvider> });

describe("SEOHead", () => {
  it("sets page title", async () => {
    renderWithHelmet(<SEOHead title="Home" />);
    // Helmet updates document.title asynchronously
    await vi.waitFor(() => {
      expect(document.title).toContain("Home");
    });
  });

  it("includes site name in title", async () => {
    renderWithHelmet(<SEOHead title="Reservas" />);
    await vi.waitFor(() => {
      expect(document.title).toContain("Okinawa");
    });
  });

  it("sets default title when no title prop", async () => {
    renderWithHelmet(<SEOHead />);
    await vi.waitFor(() => {
      expect(document.title).toContain("Okinawa");
    });
  });

  it("renders meta description", async () => {
    renderWithHelmet(<SEOHead description="Test description" />);
    await vi.waitFor(() => {
      const meta = document.querySelector('meta[name="description"]');
      expect(meta).toBeTruthy();
    });
  });
});
