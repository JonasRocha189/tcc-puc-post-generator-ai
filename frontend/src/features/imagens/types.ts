import type { FormatoImagem } from "@/lib/dominio";

// Espelha o schema do backend (ver docs/modelo-de-dados.md e docs/api.md)

export type TipoImagem = "png" | "jpeg" | "webp";

export type Imagem = {
  id: string;
  variacao_id: string;
  formato: FormatoImagem;
  /** Prompt usado pelo agente; null quando a imagem foi enviada pelo usuário */
  prompt: string | null;
  /** URL pré-assinada de leitura (expira; o banco guarda só a chave S3) */
  url: string;
  criado_em: string;
};

/** Resposta de POST /variacoes/{id}/imagens/upload-url */
export type ImagemUploadUrlResponse = {
  chave: string;
  /** URL pré-assinada do S3 para o PUT do arquivo */
  upload_url: string;
};
