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
| GET | `/documentos` 🅿 | Lista os documentos do projeto, com status de processamento |
| POST | `/documentos/upload-url` | Valida tipo e tamanho e devolve URL pré-assinada (com `projeto_id`) |
| POST | `/documentos/{id}/processar` | Avisa que o upload terminou e dispara o processamento |
| DELETE | `/documentos/{id}` | Remove o documento, o objeto S3 e os chunks |
| **Agente** | | |
| POST | `/agente/execucoes` | Executa o agente no projeto (`projeto_id`, `modo`: `ideacao` ou `criacao`) |
| GET | `/agente/execucoes` 🅿 | Histórico de execuções do projeto |
| GET | `/agente/execucoes/{id}` | Execução com seus passos |

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
