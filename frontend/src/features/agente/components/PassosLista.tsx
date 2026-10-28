import { CheckLineIcon, CloseIcon } from "@/icons";
import { useFormat } from "@/lib/format";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";
import type { PassoAgente } from "../types";

/**
 * Passos de uma execução, em ordem. Com `detalhado`, mostra também
 * o nome técnico da tool e os argumentos (tela de detalhe).
 */
export default function PassosLista({
  passos,
  executando = false,
  detalhado = false,
}: {
  passos: PassoAgente[];
  executando?: boolean;
  detalhado?: boolean;
}) {
  const { t, i18n } = useTranslation("app", { keyPrefix: "agent" });
  const fmt = useFormat();

  const rotulo = (tool: string) =>
    i18n.exists(`app:agent.tools.${tool}`) ? t(`tools.${tool}`) : tool;

  const duracao = (ms: number | null) =>
    ms === null ? "" : ms < 1000 ? `${fmt.number(ms)} ms` : `${fmt.number(Math.round(ms / 100) / 10)} s`;

  return (
    <ol className="space-y-3">
      {passos.map((passo) => (
        <li key={passo.id} className="flex gap-3">
          <span
            aria-hidden
            className={cn(
              "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
              passo.erro
                ? "bg-error-50 text-error-500 dark:bg-error-500/15"
                : "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
            )}
          >
            {passo.erro ? <CloseIcon className="size-3.5" /> : <CheckLineIcon className="size-3.5" />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                <span className="sr-only">{t("stepNumber", { n: passo.ordem })}: </span>
                {rotulo(passo.tool)}
                {detalhado && (
                  <code className="ms-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-normal text-gray-600 dark:bg-white/5 dark:text-gray-400">
                    {passo.tool}
                  </code>
                )}
              </p>
              <span className="text-theme-xs text-gray-400 tabular-nums">{duracao(passo.duracao_ms)}</span>
            </div>
            {passo.erro ? (
              <p className="mt-0.5 text-sm text-error-600 dark:text-error-400">{passo.erro}</p>
            ) : (
              passo.resultado_resumo && (
                <p className="mt-0.5 text-sm break-words text-gray-500 dark:text-gray-400">
                  {passo.resultado_resumo}
                </p>
              )
            )}
            {detalhado && Object.keys(passo.argumentos).length > 0 && (
              <details className="mt-1.5">
                <summary className="cursor-pointer text-theme-xs text-brand-500 dark:text-brand-400">
                  {t("arguments")}
                </summary>
                <pre className="custom-scrollbar mt-1.5 overflow-x-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-700 dark:bg-white/3 dark:text-gray-300">
                  {JSON.stringify(passo.argumentos, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </li>
      ))}

      {executando && (
        <li className="flex items-center gap-3" role="status">
          <span className="flex size-6 shrink-0 items-center justify-center">
            <span className="size-4 animate-spin rounded-full border-2 border-gray-200 border-t-brand-500 dark:border-gray-700 dark:border-t-brand-400" />
          </span>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("thinking")}</p>
        </li>
      )}
    </ol>
  );
}
