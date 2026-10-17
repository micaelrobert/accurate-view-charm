import { motion } from "motion/react";
import { Star } from "./Particles";

/** Envelope real: fechado na entrada, abre quando `open` é true. */
export function Envelope({ open, name, age }: { open: boolean; name: string; age: string }) {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-[22rem] [perspective:1200px]">
      {/* Cartão que desliza para fora */}
      <motion.div
        className="paper absolute inset-x-[7%] top-[8%] bottom-[8%] flex flex-col items-center justify-center rounded-md border border-gold/50 px-3 text-center"
        initial={false}
        animate={open ? { y: "-55%", scale: 1.04 } : { y: 0, scale: 1 }}
        transition={{ delay: open ? 0.55 : 0, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="font-caps text-[0.6rem] tracking-[0.35em] text-gold">CONVITE REAL</span>
        <span className="font-script text-4xl leading-tight text-apple-deep">{name}</span>
        <span className="font-caps text-xs tracking-[0.25em] text-forest">{age}</span>
      </motion.div>

      {/* Corpo do envelope (frente) */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <linearGradient id="envBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFF8EB" />
              <stop offset="1" stopColor="#F2E3C6" />
            </linearGradient>
          </defs>
          <path d="M0 0 L400 0 L400 300 L0 300 Z" fill="url(#envBody)" />
          <path d="M0 300 L170 160 M400 300 L230 160" stroke="#C9A96A" strokeWidth="1.5" fill="none" />
          <rect x="6" y="6" width="388" height="288" rx="8" fill="none" stroke="#927044" strokeWidth="2" opacity="0.7" />
          <rect x="14" y="14" width="372" height="272" rx="6" fill="none" stroke="#C9A96A" strokeWidth="1" strokeDasharray="2 5" />
        </svg>
        <div className="shimmer absolute inset-0" />
      </div>

      {/* Aba superior */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[50%] origin-top [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateX: open ? 180 : 0, zIndex: open ? 0 : 3 }}
        transition={{ delay: open ? 0.3 : 0, duration: 0.6, ease: "easeInOut" }}
        style={{ zIndex: 3 }}
      >
        <svg viewBox="0 0 400 186" className="h-full w-full drop-shadow-md" aria-hidden preserveAspectRatio="none">
          <path d="M0 0 L400 0 L200 186 Z" fill="#F7EBD3" stroke="#927044" strokeWidth="2" />
        </svg>
      </motion.div>

      {/* Rótulo do envelope */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-[7%] z-[4] flex flex-col items-center text-center"
        initial={false}
        animate={{ opacity: open ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className="font-caps text-[0.6rem] font-bold tracking-[0.35em] text-gold sm:text-xs">CONVITE REAL</span>
        <span className="font-script text-4xl leading-none text-apple-deep sm:text-5xl">{name}</span>
        <span className="font-caps text-[0.65rem] tracking-[0.3em] text-forest sm:text-xs">{age}</span>
      </motion.div>

      {/* Laço + selo */}
      <motion.div
        className="absolute left-1/2 top-[44%] z-10 -translate-x-1/2 -translate-y-1/2"
        initial={false}
        animate={open ? { scale: [1, 1.25, 0], rotate: [0, -20, 40], opacity: [1, 1, 0] } : { scale: 1, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.45 }}
      >
        <svg viewBox="0 0 120 80" className="w-24 drop-shadow-lg sm:w-28" aria-hidden>
          <path d="M60 40 C40 10 8 12 10 32 C12 52 40 50 60 40 Z" fill="#B5121B" stroke="#8F0914" strokeWidth="2" />
          <path d="M60 40 C80 10 112 12 110 32 C108 52 80 50 60 40 Z" fill="#B5121B" stroke="#8F0914" strokeWidth="2" />
          <path d="M56 44 L44 78 L54 72 L58 80 L60 46 Z M64 44 L76 78 L66 72 L62 80 L60 46 Z" fill="#8F0914" />
          <circle cx="60" cy="40" r="11" fill="#927044" stroke="#F1D58E" strokeWidth="2" />
        </svg>
        <Star className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-[85%] text-cream" />
      </motion.div>
    </div>
  );
}
