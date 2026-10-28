import { z } from "zod";
import type { Metrica, MetricaInput } from "./types";

// As mensagens são chaves de tradução (namespace "app")

const contagem = z
  .number({ error: "metrics.errors.number" })
  .int({ message: "metrics.errors.integer" })
  .min(0, { message: "metrics.errors.negative" })
  .max(1_000_000_000, { message: "metrics.errors.tooBig" });

/** Tolerância para o relógio do navegador estar um pouco adiantado. */
const FOLGA_MS = 5 * 60_000;

export const metricaFormSchema = z
  .object({
    /** valores de <input type="datetime-local"> */
    publicado_em: z
      .string()
      .min(1, { message: "metrics.errors.publishedRequired" }),
    coletado_em: z
      .string()
      .min(1, { message: "metrics.errors.collectedRequired" }),
    impressoes: contagem,
    curtidas: contagem,
    comentarios: contagem,
    compartilhamentos: contagem,
    cliques: contagem,
  })
  .superRefine((v, ctx) => {
    const limite = Date.now() + FOLGA_MS;
    const publicado = new Date(v.publicado_em).getTime();
    const coletado = new Date(v.coletado_em).getTime();
    if (v.publicado_em && publicado > limite) {
      ctx.addIssue({
        code: "custom",
        path: ["publicado_em"],
        message: "metrics.errors.future",
      });
    }
    if (v.coletado_em && coletado > limite) {
      ctx.addIssue({
        code: "custom",
        path: ["coletado_em"],
        message: "metrics.errors.future",
      });
    } else if (v.publicado_em && v.coletado_em && coletado < publicado) {
      ctx.addIssue({
        code: "custom",
        path: ["coletado_em"],
        message: "metrics.errors.beforePublished",
      });
    }
  });

export type MetricaFormValues = z.infer<typeof metricaFormSchema>;

// <input type="datetime-local"> trabalha com hora local, sem fuso: "2026-10-28T09:00"
function isoParaLocal(valor: string | Date): string {
  const d = new Date(valor);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Valores iniciais: a publicação vem do último registro ou da data prevista
 * do post (se já passou); os números partem do último registro, pois são
 * totais acumulados.
 */
export function valoresIniciais(
  ultima: Metrica | undefined,
  dataPrevista: string | null,
): MetricaFormValues {
  const publicado = ultima?.publicado_em ?? dataPrevista;
  return {
    publicado_em:
      publicado && new Date(publicado).getTime() <= Date.now()
        ? isoParaLocal(publicado)
        : "",
    coletado_em: isoParaLocal(new Date()),
    impressoes: ultima?.impressoes ?? 0,
    curtidas: ultima?.curtidas ?? 0,
    comentarios: ultima?.comentarios ?? 0,
    compartilhamentos: ultima?.compartilhamentos ?? 0,
    cliques: ultima?.cliques ?? 0,
  };
}

export function toMetricaInput(v: MetricaFormValues): MetricaInput {
  return {
    ...v,
    publicado_em: new Date(v.publicado_em).toISOString(),
    coletado_em: new Date(v.coletado_em).toISOString(),
  };
}
