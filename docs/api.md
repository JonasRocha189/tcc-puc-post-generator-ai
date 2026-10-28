# API

> Status: **planejada**. A referência oficial é o OpenAPI gerado pelo FastAPI em `/api/docs`. Mantenha esta tabela alinhada a ela.

- Prefixo: `/api/v1`
- Autenticação: `Authorization: Bearer <JWT do Auth0>` em todas as rotas, exceto `/health`
- Erros: `{"detail": ...}`
- Um usuário nunca acessa dados de outro. Recursos de outro usuário retornam `404`.
- **Escopo por projeto:** as listagens marcadas com 🅿 exigem `?projeto_id=…`, e as criações recebem `projeto_id` no corpo. O backend confere se o projeto pertence ao usuário do token (senão, `404`). O frontend envia o projeto selecionado no cabeçalho da tela.

## Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/health` | Verificação de saúde (sem autenticação) |
| **Projetos** | | |
| GET | `/projetos` | Lista os projetos do usuário |
| POST | `/projetos` | Cria |
| GET | `/projetos/{id}` | Detalha |
| PUT | `/projetos/{id}` | Atualiza |
| DELETE | `/projetos/{id}` | Remove. `409` se ainda tiver assuntos ou documentos |
| **Assuntos** | | |
| GET | `/assuntos` 🅿 | Lista os assuntos do projeto |
| POST | `/assuntos` | Cria (com `projeto_id`) |
| GET | `/assuntos/{id}` | Detalha |
| PUT | `/assuntos/{id}` | Atualiza |
| DELETE | `/assuntos/{id}` | Remove. `409` se ainda tiver posts |
| **Posts (mestre-detalhe)** | | |
| GET | `/posts` 🅿 | Lista os posts do projeto (via assunto), já com as variações, ordenados pela `data_prevista` (mais recentes primeiro). Filtros: `assunto_id`, `status` e período (`?de=AAAA-MM-DD&ate=AAAA-MM-DD`, usado pelo calendário) |
| POST | `/posts` | Cria o post com suas variações (corpo abaixo). `422` se o assunto não for de um projeto do usuário |
| GET | `/posts/{id}` | Detalha o post com variações e imagens |
| PUT | `/posts/{id}` | Atualiza o post e **substitui** todas as variações pelas enviadas (a que não vier é removida) |
| DELETE | `/posts/{id}` | Remove o post e suas variações |
| **Imagens** | | |
| POST | `/variacoes/{id}/imagens/upload-url` | URL pré-assinada para enviar uma imagem |
| GET | `/imagens/{id}/url` | URL pré-assinada de leitura |
| DELETE | `/imagens/{id}` | Remove |
| **Métricas e relatório** | | |
| GET | `/variacoes/{id}/metricas` | Lista métricas da variação |
| POST | `/variacoes/{id}/metricas` | Registra métricas |
| GET | `/relatorio/desempenho` 🅿 | Agregados do projeto por assunto, rede, dia, horário e imagem |
| **Documentos** | | |
| GET | `/documentos` 🅿 | Lista os documentos do projeto (mais recentes primeiro), com status de processamento |
| POST | `/documentos/upload-url` | Corpo `{projeto_id, nome, tipo, tamanho_bytes}`. Valida tipo (`pdf`, `docx`, `txt`) e tamanho (até 10 MB), cria o Documento como `pendente` e responde `{documento, upload_url}`. A URL pré-assinada exige o `Content-Type` do tipo |
| POST | `/documentos/{id}/processar` | Avisa que o upload terminou: muda para `processando` e processa em segundo plano (extração, chunking, embeddings). Responde o Documento |
| DELETE | `/documentos/{id}` | Remove o documento, o objeto S3 e os chunks |
| **Agente** | | |
| POST | `/agente/execucoes` | Corpo `{projeto_id, modo, pedido}`. Cria a execução e **responde `202` na hora** com `status: "executando"`; o loop roda em segundo plano |
| GET | `/agente/execucoes` 🅿 | Histórico de execuções do projeto (mais recentes primeiro) |
| GET | `/agente/execucoes/{id}` | Execução com os passos gravados até o momento. O frontend consulta a cada ~0,7 s enquanto `status = "executando"` para mostrar os passos ao vivo |

## Corpo de `POST /posts` e `PUT /posts/{id}`

```json
{
  "assunto_id": "uuid",
  "titulo": "5 erros ao migrar para a nuvem",
  "status": "rascunho",
  "data_prevista": "2026-11-03T12:00:00.000Z",
  "variacoes": [
    { "rede": "linkedin", "texto": "…", "hashtags": ["nuvem", "pme"] },
    { "rede": "x", "texto": "…", "hashtags": ["nuvem"] }
  ]
}
```

- No máximo uma variação por rede (`linkedin`, `instagram`, `x`) e pelo menos uma.
- `hashtags` sem o `#`. O backend calcula `contagem_caracteres` do texto final (texto, linha em branco e hashtags com `#`) e responde `422` se passar do limite da rede: LinkedIn 3000, Instagram 2200, X 280. O frontend usa a mesma regra (`features/posts/redes.ts`).

## Resposta de `GET /agente/execucoes/{id}`

```json
{
  "id": "uuid",
  "projeto_id": "uuid",
  "modo": "criacao",
  "pedido": "Post sobre o checklist de segurança",
  "status": "concluida",
  "resposta": "Pronto! Escrevi o post…",
  "post_id": "uuid",
  "iteracoes": 7,
  "iniciada_em": "2026-10-27T22:51:00Z",
  "finalizada_em": "2026-10-27T22:51:05Z",
  "passos": [
    {
      "id": "uuid",
      "ordem": 1,
      "tool": "buscar_documentos",
      "argumentos": { "query": "checklist de segurança" },
      "resultado_resumo": "4 trechos relevantes de auditoria.pdf",
      "duracao_ms": 380,
      "erro": null
    }
  ]
}
```

- `status`: `executando`, `concluida`, `erro` (uma tool falhou e o agente parou) ou `limite_atingido` (8 iterações sem resposta final).
- `resultado_resumo` é um texto curto para a tela; o resultado completo da tool fica só no banco e nos logs.
- `iteracoes` conta as voltas do loop: várias tools pedidas pelo LLM na mesma resposta contam como uma.
- `post_id` é preenchido quando o agente salva um rascunho (modo criação).
