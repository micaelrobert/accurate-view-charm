import { z } from "zod";

/** Prefixo exigido para a imagem da assinatura enviada pelo navegador. */
export const PNG_DATA_URL_PREFIX = "data:image/png;base64,";

/** Tamanho máximo do texto base64 da assinatura (~750 KB de imagem). */
export const MAX_SIGNATURE_BASE64_LENGTH = 1_000_000;

export const rsvpSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .trim()
    .min(2, { message: "Escreva seu nome para o reino saber quem vem celebrar." })
    .max(120, { message: "O nome está muito longo." }),
  signature: z
    .string()
    .startsWith(PNG_DATA_URL_PREFIX, { message: "Falta sua assinatura real." })
    .max(MAX_SIGNATURE_BASE64_LENGTH, { message: "A assinatura ficou grande demais." }),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;

export type RsvpResult = { ok: true } | { ok: false; message: string };

/** Mensagem temática explicando o que falta antes de confirmar. */
export function missingRsvpMessage(name: string, hasSignature: boolean): string | null {
  const hasName = name.trim().length >= 2;
  if (!hasName && !hasSignature) {
    return "O pergaminho ainda espera seu nome e sua assinatura real.";
  }
  if (!hasName) return "Escreva seu nome para o reino saber quem vem celebrar.";
  if (!hasSignature) return "Falta sua assinatura real no pergaminho.";
  return null;
}
