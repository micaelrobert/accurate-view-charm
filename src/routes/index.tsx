import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { EntryScene } from "@/components/invite/EntryScene";
import { InviteCard } from "@/components/invite/InviteCard";
import { MagicTransition } from "@/components/invite/MagicTransition";
import { MusicToggle } from "@/components/invite/MusicToggle";
import { sound } from "@/lib/sound";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Convite Real — 1 aninho da Seraphine" },
      { name: "description", content: "Você é convidado para o primeiro reinado da Seraphine: 22 de novembro, às 10h. Abra o convite mágico!" },
      { property: "og:title", content: "Convite Real — 1 aninho da Seraphine ✦" },
      { property: "og:description", content: "Uma surpresa mágica espera por você… Abra o convite encantado da Seraphine." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Phase = "entry" | "opening" | "invite";

function Index() {
  const [phase, setPhase] = useState<Phase>("entry");
  const [music, setMusic] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    sound.stopMusic();
  }, []);

  const open = useCallback(() => {
    if (phase !== "entry") return;
    setPhase("opening");
    sound.harp();
    sound.startMusic();
    setMusic(true);
    setUnlocked(true);
    timer.current = setTimeout(() => {
      setPhase("invite");
      window.scrollTo({ top: 0 });
    }, reduce ? 300 : 2100);
  }, [phase, reduce]);

  const toggleMusic = () => {
    if (music) sound.stopMusic();
    else sound.startMusic();
    setMusic(!music);
  };

  return (
    <main className="relative min-h-[100svh] w-full overflow-x-hidden bg-forest">
      {unlocked && <MusicToggle on={music} onToggle={toggleMusic} />}
      <AnimatePresence mode="wait">
        {phase !== "invite" ? (
          <motion.div key="entry" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <EntryScene opening={phase === "opening"} onOpen={open} />
          </motion.div>
        ) : (
          <motion.div key="invite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <InviteCard />
          </motion.div>
        )}
      </AnimatePresence>
      {phase === "opening" && !reduce && <MagicTransition />}
      {phase === "invite" && !reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-40 bg-cream"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
        />
      )}
    </main>
  );
}
