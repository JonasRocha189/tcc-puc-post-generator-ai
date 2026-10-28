// API FICTÍCIA de imagens (ver lib/api/mockDb.ts). A "URL" é um data URL
// de uma cópia reduzida da imagem, para caber no localStorage.
import { ApiError } from "@/lib/api/http";
import { agoraIso, latencia, mockDb, variacaoDoMock } from "@/lib/api/mockDb";
import {
  formatoMaisProximo,
  MAXIMO_POR_VARIACAO,
  TAMANHO_MAXIMO,
  tipoDaImagem,
} from "./arquivo";
import type { ImagensService } from "./service";

const LADO_MAXIMO = 640;

/** Reduz a imagem e devolve um data URL JPEG, com o formato pelas dimensões. */
async function reduzir(arquivo: File) {
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(
    1,
    LADO_MAXIMO / Math.max(bitmap.width, bitmap.height),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const formato = formatoMaisProximo(bitmap.width, bitmap.height);
  bitmap.close();
  return { url: canvas.toDataURL("image/jpeg", 0.8), formato };
}

export const imagensMock: ImagensService = {
  async listar(variacaoId) {
    await latencia();
    variacaoDoMock(variacaoId);
    return mockDb.imagens
      .todos()
      .filter((i) => i.variacao_id === variacaoId)
      .sort((a, b) => a.criado_em.localeCompare(b.criado_em));
  },

  async enviar(variacaoId, arquivo, onProgress) {
    variacaoDoMock(variacaoId);
    if (!tipoDaImagem(arquivo))
      throw new ApiError(422, "Tipo de imagem não aceito");
    if (arquivo.size > TAMANHO_MAXIMO)
      throw new ApiError(422, "Imagem maior que o permitido");
    if (
      mockDb.imagens.todos().filter((i) => i.variacao_id === variacaoId)
        .length >= MAXIMO_POR_VARIACAO
    ) {
      throw new ApiError(422, "Limite de imagens da variação atingido");
    }

    // Simula o PUT no S3 com progresso
    for (const fracao of [0.2, 0.5, 0.8, 1]) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      onProgress?.(fracao);
    }

    const { url, formato } = await reduzir(arquivo);
    return mockDb.imagens.inserir({
      id: crypto.randomUUID(),
      variacao_id: variacaoId,
      formato,
      prompt: null,
      url,
      criado_em: agoraIso(),
    });
  },

  async excluir(id) {
    await latencia();
    mockDb.imagens.encontrar(id, "Imagem");
    mockDb.imagens.remover(id);
  },
};
