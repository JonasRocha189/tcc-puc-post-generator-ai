import type { Rede } from "@/lib/dominio";

export const REDES: readonly Rede[] = ["linkedin", "instagram", "x"];

/** Limite de caracteres de cada rede (texto + hashtags). */
export const LIMITE_CARACTERES: Record<Rede, number> = {
  linkedin: 3000,
  instagram: 2200,
  x: 280,
};

/** "#nuvem, marketing  #Nuvem" → ["nuvem", "marketing"] (sem repetir, sem #). */
export function parseHashtags(entrada: string): string[] {
  const vistas = new Set<string>();
  const resultado: string[] = [];
  for (const parte of entrada.split(/[\s,]+/)) {
    const tag = parte.replace(/^#+/, "").trim();
    if (tag && !vistas.has(tag.toLowerCase())) {
      vistas.add(tag.toLowerCase());
      resultado.push(tag);
    }
  }
  return resultado;
}

export function formatarHashtags(hashtags: string[]): string {
  return hashtags.map((h) => `#${h}`).join(" ");
}

/** Texto como será publicado: texto, linha em branco e as hashtags. */
export function textoFinal(texto: string, hashtags: string[]): string {
  const tags = formatarHashtags(hashtags);
  return tags ? `${texto.trim()}\n\n${tags}` : texto.trim();
}

export function contarCaracteres(texto: string, hashtags: string[]): number {
  // Array.from conta emojis e acentos combinados como um caractere
  return Array.from(textoFinal(texto, hashtags)).length;
}
