# Modelo de dados

> Status: **planejado**. Toda mudança de modelo vem com migration Alembic revisada à mão. Atualize este diagrama junto.

Todas as entidades do usuário têm `usuario_id` (o `sub` do Auth0), `criado_em` e `atualizado_em`. Todas as consultas filtram por `usuario_id`.

## Diagrama de classes

```mermaid
classDiagram
    direction LR

    class Assunto {
        +UUID id
        +str usuario_id
        +str nome
        +str descricao
        +str publico_alvo
        +str tom_de_voz
    }

    class Post {
        +UUID id
        +str usuario_id
        +UUID assunto_id
        +str titulo
        +StatusPost status
        +date data_prevista
    }

    class VariacaoPost {
        +UUID id
        +UUID post_id
        +Rede rede
        +str texto
        +list~str~ hashtags
        +int contagem_caracteres
    }

    class Imagem {
        +UUID id
        +UUID variacao_id
        +str chave_s3
        +str prompt
        +str formato
    }

    class Metrica {
        +UUID id
        +UUID variacao_id
        +datetime publicado_em
        +int impressoes
        +int curtidas
        +int comentarios
        +int compartilhamentos
        +int cliques
        +datetime coletado_em
    }

    class Documento {
        +UUID id
        +str usuario_id
        +str nome
        +str chave_s3
        +str tipo
        +StatusDocumento status
    }

    class Chunk {
        +UUID id
        +UUID documento_id
        +str conteudo
        +vector embedding
        +tsvector busca_texto
    }

    class ExecucaoAgente {
        +UUID id
        +str usuario_id
        +ModoAgente modo
        +str pedido
        +str resposta
        +int iteracoes
        +str status
    }

    class PassoAgente {
        +UUID id
        +UUID execucao_id
        +int ordem
        +str tool
        +json argumentos
        +json resultado
        +int duracao_ms
        +str erro
    }

    class StatusPost {
        <<enumeration>>
        rascunho
        aprovado
        publicado
    }

    class Rede {
        <<enumeration>>
        linkedin
        instagram
        x
    }

    class StatusDocumento {
        <<enumeration>>
        pendente
        processando
        pronto
        erro
    }

    class ModoAgente {
        <<enumeration>>
        ideacao
        criacao
    }

    Assunto "1" --> "*" Post
    Post "1" *-- "*" VariacaoPost : mestre-detalhe
    VariacaoPost "1" *-- "*" Imagem
    VariacaoPost "1" *-- "*" Metrica
    Documento "1" *-- "*" Chunk : ON DELETE CASCADE
    ExecucaoAgente "1" *-- "*" PassoAgente
```

## Regras

| Entidade | Regra |
| --- | --- |
| Assunto | CRUD completo (requisito do TCC). |
| Post | CRUD completo. O agente só cria com status `rascunho`; aprovar e publicar é ação do usuário. |
| VariacaoPost | Editada na mesma tela do Post (mestre-detalhe, requisito do TCC). No máximo uma variação por rede em cada post. |
| Imagem | Guarda só a chave S3 (ex.: `usuarios/{id}/posts/{id}/{uuid}.png`), nunca a URL. |
| Metrica | Registrada manualmente pelo usuário depois de publicar. |
| Documento | O status acompanha o processamento: `pendente` → `processando` → `pronto` ou `erro`. |
| Chunk | Apagado em cascata com o Documento. A dimensão do `embedding` vem da configuração; trocar o modelo de embeddings exige reprocessar tudo. Índices: HNSW no `embedding` e GIN no `tsvector`. |
| PassoAgente | Um registro por tool chamada, exibido na tela da execução. |
