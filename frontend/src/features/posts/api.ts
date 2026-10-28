import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { postsService } from "./service";
import type { PostFiltros, PostInput } from "./types";

export const postsKeys = {
  all: ["posts"] as const,
  list: (projetoId: string, filtros: PostFiltros) =>
    ["posts", "list", projetoId, filtros] as const,
  detail: (id: string) => ["posts", "detail", id] as const,
};

export function usePosts(projetoId: string | undefined, filtros: PostFiltros = {}) {
  return useQuery({
    queryKey: postsKeys.list(projetoId ?? "", filtros),
    queryFn: () => postsService.listar(projetoId!, filtros),
    enabled: Boolean(projetoId),
  });
}

export function usePost(id: string | undefined) {
  return useQuery({
    queryKey: postsKeys.detail(id ?? ""),
    queryFn: () => postsService.obter(id!),
    enabled: Boolean(id),
  });
}

export function useCriarPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PostInput) => postsService.criar(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postsKeys.all }),
  });
}

export function useAtualizarPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PostInput }) =>
      postsService.atualizar(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postsKeys.all }),
  });
}

export function useExcluirPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postsService.excluir(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postsKeys.all }),
  });
}
