import ConfirmarExclusaoModal from "@/components/common/ConfirmarExclusaoModal";
import Portal from "@/components/common/Portal";
import { Modal } from "@/components/ui/modal";
import { AiIcon, CloseIcon, TrashBinIcon, UploadIcon } from "@/icons";
import { useFormat } from "@/lib/format";
import { cn } from "@/utils";
import { useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { useEnviarImagem, useExcluirImagem, useImagens } from "../api";
import {
  ACCEPT,
  ASPECTO,
  MAXIMO_POR_VARIACAO,
  TAMANHO_MAXIMO,
} from "../arquivo";
import type { Imagem } from "../types";

type Envio = {
  chave: string;
  nome: string;
  progresso: number;
  erro: string | null;
};

/** Imagens de uma variação salva: miniaturas, envio direto para o S3 e exclusão. */
export default function ImagensVariacao({
  variacaoId,
}: {
  variacaoId: string;
}) {
  const { t } = useTranslation("app", { keyPrefix: "images" });
  const fmt = useFormat();
  const imagens = useImagens(variacaoId);
  const enviar = useEnviarImagem();
  const excluir = useExcluirImagem();
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [ampliada, setAmpliada] = useState<Imagem | null>(null);
  const [aExcluir, setAExcluir] = useState<Imagem | null>(null);

  const total = imagens.data?.length ?? 0;
  const enviando = envios.filter((e) => !e.erro).length;
  const vagas = Math.max(0, MAXIMO_POR_VARIACAO - total - enviando);
  const maxMb = fmt.number(TAMANHO_MAXIMO / 1024 / 1024);

  const atualizar = (chave: string, mudanca: Partial<Envio>) =>
    setEnvios((atual) =>
      atual.map((e) => (e.chave === chave ? { ...e, ...mudanca } : e)),
    );
  const remover = (chave: string) =>
    setEnvios((atual) => atual.filter((e) => e.chave !== chave));

  const motivo = (codigo: string | undefined) => {
    if (codigo === "file-too-large") return t("tooLarge", { max: maxMb });
    if (codigo === "file-invalid-type") return t("invalidType");
    if (codigo === "too-many-files")
      return t("tooMany", { max: MAXIMO_POR_VARIACAO });
    return t("failed");
  };

  const onDrop = (aceitos: File[], rejeitados: FileRejection[]) => {
    // Acima do limite, os arquivos que sobram viram rejeitados
    const cabem = aceitos.slice(0, vagas);
    const sobram = aceitos
      .slice(vagas)
      .map((file) => ({ nome: file.name, codigo: "too-many-files" }));
    const novos: Envio[] = [
      ...cabem.map((f) => ({
        chave: crypto.randomUUID(),
        nome: f.name,
        progresso: 0,
        erro: null,
      })),
      ...[
        ...rejeitados.map((r) => ({
          nome: r.file.name,
          codigo: r.errors[0]?.code,
        })),
        ...sobram,
      ].map((r) => ({
        chave: crypto.randomUUID(),
        nome: r.nome,
        progresso: 0,
        erro: motivo(r.codigo),
      })),
    ];
    setEnvios((atual) => [...atual, ...novos]);

    cabem.forEach((arquivo, i) => {
      const { chave } = novos[i];
      enviar.mutate(
        {
          variacaoId,
          arquivo,
          onProgress: (p) => atualizar(chave, { progresso: p }),
        },
        {
          onSuccess: () => remover(chave),
          onError: () => atualizar(chave, { erro: t("failed") }),
        },
      );
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxSize: TAMANHO_MAXIMO,
    multiple: true,
    disabled: vagas === 0,
  });

  if (imagens.isError) {
    return (
      <p role="alert" className="text-sm text-error-600 dark:text-error-400">
        {t("loadError")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {imagens.isLoading &&
          [0, 1].map((i) => (
            <li
              key={i}
              aria-hidden
              className="aspect-square animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
            />
          ))}

        {imagens.data?.map((imagem, i) => (
          <li key={imagem.id} className="group relative">
            <button
              type="button"
              onClick={() => setAmpliada(imagem)}
              aria-label={t("open", { n: i + 1 })}
              className={cn(
                "block w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900",
                ASPECTO[imagem.formato],
              )}
            >
              <img
                src={imagem.url}
                alt=""
                loading="lazy"
                className="size-full object-cover"
              />
            </button>
            <div className="pointer-events-none absolute inset-x-2 top-2 flex items-start justify-between gap-2">
              <span className="rounded-md bg-gray-900/70 px-1.5 py-0.5 text-theme-xs font-medium text-white">
                {imagem.formato}
              </span>
              {imagem.prompt && (
                <span
                  title={t("generated")}
                  className="flex size-6 items-center justify-center rounded-md bg-brand-500 text-white"
                >
                  <AiIcon className="size-4" />
                  <span className="sr-only">{t("generated")}</span>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setAExcluir(imagem)}
              aria-label={t("deleteLabel", { n: i + 1 })}
              className="absolute end-2 bottom-2 flex size-8 items-center justify-center rounded-lg bg-white/90 text-gray-600 shadow-theme-xs hover:text-error-500 dark:bg-gray-900/90 dark:text-gray-300"
            >
              <TrashBinIcon className="size-4" />
            </button>
          </li>
        ))}

        {vagas > 0 && (
          <li>
            <div
              {...getRootProps({
                className: cn(
                  "flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-3 text-center transition-colors",
                  isDragActive
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                    : "border-gray-300 hover:border-brand-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-brand-800 dark:hover:bg-white/3",
                ),
              })}
            >
              <input {...getInputProps({ "aria-label": t("inputLabel") })} />
              <UploadIcon className="mb-2 size-6 text-gray-500 dark:text-gray-400" />
              <span className="text-theme-xs font-medium text-gray-700 dark:text-gray-300">
                {isDragActive ? t("drop") : t("add")}
              </span>
              <span className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
                {t("hint", { max: maxMb })}
              </span>
            </div>
          </li>
        )}
      </ul>

      {!imagens.isLoading && total === 0 && envios.length === 0 && (
        <p className="text-theme-xs text-gray-500 dark:text-gray-400">
          {t("empty")}
        </p>
      )}

      {envios.length > 0 && (
        <ul className="space-y-2" aria-live="polite">
          {envios.map((envio) => (
            <li
              key={envio.chave}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-2.5",
                envio.erro
                  ? "border-error-200 bg-error-50 dark:border-error-500/30 dark:bg-error-500/10"
                  : "border-gray-200 dark:border-gray-800",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-800 dark:text-white/90">
                  {envio.nome}
                </p>
                {envio.erro ? (
                  <p className="text-theme-xs text-error-600 dark:text-error-400">
                    {envio.erro}
                  </p>
                ) : (
                  <div
                    className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
                    role="progressbar"
                    aria-label={t("progress", { name: envio.nome })}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(envio.progresso * 100)}
                  >
                    <div
                      className="h-full rounded-full bg-brand-500 transition-[width]"
                      style={{ width: `${Math.round(envio.progresso * 100)}%` }}
                    />
                  </div>
                )}
              </div>
              {envio.erro && (
                <button
                  type="button"
                  onClick={() => remover(envio.chave)}
                  aria-label={t("dismiss")}
                  className="flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-white dark:text-gray-400 dark:hover:bg-white/5"
                >
                  <CloseIcon className="size-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Modais fora do <form> do post (ver Portal) */}
      <Portal>
        <Modal
          isOpen={Boolean(ampliada)}
          onClose={() => setAmpliada(null)}
          className="m-4 max-w-[720px] p-4 sm:p-6"
        >
          {ampliada && (
            <figure>
              <img
                src={ampliada.url}
                alt={ampliada.prompt ?? t("uploaded")}
                className="mx-auto max-h-[70vh] rounded-xl object-contain"
              />
              <figcaption className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {ampliada.prompt ? t("generated") : t("uploaded")} ·{" "}
                  {ampliada.formato}
                </p>
                {ampliada.prompt && (
                  <p>
                    <span className="font-medium">{t("prompt")}:</span>{" "}
                    {ampliada.prompt}
                  </p>
                )}
              </figcaption>
            </figure>
          )}
        </Modal>

        <ConfirmarExclusaoModal
          isOpen={Boolean(aExcluir)}
          title={t("deleteTitle")}
          message={t("deleteMessage")}
          onConfirm={() => excluir.mutateAsync(aExcluir!.id)}
          onClose={() => setAExcluir(null)}
        />
      </Portal>
    </div>
  );
}
