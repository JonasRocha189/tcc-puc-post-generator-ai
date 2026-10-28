import { ApiError, apiFetch, apiMode } from "@/lib/api/http";
import { putNoS3, type Progresso } from "@/lib/api/s3";
import { formatoMaisProximo, MIME_POR_TIPO, tipoDaImagem } from "./arquivo";
import { imagensMock } from "./mock";
import type { Imagem, ImagemUploadUrlResponse } from "./types";

export interface ImagensService {
  listar(variacaoId: string): Promise<Imagem[]>;
  /**
   * Fluxo completo de envio: pede a URL pré-assinada, envia o arquivo
   * direto para o S3 e registra a imagem na variação.
   */
  enviar(
    variacaoId: string,
    arquivo: File,
    onProgress?: Progresso,
  ): Promise<Imagem>;
  /** Remove a imagem e o objeto no S3. */
  excluir(id: string): Promise<void>;
}

const imagensHttp: ImagensService = {
  listar: (variacaoId) =>
    apiFetch<Imagem[]>(`/variacoes/${variacaoId}/imagens`),

  async enviar(variacaoId, arquivo, onProgress) {
    const tipo = tipoDaImagem(arquivo);
    if (!tipo) throw new ApiError(422, "Tipo de imagem não aceito");
    const bitmap = await createImageBitmap(arquivo);
    const formato = formatoMaisProximo(bitmap.width, bitmap.height);
    bitmap.close();

    const { chave, upload_url } = await apiFetch<ImagemUploadUrlResponse>(
      `/variacoes/${variacaoId}/imagens/upload-url`,
      {
        method: "POST",
        body: JSON.stringify({ tipo, tamanho_bytes: arquivo.size }),
      },
    );
    await putNoS3(upload_url, arquivo, MIME_POR_TIPO[tipo], onProgress);
    return apiFetch<Imagem>(`/variacoes/${variacaoId}/imagens`, {
      method: "POST",
      body: JSON.stringify({ chave, formato }),
    });
  },

  excluir: (id) => apiFetch<void>(`/imagens/${id}`, { method: "DELETE" }),
};

export const imagensService: ImagensService =
  apiMode === "mock" ? imagensMock : imagensHttp;
