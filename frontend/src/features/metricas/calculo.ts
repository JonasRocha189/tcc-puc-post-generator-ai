import type { CampoNumerico, Metrica } from "./types";

// Mesma regra do relatório de desempenho no backend (ver docs/modelo-de-dados.md)

type Numeros = Pick<Metrica, CampoNumerico>;

/** Interações: curtidas + comentários + compartilhamentos + cliques. */
export function interacoes(m: Numeros) {
  return m.curtidas + m.comentarios + m.compartilhamentos + m.cliques;
}

/** Taxa de engajamento: interações ÷ impressões (0 sem impressões). */
export function taxaEngajamento(m: Numeros) {
  return m.impressoes > 0 ? interacoes(m) / m.impressoes : 0;
}
