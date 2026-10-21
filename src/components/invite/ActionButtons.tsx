import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { Gift, MapPin, MailCheck, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { INVITE } from "@/config/invite";
import { sound } from "@/lib/sound";
import { RsvpScroll } from "./RsvpScroll";

function openOrWarn(url: string, warn: string) {
  if (!url) {
    toast(warn, {
      description: "Em breve esta informação estará disponível ✦",
    });
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

type SecondaryProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
};

function Secondary({ icon, title, subtitle, onClick }: SecondaryProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex min-h-16 w-full items-center gap-4 rounded-2xl border border-gold/50 bg-cream px-4 py-3 text-left shadow-sm transition-shadow hover:shadow-glow focus-visible:outline-2 focus-visible:outline-gold"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sage/30 text-forest">
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-caps text-sm font-bold tracking-wide text-apple-deep">
          {title}
        </span>

        <span className="block font-body text-base italic text-muted-foreground">
          {subtitle}
        </span>
      </span>
    </motion.button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pop-up de sugestão de presentes                                           */
/* -------------------------------------------------------------------------- */

type GiftCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  featured?: boolean;
  variants: Variants;
};

/** Cartão totalmente centralizado: ícone em cima, rótulo e valor abaixo. */
function GiftCard({ icon, label, value, featured, variants }: GiftCardProps) {
  return (
    <motion.div
      variants={variants}
      className={[
        "relative flex min-w-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-gold/50 text-center shadow-sm",
        featured
          ? "col-span-2 bg-gradient-to-b from-white/80 to-cream px-4 py-5 sm:py-6"
          : "bg-white/70 px-3 py-4 sm:px-4 sm:py-5",
      ].join(" ")}
    >
      {/* brilho sutil no topo do cartão */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
      />

      <span
        className={[
          "grid shrink-0 place-items-center rounded-full border border-gold/40 bg-sage/30 text-forest",
          featured ? "h-14 w-14 sm:h-16 sm:w-16" : "h-11 w-11 sm:h-12 sm:w-12",
        ].join(" ")}
      >
        {icon}
      </span>

      <div className="min-w-0">
        <p className="font-caps text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs sm:tracking-widest">
          {label}
        </p>

        <p
          className={[
            "mt-0.5 break-words font-body font-semibold lining-nums tabular-nums text-apple-deep",
            featured ? "text-xl sm:text-2xl" : "text-lg sm:text-xl",
          ].join(" ")}
        >
          {value}
        </p>
      </div>
    </motion.div>
  );
}

type GiftSuggestionsProps = {
  onClose: () => void;
};

function GiftSuggestions({ onClose }: GiftSuggestionsProps) {
  const reduceMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Trava o scroll do fundo, fecha com ESC e foca no botão de fechar
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const list: Variants = {
    hidden: {},
    show: {
      transition: {
        delayChildren: reduceMotion ? 0 : 0.18,
        staggerChildren: reduceMotion ? 0 : 0.09,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 24 },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-forest/60 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-[max(12px,env(safe-area-inset-top))] backdrop-blur-sm sm:p-6"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gift-popup-title"
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: "spring", stiffness: 280, damping: 25 }}
        className="relative mx-auto flex max-h-full w-full max-w-sm flex-col overflow-hidden rounded-3xl border-2 border-gold/60 bg-cream shadow-2xl sm:max-w-md sm:rounded-[2rem]"
      >
        {/* Cabeçalho decorativo (fixo) */}
        <div className="relative shrink-0 overflow-hidden bg-apple-gradient px-5 pb-7 pt-8 text-center text-cream sm:px-8 sm:pb-9 sm:pt-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <Sparkles className="absolute left-5 top-5 h-4 w-4 text-gold-light/50 sm:left-8 sm:top-6 sm:h-5 sm:w-5" />
            <Sparkles className="absolute right-12 top-14 h-3.5 w-3.5 text-gold-light/50 sm:right-16" />
            <Sparkles className="absolute bottom-4 left-[22%] h-3.5 w-3.5 text-gold-light/40" />
            <Sparkles className="absolute bottom-6 right-[18%] h-4 w-4 text-gold-light/30" />
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar sugestões de presentes"
            className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-gold/40 bg-cream/10 transition-colors hover:bg-cream/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:right-4 sm:top-4"
          >
            <X className="h-5 w-5" />
          </button>

          <motion.div
            initial={{ rotate: -15, scale: 0.7 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 220 }}
            className="relative mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full border-2 border-gold-light bg-gold-gradient text-apple-deep shadow-glow sm:h-20 sm:w-20"
          >
            {/* anel externo decorativo */}
            <span
              aria-hidden="true"
              className="absolute -inset-1.5 rounded-full border border-gold-light/40"
            />
            <Gift className="h-8 w-8 sm:h-10 sm:w-10" />
          </motion.div>

          <p className="mb-1 font-body text-sm italic text-gold-light sm:text-base">
            Um pequeno detalhe ✦
          </p>

          <h2
            id="gift-popup-title"
            className="mx-auto max-w-[16rem] text-balance font-caps text-xl font-bold leading-tight tracking-wide sm:max-w-none sm:text-3xl"
          >
            Sugestão de Presentes
          </h2>

          <p className="mx-auto mt-2 max-w-[17rem] text-balance font-body text-sm italic text-cream/85 sm:max-w-xs sm:text-base">
            Para ajudar a escolher um mimo para a nossa princesa!
          </p>

          {/* divisor dourado entre o cabeçalho e o conteúdo */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-light to-transparent"
          />
        </div>

        {/* Conteúdo (rola sozinho se a tela for muito baixa) */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-5 pt-5 sm:px-8 sm:pb-7 sm:pt-7">
          <motion.div
            variants={list}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-3 sm:gap-4"
          >
            <GiftCard
              featured
              variants={item}
              icon={<Gift className="h-6 w-6 sm:h-7 sm:w-7" />}
              label="Sugestão"
              value="Brinquedos"
            />

            <GiftCard
              variants={item}
              icon={
                <span aria-hidden="true" className="text-xl sm:text-2xl">
                  👟
                </span>
              }
              label="Sapato"
              value="Número 18"
            />

            <GiftCard
              variants={item}
              icon={
                <span aria-hidden="true" className="text-xl sm:text-2xl">
                  👗
                </span>
              }
              label="Roupa"
              value="2 anos"
            />
          </motion.div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="shimmer mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-gold-light bg-apple-gradient px-4 py-3 font-caps text-sm font-bold tracking-wide text-cream shadow-apple transition-shadow hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:mt-6 sm:min-h-14 sm:text-base"
          >
            <Sparkles className="h-4 w-4 text-gold-light" />
            Entendi!
          </motion.button>
        </div>

        <div aria-hidden="true" className="h-1.5 shrink-0 bg-gold-gradient" />
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Botões de ação                                                            */
/* -------------------------------------------------------------------------- */

export function ActionButtons() {
  const [showGiftSuggestions, setShowGiftSuggestions] = useState(false);
  const [showRsvp, setShowRsvp] = useState(false);

  const closeRsvp = useCallback(() => {
    setShowRsvp(false);
    // volta suavemente ao topo do convite, sem recarregar a página
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }), 350);
  }, []);

  return (
    <>
      <div className="flex flex-col gap-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            sound.fanfare();
            setShowRsvp(true);
          }}
          className="shimmer flex min-h-20 w-full items-center gap-4 rounded-2xl border-2 border-gold-light bg-apple-gradient px-5 py-4 text-left text-cream shadow-apple transition-shadow hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold-gradient text-apple-deep">
            <MailCheck className="h-6 w-6" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block font-caps text-base font-bold tracking-wide">
              Confirmar minha presença
            </span>

            <span className="block font-body text-base italic opacity-90">
              Avise que você virá celebrar
            </span>
          </span>
        </motion.button>

        <Secondary
          icon={<MapPin className="h-5 w-5" />}
          title="Ver localização"
          subtitle="Encontre o caminho até o reino"
          onClick={() => {
            sound.sparkle();

            openOrWarn(INVITE.mapsUrl, "O local ainda será definido.");
          }}
        />

        <Secondary
          icon={<Gift className="h-5 w-5" />}
          title="Sugestão de Presentes"
          subtitle="Um mimo para a pequena princesa"
          onClick={() => {
            sound.sparkle();
            setShowGiftSuggestions(true);
          }}
        />
      </div>

      <AnimatePresence>
        {showGiftSuggestions && (
          <GiftSuggestions onClose={() => setShowGiftSuggestions(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRsvp && <RsvpScroll onClose={closeRsvp} />}
      </AnimatePresence>
    </>
  );
}