import ImagensVariacao from "@/features/imagens/components/ImagensVariacao";
import MetricasVariacao from "@/features/metricas/components/MetricasVariacao";
import { InfoIcon } from "@/icons";
import { REDE_LABEL, type Rede } from "@/lib/dominio";
import { useTranslation } from "react-i18next";
import type { Post } from "../types";

/**
 * Imagens e métricas da variação aberta na aba. Dependem da variação já
 * salva (têm `variacao_id`) e são gravadas na hora, sem o "Salvar" do post.
 */
export default function MidiaEMetricas({
  post,
  rede,
}: {
  post?: Post;
  rede: Rede;
}) {
  const { t } = useTranslation("app", { keyPrefix: "posts.form" });
  const variacao = post?.variacoes.find((v) => v.rede === rede);

  if (!post || !variacao) {
    return (
      <p className="flex items-start gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:bg-white/3 dark:text-gray-400">
        <InfoIcon className="mt-0.5 size-4 shrink-0" />
        {t("saveFirst", { network: REDE_LABEL[rede] })}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-theme-xs text-gray-500 dark:text-gray-400">
        {t("savedImmediately")}
      </p>
      <section aria-labelledby={`imagens-${rede}`}>
        <h4
          id={`imagens-${rede}`}
          className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90"
        >
          {t("images")}
        </h4>
        <ImagensVariacao variacaoId={variacao.id} />
      </section>
      <section aria-labelledby={`metricas-${rede}`}>
        <h4
          id={`metricas-${rede}`}
          className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90"
        >
          {t("metrics")}
        </h4>
        <MetricasVariacao
          variacaoId={variacao.id}
          publicado={post.status === "publicado"}
          dataPrevista={post.data_prevista}
        />
      </section>
    </div>
  );
}
