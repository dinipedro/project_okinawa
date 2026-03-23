import React from "react";

interface ReservioLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "mark" | "wordmark";
  className?: string;
}

const sizeMap = {
  sm: { height: 32, fontSize: 18, markSize: 26 },
  md: { height: 44, fontSize: 26, markSize: 36 },
  lg: { height: 60, fontSize: 36, markSize: 48 },
  xl: { height: 80, fontSize: 48, markSize: 64 },
};

/**
 * Reservio Brand Logo
 *
 * Abstract geometric flame — two clean arcs converging upward
 * to form a stylized flame/drop. Minimal, modern, iconic.
 * Inspired by Airbnb's simplicity and the warmth of shared experiences.
 */
const ReservioLogo: React.FC<ReservioLogoProps> = ({
  size = "md",
  variant = "full",
  className = "",
}) => {
  const { height, fontSize, markSize } = sizeMap[size];

  const Mark = () => (
    <svg
      width={markSize}
      height={markSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* 
        Abstract flame: two symmetric arcs meeting at the top,
        forming a pointed flame/teardrop that opens at the base.
        Clean geometric curves — no noise, pure form.
      */}
      <path
        d="M24 4
           C24 4, 10 20, 10 30
           C10 36, 16 42, 24 42
           C24 42, 18 36, 18 30
           C18 22, 24 12, 24 4Z"
        className="fill-primary"
      />
      <path
        d="M24 4
           C24 4, 38 20, 38 30
           C38 36, 32 42, 24 42
           C24 42, 30 36, 30 30
           C30 22, 24 12, 24 4Z"
        className="fill-primary"
        opacity="0.65"
      />
    </svg>
  );

  if (variant === "mark") {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <Mark />
      </div>
    );
  }

  const Wordmark = () => (
    <span
      className="text-foreground"
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: `${height}px`,
        fontFamily: "'Inter', -apple-system, sans-serif",
        letterSpacing: "-0.03em",
        fontWeight: 300,
      }}
    >
      reserv
      <span className="text-primary" style={{ fontWeight: 600 }}>io</span>
    </span>
  );

  if (variant === "wordmark") {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <Wordmark />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Mark />
      <Wordmark />
    </div>
  );
};

export default ReservioLogo;
