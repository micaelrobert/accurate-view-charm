import { createServerFn } from "@tanstack/react-start";
import { PNG_DATA_URL_PREFIX, rsvpSchema, type RsvpResult } from "./rsvp-schema";

const BUCKET = "assinaturas";
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const MAX_PER_WINDOW = 60;

const FRIENDLY_ERROR = "Um encanto atrapalhou o envio. Seus dados foram mantidos — tente novamente em instantes.";

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

export const submitRsvp = createServerFn({ method: "POST" })
  .validator((input: any) => {
    console.log("\n--- NOVO ENVIO DE RSVP ---");
    console.log("1. Dados recebidos da interface:", { nome: input?.name, id: input?.id });
    try {
      return rsvpSchema.parse(input);
    } catch (err) {
      console.error("ERRO DE VALIDAÇÃO (O formato está incorreto):", err);
      throw err;
    }
  })
  .handler(async ({ data }): Promise<RsvpResult> => {
    console.log("2. Validação passou! Processando:", data.name);
    try {
      const png = decodePng(data.signature);
      if (!png) {
        console.error("ERRO: Falha ao decodificar a imagem PNG da assinatura.");
        return { ok: false, message: "Não conseguimos ler sua assinatura. Refaça e tente de novo." };
      }

      console.log("3. A conectar com o Supabase Admin...");
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      console.log("4. A verificar limite de envios...");
      const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count, error: countError } = await supabaseAdmin
        .from("confirmacoes_presenca")
        .select("id", { count: "exact", head: true })
        .gte("confirmado_em", since);

      if (countError) {
        console.error("ERRO NO COUNT DO SUPABASE:", countError);
        return { ok: false, message: FRIENDLY_ERROR };
      }

      const day = new Date().toISOString().slice(0, 10);
      const path = `${day}/${data.id}.png`;

      console.log("5. A fazer upload da imagem no Storage...");
      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, png, { contentType: "image/png", upsert: true });

      if (uploadError) {
        console.error("ERRO NO UPLOAD DA IMAGEM:", uploadError);
        return { ok: false, message: FRIENDLY_ERROR };
      }

      console.log("6. A guardar dados na tabela...");
      const { error: insertError } = await supabaseAdmin
        .from("confirmacoes_presenca")
        .upsert(
          { id: data.id, nome_convidado: data.name, assinatura_caminho: `${BUCKET}/${path}` },
          { onConflict: "id" }
        );

      if (insertError) {
        console.error("ERRO NO INSERT DA TABELA:", insertError);
        return { ok: false, message: FRIENDLY_ERROR };
      }

      console.log("7. SUCESSO! A presença foi guardada.");
      return { ok: true };
    } catch (err) {
      console.error("ERRO GERAL INESPERADO NO BACKEND:", err);
      return { ok: false, message: FRIENDLY_ERROR };
    }
  });