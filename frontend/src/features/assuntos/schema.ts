import { z } from "zod";
import type { Assunto, AssuntoInput } from "./types";

// As mensagens são chaves de tradução (namespace "app")
const textoOpcional = (max: number) =>
  z.string().trim().max(max, { message: "form.errors.tooLong" });

export const assuntoFormSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, { message: "subjects.form.errors.nameRequired" })
    .max(100, { message: "form.errors.tooLong" }),
  descricao: textoOpcional(500),
  publico_alvo: textoOpcional(500),
  tom_de_voz: textoOpcional(500),
});

export type AssuntoFormValues = z.infer<typeof assuntoFormSchema>;

export const LIMITES: Record<keyof AssuntoFormValues, number> = {
  nome: 100,
  descricao: 500,
  publico_alvo: 500,
  tom_de_voz: 500,
};

const vazioParaNull = (valor: string) => (valor === "" ? null : valor);

export function toAssuntoInput(values: AssuntoFormValues): AssuntoInput {
  return {
    nome: values.nome,
    descricao: vazioParaNull(values.descricao),
    publico_alvo: vazioParaNull(values.publico_alvo),
    tom_de_voz: vazioParaNull(values.tom_de_voz),
  };
}

export function toFormValues(assunto?: Assunto): AssuntoFormValues {
  return {
    nome: assunto?.nome ?? "",
    descricao: assunto?.descricao ?? "",
    publico_alvo: assunto?.publico_alvo ?? "",
    tom_de_voz: assunto?.tom_de_voz ?? "",
  };
}
