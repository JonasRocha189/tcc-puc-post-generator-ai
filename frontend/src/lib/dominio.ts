// Tipos do domínio compartilhados entre as features.
// Espelham os enums do backend (ver docs/modelo-de-dados.md).
// Os rótulos traduzidos ficam em locales/*/app.json, em "domain".

export type StatusPost = "rascunho" | "aprovado" | "publicado";
export type Rede = "linkedin" | "instagram" | "x";
export type ModoAgente = "ideacao" | "criacao";
export type StatusExecucao = "executando" | "concluida" | "erro" | "limite_atingido";
export type StatusDocumento = "pendente" | "processando" | "pronto" | "erro";

// Nomes de marca: iguais em todos os idiomas
export const REDE_LABEL: Record<Rede, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  x: "X",
};

export const STATUS_POST_COR = {
  rascunho: "light",
  aprovado: "info",
  publicado: "success",
} as const satisfies Record<StatusPost, string>;

export const STATUS_EXECUCAO_COR = {
  executando: "info",
  concluida: "success",
  erro: "error",
  limite_atingido: "warning",
} as const satisfies Record<StatusExecucao, string>;

export const STATUS_DOCUMENTO_COR = {
  pendente: "light",
  processando: "info",
  pronto: "success",
  erro: "error",
} as const satisfies Record<StatusDocumento, string>;
