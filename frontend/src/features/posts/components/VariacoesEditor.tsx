import ConfirmarExclusaoModal from "@/components/common/ConfirmarExclusaoModal";
import Portal from "@/components/common/Portal";
import { FormInput, FormTextArea } from "@/components/form/FormField";
import { useImagens } from "@/features/imagens/api";
import { useMetricas } from "@/features/metricas/api";
import { PlusIcon, TrashBinIcon } from "@/icons";
import { REDE_LABEL, type Rede } from "@/lib/dominio";
import { useFormat } from "@/lib/format";
import { cn } from "@/utils";
import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  contarCaracteres,
  LIMITE_CARACTERES,
  parseHashtags,
  REDES,
} from "../redes";
import type { PostFormValues } from "../schema";
import type { Post } from "../types";
import MidiaEMetricas from "./MidiaEMetricas";

/** Contador "123 / 280" da variação, em vermelho acima do limite. */
function Contador({ index, rede }: { index: number; rede: Rede }) {
  const { t } = useTranslation("app");
  const fmt = useFormat();
  const variacao = useWatch<PostFormValues, `variacoes.${number}`>({
    name: `variacoes.${index}`,
  });
  const total = contarCaracteres(
    variacao?.texto ?? "",
    parseHashtags(variacao?.hashtags ?? ""),
  );
  const limite = LIMITE_CARACTERES[rede];
  const excedeu = total > limite;

  return (
    <p
      aria-live="polite"
      className={cn(
        "text-theme-xs font-medium tabular-nums",
        excedeu ? "text-error-500" : "text-gray-500 dark:text-gray-400",
      )}
    >
      {t("posts.form.counter", {
        count: fmt.number(total),
        limit: fmt.number(limite),
      })}
    </p>
  );
}

/**
 * Detalhe do mestre-detalhe: uma aba por rede, com a variação do post
 * para aquela rede (no máximo uma por rede).
 */
