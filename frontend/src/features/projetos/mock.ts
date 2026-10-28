// API FICTÍCIA de projetos (ver lib/api/mockDb.ts)
import { ApiError } from "@/lib/api/http";
import { agoraIso, latencia, mockDb } from "@/lib/api/mockDb";
import type { ProjetosService } from "./service";
import type { Projeto } from "./types";

const NOME = "Projeto";

// Devolve só os campos públicos (dados antigos do mock podiam ter campos extras)
const publico = (p: Projeto): Projeto => ({
  id: p.id,
  nome: p.nome,
  descricao: p.descricao,
  publico_alvo: p.publico_alvo,
  tom_de_voz: p.tom_de_voz,
  criado_em: p.criado_em,
  atualizado_em: p.atualizado_em,
});

export const projetosMock: ProjetosService = {
  async listar() {
    await latencia();
    return mockDb.projetos
      .todos()
      .map(publico)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  },

  async obter(id) {
    await latencia();
    return publico(mockDb.projetos.encontrar(id, NOME));
  },

  async criar(input) {
    await latencia();
    const agora = agoraIso();
    return publico(
      mockDb.projetos.inserir({
        ...input,
        id: crypto.randomUUID(),
        criado_em: agora,
        atualizado_em: agora,
      }),
    );
  },

  async atualizar(id, input) {
    await latencia();
    const atual = mockDb.projetos.encontrar(id, NOME);
    return publico(
      mockDb.projetos.substituir({ ...atual, ...input, atualizado_em: agoraIso() }),
    );
  },

  async excluir(id) {
    await latencia();
    mockDb.projetos.encontrar(id, NOME);
    // Regra da API: só exclui projeto sem assuntos nem documentos
    if (
      mockDb.assuntos.todos().some((a) => a.projeto_id === id) ||
      mockDb.documentos.todos().some((d) => d.projeto_id === id)
    ) {
      throw new ApiError(409, "O projeto ainda tem assuntos ou documentos");
    }
    mockDb.projetos.remover(id);
  },
};
