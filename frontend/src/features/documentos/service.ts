import { ApiError, apiFetch, apiMode } from "@/lib/api/http";
import { documentosMock } from "./mock";
import type { Documento, UploadUrlResponse } from "./types";
import { MIME_POR_TIPO, tipoDoArquivo } from "./validacao";

export type Progresso = (fracao: number) => void;

export interface DocumentosService {
  listar(projetoId: string): Promise<Documento[]>;
  /**
   * Fluxo completo de envio: pede a URL pré-assinada, envia o arquivo
   * direto para o S3 e avisa o backend para processar.
   */
  enviar(projetoId: string, arquivo: File, onProgress?: Progresso): Promise<Documento>;
  /** Remove o documento, o objeto no S3 e os chunks. */
  excluir(id: string): Promise<void>;
}

/** PUT direto no S3. Usa XHR porque o fetch não informa o progresso do envio. */
function putNoS3(url: string, arquivo: File, contentType: string, onProgress?: Progresso) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new ApiError(xhr.status, "Falha no envio para o S3"));
    xhr.onerror = () => reject(new ApiError(0, "Falha de rede no envio para o S3"));
    xhr.send(arquivo);
  });
}

const documentosHttp: DocumentosService = {
  listar: (projetoId) =>
    apiFetch<Documento[]>(`/documentos?${new URLSearchParams({ projeto_id: projetoId })}`),

  async enviar(projetoId, arquivo, onProgress) {
    const tipo = tipoDoArquivo(arquivo.name);
    if (!tipo) throw new ApiError(422, "Tipo de arquivo não aceito");

    const { documento, upload_url } = await apiFetch<UploadUrlResponse>(
      "/documentos/upload-url",
      {
        method: "POST",
        body: JSON.stringify({
          projeto_id: projetoId,
          nome: arquivo.name,
          tipo,
          tamanho_bytes: arquivo.size,
        }),
      },
    );
    await putNoS3(upload_url, arquivo, MIME_POR_TIPO[tipo], onProgress);
    return apiFetch<Documento>(`/documentos/${documento.id}/processar`, { method: "POST" });
  },

  excluir: (id) => apiFetch<void>(`/documentos/${id}`, { method: "DELETE" }),
};

export const documentosService: DocumentosService =
  apiMode === "mock" ? documentosMock : documentosHttp;
