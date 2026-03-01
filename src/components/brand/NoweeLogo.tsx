import React from "react";

interface NoweeLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "full" | "mark" | "wordmark";
  theme?: "light" | "dark" | "auto";
  className?: string;
}

const sizeMap = {
  xs: { height: 24, fontSize: 14, markSize: 20, gap: 6 },
  sm: { height: 32, fontSize: 20, markSize: 28, gap: 8 },
  md: { height: 44, fontSize: 28, markSize: 38, gap: 10 },
  lg: { height: 60, fontSize: 38, markSize: 50, gap: 12 },
  xl: { height: 80, fontSize: 52, markSize: 66, gap: 14 },
  "2xl": { height: 110, fontSize: 72, markSize: 90, gap: 18 },
};

/**
 * NOOWE Brand Logo
 *
 * The mark is two interlocking "O" rings — one warm orange, one teal —
 * linked like chain links to symbolize connection and shared experiences.
 *
 * Modern Chic. Minimal. Memorable.
 */
const NoweeLogo: React.FC<NoweeLogoProps> = ({
  size = "md",
  variant = "full",
  theme = "auto",
  className = "",
}) => {
  const { height, fontSize, markSize, gap } = sizeMap[size];

  // The interlocked rings that serve as both "oo" in the wordmark and standalone mark
  const InterlockedOO = ({ ringSize }: { ringSize: number }) => {
    const svgW = ringSize * 1.65;
    const svgH = ringSize;
    const r = ringSize * 0.34;
    const cx1 = ringSize * 0.42;
    const cx2 = ringSize * 1.22;
    const cy = ringSize * 0.5;
    const sw = Math.max(ringSize * 0.08, 2);
    const uid = `noowe-clip-${ringSize}`;

    return (
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="inline-block align-middle"
        style={{ verticalAlign: 'baseline', marginBottom: `-${ringSize * 0.12}px` }}
        aria-hidden="true"
      >
        {/* Right O — teal, drawn first (behind) */}
        <circle
          cx={cx2}
          cy={cy}
          r={r}
          className="stroke-secondary"
          strokeWidth={sw}
          fill="none"
          opacity="0.92"
        />
        {/* Left O — primary orange, full */}
        <circle
          cx={cx1}
          cy={cy}
          r={r}
          className="stroke-primary"
          strokeWidth={sw}
          fill="none"
        />
        {/* Interlock: redraw bottom-right arc of left O behind right O */}
        <clipPath id={uid}>
          <rect
            x={cx1 + r * 0.15}
            y={cy}
            width={r * 1.2}
            height={r + sw}
          />
        </clipPath>
        {/* Redraw right ring segment on top in overlap zone (bottom) */}
        <circle
          cx={cx2}
          cy={cy}
          r={r}
          className="stroke-secondary"
          strokeWidth={sw}
          fill="none"
          clipPath={`url(#${uid})`}
        />
      </svg>
    );
  };

  // Mark-only: just the interlocked rings
  if (variant === "mark") {
    return (
      <div className={`inline-flex items-center ${className}`} role="img" aria-label="NOOWE">
        <InterlockedOO ringSize={markSize} />
      </div>
    );
  }

  // The unified wordmark with interlocked rings as the "oo"
  const ringInlineSize = fontSize * 1.15;

  const WordmarkWithRings = () => (
    <span
      className="text-foreground tracking-tight inline-flex items-baseline"
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: `${height}px`,
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        fontWeight: 600,
        letterSpacing: "-0.02em",
      }}
    >
      n
      <InterlockedOO ringSize={ringInlineSize} />
      we
    </span>
  );

  if (variant === "wordmark") {
    return (
      <div className={`inline-flex items-center ${className}`} role="img" aria-label="NOOWE">
        <WordmarkWithRings />
      </div>
    );
  }

  // Full = same as wordmark now (unified)
  return (
    <div
      className={`inline-flex items-center ${className}`}
      role="img"
      aria-label="NOOWE"
    >
      <WordmarkWithRings />
    </div>
  );
};

export default NoweeLogo;
