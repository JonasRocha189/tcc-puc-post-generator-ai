// AGENTE FICTÍCIO (ver lib/api/mockDb.ts e ./mockRoteiro.ts).
// Os passos do roteiro "aparecem" um a um conforme o tempo passa, imitando
// o backend que roda o agente em segundo plano e grava cada PassoAgente.
import { contarCaracteres } from "@/features/posts/redes";
import { agoraIso, latencia, mockDb, type ExecucaoMock } from "@/lib/api/mockDb";
import { criarRoteiro } from "./mockRoteiro";
import type { AgenteService } from "./service";
import type { ExecucaoAgente } from "./types";

/** Tempo entre um passo e outro na tela (mais curto que as durações "reais"). */
const INTERVALO_MS = 900;

/** Cria o rascunho do post quando a execução de criação termina. */
function finalizar(exec: ExecucaoMock): ExecucaoMock {
  let postId = exec.post_id;
  const rascunho = exec.roteiro.rascunho;
  if (rascunho && !postId) {
    const agora = agoraIso();
    postId = crypto.randomUUID();
    mockDb.posts.inserir({
      id: postId,
      assunto_id: rascunho.assunto_id,
      titulo: rascunho.titulo,
      status: "rascunho", // o agente só salva rascunhos
      data_prevista: null,
      criado_em: agora,
      atualizado_em: agora,
      variacoes: rascunho.redes.map((rede) => {
        const hashtags = ["postpilot"];
        return {
          id: `${postId}-${rede}`,
          rede,
          texto: rascunho.texto,
          hashtags,
          contagem_caracteres: contarCaracteres(rascunho.texto, hashtags),
        };
      }),
    });
  }
  return mockDb.execucoes.substituir({ ...exec, post_id: postId, finalizada: true });
}

/** Monta a resposta da API a partir do tempo decorrido desde o início. */
function materializar(registro: ExecucaoMock): ExecucaoAgente {
  const total = registro.roteiro.passos.length;
  const decorrido = Date.now() - new Date(registro.iniciada_em).getTime();

  let exec = registro;
  if (!exec.finalizada && decorrido >= total * INTERVALO_MS + 400) {
    exec = finalizar(exec);
  }

  const visiveis = exec.finalizada
    ? total
    : Math.min(total, Math.floor(decorrido / INTERVALO_MS));

  const duracaoTotal = exec.roteiro.passos.reduce((soma, p) => soma + (p.duracao_ms ?? 0), 0);

  // Chamadas em paralelo (ex.: adaptar para LinkedIn e para X) contam como uma iteração
  const passosVistos = exec.roteiro.passos.slice(0, visiveis);
  const iteracoes = passosVistos.filter((p) => !p.paralelo).length;

  return {
    id: exec.id,
    projeto_id: exec.projeto_id,
    modo: exec.modo,
    pedido: exec.pedido,
    status: exec.finalizada ? exec.roteiro.statusFinal : "executando",
    resposta: exec.finalizada ? exec.roteiro.resposta : null,
    post_id: exec.finalizada ? exec.post_id : null,
    iteracoes,
    passos: passosVistos.map((p, i) => ({
      tool: p.tool,
      argumentos: p.argumentos,
      resultado_resumo: p.resultado_resumo,
      duracao_ms: p.duracao_ms,
      erro: p.erro,
      id: `${exec.id}-passo-${i + 1}`,
      ordem: i + 1,
    })),
    iniciada_em: exec.iniciada_em,
    finalizada_em: exec.finalizada
      ? new Date(new Date(exec.iniciada_em).getTime() + duracaoTotal).toISOString()
      : null,
  };
}

export const agenteMock: AgenteService = {
  async executar({ projeto_id, modo, pedido }) {
    await latencia();
    const projeto = mockDb.projetos.encontrar(projeto_id, "Projeto");
    const assuntos = mockDb.assuntos.todos().filter((a) => a.projeto_id === projeto_id);
    // Usa o assunto citado no pedido; senão, o primeiro do projeto
    const assunto =
      assuntos.find((a) => pedido.toLowerCase().includes(a.nome.toLowerCase())) ??
      assuntos[0] ??
      null;
    const documentos = mockDb.documentos
      .todos()
      .filter((d) => d.projeto_id === projeto_id && d.status === "pronto")
      .map((d) => d.nome);

    const registro = mockDb.execucoes.inserir({
      id: crypto.randomUUID(),
      projeto_id,
      modo,
      pedido,
      iniciada_em: agoraIso(),
      roteiro: criarRoteiro({
        modo,
        pedido,
        projeto,
        assunto: assunto && { id: assunto.id, nome: assunto.nome },
        documentos,
      }),
      post_id: null,
      finalizada: false,
    });
    return materializar(registro);
  },

  async listar(projetoId) {
    await latencia();
    return mockDb.execucoes
      .todos()
      .filter((e) => e.projeto_id === projetoId)
      .map(materializar)
      .sort((a, b) => b.iniciada_em.localeCompare(a.iniciada_em));
  },

  async obter(id) {
    await latencia();
    return materializar(mockDb.execucoes.encontrar(id, "Execução"));
  },
};
