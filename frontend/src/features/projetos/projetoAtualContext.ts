import { createContext } from "react";
import type { Projeto } from "./types";

export type ProjetoAtualState = {
  /** Projetos do usuário (vazio enquanto carrega) */
  projetos: Projeto[];
  /** Projeto selecionado no cabeçalho; null quando não há projetos */
  projetoAtual: Projeto | null;
  selecionar: (id: string) => void;
  isLoading: boolean;
  isError: boolean;
};

export const ProjetoAtualContext = createContext<ProjetoAtualState | undefined>(
  undefined,
);
