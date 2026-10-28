import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projetosService } from "./service";
import type { ProjetoInput } from "./types";

export const projetosKeys = {
  all: ["projetos"] as const,
  detail: (id: string) => ["projetos", id] as const,
};

export function useProjetos() {
  return useQuery({
    queryKey: projetosKeys.all,
    queryFn: () => projetosService.listar(),
  });
}

export function useProjeto(id: string | undefined) {
  return useQuery({
    queryKey: projetosKeys.detail(id ?? ""),
    queryFn: () => projetosService.obter(id!),
    enabled: Boolean(id),
  });
}

export function useCriarProjeto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProjetoInput) => projetosService.criar(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projetosKeys.all }),
  });
}

export function useAtualizarProjeto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProjetoInput }) =>
      projetosService.atualizar(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projetosKeys.all }),
  });
}

export function useExcluirProjeto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projetosService.excluir(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projetosKeys.all }),
  });
}
