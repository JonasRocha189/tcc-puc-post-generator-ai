import { alertErrorClass, cardClass, secondaryLinkClass } from "@/components/common/styles";
import { FormInput, FormSelect } from "@/components/form/FormField";
import Button from "@/components/ui/button/Button";
import type { Assunto } from "@/features/assuntos/types";
import type { StatusPost } from "@/lib/dominio";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { postFormSchema, type PostFormValues } from "../schema";
import VariacoesEditor from "./VariacoesEditor";

const STATUS: StatusPost[] = ["rascunho", "aprovado", "publicado"];

/** Mestre-detalhe: dados do post (mestre) e variações por rede (detalhe). */
export default function PostForm({
  assuntos,
  defaultValues,
  onSubmit,
  submitLabel,
  submitError,
}: {
  assuntos: Assunto[];
  defaultValues: PostFormValues;
  onSubmit: (values: PostFormValues) => Promise<unknown>;
  submitLabel: string;
  submitError?: string | null;
}) {
  const { t } = useTranslation("app");
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues,
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const erro = (message?: string) => (message ? t(message, { max: 200 }) : undefined);

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Mestre */}
        <section className={`${cardClass} p-5 sm:p-6`}>
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("posts.form.postSection")}
          </h3>
          <div className="space-y-5">
            <FormInput
              id="post-titulo"
              label={t("posts.form.title")}
              placeholder={t("posts.form.titlePlaceholder")}
              hint={t("posts.form.titleHint")}
              required
              autoFocus
              maxLength={200}
              error={erro(errors.titulo?.message)}
              {...register("titulo")}
            />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <FormSelect
                id="post-assunto"
                label={t("posts.form.subject")}
                required
                error={erro(errors.assunto_id?.message)}
                {...register("assunto_id")}
              >
                <option value="">{t("posts.form.subjectPlaceholder")}</option>
                {assuntos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </FormSelect>
              <FormSelect
                id="post-status"
                label={t("posts.form.status")}
                hint={t("posts.form.statusHint")}
                {...register("status")}
              >
                {STATUS.map((s) => (
                  <option key={s} value={s}>
                    {t(`domain.postStatus.${s}`)}
                  </option>
                ))}
              </FormSelect>
              <FormInput
                id="post-data"
                type="datetime-local"
                label={t("posts.form.scheduledFor")}
                {...register("data_prevista")}
              />
            </div>
          </div>
        </section>

        {/* Detalhe */}
        <section className={`${cardClass} p-5 sm:p-6`}>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("posts.form.variations")}
          </h3>
          <p className="mt-1 mb-4 text-sm text-gray-500 dark:text-gray-400">
            {t("posts.form.variationsHint")}
          </p>
          <VariacoesEditor />
        </section>

        {submitError && (
          <p role="alert" className={alertErrorClass}>
            {submitError}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link to="/posts" className={secondaryLinkClass}>
            {t("form.cancel")}
          </Link>
          <Button disabled={isSubmitting} className="sm:min-w-36">
            {isSubmitting ? t("form.saving") : submitLabel}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
