import { motion } from "motion/react";
import { Gift, MapPin, MailCheck } from "lucide-react";
import { toast } from "sonner";
import type { ReactNode } from "react";
import { INVITE, whatsappLink } from "@/config/invite";
import { sound } from "@/lib/sound";

function openOrWarn(url: string, warn: string) {
  if (!url) {
    toast(warn, { description: "Em breve esta informação estará disponível ✦" });
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

function Secondary({ icon, title, subtitle, onClick }: { icon: ReactNode; title: string; subtitle: string; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex min-h-16 w-full items-center gap-4 rounded-2xl border border-gold/50 bg-cream px-4 py-3 text-left shadow-sm transition-shadow hover:shadow-glow focus-visible:outline-2 focus-visible:outline-gold"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sage/30 text-forest">{icon}</span>
      <span>
        <span className="block font-caps text-sm font-bold tracking-wide text-apple-deep">{title}</span>
        <span className="block font-body text-base italic text-muted-foreground">{subtitle}</span>
      </span>
    </motion.button>
  );
}

export function ActionButtons() {
  return (
    <div className="flex flex-col gap-3">
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          sound.fanfare();
          openOrWarn(whatsappLink(INVITE.whatsappNumber, INVITE.whatsappMessage), "O número para confirmação ainda será informado.");
        }}
        className="shimmer flex min-h-20 w-full items-center gap-4 rounded-2xl border-2 border-gold-light bg-apple-gradient px-5 py-4 text-left text-cream shadow-apple transition-shadow hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold-gradient text-apple-deep">
          <MailCheck className="h-6 w-6" />
        </span>
        <span>
          <span className="block font-caps text-base font-bold tracking-wide">Confirmar minha presença</span>
          <span className="block font-body text-base italic opacity-90">Avise que você virá celebrar</span>
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
        title="Escolher um presente"
        subtitle="Uma ajudinha para a pequena princesa"
        onClick={() => {
          sound.sparkle();
          openOrWarn(INVITE.giftsUrl, "A lista de presentes ainda será publicada.");
        }}
      />
    </div>
  );
}
