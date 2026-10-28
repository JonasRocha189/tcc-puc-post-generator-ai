// BANCO FICTÍCIO para `npm run dev` sem backend (ver lib/api/http.ts).
// Cada coleção fica no localStorage; os services `mock` de cada feature
// usam estas coleções e imitam as regras da API real (404, 409...).
import { criarRoteiro, type Roteiro } from "@/features/agente/mockRoteiro";
import type { Assunto } from "@/features/assuntos/types";
import type { Documento } from "@/features/documentos/types";
import type { ModoAgente } from "@/lib/dominio";
import type { Post } from "@/features/posts/types";
import type { Projeto } from "@/features/projetos/types";
import { contarCaracteres } from "@/features/posts/redes";
import { ApiError } from "./http";

/** Documento no banco fictício: guarda quando o processamento começou. */
export type DocumentoMock = Documento & {
  processamento_iniciado_em: string | null;
};

/**
 * Execução no banco fictício: guarda o roteiro inteiro; os passos vão
 * "aparecendo" conforme o tempo passa (ver features/agente/mock.ts).
 */
export type ExecucaoMock = {
  id: string;
  projeto_id: string;
  modo: ModoAgente;
  pedido: string;
  iniciada_em: string;
  roteiro: Roteiro;
  post_id: string | null;
  finalizada: boolean;
};

type Entidade = { id: string };

function colecao<T extends Entidade>(key: string, seed: () => T[]) {
  let memoria: T[] | null = null;

  const ler = (): T[] => {
    if (memoria) return memoria;
    try {
      const salvo = localStorage.getItem(key);
      memoria = salvo ? (JSON.parse(salvo) as T[]) : seed();
    } catch {
      memoria = seed();
    }
    return memoria;
  };

  const gravar = (itens: T[]) => {
    memoria = itens;
    try {
      localStorage.setItem(key, JSON.stringify(itens));
    } catch {
      // localStorage indisponível: os dados duram só nesta aba
    }
  };

  return {
    todos: ler,
    encontrar(id: string, nome = "Registro"): T {
      const item = ler().find((i) => i.id === id);
      if (!item) throw new ApiError(404, `${nome} não encontrado`);
      return item;
    },
    inserir(item: T) {
      gravar([...ler(), item]);
      return item;
    },
    substituir(item: T) {
      gravar(ler().map((i) => (i.id === item.id ? item : i)));
      return item;
    },
    remover(id: string) {
      gravar(ler().filter((i) => i.id !== id));
    },
  };
}

/** Simula a latência da rede. */
export const latencia = () => new Promise((resolve) => setTimeout(resolve, 250));

export const agoraIso = () => new Date().toISOString();

// ---------------------------------------------------------------------------
// Dados iniciais
// ---------------------------------------------------------------------------

const PROJ_MARCA = "proj-minha-marca";
const PROJ_ACME = "proj-acme";

function seedProjetos(): Projeto[] {
  const agora = agoraIso();
  return [
    {
      id: PROJ_MARCA,
      nome: "Minha marca",
      descricao: "Conteúdo da minha consultoria de tecnologia para pequenas empresas.",
      publico_alvo: "Donos e gestores de pequenas e médias empresas",
      tom_de_voz: "Próximo, didático e sem jargão técnico",
      criado_em: agora,
      atualizado_em: agora,
    },
    {
      id: PROJ_ACME,
      nome: "Acme Cloud",
      descricao: "Cliente: provedor de nuvem focado em segurança.",
      publico_alvo: "Gestores de TI e CTOs",
      tom_de_voz: "Profissional, confiante e direto",
      criado_em: agora,
      atualizado_em: agora,
    },
  ];
}

function seedAssuntos(): Assunto[] {
  const agora = agoraIso();
  const assunto = (
    id: string,
    projeto_id: string,
    nome: string,
    descricao: string,
    voz: Partial<Pick<Assunto, "publico_alvo" | "tom_de_voz">> = {},
  ): Assunto => ({
    id,
    projeto_id,
    nome,
    descricao,
    publico_alvo: voz.publico_alvo ?? null,
    tom_de_voz: voz.tom_de_voz ?? null,
    criado_em: agora,
    atualizado_em: agora,
  });
  return [
    assunto("ass-cloud", PROJ_MARCA, "Cloud para PMEs", "Migração, custos e boas práticas de nuvem para empresas pequenas."),
    assunto("ass-cultura", PROJ_MARCA, "Cultura da empresa", "Bastidores, time e jeito de trabalhar.", {
      tom_de_voz: "Leve, humano e bem-humorado",
    }),
    assunto("ass-eventos", PROJ_MARCA, "Eventos", "Palestras e eventos de que participamos."),
    assunto("ass-seguranca", PROJ_ACME, "Segurança da informação", "Ameaças, prevenção e conformidade.", {
      publico_alvo: "Equipes de segurança e compliance",
    }),
    assunto("ass-produto", PROJ_ACME, "Novidades do produto", "Lançamentos e recursos da Acme Cloud."),
  ];
}

