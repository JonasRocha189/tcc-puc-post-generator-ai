import { apiFetch, apiMode } from "@/lib/api/http";
import { agenteMock } from "./mock";
import type { ExecucaoAgente, ExecucaoInput } from "./types";

export interface AgenteService {
  /**
   * Inicia uma execução. Responde logo (202) com status "executando";
   * o progresso é acompanhado com `obter` até o status final.
   */
  executar(input: ExecucaoInput): Promise<ExecucaoAgente>;
  listar(projetoId: string): Promise<ExecucaoAgente[]>;
  obter(id: string): Promise<ExecucaoAgente>;
}

const agenteHttp: AgenteService = {
  executar: (input) =>
    apiFetch<ExecucaoAgente>("/agente/execucoes", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  listar: (projetoId) =>
    apiFetch<ExecucaoAgente[]>(
      `/agente/execucoes?${new URLSearchParams({ projeto_id: projetoId })}`,
    ),
  obter: (id) => apiFetch<ExecucaoAgente>(`/agente/execucoes/${id}`),
};

export const agenteService: AgenteService = apiMode === "mock" ? agenteMock : agenteHttp;
