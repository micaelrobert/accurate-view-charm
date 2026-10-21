
import standing from "@/assets/snow-standing.png";
import sitting from "@/assets/snow-sitting.png";
import forest from "@/assets/forest.jpg";

/**
 * Configurações do convite — edite aqui.
 * Deixe vazio ("") enquanto não tiver o valor: o botão mostrará um aviso amigável.
 */
export const INVITE = {
  name: "Seraphine",
  age: "1 aninho",
  date: "22 de novembro",
  time: "10:00 horas",
  location: "A definir",

  /** Somente números com DDI e DDD, ex.: "5511999999999" */
  whatsappNumber: "5522997553865",
  whatsappMessage:
    "Minha presença está confirmada no aniversário de 1 aninho da Seraphine!",
  mapsUrl: "https://www.google.com/maps/place/Espaço+Lara+Jackson/@-22.9210542,-42.5453806,19z/data=!4m6!3m5!1s0x975f4c5841facf:0x693364aa9a66be2b!8m2!3d-22.9209048!4d-42.5451021!16s%2Fg%2F11rxv06l9_?entry=ttu&g_ep=EgoyMDI2MTAxOC4wIKXMDSoASAFQAw%3D%3D",
  giftsUrl: "",

  images: {
    standing,
    sitting,
    forest,
  },
};

export function whatsappLink(number: string, message: string) {
  const digits = number.replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
