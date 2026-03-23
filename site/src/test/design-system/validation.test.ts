import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Design System Validation", () => {
  it("index.css has no duplicate @tailwind directives", () => {
    const css = fs.readFileSync(path.resolve("src/index.css"), "utf-8");
    const matches = css.match(/@tailwind base/g);
    expect(matches?.length).toBe(1);
  });

  it("index.css defines --radius-xl", () => {
    const css = fs.readFileSync(path.resolve("src/index.css"), "utf-8");
    expect(css).toContain("--radius-xl");
  });

  it("index.css defines all shadow variables", () => {
    const css = fs.readFileSync(path.resolve("src/index.css"), "utf-8");
    ["--shadow-sm", "--shadow-md", "--shadow-lg", "--shadow-xl", "--shadow-glow"].forEach((v) => {
      expect(css).toContain(v);
    });
  });

  it("index.css defines dark mode shadow variables", () => {
    const css = fs.readFileSync(path.resolve("src/index.css"), "utf-8");
    const darkSection = css.split(".dark")[1];
    expect(darkSection).toContain("--shadow-sm");
    expect(darkSection).toContain("--shadow-glow");
  });

  it("MobilePreviewV2 page has no hardcoded color classes in classNames", () => {
    const code = fs.readFileSync(path.resolve("src/pages/MobilePreviewV2.tsx"), "utf-8");
    // Match slate/orange/amber followed by a digit (Tailwind color pattern)
    const hardcodedPatterns = /(?:bg|text|border|from|to|via|shadow)-(?:slate|orange|amber)-\d/g;
    const matches = code.match(hardcodedPatterns);
    expect(matches).toBeNull();
  });

  it("MobilePreviewV2 component has no hardcoded color classes in classNames", () => {
    const filePath = path.resolve("src/components/mobile-preview-v2/MobilePreviewV2.tsx");
    if (fs.existsSync(filePath)) {
      const code = fs.readFileSync(filePath, "utf-8");
      const hardcodedPatterns = /(?:bg|text|border|from|to|via|shadow)-(?:slate|orange|amber)-\d/g;
      const matches = code.match(hardcodedPatterns);
      expect(matches).toBeNull();
    }
  });

  it("MobilePreviewV2 uses React.lazy for all screen imports", () => {
    const code = fs.readFileSync(path.resolve("src/pages/MobilePreviewV2.tsx"), "utf-8");
    expect(code).toContain("lazy(");
    expect(code).toContain("Suspense");
    // No synchronous screen imports
    const lines = code.split("\n");
    const directImports = lines.filter(
      (l) => l.startsWith("import ") && l.includes("/screens/") && !l.includes("lazy")
    );
    expect(directImports.length).toBe(0);
  });

  it("robots.txt exists and disallows /admin", () => {
    const robots = fs.readFileSync(path.resolve("public/robots.txt"), "utf-8");
    expect(robots).toContain("Disallow: /admin");
  });

  it("sitemap.xml exists", () => {
    expect(fs.existsSync(path.resolve("public/sitemap.xml"))).toBe(true);
  });

  it("Space Grotesk is imported via Google Fonts", () => {
    const html = fs.readFileSync(path.resolve("index.html"), "utf-8");
    expect(html).toContain("Space+Grotesk");
    expect(html).toContain("display=swap");
  });
});
