import { motion } from "motion/react";
import { INVITE } from "@/config/invite";
import { Envelope } from "./Envelope";
import { Apple, Particles } from "./Particles";

export function EntryScene({ opening, onOpen }: { opening: boolean; onOpen: () => void }) {
  return (
    <section className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(4rem,env(safe-area-inset-top))]">
      <img src={INVITE.images.forest} alt="" width={1600} height={1200} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-sky/20 via-transparent to-forest/70" />
      <div className="anim-rays absolute -top-20 right-0 h-[80vh] w-[60vw] opacity-50" style={{ background: "conic-gradient(from 200deg at 80% 0%, transparent, oklch(0.95 0.08 90 / 0.5) 8deg, transparent 18deg, oklch(0.95 0.08 90 / 0.35) 26deg, transparent 34deg)" }} aria-hidden />
      <Particles />

      <div className="relative z-10 grid w-full max-w-5xl items-center gap-2 md:grid-cols-[1fr_1.1fr_1fr]">
        <motion.img
          src={INVITE.images.standing}
          alt="Branca de Neve sorrindo, segurando a saia amarela"
          className="anim-float pointer-events-none mx-auto hidden h-auto w-full max-w-[15rem] drop-shadow-2xl md:block"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: opening ? 0 : 1, x: 0 }}
          transition={{ duration: 1.2 }}
        />

        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <img
            src={INVITE.images.sitting}
            alt="Branca de Neve sentada segurando uma maçã vermelha"
            className="anim-float pointer-events-none relative z-20 -mb-6 h-auto w-[min(48vw,11rem)] drop-shadow-2xl md:hidden"
          />
          <motion.div
            className="w-full"
            animate={opening ? { scale: 1.08 } : { rotate: [-1.5, 1.5, -1.5], y: [0, -8, 0] }}
            transition={opening ? { duration: 0.6 } : { duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <Envelope open={opening} name={INVITE.name} age={INVITE.age} />
          </motion.div>

          <motion.button
            type="button"
            onClick={onOpen}
            disabled={opening}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            animate={{ opacity: opening ? 0 : 1 }}
            className="shimmer mt-7 min-h-12 rounded-full border-2 border-gold-light bg-apple-gradient px-8 py-3 font-caps text-sm font-bold tracking-[0.25em] text-cream shadow-apple outline-offset-4 transition-shadow hover:shadow-glow focus-visible:outline-2 focus-visible:outline-gold-light disabled:cursor-default"
          >
            ✦ ABRIR CONVITE ✦
          </motion.button>
          <p className="mt-3 font-body text-lg italic text-cream [text-shadow:0_1px_8px_oklch(0.2_0.05_130/0.9)]">
            Uma surpresa mágica espera por você…
          </p>
        </motion.div>

        <motion.div
          className="pointer-events-none hidden flex-col items-center md:flex"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: opening ? 0 : 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        >
          <img src={INVITE.images.sitting} alt="" className="anim-float h-auto w-full max-w-[14rem] drop-shadow-2xl" style={{ animationDelay: "-3s" }} />
        </motion.div>
      </div>

      <Apple className="anim-sway pointer-events-none absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 w-12 drop-shadow-lg sm:w-16" />
    </section>
  );
}
