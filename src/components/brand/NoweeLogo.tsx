import React from "react";

interface NoweeLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "full" | "mark" | "wordmark";
  theme?: "light" | "dark" | "auto";
  className?: string;
}

const sizeMap = {
  xs: { height: 24, fontSize: 14 },
  sm: { height: 32, fontSize: 20 },
  md: { height: 44, fontSize: 28 },
  lg: { height: 60, fontSize: 38 },
  xl: { height: 80, fontSize: 52 },
  "2xl": { height: 110, fontSize: 72 },
};

/**
 * NOOWE Brand Logo
 *
 * The two "O"s in the wordmark ARE the interlocking rings mark.
 * No separate logo — the symbol lives inside the name.
 *
 * Modern Chic. Minimal. Memorable.
 */
const NoweeLogo: React.FC<NoweeLogoProps> = ({
  size = "md",
  variant = "full",
  theme = "auto",
  className = "",
}) => {
  const { height, fontSize } = sizeMap[size];


  // Dois "o" tipográficos em forma de laços suaves (sem estética Mastercard)
  const InlineMark = () => {
    const sw = 3.4;

    return (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 48 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <ellipse
          cx="15"
          cy="14"
          rx="10.5"
          ry="9.5"
          className="stroke-primary"
          strokeWidth={sw}
        />

        <ellipse
          cx="33"
          cy="14"
          rx="10.5"
          ry="9.5"
          className="stroke-secondary"
          strokeWidth={sw}
        />

        {/* realce sutil no cruzamento para parecer ligatura tipográfica */}
        <path
          d="M24 5.8 C26.2 7.8 26.2 20.2 24 22.2"
          stroke="hsl(var(--foreground) / 0.18)"
          strokeWidth={sw - 0.8}
          strokeLinecap="round"
        />
      </svg>
    );
  };

  const Wordmark = () => (
    <span
      className="text-foreground tracking-tight inline-flex items-center"
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: `${height}px`,
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        fontWeight: 600,
        letterSpacing: "-0.02em",
        textTransform: "lowercase",
      }}
    >
      <span>n</span>
      <span
        className="inline-block flex-shrink-0"
        style={{
          width: "1.5em",
          height: "0.72em",
          margin: "0 -0.06em",
          transform: "translateY(0.06em)",
        }}
      >
        <InlineMark />
      </span>
      <span>we</span>
    </span>
  );

  // Brand rule: no detached symbol; logo is always the full wordmark.
  return (
    <div className={`inline-flex items-center ${className}`} role="img" aria-label="NOOWE">
      <Wordmark />
    </div>
  );
};

export default NoweeLogo;
