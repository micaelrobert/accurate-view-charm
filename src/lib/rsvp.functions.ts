import { createServerFn } from "@tanstack/react-start";
import { PNG_DATA_URL_PREFIX, rsvpSchema, type RsvpResult } from "./rsvp-schema";

const BUCKET = "assinaturas";
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
/** Limite simples contra envios em massa: confirmações aceitas a cada 10 minutos. */
const MAX_PER_WINDOW = 60;

const FRIENDLY_ERROR =
  "Um encanto atrapalhou o envio. Seus dados foram mantidos — tente novamente em instantes.";

function decodePng(dataUrl: string): Uint8Array | null {
  try {
    const binary = atob(dataUrl.slice(PNG_DATA_URL_PREFIX.length));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    if (bytes.length < 100) return null;
    for (let i = 0; i < PNG_MAGIC.length; i++) if (bytes[i] !== PNG_MAGIC[i]) return null;
    return bytes;
  } catch {
    return null;
  }
}

/**
 * Registra uma confirmação de presença (público, sem login).
 * O id vem do navegador e é reaproveitado em novas tentativas, evitando duplicatas.
 */
export const submitRsvp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => rsvpSchema.parse(input))
  .handler(async ({ data }): Promise<RsvpResult> => {
    const png = decodePng(data.signature);
    if (!png) return { ok: false, message: "Não conseguimos ler sua assinatura. Refaça e tente de novo." };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabaseAdmin
      .from("confirmacoes_presenca")
      .select("id", { count: "exact", head: true })
      .gte("confirmado_em", since);
    if (countError) {
      console.error("rsvp count failed", countError);
      return { ok: false, message: FRIENDLY_ERROR };
    }
    if ((count ?? 0) >= MAX_PER_WINDOW) {
      return { ok: false, message: "Muitas confirmações chegaram agora. Tente novamente em alguns minutos." };
    }

    const day = new Date().toISOString().slice(0, 10);
    const path = `${day}/${data.id}.png`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, png, { contentType: "image/png", upsert: true });
    if (uploadError) {
      console.error("rsvp upload failed", uploadError);
      return { ok: false, message: FRIENDLY_ERROR };
    }

    const { error: insertError } = await supabaseAdmin
      .from("confirmacoes_presenca")
      .upsert(
        { id: data.id, nome_convidado: data.name, assinatura_caminho: `${BUCKET}/${path}` },
        { onConflict: "id" },
      );
    if (insertError) {
      console.error("rsvp insert failed", insertError);
      return { ok: false, message: FRIENDLY_ERROR };
    }

    return { ok: true };
  });
