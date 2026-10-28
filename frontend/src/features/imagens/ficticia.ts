import type { FormatoImagem } from "@/lib/dominio";

const DIMENSOES: Record<FormatoImagem, [number, number]> = {
  "1:1": [1080, 1080],
  "4:5": [1080, 1350],
  "16:9": [1200, 675],
};

/**
 * Imagem fictícia (SVG abstrato, sem texto) usada pela API fictícia no
 * lugar das imagens geradas pelo agente. A mesma semente gera a mesma imagem.
 */
export function imagemFicticia(
  semente: string,
  formato: FormatoImagem = "1:1",
): string {
  let hash = 2166136261;
  for (const c of semente)
    hash = Math.imul(hash ^ c.charCodeAt(0), 16777619) >>> 0;
  const matiz = hash % 360;
  const [w, h] = DIMENSOES[formato];
  const circulo = (i: number) => {
    const x = ((hash >> (i * 3)) % 100) / 100;
    const y = ((hash >> (i * 5)) % 100) / 100;
    const r = 0.15 + ((hash >> i) % 30) / 100;
    return `<circle cx="${Math.round(x * w)}" cy="${Math.round(y * h)}" r="${Math.round(r * Math.min(w, h))}" fill="hsl(${(matiz + i * 40) % 360} 80% 70%)" fill-opacity="0.55"/>`;
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${matiz} 70% 45%)"/><stop offset="1" stop-color="hsl(${(matiz + 60) % 360} 70% 25%)"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/>${[1, 2, 3].map(circulo).join("")}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
