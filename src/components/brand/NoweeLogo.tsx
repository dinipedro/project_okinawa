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


  // The logo is the full word "NOOWE"; only the two "O" letters are interlocked rings.
  // Sized in "em" so the rings always match the text size.
  const InlineMark = () => (
    <svg
      width="1.12em"
      height="1em"
      viewBox="0 0 56 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block flex-shrink-0"
      style={{ verticalAlign: "-0.08em" }}
      aria-hidden="true"
    >
      <circle cx="20" cy="16" r="11.5" className="stroke-primary" strokeWidth="3.2" fill="none" />
      <circle cx="36" cy="16" r="11.5" className="stroke-secondary" strokeWidth="3.2" fill="none" />

      {/* Interlock effect: left ring passes over right ring in upper overlap */}
      <clipPath id={`noowe-clip-${size}`}>
        <rect x="25.4" y="0" width="5.8" height="16" />
      </clipPath>
      <circle
        cx="20"
        cy="16"
        r="11.5"
        className="stroke-primary"
        strokeWidth="3.2"
        fill="none"
        clipPath={`url(#noowe-clip-${size})`}
      />
    </svg>
  );

  const Wordmark = () => (
    <span
      className="text-foreground tracking-tight inline-flex items-center"
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: `${height}px`,
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        fontWeight: 600,
        letterSpacing: "-0.02em",
      }}
    >
      n<InlineMark />we
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
