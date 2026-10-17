import { motion } from "motion/react";
import { useMemo } from "react";
import { Star } from "./Particles";

/** Explosão de estrelas + véu de luz dourada que revela o convite. */
export function MagicTransition() {
  const burst = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const a = (i / 36) * Math.PI * 2 + (i % 3) * 0.2;
        const dist = 30 + (i % 5) * 14;
        return { x: Math.cos(a) * dist, y: Math.sin(a) * dist, s: 10 + (i % 4) * 7, d: 0.9 + (i % 3) * 0.2 };
      }),
    [],
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <motion.div
        className="absolute left-1/2 top-1/2 h-[30vmax] w-[30vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, var(--cream), var(--gold-light) 40%, transparent 70%)" }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1, 6], opacity: [0, 1, 1] }}
        transition={{ delay: 0.8, duration: 1.3, ease: "easeIn" }}
      />
      {burst.map((p, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 text-gold-light"
          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
          animate={{ x: `${p.x}vmin`, y: `${p.y}vmin`, scale: [0, 1.6, 0.6], opacity: [0, 1, 0], rotate: 180 }}
          transition={{ delay: 0.7 + (i % 6) * 0.04, duration: p.d, ease: "easeOut" }}
        >
          <Star style={{ width: p.s, height: p.s }} />
        </motion.div>
      ))}
    </div>
  );
}
