import React, { useState } from "react";
import SEOHead from "@/components/seo/SEOHead";

interface LogoVariantProps {
  markSize: number;
}

// 1: Bélo/Embrace — two forms meeting, like Airbnb's belonging symbol
const Mark1: React.FC<LogoVariantProps> = ({ markSize }) => (
  <svg width={markSize} height={markSize} viewBox="0 0 48 48" fill="none">
    <path
      d="M24 44
         C24 44, 4 30, 4 18
         C4 10, 10 4, 18 4
         C22 4, 24 8, 24 12
         C24 8, 26 4, 30 4
         C38 4, 44 10, 44 18
         C44 30, 24 44, 24 44Z"
      className="fill-primary"
      opacity="0.85"
    />
    {/* Inner negative space — creates the "embrace" */}
    <path
      d="M24 36
         C24 36, 12 26, 12 19
         C12 14, 15 11, 19 11
         C22 11, 24 15, 24 18
         C24 15, 26 11, 29 11
         C33 11, 36 14, 36 19
         C36 26, 24 36, 24 36Z"
      className="fill-background"
    />
  </svg>
);

// 2: Rising Sun — a horizon arc with radiating warmth
const Mark2: React.FC<LogoVariantProps> = ({ markSize }) => (
  <svg width={markSize} height={markSize} viewBox="0 0 48 48" fill="none">
    {/* Sun disc */}
    <circle cx="24" cy="24" r="10" className="fill-primary" />
    {/* Horizon line */}
    <rect x="4" y="30" width="40" height="2.5" rx="1.25" className="fill-primary" opacity="0.3" />
    {/* Rays — three ascending arcs */}
    <path d="M24 10 C24 10, 28 4, 24 2 C20 4, 24 10, 24 10Z" className="fill-primary" opacity="0.5" />
    <path d="M14 16 C14 16, 10 10, 8 12 C8 16, 14 16, 14 16Z" className="fill-primary" opacity="0.35" />
    <path d="M34 16 C34 16, 38 10, 40 12 C40 16, 34 16, 34 16Z" className="fill-primary" opacity="0.35" />
  </svg>
);

// 3: Connected — two abstract people/forms creating a shared space
const Mark3: React.FC<LogoVariantProps> = ({ markSize }) => (
  <svg width={markSize} height={markSize} viewBox="0 0 48 48" fill="none">
    {/* Left arc — a person/presence */}
    <path
      d="M20 42 C8 42, 4 32, 4 24 C4 14, 12 6, 20 6 C20 6, 14 14, 14 24 C14 34, 20 42, 20 42Z"
      className="fill-primary"
      opacity="0.55"
    />
    {/* Right arc — another presence */}
    <path
      d="M28 42 C40 42, 44 32, 44 24 C44 14, 36 6, 28 6 C28 6, 34 14, 34 24 C34 34, 28 42, 28 42Z"
      className="fill-primary"
    />
    {/* Shared center dot — the experience/connection */}
    <circle cx="24" cy="24" r="4" className="fill-primary" opacity="0.4" />
  </svg>
);

// 4: Pin Drop — location pin abstracted into a warm organic form
const Mark4: React.FC<LogoVariantProps> = ({ markSize }) => (
  <svg width={markSize} height={markSize} viewBox="0 0 48 48" fill="none">
    <path
      d="M24 44 L14 28 C10 22, 10 14, 16 8 C20 4, 28 4, 32 8 C38 14, 38 22, 34 28 Z"
      className="fill-primary"
    />
    {/* Inner circle — warmth core */}
    <circle cx="24" cy="18" r="7" className="fill-background" />
    {/* Small warm dot */}
    <circle cx="24" cy="18" r="3" className="fill-primary" opacity="0.5" />
  </svg>
);

