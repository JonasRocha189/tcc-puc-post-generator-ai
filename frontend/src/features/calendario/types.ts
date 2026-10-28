import type { Rede, StatusPost } from "@/lib/dominio";

// Formato provisório; virá de GET /posts?de=…&ate=… (ver docs/api.md)
export type PostAgendado = {
  id: string;
  titulo: string;
  assunto: string;
  redes: Rede[];
  status: StatusPost;
  dataPrevista: string; // ISO
};
