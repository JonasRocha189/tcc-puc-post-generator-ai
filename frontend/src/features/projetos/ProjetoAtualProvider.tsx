import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useProjetos } from "./api";
import { ProjetoAtualContext } from "./projetoAtualContext";

const STORAGE_KEY = "postpilot:projeto-atual";

function lerSalvo(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Guarda o projeto selecionado no cabeçalho e o disponibiliza para as páginas. */
export default function ProjetoAtualProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isError } = useProjetos();
  const [selecionadoId, setSelecionadoId] = useState<string | null>(lerSalvo);

  const projetos = useMemo(() => data ?? [], [data]);
  // Se o salvo não existe mais (ex.: foi excluído), usa o primeiro da lista
  const projetoAtual =
    projetos.find((p) => p.id === selecionadoId) ?? projetos[0] ?? null;

  const selecionar = useCallback((id: string) => {
    setSelecionadoId(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // localStorage indisponível: a escolha vale só nesta aba
    }
  }, []);

  const value = useMemo(
    () => ({ projetos, projetoAtual, selecionar, isLoading, isError }),
    [projetos, projetoAtual, selecionar, isLoading, isError],
  );

  return (
    <ProjetoAtualContext.Provider value={value}>
      {children}
    </ProjetoAtualContext.Provider>
  );
}
