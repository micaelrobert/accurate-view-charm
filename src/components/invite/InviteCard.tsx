import { motion, type Variants } from "motion/react";
import { CalendarHeart, Clock, Castle, Waves } from "lucide-react";
import { INVITE } from "@/config/invite";
import { ActionButtons } from "./ActionButtons";
import { Apple, Particles, Star } from "./Particles";

// Local da festa (já definido)
const LOCATION_NAME = "Espaço Lara Jackson";

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

function Ornament() {
  return (
    <div aria-hidden className="flex items-center justify-center gap-2 text-gold">
      <span className="h-px w-12 bg-gold-gradient sm:w-20" />
      <Star className="h-3 w-3" />
      <span className="h-px w-12 bg-gold-gradient sm:w-20" />
    </div>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 60 60" aria-hidden className={`absolute h-12 w-12 text-gold sm:h-16 sm:w-16 ${className}`}>
      <path d="M4 56 C4 26 26 4 56 4 M4 40 C10 22 22 10 40 4 M14 30 c6 -2 10 -8 10 -14" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="8" cy="8" r="3" fill="var(--apple)" />
      <path d="M16 18 c4 -6 10 -6 12 -4 c-4 6 -10 6 -12 4z" fill="var(--forest)" />
    </svg>
  );
}

function Detail({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <motion.div
      variants={item}
      className={`flex min-w-0 flex-col items-center gap-1 rounded-xl bg-sky/25 px-2 py-3 text-center ring-1 ring-gold/30 ${className}`}
    >
      <span className="text-apple">{icon}</span>
      <span className="font-caps text-[0.65rem] font-bold tracking-[0.25em] text-gold">{label}</span>
      <span className="text-balance break-words font-body text-lg font-semibold leading-tight text-ink">{value}</span>
    </motion.div>
  );
}

/** Aviso do reino: piscina e brinquedos com água */
function PoolNotice() {
  return (
    <motion.aside
      variants={item}
      aria-label="Aviso importante"
      className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-sky/40 via-sky/20 to-cream px-4 pb-9 pt-5 text-center ring-1 ring-gold/50 sm:px-6"
    >
      {/* bolhinhas decorativas */}
      <span aria-hidden className="anim-float pointer-events-none absolute left-4 top-4 h-2.5 w-2.5 rounded-full border border-gold/50 bg-white/50" />
      <span aria-hidden className="anim-float pointer-events-none absolute right-5 top-7 h-3.5 w-3.5 rounded-full border border-gold/50 bg-white/40" />
      <span aria-hidden className="anim-float pointer-events-none absolute bottom-10 right-10 h-2 w-2 rounded-full border border-gold/50 bg-white/50" />
      <span aria-hidden className="anim-float pointer-events-none absolute bottom-12 left-8 h-1.5 w-1.5 rounded-full border border-gold/50 bg-white/50" />

      <span className="relative mx-auto grid h-12 w-12 place-items-center rounded-full border border-gold-light bg-gold-gradient text-apple-deep shadow-glow">
        <Waves className="h-6 w-6" />
      </span>

      <p className="mt-3 font-caps text-[0.65rem] font-bold tracking-[0.25em] text-apple">AVISO DO REINO</p>

      <p className="mx-auto mt-1.5 max-w-xs text-balance font-body text-lg font-semibold leading-snug text-ink">
        Haverá piscina e brinquedos com água, traga seu traje de banho!
      </p>

      {/* ondinha na base */}
      <svg
        aria-hidden
        viewBox="0 0 120 16"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-4 w-full text-sky/60"
      >
        <path d="M0 8 Q15 0 30 8 T60 8 T90 8 T120 8 V16 H0z" fill="currentColor" />
      </svg>
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gold-gradient opacity-60" />
    </motion.aside>
  );
}

export function InviteCard() {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(4.5rem,env(safe-area-inset-top))]">
      <img src={INVITE.images.forest} alt="" width={1600} height={1200} className="absolute inset-0 h-full w-full object-cover blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-forest/40 via-forest/20 to-apple-deep/40" />
      <Particles stars={14} fireflies={8} petals={5} seed={21} />

      <motion.article
        initial="hidden"
        animate="show"
        variants={{ hidden: { opacity: 0, scale: 0.94 }, show: { opacity: 1, scale: 1, transition: { duration: 0.8, staggerChildren: 0.09, delayChildren: 0.2 } } }}
        className="paper relative z-10 mx-auto w-full max-w-lg rounded-[1.75rem] px-5 pb-8 pt-10 sm:px-10"
      >
        <div aria-hidden className="pointer-events-none absolute inset-2.5 rounded-[1.4rem] border border-gold/60" />
        <div aria-hidden className="shimmer pointer-events-none absolute inset-0 rounded-[1.75rem]" />
        <Corner className="left-2 top-2" />
        <Corner className="right-2 top-2 -scale-x-100" />
        <Corner className="bottom-2 left-2 -scale-y-100" />
        <Corner className="bottom-2 right-2 -scale-100" />

        <div className="relative text-center">
          <motion.p variants={item} className="font-caps text-xs font-bold tracking-[0.4em] text-apple sm:text-sm">CONVOCAÇÃO REAL</motion.p>
          <motion.p variants={item} className="mt-1 font-body text-lg italic text-gold">Um convite do reino encantado</motion.p>
          <motion.div variants={item} className="my-4"><Ornament /></motion.div>

          <motion.div variants={item} className="relative mx-auto w-32 sm:w-36">
            <img src={INVITE.images.sitting} alt="Branca de Neve sentada segurando uma maçã" className="anim-float h-auto w-full drop-shadow-xl" />
          </motion.div>

          <motion.p variants={item} className="mt-3 font-caps text-sm tracking-[0.2em] text-forest">O primeiro reinado de</motion.p>
          <motion.h1 variants={item} className="name-glow relative font-script text-[clamp(3.5rem,16vw,5.5rem)] leading-[1.05] text-apple-deep">
            {INVITE.name}
            <Star className="anim-twinkle absolute -right-1 top-2 h-4 w-4 text-gold" />
            <Star className="anim-twinkle absolute left-0 bottom-2 h-3 w-3 text-gold" style={{ ["--delay" as string]: "1.4s" }} />
          </motion.h1>
          <motion.div variants={item} className="flex items-center justify-center gap-2">
            <Apple crown className="anim-sway w-9" />
            <p className="font-display text-xl font-bold text-gold-gradient sm:text-2xl">faz 1 aninho!</p>
          </motion.div>

          <motion.p variants={item} className="mx-auto mt-5 max-w-sm font-body text-lg leading-snug text-ink">
            “Convocamos todas as princesas e príncipes para comemorar o primeiro reinado da nossa pequena princesa!”
          </motion.p>

          <motion.div variants={item} className="my-6"><Ornament /></motion.div>

          {/* Data e horário lado a lado; o local ocupa a linha toda para o nome caber bem em qualquer tela */}
          <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
            <Detail icon={<CalendarHeart className="h-5 w-5" />} label="DATA" value={INVITE.date} />
            <Detail icon={<Clock className="h-5 w-5" />} label="HORÁRIO" value={INVITE.time} />
            <Detail
              icon={<Castle className="h-5 w-5" />}
              label="LOCAL"
              value={LOCATION_NAME}
              className="min-[420px]:col-span-2"
            />
          </div>

          <PoolNotice />

          <motion.div variants={item} className="mt-7">
            <ActionButtons />
          </motion.div>
        </div>
      </motion.article>
    </section>
  );
}