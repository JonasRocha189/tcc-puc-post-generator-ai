import { z } from "zod";
import type { Projeto, ProjetoInput } from "./types";

// As mensagens são chaves de tradução (namespace "app"), traduzidas no formulário
const textoOpcional = (max: number) =>
  z.string().trim().max(max, { message: "projects.form.errors.tooLong" });

export const projetoFormSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, { message: "projects.form.errors.nameRequired" })
    .max(100, { message: "projects.form.errors.tooLong" }),
  descricao: textoOpcional(500),
  publico_alvo: textoOpcional(500),
  tom_de_voz: textoOpcional(500),
});

export type ProjetoFormValues = z.infer<typeof projetoFormSchema>;

export const LIMITES: Record<keyof ProjetoFormValues, number> = {
  nome: 100,
  descricao: 500,
  publico_alvo: 500,
  tom_de_voz: 500,
};

const vazioParaNull = (valor: string) => (valor === "" ? null : valor);

export function toProjetoInput(values: ProjetoFormValues): ProjetoInput {
  return {
    nome: values.nome,
    descricao: vazioParaNull(values.descricao),
    publico_alvo: vazioParaNull(values.publico_alvo),
    tom_de_voz: vazioParaNull(values.tom_de_voz),
  };
}

export function toFormValues(projeto?: Projeto): ProjetoFormValues {
  return {
    nome: projeto?.nome ?? "",
    descricao: projeto?.descricao ?? "",
    publico_alvo: projeto?.publico_alvo ?? "",
    tom_de_voz: projeto?.tom_de_voz ?? "",
  };
}
