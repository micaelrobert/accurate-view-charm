import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useServerFn } from "@tanstack/react-start";
import { Crown, Loader2, RotateCcw, ScrollText, Sparkles, X } from "lucide-react";
import { INVITE } from "@/config/invite";
import { sound } from "@/lib/sound";
import { missingRsvpMessage } from "@/lib/rsvp-schema";
import { submitRsvp } from "@/lib/rsvp.functions";
import { SignaturePad, type SignaturePadHandle } from "./SignaturePad";
import { Star } from "./Particles";

type Phase = "form" | "absorbing" | "closing" | "sealed" | "thanks";

const FRIENDLY_ERROR =
  "Um encanto atrapalhou o envio. Seus dados foram mantidos — tente novamente em instantes.";

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (+c ^ (Math.random() * 16) >> (+c / 4)).toString(16),
  );
}

function Rod() {
  return (
    <div aria-hidden className="relative z-20 flex w-full items-center">
      <span className="h-6 w-4 shrink-0 rounded-full bg-apple-gradient ring-1 ring-gold-light/70 sm:h-7 sm:w-5" />
      <span className="scroll-rod h-4 flex-1 rounded-full sm:h-5" />
      <span className="h-6 w-4 shrink-0 rounded-full bg-apple-gradient ring-1 ring-gold-light/70 sm:h-7 sm:w-5" />
    </div>
  );
}

function Ornament() {
  return (
    <div aria-hidden className="flex items-center justify-center gap-2 text-gold">
      <span className="h-px w-10 bg-gold-gradient sm:w-16" />
      <Star className="h-3 w-3" />
      <span className="h-px w-10 bg-gold-gradient sm:w-16" />
    </div>
  );
}

