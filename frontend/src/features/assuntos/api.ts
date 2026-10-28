import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assuntosService } from "./service";
import type { AssuntoInput } from "./types";

export const assuntosKeys = {
  all: ["assuntos"] as const,
  list: (projetoId: string) => ["assuntos", "list", projetoId] as const,
  detail: (id: string) => ["assuntos", "detail", id] as const,
};

export function useAssuntos(projetoId: string | undefined) {
  return useQuery({
    queryKey: assuntosKeys.list(projetoId ?? ""),
    queryFn: () => assuntosService.listar(projetoId!),
    enabled: Boolean(projetoId),
  });
}

export function useAssunto(id: string | undefined) {
  return useQuery({
    queryKey: assuntosKeys.detail(id ?? ""),
    queryFn: () => assuntosService.obter(id!),
    enabled: Boolean(id),
  });
}

export function useCriarAssunto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projetoId, input }: { projetoId: string; input: AssuntoInput }) =>
      assuntosService.criar(projetoId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assuntosKeys.all }),
  });
}

export function useAtualizarAssunto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AssuntoInput }) =>
      assuntosService.atualizar(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assuntosKeys.all }),
  });
}

export function useExcluirAssunto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assuntosService.excluir(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assuntosKeys.all }),
  });
}
