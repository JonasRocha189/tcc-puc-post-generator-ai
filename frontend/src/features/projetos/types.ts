// Espelha o schema do backend (ver docs/modelo-de-dados.md e docs/api.md)
export type Projeto = {
  id: string;
  nome: string;
  descricao: string | null;
  publico_alvo: string | null;
  tom_de_voz: string | null;
  criado_em: string; // ISO
  atualizado_em: string; // ISO
};

/** Corpo de POST /projetos e PUT /projetos/{id} */
export type ProjetoInput = Pick<
  Projeto,
  "nome" | "descricao" | "publico_alvo" | "tom_de_voz"
>;