function WaxSeal({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative grid place-items-center rounded-full border-2 border-gold-light bg-apple-gradient text-gold-light shadow-apple ${className}`}
    >
      <span aria-hidden className="absolute inset-1.5 rounded-full border border-dashed border-gold-light/60" />
      <span className="flex flex-col items-center leading-none">
        <Crown className="h-1/3 w-1/3 min-h-4 min-w-4" />
        <span className="font-script text-2xl leading-none sm:text-3xl">S</span>
      </span>
    </span>
  );
}

/** Faíscas douradas subindo da assinatura enquanto ela é absorvida. */
function RisingSparks() {
  const sparks = [12, 26, 41, 55, 68, 82, 34, 74];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      {sparks.map((left, i) => (
        <motion.span
          key={i}
          className="absolute bottom-1/3 text-gold-light"
          style={{ left: `${left}%` }}
          initial={{ opacity: 0, y: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 0], y: -60 - (i % 3) * 18, scale: [0.4, 1, 0.6] }}
          transition={{ duration: 1.3, delay: 0.15 + i * 0.08, ease: "easeOut" }}
        >
          <Star className="h-3 w-3" />
        </motion.span>
      ))}
    </div>
  );
}

type Props = { onClose: () => void };

export function RsvpScroll({ onClose }: Props) {
  const reduce = useReducedMotion();
  const submitFn = useServerFn(submitRsvp);
  const padRef = useRef<SignaturePadHandle>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [submissionId] = useState(newId);

  const [phase, setPhase] = useState<Phase>("form");
  const [name, setName] = useState("");
  const [hasInk, setHasInk] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = submitting || phase !== "form";
  const t = (ms: number) => (reduce ? Math.min(ms, 350) : ms);

  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  // Trava o scroll do fundo, ESC fecha (quando não está enviando), foca no nome após abrir
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = setTimeout(() => nameRef.current?.focus({ preventScroll: true }), reduce ? 100 : 1300);
    return () => {
      document.body.style.overflow = previous;
      clearTimeout(focusTimer);
      timers.current.forEach(clearTimeout);
    };
  }, [reduce]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const runSuccessSequence = () => {
    sound.sparkle();
    setPhase("absorbing");
    later(t(1500), () => setPhase("closing"));
    later(t(1500) + t(950), () => {
      sound.harp();
      setPhase("sealed");
    });
    later(t(1500) + t(950) + t(1300), () => setPhase("thanks"));
    later(t(1500) + t(950) + t(1300) + 6000, onClose);
  };

  const handleConfirm = async () => {
    if (busy) return;
    const missing = missingRsvpMessage(name, hasInk && !padRef.current?.isEmpty());
    if (missing) {
      setError(missing);
      return;
    }
    const signature = padRef.current?.toPng();
    if (!signature) {
      setError("Falta sua assinatura real no pergaminho.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const result = await submitFn({ data: { id: submissionId, name: name.trim(), signature } });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      runSuccessSequence();
    } catch {
      setError(FRIENDLY_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRedo = () => {
    if (busy) return;
    padRef.current?.clear();
    setError(null);
    sound.sparkle();
  };

  const rolledUp = phase === "closing" || phase === "sealed" || phase === "thanks";

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0.15 : 0.5 }}
    >
      {/* Fundo escurecido com brilho dourado discreto */}
      <div
        aria-hidden
        className="absolute inset-0 bg-forest/75 backdrop-blur-[3px]"
        onClick={() => !busy && onClose()}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 45%, color-mix(in oklab, var(--gold-light) 28%, transparent), transparent 60%)" }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {[
          "left-[8%] top-[12%]",
          "right-[10%] top-[18%]",
          "left-[14%] bottom-[16%]",
          "right-[16%] bottom-[10%]",
          "left-[48%] top-[5%]",
        ].map((pos, i) => (
          <Star
            key={pos}
            className={`anim-twinkle absolute h-3 w-3 text-gold-light ${pos}`}
            style={{ ["--delay" as string]: `${i * 0.7}s`, ["--d" as string]: "3.6s" }}
          />
        ))}
      </div>

      <div className="pointer-events-none relative flex h-full w-full items-center justify-center px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-[max(12px,env(safe-area-inset-top))] sm:px-6">
        <AnimatePresence mode="wait">
          {phase !== "thanks" ? (
            <motion.div
              key="scroll"
              role="dialog"
              aria-modal="true"
              aria-labelledby="rsvp-title"
              className="pointer-events-auto relative flex w-full max-w-md flex-col items-center sm:max-w-lg"
              initial={{ opacity: 0, scale: reduce ? 1 : 0.6, y: reduce ? 0 : 30 }}
              animate={{ opacity: 1, scale: phase === "sealed" && !reduce ? 1.04 : 1, y: 0 }}
              exit={{ opacity: 0, scale: reduce ? 1 : 0.85, y: reduce ? 0 : -20 }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
            >
              <Rod />

              <motion.div
                className="relative z-10 -my-2 w-[calc(100%-1.75rem)] overflow-hidden sm:w-[calc(100%-2.25rem)]"
                initial={{ height: 0 }}
                animate={{ height: rolledUp ? 0 : "auto" }}
                transition={{
                  duration: reduce ? 0.2 : rolledUp ? 0.9 : 1.1,
                  delay: rolledUp || reduce ? 0 : 0.35,
                  ease: [0.65, 0, 0.35, 1],
                }}
              >
                <div className="parchment relative max-h-[calc(100svh-6.5rem)] overflow-y-auto overscroll-contain px-5 pb-6 pt-7 sm:px-9 sm:pb-8 sm:pt-9">
                  {/* bordas e ornamentos do documento */}
                  <div aria-hidden className="pointer-events-none absolute inset-2 rounded-sm border border-gold/50" />
                  <div aria-hidden className="pointer-events-none absolute inset-3.5 rounded-sm border border-dashed border-gold/30" />

                  <button
                    type="button"
                    onClick={onClose}
                    disabled={busy}
                    aria-label="Fechar confirmação de presença"
                    className="absolute right-3.5 top-3.5 z-10 grid h-10 w-10 place-items-center rounded-full border border-gold/40 bg-cream/60 text-apple-deep transition-colors hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-40"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <motion.div
                    className="relative text-center"
                    initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                    animate={{ opacity: rolledUp ? 0 : 1, y: 0 }}
                    transition={{ duration: 0.6, delay: rolledUp ? 0 : reduce ? 0.1 : 1.2 }}
                  >
                    <span className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full border border-gold-light bg-gold-gradient text-apple-deep shadow-glow">
                      <ScrollText className="h-6 w-6" />
                    </span>
                    <p className="font-caps text-[0.65rem] font-bold tracking-[0.35em] text-apple sm:text-xs">DECRETO REAL</p>
                    <h2 id="rsvp-title" className="mt-1 text-balance font-display text-2xl font-bold leading-tight text-gold-gradient sm:text-3xl">
                      Registro de Presença
                    </h2>
                    <div className="my-3"><Ornament /></div>
                    <p className="mx-auto max-w-sm text-balance font-body text-lg italic leading-snug text-ink">
                      “Por ordem do reino, fica convidado a registrar sua presença na celebração do primeiro aniversário da princesa {INVITE.name}.”
                    </p>
                  </motion.div>

                  <motion.form
                    className="relative mt-5 flex flex-col gap-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleConfirm();
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: rolledUp ? 0 : 1 }}
                    transition={{ duration: 0.5, delay: rolledUp ? 0 : reduce ? 0.1 : 1.45 }}
                    noValidate
                  >
                    <div>
                      <label htmlFor="rsvp-name" className="block text-center font-caps text-xs font-bold tracking-[0.25em] text-forest">
                        NOME DO CONVIDADO
                      </label>
                      <input
                        ref={nameRef}
                        id="rsvp-name"
                        type="text"
                        autoComplete="name"
                        maxLength={120}
                        value={name}
                        disabled={busy}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="Escreva seu nome completo..."
                        className="mt-1.5 min-h-12 w-full border-0 border-b-2 border-gold/60 bg-transparent px-1 text-center font-body text-xl font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:italic placeholder:text-muted-foreground/80 focus:border-apple disabled:opacity-70"
                      />
                    </div>

                    <div>
                      <p className="text-center font-caps text-xs font-bold tracking-[0.25em] text-forest">ASSINATURA REAL</p>
                      <p className="mt-0.5 text-center font-body text-base italic text-muted-foreground">
                        Assine abaixo para confirmar sua presença.
                      </p>

                      <div className="relative mt-2 h-44 w-full overflow-hidden rounded-xl border border-gold/50 bg-cream/40 shadow-[inset_0_1px_6px_color-mix(in_oklab,var(--gold)_25%,transparent)] sm:h-48">
                        {/* cantos ornamentais */}
                        <span aria-hidden className="pointer-events-none absolute left-2 top-2 h-4 w-4 rounded-tl-md border-l-2 border-t-2 border-gold/60" />
                        <span aria-hidden className="pointer-events-none absolute right-2 top-2 h-4 w-4 rounded-tr-md border-r-2 border-t-2 border-gold/60" />
                        <span aria-hidden className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 rounded-bl-md border-b-2 border-l-2 border-gold/60" />
                        <span aria-hidden className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 rounded-br-md border-b-2 border-r-2 border-gold/60" />

                        {/* linha de assinatura */}
                        <div aria-hidden className="pointer-events-none absolute inset-x-6 bottom-9 flex items-end gap-2">
                          <span className="font-display text-lg leading-none text-gold">✕</span>
                          <span className="mb-0.5 h-px flex-1 bg-gold-gradient" />
                        </div>
                        <p aria-hidden className="pointer-events-none absolute inset-x-0 bottom-3 text-center font-caps text-[0.6rem] tracking-[0.3em] text-gold">
                          ASSINATURA DO CONVIDADO
                        </p>

                        <AnimatePresence>
                          {!hasInk && phase === "form" && (
                            <motion.p
                              aria-hidden
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="pointer-events-none absolute inset-x-0 top-[38%] -translate-y-1/2 text-center font-body text-lg italic text-muted-foreground/70"
                            >
                              Desenhe com o dedo ou o mouse
                            </motion.p>
                          )}
                        </AnimatePresence>

                        {/* brilho dourado que fica no papel após absorver a tinta */}
                        <motion.div
                          aria-hidden
                          className="pointer-events-none absolute inset-0"
                          style={{ background: "radial-gradient(ellipse at 50% 55%, color-mix(in oklab, var(--gold-light) 55%, transparent), transparent 65%)" }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: phase === "absorbing" ? [0, 0.9, 0.35] : 0 }}
                          transition={{ duration: 1.4 }}
                        />

                        <div className={`absolute inset-0 ${phase === "absorbing" && !reduce ? "ink-absorb" : ""} ${phase !== "form" && phase !== "absorbing" ? "opacity-0" : ""}`}>
                          <SignaturePad
                            ref={padRef}
                            disabled={busy}
                            label="Área para desenhar sua assinatura"
                            onChange={(ink) => {
                              setHasInk(ink);
                              if (ink && error) setError(null);
                            }}
                          />
                        </div>

                        {phase === "absorbing" && !reduce && <RisingSparks />}
                      </div>
                    </div>

                    <div aria-live="polite" className="min-h-0">
                      <AnimatePresence>
                        {error && (
                          <motion.p
                            key={error}
                            role="alert"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-start gap-2 rounded-xl border border-apple/40 bg-apple/5 px-3 py-2.5 text-left font-body text-base font-semibold leading-snug text-apple-deep"
                          >
                            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                            {error}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
                      <motion.button
                        type="submit"
                        disabled={busy}
                        whileHover={busy ? undefined : { scale: 1.02 }}
                        whileTap={busy ? undefined : { scale: 0.97 }}
                        className="shimmer order-1 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-gold-light bg-apple-gradient px-4 py-3 font-caps text-sm font-bold tracking-wide text-cream shadow-apple transition-shadow hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-wait disabled:opacity-90 sm:order-2"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-gold-light" />
                            Selando o documento…
                          </>
                        ) : (
                          <>
                            <Crown className="h-4 w-4 text-gold-light" />
                            Confirmar minha presença
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        type="button"
                        onClick={handleRedo}
                        disabled={busy || !hasInk}
                        whileTap={busy ? undefined : { scale: 0.97 }}
                        className="order-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-gold/50 bg-cream/80 px-4 py-3 font-caps text-xs font-bold tracking-wide text-apple-deep transition-shadow hover:shadow-glow focus-visible:outline-2 focus-visible:outline-gold disabled:opacity-50 disabled:hover:shadow-none sm:order-1"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Refazer assinatura
                      </motion.button>
                    </div>
                  </motion.form>
                </div>
              </motion.div>

              <Rod />

              {/* Selo real ao fechar */}
              <AnimatePresence>
                {phase === "sealed" && (
                  <motion.div
                    className="pointer-events-none absolute inset-x-0 top-1/2 z-30 flex -translate-y-1/2 justify-center"
                    initial={{ opacity: 0, scale: reduce ? 1 : 2.2, rotate: reduce ? 0 : -25 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  >
                    <span
                      aria-hidden
                      className="absolute top-1/2 h-40 w-40 -translate-y-1/2 rounded-full"
                      style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--gold-light) 70%, transparent), transparent 70%)" }}
                    />
                    <WaxSeal className="h-20 w-20" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="thanks"
              role="status"
              className="pointer-events-auto relative w-full max-w-sm sm:max-w-md"
              initial={{ opacity: 0, scale: reduce ? 1 : 0.9, y: reduce ? 0 : 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: reduce ? 1 : 0.95 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
            >
              <div className="paper relative overflow-hidden rounded-[1.75rem] px-6 pb-7 pt-12 text-center sm:px-9">
                <div aria-hidden className="pointer-events-none absolute inset-2.5 rounded-[1.4rem] border border-gold/60" />
                <div aria-hidden className="shimmer pointer-events-none absolute inset-0 rounded-[1.75rem]" />

                <WaxSeal className="mx-auto h-20 w-20" />

                <p className="mt-4 font-caps text-[0.65rem] font-bold tracking-[0.35em] text-apple">SELADO PELO REINO</p>
                <h2 className="mt-1 text-balance font-display text-2xl font-bold leading-tight text-gold-gradient sm:text-3xl">
                  Sua presença foi registrada no reino!
                </h2>
                <div className="my-4"><Ornament /></div>
                <p className="mx-auto max-w-xs text-balance font-body text-lg leading-snug text-ink">
                  Obrigado por confirmar sua presença no primeiro aniversário da princesa {INVITE.name}. Será uma alegria celebrar esse dia especial com você!
                </p>

                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="shimmer mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-gold-light bg-apple-gradient px-4 py-3 font-caps text-sm font-bold tracking-wide text-cream shadow-apple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <Sparkles className="h-4 w-4 text-gold-light" />
                  Voltar ao convite
                </motion.button>

                <motion.div
                  aria-hidden
                  className="mx-auto mt-4 h-1 overflow-hidden rounded-full bg-gold/20"
                  style={{ width: "60%" }}
                >
                  <motion.div
                    className="h-full bg-gold-gradient"
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 6, ease: "linear" }}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
