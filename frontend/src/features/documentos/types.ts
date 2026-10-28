import type { StatusDocumento } from "@/lib/dominio";

// Espelha o schema do backend (ver docs/modelo-de-dados.md e docs/api.md)

export type TipoDocumento = "pdf" | "docx" | "txt";

export type Documento = {
  id: string;
  projeto_id: string;
  nome: string;
  tipo: TipoDocumento;
  tamanho_bytes: number;
  status: StatusDocumento;
  /** Preenchido quando status = "erro" */
  mensagem_erro: string | null;
  /** Quantos trechos foram indexados para o RAG (quando pronto) */
  total_chunks: number | null;
  criado_em: string;
  atualizado_em: string;
};

/** Resposta de POST /documentos/upload-url */
export type UploadUrlResponse = {
  documento: Documento;
  /** URL pré-assinada do S3 para o PUT do arquivo */
  upload_url: string;
};
