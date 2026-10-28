// API FICTÍCIA de posts (ver lib/api/mockDb.ts)
import { ApiError } from "@/lib/api/http";
import {
  agoraIso,
  latencia,
  mockDb,
  removerDependentesDasVariacoes,
} from "@/lib/api/mockDb";
import { contarCaracteres } from "./redes";
import type { PostsService } from "./service";
import type { Post, PostInput } from "./types";

const NOME = "Post";

function validarAssunto(assuntoId: string) {
  if (!mockDb.assuntos.todos().some((a) => a.id === assuntoId)) {
    throw new ApiError(422, "Assunto inválido");
  }
}

/**
 * A variação de uma rede que continua no post mantém o id (e, com ele,
 * as imagens e métricas); a de uma rede nova ganha um id novo.
 */
function montarVariacoes(
  postId: string,
  input: PostInput,
  atuais: Post["variacoes"] = [],
): Post["variacoes"] {
  return input.variacoes.map((v) => ({
    ...v,
    id: atuais.find((a) => a.rede === v.rede)?.id ?? `${postId}-${v.rede}`,
    contagem_caracteres: contarCaracteres(v.texto, v.hashtags),
  }));
}

export const postsMock: PostsService = {
  async listar(projetoId, filtros = {}) {
    await latencia();
    const assuntosDoProjeto = new Set(
      mockDb.assuntos
        .todos()
        .filter((a) => a.projeto_id === projetoId)
        .map((a) => a.id),
    );
    const dia = (iso: string | null) => (iso ? iso.slice(0, 10) : null);

    return mockDb.posts
      .todos()
      .filter((p) => assuntosDoProjeto.has(p.assunto_id))
      .filter((p) => !filtros.status || p.status === filtros.status)
      .filter((p) => !filtros.assunto_id || p.assunto_id === filtros.assunto_id)
      .filter((p) => !filtros.de || (dia(p.data_prevista) ?? "") >= filtros.de)
      .filter(
        (p) => !filtros.ate || (dia(p.data_prevista) ?? "9999") <= filtros.ate,
      )
      .sort((a, b) =>
        (b.data_prevista ?? "").localeCompare(a.data_prevista ?? ""),
      );
  },

  async obter(id) {
    await latencia();
    return mockDb.posts.encontrar(id, NOME);
  },

  async criar(input) {
    await latencia();
    validarAssunto(input.assunto_id);
    const id = crypto.randomUUID();
    const agora = agoraIso();
    return mockDb.posts.inserir({
      id,
      assunto_id: input.assunto_id,
      titulo: input.titulo,
      status: input.status,
      data_prevista: input.data_prevista,
      variacoes: montarVariacoes(id, input),
      criado_em: agora,
      atualizado_em: agora,
    });
  },

  async atualizar(id, input) {
    await latencia();
    const atual = mockDb.posts.encontrar(id, NOME);
    validarAssunto(input.assunto_id);
    const variacoes = montarVariacoes(id, input, atual.variacoes);
    removerDependentesDasVariacoes(
      atual.variacoes
        .filter((v) => !variacoes.some((n) => n.id === v.id))
        .map((v) => v.id),
    );
    return mockDb.posts.substituir({
      ...atual,
      assunto_id: input.assunto_id,
      titulo: input.titulo,
      status: input.status,
      data_prevista: input.data_prevista,
      variacoes,
      atualizado_em: agoraIso(),
    });
  },

  async excluir(id) {
    await latencia();
    const post = mockDb.posts.encontrar(id, NOME);
    removerDependentesDasVariacoes(post.variacoes.map((v) => v.id));
    mockDb.posts.remover(id);
  },
};
