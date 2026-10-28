import { useContext } from "react";
import { ProjetoAtualContext } from "./projetoAtualContext";

export function useProjetoAtual() {
  const context = useContext(ProjetoAtualContext);
  if (context === undefined) {
    throw new Error("useProjetoAtual must be used within a ProjetoAtualProvider");
  }
  return context;
}