export default function VariacoesEditor({ post }: { post?: Post }) {
  const { t } = useTranslation("app");
  const {
    control,
    register,
    formState: { errors, submitCount },
  } = useFormContext<PostFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variacoes",
  });
  const [ativa, setAtiva] = useState<Rede>(() => fields[0]?.rede ?? "linkedin");

  const indice = (rede: Rede) => fields.findIndex((f) => f.rede === rede);
  const index = indice(ativa);
  const variacaoErros = (i: number) => errors.variacoes?.[i];

  // Após um envio com erro numa aba que não está aberta, abre essa aba
  const [envioTratado, setEnvioTratado] = useState(submitCount);
  const redeComErro = REDES.find((r) => {
    const i = indice(r);
    return i >= 0 && Boolean(variacaoErros(i));
  });
  if (submitCount !== envioTratado && redeComErro) {
    setEnvioTratado(submitCount);
    if (!(index >= 0 && variacaoErros(index))) setAtiva(redeComErro);
  }

  const erro = (message: string | undefined, rede: Rede) =>
    message
      ? t(message, {
          limit: LIMITE_CARACTERES[rede],
          network: REDE_LABEL[rede],
        })
      : undefined;

  // Remover uma variação salva com imagens ou métricas apaga tudo ao salvar: pede confirmação
  const variacaoSalvaId = post?.variacoes.find((v) => v.rede === ativa)?.id;
  const imagensSalvas = useImagens(variacaoSalvaId);
  const metricasSalvas = useMetricas(variacaoSalvaId);
  const [confirmarRemocao, setConfirmarRemocao] = useState(false);
  const removerAtiva = () => {
    if (imagensSalvas.data?.length || metricasSalvas.data?.length)
      setConfirmarRemocao(true);
    else remove(index);
  };

  const adicionar = () => {
    // Mantém as variações na ordem das redes
    append({ rede: ativa, texto: "", hashtags: "" }, { shouldFocus: true });
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={t("posts.form.variations")}
        className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800"
      >
        {REDES.map((rede) => {
          const i = indice(rede);
          const temErro = i >= 0 && Boolean(variacaoErros(i));
          const selecionada = rede === ativa;
          return (
            <button
              key={rede}
              type="button"
              role="tab"
              id={`tab-${rede}`}
              aria-selected={selecionada}
              aria-controls={`painel-${rede}`}
              onClick={() => setAtiva(rede)}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                selecionada
                  ? "border-brand-500 text-brand-500 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
              )}
            >
              {REDE_LABEL[rede]}
              <span
                aria-hidden
                className={cn(
                  "size-2 rounded-full",
                  temErro
                    ? "bg-error-500"
                    : i >= 0
                      ? "bg-success-500"
                      : "bg-gray-300 dark:bg-gray-700",
                )}
              />
              <span className="sr-only">
                {temErro
                  ? t("posts.form.tabError")
                  : i >= 0
                    ? t("posts.form.tabFilled")
                    : t("posts.form.tabEmpty")}
              </span>
            </button>
          );
        })}
      </div>

      {errors.variacoes?.root?.message || errors.variacoes?.message ? (
        <p role="alert" className="mt-3 text-sm text-error-500">
          {t(
            errors.variacoes?.root?.message ?? errors.variacoes?.message ?? "",
          )}
        </p>
      ) : null}

      <div
        role="tabpanel"
        id={`painel-${ativa}`}
        aria-labelledby={`tab-${ativa}`}
        className="pt-5"
      >
        {index < 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("posts.form.noVariation", { network: REDE_LABEL[ativa] })}
            </p>
            <button
              type="button"
              onClick={adicionar}
              className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-brand-500 ring-1 ring-brand-200 ring-inset hover:bg-brand-50 dark:text-brand-400 dark:ring-brand-500/30 dark:hover:bg-brand-500/10"
            >
              <PlusIcon className="size-5" />
              {t("posts.form.addVariation", { network: REDE_LABEL[ativa] })}
            </button>
          </div>
        ) : (
          // key: troca os campos registrados ao mudar de aba
          <div key={fields[index].id} className="space-y-5">
            <div>
              <FormTextArea
                id={`variacao-${ativa}-texto`}
                label={t("posts.form.text")}
                placeholder={t("posts.form.textPlaceholder", {
                  network: REDE_LABEL[ativa],
                })}
                rows={8}
                required
                error={erro(variacaoErros(index)?.texto?.message, ativa)}
                {...register(`variacoes.${index}.texto`)}
              />
              <div className="mt-1.5 flex justify-end">
                <Contador index={index} rede={ativa} />
              </div>
            </div>
            <FormInput
              id={`variacao-${ativa}-hashtags`}
              label={t("posts.form.hashtags")}
              placeholder={t("posts.form.hashtagsPlaceholder")}
              hint={t("posts.form.hashtagsHint")}
              error={erro(variacaoErros(index)?.hashtags?.message, ativa)}
              {...register(`variacoes.${index}.hashtags`)}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={removerAtiva}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-400"
              >
                <TrashBinIcon className="size-4" />
                {t("posts.form.removeVariation", {
                  network: REDE_LABEL[ativa],
                })}
              </button>
            </div>
            <div className="border-t border-gray-200 pt-5 dark:border-gray-800">
              <MidiaEMetricas post={post} rede={ativa} />
            </div>
          </div>
        )}
      </div>

      {/* Fora do <form> do post (ver Portal) */}
      <Portal>
        <ConfirmarExclusaoModal
          isOpen={confirmarRemocao}
          title={t("posts.form.removeTitle", { network: REDE_LABEL[ativa] })}
          message={t("posts.form.removeMessage", {
            images: imagensSalvas.data?.length ?? 0,
            metrics: metricasSalvas.data?.length ?? 0,
          })}
          onConfirm={async () => {
            if (index >= 0) remove(index);
          }}
          onClose={() => setConfirmarRemocao(false)}
        />
      </Portal>
    </div>
  );
}