// 5: Abstract R — letterform with organic warmth curve
const Mark5: React.FC<LogoVariantProps> = ({ markSize }) => (
  <svg width={markSize} height={markSize} viewBox="0 0 48 48" fill="none">
    {/* R stem */}
    <rect x="10" y="6" width="5" height="36" rx="2.5" className="fill-primary" />
    {/* R bowl — elegant curve */}
    <path
      d="M15 6 C15 6, 36 6, 36 16 C36 26, 15 26, 15 26"
      className="stroke-primary"
      strokeWidth="5"
      strokeLinecap="round"
      fill="none"
    />
    {/* R leg — dynamic kick */}
    <path
      d="M22 26 L38 42"
      className="stroke-primary"
      strokeWidth="5"
      strokeLinecap="round"
    />
    {/* Warm accent dot */}
    <circle cx="38" cy="8" r="4" className="fill-primary" opacity="0.4" />
  </svg>
);

// 6: Dual Arc — original (kept)
const Mark6: React.FC<LogoVariantProps> = ({ markSize }) => (
  <svg width={markSize} height={markSize} viewBox="0 0 48 48" fill="none">
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

const variants = [
  { id: 1, name: "Embrace", desc: "Duas formas se encontrando — pertencimento e conexão", Mark: Mark1 },
  { id: 2, name: "Rising Sun", desc: "Sol nascente com raios — novas experiências e calor", Mark: Mark2 },
  { id: 3, name: "Connected", desc: "Duas presenças criando um espaço compartilhado", Mark: Mark3 },
  { id: 4, name: "Pin Drop", desc: "Pin de localização orgânico com núcleo de calor", Mark: Mark4 },
  { id: 5, name: "Abstract R", desc: "Letra R estilizada com curva elegante e acento", Mark: Mark5 },
  { id: 6, name: "Dual Arc", desc: "Dois arcos simétricos convergindo — chama abstrata", Mark: Mark6 },
];

const LogoShowcase: React.FC = () => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <SEOHead
        title="Logo Variations"
        description="Explore as variações do logo Okinawa. Selecione o mark que melhor representa a identidade da marca."
        canonical="/logo"
        noIndex
      />
      <h1 className="text-3xl font-semibold text-foreground mb-2 tracking-tight">
        Reservio — Logo Variations
      </h1>
      <p className="text-muted-foreground mb-12 text-center max-w-md">
        Selecione o mark que mais combina com a identidade Reservio.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl w-full mb-16">
        {variants.map(({ id, name, desc, Mark }) => (
          <button
            key={id}
            onClick={() => setSelected(id)}
            className={`
              group flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all duration-200 cursor-pointer
              ${selected === id
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border hover:border-primary/40 bg-card"
              }
            `}
          >
            {/* Mark preview */}
            <div className="flex items-center justify-center h-20 w-20">
              <Mark markSize={64} />
            </div>

            {/* Wordmark preview */}
            <span
              className="text-foreground"
              style={{
                fontSize: "22px",
                fontFamily: "'Inter', -apple-system, sans-serif",
                letterSpacing: "-0.03em",
                fontWeight: 300,
              }}
            >
              reserv
              <span className="text-primary" style={{ fontWeight: 600 }}>io</span>
            </span>

            {/* Label */}
            <div className="text-center mt-2">
              <p className="text-sm font-medium text-foreground">
                {id}. {name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </div>

            {selected === id && (
              <span className="text-xs font-medium text-primary mt-1">✓ Selecionado</span>
            )}
          </button>
        ))}
      </div>

      {/* Full-size preview of selected */}
      {selected && (
        <div className="flex flex-col items-center gap-6 p-12 rounded-3xl bg-card border border-border shadow-sm max-w-lg w-full">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Preview — Opção {selected}</p>
          <div className="flex items-center gap-3">
            {React.createElement(variants[selected - 1].Mark, { markSize: 48 })}
            <span
              className="text-foreground"
              style={{
                fontSize: "32px",
                fontFamily: "'Inter', -apple-system, sans-serif",
                letterSpacing: "-0.03em",
                fontWeight: 300,
              }}
            >
              reserv
              <span className="text-primary" style={{ fontWeight: 600 }}>io</span>
            </span>
          </div>
          {/* Sizes */}
          <div className="flex items-end gap-6 mt-4">
            {[24, 36, 48, 64].map((s) => (
              <div key={s} className="flex flex-col items-center gap-1">
                {React.createElement(variants[selected - 1].Mark, { markSize: s })}
                <span className="text-[10px] text-muted-foreground">{s}px</span>
              </div>
            ))}
          </div>
          {/* Dark/light preview */}
          <div className="flex gap-4 mt-4 w-full">
            <div className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl bg-white">
              {React.createElement(variants[selected - 1].Mark, { markSize: 32 })}
              <span style={{ fontSize: "18px", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em", fontWeight: 300, color: "#1a1a1a" }}>
                reserv<span style={{ fontWeight: 600, color: "hsl(25, 90%, 48%)" }}>io</span>
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl bg-zinc-900">
              <svg width={32} height={32} viewBox="0 0 48 48" fill="none">
                {/* Simplified mark for dark bg */}
                {selected === 1 && <>
                  <path d="M22 6 C22 6, 8 22, 10 32 C11 37, 16 42, 22 42 C22 42, 16 37, 16 32 C16 24, 22 14, 22 6Z" fill="hsl(25, 90%, 48%)" />
                  <path d="M26 6 C26 6, 40 22, 38 32 C37 37, 32 42, 26 42 C26 42, 32 37, 32 32 C32 24, 26 14, 26 6Z" fill="hsl(25, 90%, 48%)" opacity="0.6" />
                </>}
                {selected === 2 && <path d="M24 3 C24 3, 8 18, 8 30 C8 38, 15 45, 24 45 C33 45, 40 38, 40 30 C40 18, 24 3, 24 3Z M24 16 C24 16, 16 26, 16 32 C16 37, 19 40, 24 40 C29 40, 32 37, 32 32 C32 26, 24 16, 24 16Z" fill="hsl(25, 90%, 48%)" fillRule="evenodd" />}
                {selected === 3 && <>
                  <path d="M20 8 C20 8, 6 22, 8 33 C9 38, 14 43, 21 43 C21 43, 14 38, 14 33 C14 24, 20 14, 20 8Z" fill="hsl(25, 90%, 48%)" opacity="0.4" />
                  <path d="M24 4 C24 4, 12 20, 13 32 C14 38, 18 43, 24 43 C24 43, 18 38, 18 32 C18 22, 24 12, 24 4Z" fill="hsl(25, 90%, 48%)" opacity="0.7" />
                  <path d="M28 8 C28 8, 40 22, 38 33 C37 38, 32 43, 27 43 C27 43, 34 38, 34 33 C34 24, 28 14, 28 8Z" fill="hsl(25, 90%, 48%)" />
                </>}
                {selected === 4 && <>
                  <path d="M24 3 L16 20 L10 36 L18 44 L24 38 L30 44 L38 36 L32 20 Z" fill="hsl(25, 90%, 48%)" opacity="0.25" />
                  <path d="M24 3 L16 20 L24 38 L32 20 Z" fill="hsl(25, 90%, 48%)" opacity="0.7" />
                  <path d="M24 3 L20 20 L24 34 L28 20 Z" fill="hsl(25, 90%, 48%)" />
                </>}
                {selected === 5 && <path d="M26 4 C26 4, 40 16, 36 28 C34 34, 28 36, 24 34 C20 32, 18 28, 22 24 C26 20, 32 22, 30 28 C28 34, 22 40, 16 42 C12 44, 8 40, 10 36 C10 36, 14 44, 20 44 C28 44, 34 38, 34 32 C34 26, 28 22, 24 24 C20 26, 18 30, 20 34 C22 38, 30 38, 34 32 C38 24, 30 12, 26 4Z" fill="hsl(25, 90%, 48%)" />}
                {selected === 6 && <>
                  <path d="M24 4 C24 4, 10 20, 10 30 C10 36, 16 42, 24 42 C24 42, 18 36, 18 30 C18 22, 24 12, 24 4Z" fill="hsl(25, 90%, 48%)" />
                  <path d="M24 4 C24 4, 38 20, 38 30 C38 36, 32 42, 24 42 C24 42, 30 36, 30 30 C30 22, 24 12, 24 4Z" fill="hsl(25, 90%, 48%)" opacity="0.65" />
                </>}
              </svg>
              <span style={{ fontSize: "18px", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em", fontWeight: 300, color: "#f5f5f5" }}>
                reserv<span style={{ fontWeight: 600, color: "hsl(25, 90%, 48%)" }}>io</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoShowcase;
