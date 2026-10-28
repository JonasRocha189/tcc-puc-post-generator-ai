import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import { useAssunto, useAssuntos } from "@/features/assuntos/api";
import { useAtualizarPost, useCriarPost, usePost } from "@/features/posts/api";
import PostForm from "@/features/posts/components/PostForm";
import { toFormValues, toPostInput, type PostFormValues } from "@/features/posts/schema";
import { useProjetoAtual } from "@/features/projetos/useProjetoAtual";
import { ApiError } from "@/lib/api/http";
import NotFound from "@/pages/OtherPage/NotFound";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router";

/** /posts/novo (sem id) e /posts/:id (edição): tela mestre-detalhe. */
export default function PostFormPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { t } = useTranslation("app", { keyPrefix: "posts" });
  const navigate = useNavigate();
  const { projetoAtual } = useProjetoAtual();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEdicao = Boolean(id);
  const post = usePost(id);
  // Na edição, os assuntos oferecidos são os do projeto do post
  const assuntoDoPost = useAssunto(post.data?.assunto_id);
  const projetoId = isEdicao ? assuntoDoPost.data?.projeto_id : projetoAtual?.id;
  const assuntos = useAssuntos(projetoId);

  const criar = useCriarPost();
  const atualizar = useAtualizarPost();
  const titulo = isEdicao ? t("editTitle") : t("newTitle");

  const onSubmit = async (values: PostFormValues) => {
    setSubmitError(null);
    try {
      if (id) await atualizar.mutateAsync({ id, input: toPostInput(values) });
      else await criar.mutateAsync(toPostInput(values));
      navigate("/posts");
    } catch {
      setSubmitError(t("saveError"));
    }
  };

  if (isEdicao && post.error instanceof ApiError && post.error.status === 404) {
    return <NotFound />;
  }

  const carregando = (isEdicao && (post.isLoading || assuntoDoPost.isLoading)) || assuntos.isLoading || !assuntos.data;
  const erro = (isEdicao && post.isError) || assuntos.isError;
  // ?assunto=… pré-seleciona o assunto (ex.: vindo da lista filtrada)
  const assuntoPadrao = params.get("assunto") ?? "";

  return (
    <>
      <PageMeta title={`${titulo} | PostPilot`} description={t("subtitle")} />
      <PageBreadcrumb pageTitle={titulo} />

      <div className="mx-auto max-w-4xl">
        {erro ? (
          <p role="alert" className="text-sm text-error-600">
            {t("loadError")}
          </p>
        ) : carregando ? (
          <div className="space-y-6" aria-hidden>
            <div className="h-56 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
            <div className="h-80 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
          </div>
        ) : (
          <PostForm
            key={post.data?.id ?? "novo"}
            assuntos={assuntos.data ?? []}
            defaultValues={toFormValues(post.data, assuntoPadrao)}
            onSubmit={onSubmit}
            submitLabel={isEdicao ? t("save") : t("create")}
            submitError={submitError}
          />
        )}
      </div>
    </>
  );
}
