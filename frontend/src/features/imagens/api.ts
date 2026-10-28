import type { Progresso } from "@/lib/api/s3";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { imagensService } from "./service";

export const imagensKeys = {
  all: ["imagens"] as const,
  list: (variacaoId: string) => ["imagens", "list", variacaoId] as const,
};

export function useImagens(variacaoId: string | undefined) {
  return useQuery({
    queryKey: imagensKeys.list(variacaoId ?? ""),
    queryFn: () => imagensService.listar(variacaoId!),
    enabled: Boolean(variacaoId),
    // As URLs de leitura do S3 expiram em 15 minutos: busca de novo antes disso
    staleTime: 5 * 60_000,
    refetchInterval: 10 * 60_000,
  });
}

export function useEnviarImagem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      variacaoId,
      arquivo,
      onProgress,
    }: {
      variacaoId: string;
      arquivo: File;
      onProgress?: Progresso;
    }) => imagensService.enviar(variacaoId, arquivo, onProgress),
    onSuccess: (_, { variacaoId }) =>
      queryClient.invalidateQueries({ queryKey: imagensKeys.list(variacaoId) }),
  });
}

export function useExcluirImagem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => imagensService.excluir(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: imagensKeys.all }),
  });
}
