// Espelha o schema do backend (ver docs/modelo-de-dados.md e docs/api.md)
export type Assunto = {
  id: string;
  projeto_id: string;
  nome: string;
  descricao: string | null;
  /** null = usa o do projeto */
  publico_alvo: string | null;
  /** null = usa o do projeto */
  tom_de_voz: string | null;
  criado_em: string;
  atualizado_em: string;
};

/** Corpo de POST /assuntos (com projeto_id) e PUT /assuntos/{id} */
export type AssuntoInput = Pick<
  Assunto,
  "nome" | "descricao" | "publico_alvo" | "tom_de_voz"
>;
