# Changelog

Funcionalidades entregues, da mais recente para a mais antiga. Atualize a cada push de funcionalidade nova, junto com os documentos afetados em [`docs/`](README.md).

Formato de cada entrada:

```
## AAAA-MM-DD
### Adicionado | Alterado | Corrigido | Removido
- Descrição curta (commit ou PR)
```

---

## 2026-10-27

### Adicionado

- Frontend: template TailAdmin em `frontend/`, com erros de lint corrigidos e dependências sem vulnerabilidades.
- Frontend: autenticação com Auth0 (`/login`, `/cadastro`, rotas protegidas, sair) e usuário fictício em desenvolvimento.
- Frontend: páginas `/dashboard` (resumo de posts, desempenho por rede, assunto, dia e horário, próximos posts e execuções do agente, com dados de exemplo), `/perfil` (dados do usuário e alteração de senha), `/erro` e 404 em português.
- Frontend: rotas carregadas sob demanda e marca PostPilot no lugar da TailAdmin.
- Frontend: interface em português e inglês, com seletor de idioma no cabeçalho (no lugar das notificações) e nas telas de login e cadastro.
- Frontend: página `/calendario` com os posts pela data prevista, cor por status e modal de detalhes (dados de exemplo).

- Documentação técnica em `docs/`: arquitetura C4, modelo de dados, agente e RAG, API, implantação, registro de decisões e este changelog.

### Alterado

- Frontend passa a usar o template TailAdmin no lugar de shadcn/ui (ver [decisão 8](decisoes.md)).

## Versão inicial

### Adicionado

- README com visão geral, requisitos do TCC e plano de entregas.
- CLAUDE.md com stack, convenções e ordem de corte.
