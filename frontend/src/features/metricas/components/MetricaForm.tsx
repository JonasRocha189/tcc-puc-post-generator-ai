import { alertErrorClass } from "@/components/common/styles";
import { FormInput } from "@/components/form/FormField";
import Button from "@/components/ui/button/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { metricaFormSchema, type MetricaFormValues } from "../schema";
import { CAMPOS_NUMERICOS } from "../types";

/**
 * Formulário de registro de métricas, aberto num modal (via Portal) de
 * dentro do formulário do post: o submit não pode subir até o form de fora.
 */
export default function MetricaForm({
  defaultValues,
  onSubmit,
  onCancel,
}: {
  defaultValues: MetricaFormValues;
  onSubmit: (values: MetricaFormValues) => Promise<unknown>;
  onCancel: () => void;
}) {
  const { t } = useTranslation("app");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MetricaFormValues>({
    resolver: zodResolver(metricaFormSchema),
    defaultValues,
  });

  const erro = (message?: string) => (message ? t(message) : undefined);

  const salvar = async (values: MetricaFormValues) => {
    setSubmitError(null);
    try {
      await onSubmit(values);
    } catch {
      setSubmitError(t("metrics.saveError"));
    }
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.stopPropagation();
        void handleSubmit(salvar)(e);
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput
          id="metrica-publicado-em"
          type="datetime-local"
          label={t("metrics.publishedAt")}
          required
          error={erro(errors.publicado_em?.message)}
          {...register("publicado_em")}
        />
        <FormInput
          id="metrica-coletado-em"
          type="datetime-local"
          label={t("metrics.collectedAt")}
          hint={t("metrics.collectedAtHint")}
          required
          error={erro(errors.coletado_em?.message)}
          {...register("coletado_em")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {CAMPOS_NUMERICOS.map((campo) => (
          <FormInput
            key={campo}
            id={`metrica-${campo}`}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            label={t(`metrics.fields.${campo}`)}
            error={erro(errors[campo]?.message)}
            {...register(campo, { valueAsNumber: true })}
          />
        ))}
      </div>

      <p className="text-theme-xs text-gray-500 dark:text-gray-400">
        {t("metrics.totalsHint")}
      </p>

      {submitError && (
        <p role="alert" className={alertErrorClass}>
          {submitError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          {t("form.cancel")}
        </Button>
        <Button size="sm" disabled={isSubmitting}>
          {isSubmitting ? t("form.saving") : t("metrics.save")}
        </Button>
      </div>
    </form>
  );
}