function seedPosts(): Post[] {
  type Base = [string, string, Post["variacoes"][number]["rede"][], number, number];
  // título, assunto, redes, dias a partir de hoje, hora
  const base: Base[] = [
    ["5 erros ao migrar para a nuvem", "ass-cloud", ["linkedin", "x"], -20, 9],
    ["Bastidores do onboarding", "ass-cultura", ["instagram"], -14, 12],
    ["Backup em nuvem sem complicação", "ass-cloud", ["linkedin"], -9, 18],
    ["Nosso time no evento de tecnologia", "ass-eventos", ["linkedin", "instagram"], -3, 9],
    ["Como medir o ROI de automação", "ass-cloud", ["linkedin"], 2, 12],
    ["Um dia na vida do suporte", "ass-cultura", ["instagram"], 5, 18],
    ["Custos escondidos da nuvem", "ass-cloud", ["linkedin", "x"], 9, 9],
    ["Checklist de segurança para o fim do ano", "ass-seguranca", ["linkedin", "instagram", "x"], -6, 9],
    ["Phishing: 3 sinais de alerta", "ass-seguranca", ["instagram", "x"], 1, 12],
    ["Autenticação em dois fatores", "ass-seguranca", ["linkedin"], 6, 9],
    ["Novo painel de auditoria", "ass-produto", ["linkedin", "x"], 12, 12],
  ];

  return base.map(([titulo, assunto_id, redes, dias, hora], i) => {
    const data = new Date();
    data.setDate(data.getDate() + dias);
    data.setHours(hora, 0, 0, 0);
    const status: Post["status"] = dias < 0 ? "publicado" : i % 2 === 0 ? "aprovado" : "rascunho";
    const agora = agoraIso();
    return {
      id: `post-${i + 1}`,
      assunto_id,
      titulo,
      status,
      data_prevista: data.toISOString(),
      criado_em: agora,
      atualizado_em: agora,
      variacoes: redes.map((rede) => {
        const texto = `${titulo}. Texto de exemplo para ${rede}.`;
        const hashtags = ["tecnologia", "negocios"];
        return {
          id: `var-${i + 1}-${rede}`,
          rede,
          texto,
          hashtags,
          contagem_caracteres: contarCaracteres(texto, hashtags),
        };
      }),
    };
  });
}

function seedDocumentos(): DocumentoMock[] {
  const doc = (
    id: string,
    projeto_id: string,
    nome: string,
    tipo: Documento["tipo"],
    tamanho_bytes: number,
    total_chunks: number,
    diasAtras: number,
  ): DocumentoMock => {
    const data = new Date(Date.now() - diasAtras * 86_400_000).toISOString();
    return {
      id,
      projeto_id,
      nome,
      tipo,
      tamanho_bytes,
      status: "pronto",
      mensagem_erro: null,
      total_chunks,
      criado_em: data,
      atualizado_em: data,
      processamento_iniciado_em: data,
    };
  };
  return [
    doc("doc-guia", PROJ_MARCA, "guia-de-marca.pdf", "pdf", 1_240_000, 38, 20),
    doc("doc-cases", PROJ_MARCA, "cases-de-clientes.docx", "docx", 486_000, 22, 12),
    doc("doc-auditoria", PROJ_ACME, "auditoria-seguranca-2026.pdf", "pdf", 3_150_000, 96, 9),
    doc("doc-faq", PROJ_ACME, "faq-produto.txt", "txt", 42_000, 7, 4),
  ];
}

function seedExecucoes(): ExecucaoMock[] {
  const projetos = seedProjetos();
  const exec = (
    id: string,
    projetoId: string,
    modo: ModoAgente,
    pedido: string,
    assunto: { id: string; nome: string } | null,
    documentos: string[],
    horasAtras: number,
    post_id: string | null = null,
  ): ExecucaoMock => {
    const projeto = projetos.find((p) => p.id === projetoId)!;
    return {
      id,
      projeto_id: projetoId,
      modo,
      pedido,
      iniciada_em: new Date(Date.now() - horasAtras * 3_600_000).toISOString(),
      roteiro: criarRoteiro({ modo, pedido, projeto, assunto, documentos }),
      post_id,
      finalizada: true,
    };
  };
  return [
    exec("exec-1", PROJ_ACME, "criacao", "Post sobre o checklist de segurança, com base no PDF da auditoria", { id: "ass-seguranca", nome: "Segurança da informação" }, ["auditoria-seguranca-2026.pdf"], 1, "post-8"),
    exec("exec-2", PROJ_ACME, "ideacao", "Temas para a próxima semana sobre segurança em nuvem", null, [], 6),
    exec("exec-3", PROJ_ACME, "ideacao", "O que está funcionando melhor no LinkedIn? #erro", null, [], 30),
    exec("exec-4", PROJ_MARCA, "criacao", "Carrossel do Instagram sobre onboarding #limite", { id: "ass-cultura", nome: "Cultura da empresa" }, [], 26),
    exec("exec-5", PROJ_MARCA, "ideacao", "Ideias de posts para pequenas empresas que querem migrar para a nuvem", null, [], 50),
  ];
}

// ---------------------------------------------------------------------------

export const mockDb = {
  projetos: colecao<Projeto>("postpilot:mock:projetos", seedProjetos),
  assuntos: colecao<Assunto>("postpilot:mock:assuntos", seedAssuntos),
  posts: colecao<Post>("postpilot:mock:posts", seedPosts),
  documentos: colecao<DocumentoMock>("postpilot:mock:documentos", seedDocumentos),
  execucoes: colecao<ExecucaoMock>("postpilot:mock:execucoes", seedExecucoes),
};
