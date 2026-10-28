import { FormInput, FormTextArea } from "@/components/form/FormField";
import { alertErrorClass, secondaryLinkClass } from "@/components/common/styles";
import Button from "@/components/ui/button/Button";
import type { Projeto } from "@/features/projetos/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { assuntoFormSchema, LIMITES, type AssuntoFormValues } from "../schema";

export default function AssuntoForm({
  projeto,
  defaultValues,
  onSubmit,
  submitLabel,
  submitError,
}: {
  /** Projeto do assunto: mostra a voz herdada quando os campos ficam vazios */
  projeto: Projeto;
  defaultValues: AssuntoFormValues;
  onSubmit: (values: AssuntoFormValues) => Promise<unknown>;
  submitLabel: string;
  submitError?: string | null;
}) {
  const { t } = useTranslation("app");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AssuntoFormValues>({
    resolver: zodResolver(assuntoFormSchema),
    defaultValues,
  });

  const erro = (campo: keyof AssuntoFormValues) => {
    const message = errors[campo]?.message;
    return message ? t(message, { max: LIMITES[campo] }) : undefined;
  };

  const herdado = (valor: string | null) =>
    valor
      ? t("subjects.form.inherits", { value: valor })
      : t("subjects.form.inheritsNothing");

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <FormInput
        id="assunto-nome"
        label={t("subjects.form.name")}
        placeholder={t("subjects.form.namePlaceholder")}
        required
        autoFocus
        maxLength={LIMITES.nome}
        error={erro("nome")}
        {...register("nome")}
      />
      <FormTextArea
        id="assunto-descricao"
        label={t("subjects.form.description")}
        placeholder={t("subjects.form.descriptionPlaceholder")}
        error={erro("descricao")}
        {...register("descricao")}
      />

      <fieldset className="space-y-6 rounded-xl border border-gray-200 p-4 sm:p-5 dark:border-gray-800">
        <legend className="px-1 text-sm font-semibold text-gray-800 dark:text-white/90">
          {t("subjects.form.voiceSection")}
        </legend>
        <p className="-mt-2 text-sm text-gray-500 dark:text-gray-400">
          {t("subjects.form.voiceHint", { project: projeto.nome })}
        </p>
        <FormTextArea
          id="assunto-publico"
          label={t("projects.form.audience")}
          placeholder={projeto.publico_alvo ?? t("projects.form.audiencePlaceholder")}
          rows={2}
          hint={herdado(projeto.publico_alvo)}
          error={erro("publico_alvo")}
          {...register("publico_alvo")}
        />
        <FormTextArea
          id="assunto-tom"
          label={t("projects.form.tone")}
          placeholder={projeto.tom_de_voz ?? t("projects.form.tonePlaceholder")}
          rows={2}
          hint={herdado(projeto.tom_de_voz)}
          error={erro("tom_de_voz")}
          {...register("tom_de_voz")}
        />
      </fieldset>

      {submitError && (
        <p role="alert" className={alertErrorClass}>
          {submitError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link to="/assuntos" className={secondaryLinkClass}>
          {t("form.cancel")}
        </Link>
        <Button disabled={isSubmitting} className="sm:min-w-36">
          {isSubmitting ? t("form.saving") : submitLabel}
        </Button>
      </div>
    </form>
  );
}
