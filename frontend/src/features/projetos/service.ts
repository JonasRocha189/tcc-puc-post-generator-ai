import { apiFetch, apiMode } from "@/lib/api/http";
import { projetosMock } from "./mock";
import type { Projeto, ProjetoInput } from "./types";

export interface ProjetosService {
  listar(): Promise<Projeto[]>;
  obter(id: string): Promise<Projeto>;
  criar(input: ProjetoInput): Promise<Projeto>;
  atualizar(id: string, input: ProjetoInput): Promise<Projeto>;
  /** Rejeita com ApiError 409 quando o projeto ainda tem assuntos ou documentos. */
  excluir(id: string): Promise<void>;
}

const projetosHttp: ProjetosService = {
  listar: () => apiFetch<Projeto[]>("/projetos"),
  obter: (id) => apiFetch<Projeto>(`/projetos/${id}`),
  criar: (input) =>
    apiFetch<Projeto>("/projetos", { method: "POST", body: JSON.stringify(input) }),
  atualizar: (id, input) =>
    apiFetch<Projeto>(`/projetos/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  excluir: (id) => apiFetch<void>(`/projetos/${id}`, { method: "DELETE" }),
};

export const projetosService: ProjetosService =
  apiMode === "mock" ? projetosMock : projetosHttp;
