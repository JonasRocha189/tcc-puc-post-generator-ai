import type { Interacoes } from "./types";

/** Mínimo de posts por grupo para uma conclusão de desempenho (regra do agente). */
export const AMOSTRA_MINIMA = 5;

export function totalInteracoes(m: Interacoes): number {
  return m.curtidas + m.comentarios + m.compartilhamentos + m.cliques;
}

/** Interações / impressões, entre 0 e 1. Zero quando não há impressões. */
export function taxaEngajamento(m: Interacoes & { impressoes: number }): number {
  return m.impressoes > 0 ? totalInteracoes(m) / m.impressoes : 0;
}

export function amostraSuficiente(posts: number): boolean {
  return posts >= AMOSTRA_MINIMA;
}

/** Soma interações e impressões de vários grupos. */
export function somar<T extends Interacoes & { impressoes: number; posts: number }>(
  grupos: T[],
): Interacoes & { impressoes: number; posts: number } {
  return grupos.reduce(
    (acc, g) => ({
      posts: acc.posts + g.posts,
      impressoes: acc.impressoes + g.impressoes,
      curtidas: acc.curtidas + g.curtidas,
      comentarios: acc.comentarios + g.comentarios,
      compartilhamentos: acc.compartilhamentos + g.compartilhamentos,
      cliques: acc.cliques + g.cliques,
    }),
    {
      posts: 0,
      impressoes: 0,
      curtidas: 0,
      comentarios: 0,
      compartilhamentos: 0,
      cliques: 0,
    },
  );
}
