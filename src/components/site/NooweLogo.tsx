import React from 'react';

interface NooweLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: { h: 28, font: 16 },
  md: { h: 36, font: 22 },
  lg: { h: 48, font: 30 },
};

const NooweLogo: React.FC<NooweLogoProps> = ({ size = 'md', className = '' }) => {
  const { font } = sizes[size];
  const markH = font * 0.85;
  const cx = markH / 2;
  const r = markH * 0.42;

  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: font,
          fontWeight: 500,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
        className="text-noowe-t1"
      >
        n
      </span>
      <svg
        width={markH}
        height={markH}
        viewBox={`0 0 ${markH} ${markH}`}
        className="flex-shrink-0"
        style={{ margin: '0 -1px' }}
      >
        <defs>
          <linearGradient id="noowe-oo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF5E3A" />
            <stop offset="100%" stopColor="#0D4F4F" />
          </linearGradient>
        </defs>
        <circle cx={cx - r * 0.35} cy={cx} r={r} fill="none" stroke="url(#noowe-oo-grad)" strokeWidth={r * 0.22} />
        <circle cx={cx + r * 0.35} cy={cx} r={r} fill="none" stroke="url(#noowe-oo-grad)" strokeWidth={r * 0.22} />
      </svg>
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: font * 1.0,
          fontWeight: 500,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
        className="text-noowe-t1"
      >
        we
      </span>
    </span>
  );
};

export default NooweLogo;
