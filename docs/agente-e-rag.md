# Agente e RAG

> Status: **planejado**.

## Loop do agente

Implementado manualmente sobre o tool calling do SDK do provedor, **sem LangChain nem LlamaIndex** (ver [decisões](decisoes.md)).

```mermaid
sequenceDiagram
    actor U as Usuário
    participant API as Backend
    participant A as Loop do agente
    participant LLM as LLMProvider
    participant T as Tools
    participant DB as PostgreSQL

    U->>API: Pedido + modo + projeto_id
    API->>DB: Confere se o projeto é do usuário e cria ExecucaoAgente
    API->>A: Executa com usuario_id (token) e projeto_id
    loop até responder ou 8 iterações
        A->>LLM: Mensagens + schema das tools
        alt LLM pede tool
            LLM-->>A: tool + argumentos
            A->>T: Executa (usuario_id e projeto_id injetados)
            T-->>A: Resultado
            A->>DB: Grava PassoAgente
        else LLM responde
            LLM-->>A: Resposta final
        end
    end
    A->>DB: Finaliza ExecucaoAgente
    API-->>U: Resposta + passos executados
```

- **Máximo de 8 iterações.** Ao atingir o limite, a execução termina e o usuário é avisado.
- **Prompts de sistema** separados por modo em `app/ai/agent/prompts/`.
- **Segurança:** o `usuario_id` e o `projeto_id` são injetados pelo backend em toda tool. Eles não aparecem no schema que o LLM vê: o agente só enxerga os dados do projeto em que foi chamado, e os documentos de um cliente nunca entram nos posts de outro.
- **Voz da marca:** o público-alvo e o tom de voz vêm do assunto; quando o assunto não define, valem os do projeto.
- **Rastreabilidade:** cada passo (tool, argumentos, duração, erro) vira log estruturado e registro em `PassoAgente`.

## Modos

| Modo | Objetivo | Tools mais usadas |
| --- | --- | --- |
| Ideação | Sugerir temas | `pesquisar_web`, `buscar_posts_anteriores`, `analisar_desempenho`, `listar_assuntos` |
| Criação | Escrever o post completo | `obter_assunto`, `buscar_documentos`, `buscar_posts_anteriores`, `adaptar_para_rede`, `gerar_imagem`, `salvar_rascunho` |

## Tools

Uma por arquivo em `app/ai/tools/`, com schema de entrada em Pydantic.

| Tool | O que faz |
| --- | --- |
| `pesquisar_web(query)` | Busca no Tavily ou Brave, sempre retornando as fontes |
| `obter_projeto()` | Dados do projeto atual: nome, descrição, público-alvo e tom de voz padrão |
| `listar_assuntos()` | Lista os assuntos do projeto |
| `obter_assunto(id)` | Detalhes do assunto, com público-alvo e tom de voz já resolvidos (do assunto ou, se vazios, do projeto) |
| `buscar_documentos(query)` | RAG híbrido nos documentos do projeto |
| `buscar_posts_anteriores(assunto)` | Exemplos de estilo do projeto, só de posts aprovados ou publicados |
| `analisar_desempenho()` | Agregados do projeto por assunto, dia, horário, rede e imagem. Com menos de 5 posts no grupo, informa que os dados são insuficientes |
| `adaptar_para_rede(texto, rede)` | Ajusta formato e limite de caracteres da rede |
| `gerar_imagem(prompt, formato)` | Gera imagem sem texto dentro dela e salva no S3 |
| `salvar_rascunho(post)` | Salva o post com status `rascunho` (único status que o agente pode usar) |

## Provedores

O agente depende apenas das interfaces abaixo. As implementações ficam em `app/ai/providers/`.

| Interface | Responsabilidade |
| --- | --- |
| `LLMProvider` | Chat com tool calling (provedor **a definir**) |
| `EmbeddingProvider` | Vetores para chunks e consultas |
| `ImageProvider` | Geração de imagem |
| `VectorStore` | Busca híbrida (implementação: `PgVectorStore`) |

## Pipeline de documentos (RAG)

```mermaid
sequenceDiagram
    actor U as Navegador
    participant API as Backend
    participant S3 as AWS S3
    participant E as EmbeddingProvider
    participant DB as PostgreSQL

    U->>API: Pede URL de upload (nome, tipo, tamanho)
    API->>API: Valida tipo (PDF, DOCX, TXT) e tamanho
    API->>DB: Cria Documento (pendente)
    API-->>U: URL pré-assinada
    U->>S3: PUT do arquivo
    U->>API: Upload concluído
    API->>DB: Status processando
    API->>S3: Baixa o arquivo
    API->>API: Extrai texto (pypdf, python-docx) e faz chunking
    API->>E: Gera embeddings
    API->>DB: Grava Chunks e status pronto (ou erro)
```

## Busca híbrida

`buscar_documentos` combina:

1. **Similaridade vetorial** (pgvector, índice HNSW) sobre o embedding da consulta.
2. **Full-text** (`tsvector` em português) sobre o conteúdo.

Os dois rankings são combinados em uma lista única, por exemplo com Reciprocal Rank Fusion. A consulta **sempre** filtra por `usuario_id` e `projeto_id` (via `Documento`).

## Testes

LLM, embeddings, imagem e busca web são **sempre mockados**, com respostas gravadas e determinísticas. Nenhum teste chama API paga ou depende de rede externa.
