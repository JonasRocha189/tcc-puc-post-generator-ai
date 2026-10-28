import type { Rede, StatusPost } from "@/lib/dominio";
import { z } from "zod";
import {
  contarCaracteres,
  LIMITE_CARACTERES,
  parseHashtags,
  formatarHashtags,
  REDES,
} from "./redes";
import type { Post, PostInput } from "./types";

// As mensagens são chaves de tradução (namespace "app")

const STATUS: readonly StatusPost[] = ["rascunho", "aprovado", "publicado"];

const variacaoSchema = z
  .object({
    rede: z.enum(REDES as [Rede, ...Rede[]]),
    texto: z
      .string()
      .trim()
      .min(1, { message: "posts.form.errors.textRequired" }),
    hashtags: z.string(),
  })
  .superRefine((v, ctx) => {
    if (
      contarCaracteres(v.texto, parseHashtags(v.hashtags)) >
      LIMITE_CARACTERES[v.rede]
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["texto"],
        message: "posts.form.errors.tooLongForNetwork",
      });
    }
    if (parseHashtags(v.hashtags).length > 30) {
      ctx.addIssue({
        code: "custom",
        path: ["hashtags"],
        message: "posts.form.errors.tooManyHashtags",
      });
    }
  });

export const postFormSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, { message: "posts.form.errors.titleRequired" })
    .max(200, { message: "form.errors.tooLong" }),
  assunto_id: z
    .string()
    .min(1, { message: "posts.form.errors.subjectRequired" }),
  status: z.enum(STATUS as [StatusPost, ...StatusPost[]]),
  /** valor de <input type="datetime-local"> ou "" */
  data_prevista: z.string(),
  variacoes: z
    .array(variacaoSchema)
    .min(1, { message: "posts.form.errors.variationRequired" }),
});

export type PostFormValues = z.infer<typeof postFormSchema>;
export type VariacaoFormValues = PostFormValues["variacoes"][number];

// <input type="datetime-local"> trabalha com hora local, sem fuso: "2026-10-28T09:00"
function isoParaLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toPostInput(values: PostFormValues): PostInput {
  return {
    titulo: values.titulo,
    assunto_id: values.assunto_id,
    status: values.status,
    data_prevista: values.data_prevista
      ? new Date(values.data_prevista).toISOString()
      : null,
    variacoes: values.variacoes.map((v) => ({
      rede: v.rede,
      texto: v.texto.trim(),
      hashtags: parseHashtags(v.hashtags),
    })),
  };
}

export function toFormValues(post?: Post, assuntoPadrao = ""): PostFormValues {
  return {
    titulo: post?.titulo ?? "",
    assunto_id: post?.assunto_id ?? assuntoPadrao,
    status: post?.status ?? "rascunho",
    data_prevista: isoParaLocal(post?.data_prevista ?? null),
    variacoes: post?.variacoes
      .slice()
      .sort((a, b) => REDES.indexOf(a.rede) - REDES.indexOf(b.rede))
      .map((v) => ({
        rede: v.rede,
        texto: v.texto,
        hashtags: formatarHashtags(v.hashtags),
      })) ?? [{ rede: "linkedin", texto: "", hashtags: "" }],
  };
}
