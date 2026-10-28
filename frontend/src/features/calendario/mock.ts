// DADOS DE EXEMPLO. Substituir por GET /posts?de=…&ate=… quando a API existir.
import type { Rede, StatusPost } from "@/lib/dominio";
import type { PostAgendado } from "./types";

const BASE: [string, string, Rede[]][] = [
  ["5 erros ao migrar para a nuvem", "Cloud para PMEs", ["linkedin", "x"]],
  ["Bastidores do onboarding", "Cultura da empresa", ["instagram"]],
  ["Checklist de segurança para o fim do ano", "Segurança da informação", ["linkedin", "instagram", "x"]],
  ["Como medir o ROI de automação", "Cloud para PMEs", ["linkedin"]],
  ["Phishing: 3 sinais de alerta", "Segurança da informação", ["instagram", "x"]],
  ["Nosso time no evento de tecnologia", "Eventos", ["linkedin", "instagram"]],
  ["Backup em nuvem sem complicação", "Cloud para PMEs", ["linkedin"]],
  ["Um dia na vida do suporte", "Cultura da empresa", ["instagram"]],
  ["Senhas fortes em 2 minutos", "Segurança da informação", ["x"]],
  ["Custos escondidos da nuvem", "Cloud para PMEs", ["linkedin", "x"]],
  ["Retrospectiva do trimestre", "Cultura da empresa", ["linkedin"]],
  ["Autenticação em dois fatores", "Segurança da informação", ["linkedin", "instagram"]],
];

// Distribui os posts entre 3 semanas atrás e 4 semanas à frente.
// Passado = publicado; futuro = aprovado ou rascunho.
export const postsAgendadosMock: PostAgendado[] = BASE.map(
  ([titulo, assunto, redes], i) => {
    const offset = -21 + i * 4 + (i % 3);
    const data = new Date();
    data.setDate(data.getDate() + offset);
    data.setHours([9, 12, 18][i % 3], 0, 0, 0);
    const status: StatusPost =
      offset < 0 ? "publicado" : i % 2 === 0 ? "aprovado" : "rascunho";
    return {
      id: `c${i + 1}`,
      titulo,
      assunto,
      redes,
      status,
      dataPrevista: data.toISOString(),
    };
  },
);
