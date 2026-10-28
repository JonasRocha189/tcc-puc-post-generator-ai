import type { ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renderiza fora da árvore do DOM atual (no <body>). Usado por modais
 * abertos de dentro de um <form>: no DOM eles não ficam aninhados ao
 * formulário, então botões e formulários do modal não enviam o de fora.
 * Atenção: eventos do React ainda sobem pela árvore de componentes, por
 * isso um <form> dentro do modal deve chamar `e.stopPropagation()` no submit.
 */
export default function Portal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}
