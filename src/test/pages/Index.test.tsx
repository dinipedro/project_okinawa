import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/useTheme";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

describe("Index Page (Landing)", () => {
  it("renders without crashing", async () => {
    const Index = (await import("@/pages/Index")).default;
    render(
      <TestWrapper>
        <MemoryRouter>
          <Index />
        </MemoryRouter>
      </TestWrapper>
    );
    expect(screen.getByText(/Descubra momentos/i)).toBeInTheDocument();
  });

  it("has proper navigation landmarks", async () => {
    const Index = (await import("@/pages/Index")).default;
    render(
      <TestWrapper>
        <MemoryRouter>
          <Index />
        </MemoryRouter>
      </TestWrapper>
    );
    expect(screen.getByRole("navigation", { name: /principal/i })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("has no dead href=# links", async () => {
    const Index = (await import("@/pages/Index")).default;
    const { container } = render(
      <TestWrapper>
        <MemoryRouter>
          <Index />
        </MemoryRouter>
      </TestWrapper>
    );
    const links = container.querySelectorAll('a[href="#"]');
    expect(links.length).toBe(0);
  });

  it("has dynamic copyright year", async () => {
    const Index = (await import("@/pages/Index")).default;
    render(
      <TestWrapper>
        <MemoryRouter>
          <Index />
        </MemoryRouter>
      </TestWrapper>
    );
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it("renders section IDs for anchor links", async () => {
    const Index = (await import("@/pages/Index")).default;
    const { container } = render(
      <TestWrapper>
        <MemoryRouter>
          <Index />
        </MemoryRouter>
      </TestWrapper>
    );
    expect(container.querySelector("#features")).toBeInTheDocument();
    expect(container.querySelector("#experiences")).toBeInTheDocument();
    expect(container.querySelector("#cta")).toBeInTheDocument();
  });
});
