import { apiFetch, apiMode } from "@/lib/api/http";
import { metricasMock } from "./mock";
import type { Metrica, MetricaInput } from "./types";

export interface MetricasService {
  /** Registros da variação, do mais recente para o mais antigo. */
  listar(variacaoId: string): Promise<Metrica[]>;
  /** `422` se o post não estiver publicado. */
  registrar(variacaoId: string, input: MetricaInput): Promise<Metrica>;
  excluir(id: string): Promise<void>;
}

const metricasHttp: MetricasService = {
  listar: (variacaoId) =>
    apiFetch<Metrica[]>(`/variacoes/${variacaoId}/metricas`),
  registrar: (variacaoId, input) =>
    apiFetch<Metrica>(`/variacoes/${variacaoId}/metricas`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  excluir: (id) => apiFetch<void>(`/metricas/${id}`, { method: "DELETE" }),
};

export const metricasService: MetricasService =
  apiMode === "mock" ? metricasMock : metricasHttp;
