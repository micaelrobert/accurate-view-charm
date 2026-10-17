import { Music, VolumeX } from "lucide-react";

export function MusicToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? "Silenciar música" : "Ativar música"}
      className="fixed right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-50 grid h-11 w-11 place-items-center rounded-full border border-gold-light/70 bg-apple-deep/80 text-cream shadow-apple backdrop-blur transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-gold-light"
    >
      {on ? <Music className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </button>
  );
}
