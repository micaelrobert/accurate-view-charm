import { useMemo, type CSSProperties } from "react";

// Gerador determinístico para evitar diferenças entre servidor e navegador.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function Star({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} style={style}>
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="currentColor" />
    </svg>
  );
}

export function Particles({ stars = 18, fireflies = 10, petals = 7, seed = 7 }: { stars?: number; fireflies?: number; petals?: number; seed?: number }) {
  const items = useMemo(() => {
    const r = rng(seed);
    return {
      stars: Array.from({ length: stars }, () => ({ x: r() * 100, y: r() * 100, s: 6 + r() * 12, d: 2.5 + r() * 4, delay: r() * 6 })),
      flies: Array.from({ length: fireflies }, () => ({ x: r() * 100, y: 30 + r() * 65, dx: (r() - 0.5) * 160, dy: (r() - 0.5) * 120, d: 10 + r() * 10, delay: r() * 8 })),
      petals: Array.from({ length: petals }, () => ({ x: r() * 100, dx: (r() - 0.5) * 200, d: 14 + r() * 12, delay: r() * 16, s: 8 + r() * 8, red: r() > 0.5 })),
    };
  }, [stars, fireflies, petals, seed]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.stars.map((p, i) => (
        <Star
          key={`s${i}`}
          className="anim-twinkle absolute text-gold-light"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, opacity: 0, ["--d" as string]: `${p.d}s`, ["--delay" as string]: `${p.delay}s` }}
        />
      ))}
      {items.flies.map((p, i) => (
        <span
          key={`f${i}`}
          className="anim-firefly absolute h-1.5 w-1.5 rounded-full bg-gold-light shadow-glow"
          style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: 0, ["--dx" as string]: `${p.dx}px`, ["--dy" as string]: `${p.dy}px`, ["--d" as string]: `${p.d}s`, ["--delay" as string]: `${p.delay}s` }}
        />
      ))}
      {items.petals.map((p, i) => (
        <span
          key={`p${i}`}
          className={`anim-fall absolute top-0 rounded-[60%_0_60%_0] ${p.red ? "bg-apple/70" : "bg-cream/80"}`}
          style={{ left: `${p.x}%`, width: p.s, height: p.s * 0.8, opacity: 0, ["--dx" as string]: `${p.dx}px`, ["--d" as string]: `${p.d}s`, ["--delay" as string]: `${p.delay}s` }}
        />
      ))}
    </div>
  );
}

export function Apple({ className = "", crown = false }: { className?: string; crown?: boolean }) {
  return (
    <svg viewBox="0 0 100 110" aria-hidden className={className}>
      <defs>
        <radialGradient id="ap" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#E3424A" />
          <stop offset="55%" stopColor="#B5121B" />
          <stop offset="100%" stopColor="#6E0610" />
        </radialGradient>
        <linearGradient id="gd" x1="0" x2="1">
          <stop offset="0%" stopColor="#927044" />
          <stop offset="50%" stopColor="#F1D58E" />
          <stop offset="100%" stopColor="#927044" />
        </linearGradient>
      </defs>
      {crown && <path d="M32 26 L36 8 L44 20 L50 4 L56 20 L64 8 L68 26 Z" fill="url(#gd)" stroke="#7a5b33" strokeWidth="1" />}
      <path d="M50 34 C30 22 8 32 10 60 C12 88 32 106 50 98 C68 106 88 88 90 60 C92 32 70 22 50 34 Z" fill="url(#ap)" />
      <path d="M50 34 C50 28 52 22 56 18" stroke="#5a3a1c" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M55 24 C64 14 76 16 78 20 C70 28 60 28 55 24 Z" fill="#657D54" />
      <ellipse cx="32" cy="52" rx="7" ry="12" fill="#fff" opacity="0.35" transform="rotate(-20 32 52)" />
    </svg>
  );
}
