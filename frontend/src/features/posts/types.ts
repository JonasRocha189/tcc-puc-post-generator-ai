import type { Rede, StatusPost } from "@/lib/dominio";

// Espelha o schema do backend (ver docs/modelo-de-dados.md e docs/api.md)

export type Variacao = {
  id: string;
  rede: Rede;
  texto: string;
  hashtags: string[];
  /** Calculada pelo backend: texto + hashtags */
  contagem_caracteres: number;
};

export type Post = {
  id: string;
  assunto_id: string;
  titulo: string;
  status: StatusPost;
  data_prevista: string | null; // ISO
  variacoes: Variacao[];
  criado_em: string;
  atualizado_em: string;
};

/** Corpo de POST /posts e PUT /posts/{id}: o post e todas as suas variações. */
export type PostInput = {
  assunto_id: string;
  titulo: string;
  status: StatusPost;
  data_prevista: string | null;
  variacoes: Pick<Variacao, "rede" | "texto" | "hashtags">[];
};

/** Filtros de GET /posts (além do projeto) */
export type PostFiltros = {
  status?: StatusPost;
  assunto_id?: string;
  de?: string; // AAAA-MM-DD
  ate?: string;
};
