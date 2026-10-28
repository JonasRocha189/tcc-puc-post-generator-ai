# API

> Status: **planejada**. A referência oficial é o OpenAPI gerado pelo FastAPI em `/api/docs`. Mantenha esta tabela alinhada a ela.

- Prefixo: `/api/v1`
- Autenticação: `Authorization: Bearer <JWT do Auth0>` em todas as rotas, exceto `/health`
- Erros: `{"detail": ...}`
- Um usuário nunca acessa dados de outro. Recursos de outro usuário retornam `404`.

## Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/health` | Verificação de saúde (sem autenticação) |
| **Assuntos** | | |
| GET | `/assuntos` | Lista |
| POST | `/assuntos` | Cria |
| GET | `/assuntos/{id}` | Detalha |
| PUT | `/assuntos/{id}` | Atualiza |
| DELETE | `/assuntos/{id}` | Remove |
| **Posts (mestre-detalhe)** | | |
| GET | `/posts` | Lista, com filtros por assunto, status e período da `data_prevista` (`?de=AAAA-MM-DD&ate=AAAA-MM-DD`, usado pelo calendário) |
| POST | `/posts` | Cria o post com suas variações |
| GET | `/posts/{id}` | Detalha o post com variações e imagens |
| PUT | `/posts/{id}` | Atualiza o post e suas variações |
| DELETE | `/posts/{id}` | Remove o post e suas variações |
| **Imagens** | | |
| POST | `/variacoes/{id}/imagens/upload-url` | URL pré-assinada para enviar uma imagem |
| GET | `/imagens/{id}/url` | URL pré-assinada de leitura |
| DELETE | `/imagens/{id}` | Remove |
| **Métricas e relatório** | | |
| GET | `/variacoes/{id}/metricas` | Lista métricas da variação |
| POST | `/variacoes/{id}/metricas` | Registra métricas |
| GET | `/relatorio/desempenho` | Agregados por assunto, rede, dia, horário e imagem |
| **Documentos** | | |
| GET | `/documentos` | Lista com status de processamento |
| POST | `/documentos/upload-url` | Valida tipo e tamanho e devolve URL pré-assinada |
| POST | `/documentos/{id}/processar` | Avisa que o upload terminou e dispara o processamento |
| DELETE | `/documentos/{id}` | Remove o documento, o objeto S3 e os chunks |
| **Agente** | | |
| POST | `/agente/execucoes` | Executa o agente (`modo`: `ideacao` ou `criacao`) |
| GET | `/agente/execucoes` | Histórico de execuções |
| GET | `/agente/execucoes/{id}` | Execução com seus passos |
