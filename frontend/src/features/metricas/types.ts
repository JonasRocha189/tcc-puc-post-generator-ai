// Espelha o schema do backend (ver docs/modelo-de-dados.md e docs/api.md)

/**
 * Um registro de métricas de uma variação publicada. Os números são o total
 * acumulado no momento da coleta; o registro mais recente é o atual.
 */
export type Metrica = {
  id: string;
  variacao_id: string;
  publicado_em: string; // ISO
  impressoes: number;
  curtidas: number;
  comentarios: number;
  compartilhamentos: number;
  cliques: number;
  coletado_em: string; // ISO
};

/** Corpo de POST /variacoes/{id}/metricas */
export type MetricaInput = Omit<Metrica, "id" | "variacao_id">;

export const CAMPOS_NUMERICOS = [
  "impressoes",
  "curtidas",
  "comentarios",
  "compartilhamentos",
  "cliques",
] as const satisfies readonly (keyof MetricaInput)[];

export type CampoNumerico = (typeof CAMPOS_NUMERICOS)[number];
