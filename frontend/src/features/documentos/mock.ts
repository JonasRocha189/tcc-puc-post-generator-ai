// API FICTÍCIA de documentos (ver lib/api/mockDb.ts). Não guarda o arquivo:
// só simula o envio e o processamento (pendente → processando → pronto/erro).
// Arquivos vazios ou com "erro" no nome terminam com status "erro".
import { ApiError } from "@/lib/api/http";
import { agoraIso, latencia, mockDb, type DocumentoMock } from "@/lib/api/mockDb";
import type { DocumentosService } from "./service";
import type { Documento } from "./types";
import { TAMANHO_MAXIMO, tipoDoArquivo } from "./validacao";

const TEMPO_PROCESSAMENTO_MS = 3500;

/** Avança o status conforme o tempo passa, como o backend faria em segundo plano. */
function atualizar(doc: DocumentoMock): DocumentoMock {
  if (doc.status !== "processando" || !doc.processamento_iniciado_em) return doc;
  const decorrido = Date.now() - new Date(doc.processamento_iniciado_em).getTime();
  if (decorrido < TEMPO_PROCESSAMENTO_MS) return doc;

  const falhou = doc.tamanho_bytes === 0 || doc.nome.toLowerCase().includes("erro");
  return mockDb.documentos.substituir({
    ...doc,
    status: falhou ? "erro" : "pronto",
    mensagem_erro: falhou ? "Não foi possível extrair texto do arquivo" : null,
    total_chunks: falhou ? null : Math.max(1, Math.round(doc.tamanho_bytes / 30_000)),
    atualizado_em: agoraIso(),
  });
}

const publico = ({ processamento_iniciado_em: _ignorado, ...doc }: DocumentoMock): Documento => {
  void _ignorado;
  return doc;
};

export const documentosMock: DocumentosService = {
  async listar(projetoId) {
    await latencia();
    mockDb.projetos.encontrar(projetoId, "Projeto");
    return mockDb.documentos
      .todos()
      .filter((d) => d.projeto_id === projetoId)
      .map(atualizar)
      .map(publico)
      .sort((a, b) => b.criado_em.localeCompare(a.criado_em));
  },

  async enviar(projetoId, arquivo, onProgress) {
    mockDb.projetos.encontrar(projetoId, "Projeto");
    const tipo = tipoDoArquivo(arquivo.name);
    if (!tipo) throw new ApiError(422, "Tipo de arquivo não aceito");
    if (arquivo.size > TAMANHO_MAXIMO) throw new ApiError(422, "Arquivo maior que o permitido");

    // Simula o PUT no S3 com progresso
    for (const fracao of [0.15, 0.4, 0.7, 1]) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      onProgress?.(fracao);
    }

    const agora = agoraIso();
    const doc = mockDb.documentos.inserir({
      id: crypto.randomUUID(),
      projeto_id: projetoId,
      nome: arquivo.name,
      tipo,
      tamanho_bytes: arquivo.size,
      status: "processando",
      mensagem_erro: null,
      total_chunks: null,
      criado_em: agora,
      atualizado_em: agora,
      processamento_iniciado_em: agora,
    });
    return publico(doc);
  },

  async excluir(id) {
    await latencia();
    mockDb.documentos.encontrar(id, "Documento");
    mockDb.documentos.remover(id);
  },
};
