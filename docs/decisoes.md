# Registro de decisões

Cada decisão de arquitetura com o motivo. Ao mudar uma decisão, não apague a antiga: marque como **substituída** e adicione a nova.

| # | Data | Decisão | Motivo | Status |
| --- | --- | --- | --- | --- |
| 1 | 2026-10 | Loop do agente manual com tool calling do SDK, sem LangChain ou LlamaIndex | Objetivo de aprendizado e controle total do loop, dos logs e do limite de iterações | Aceita |
| 2 | 2026-10 | pgvector no próprio PostgreSQL, sem banco vetorial separado | Uma única base para dados e vetores, menos infraestrutura e custo; atende ao volume do projeto | Aceita |
| 3 | 2026-10 | Busca híbrida (vetorial + full-text) | Full-text acerta nomes e termos exatos que a busca vetorial pode perder | Aceita |
| 4 | 2026-10 | Provedor de LLM atrás de interfaces (`LLMProvider` etc.) | Provedor ainda não decidido; permite trocar sem mexer no agente e mockar nos testes | Aceita (provedor a definir) |
| 5 | 2026-10 | Auth0 para autenticação | Atende ao requisito de OAuth e ao ciclo de vida do usuário (cadastro, troca de senha) sem implementar isso do zero | Aceita |
| 6 | 2026-10 | Upload direto do navegador para o S3 com URL pré-assinada | Backend sem estado e sem tráfego de arquivos grandes | Aceita |
| 7 | 2026-10 | k3s em VPS própria, em vez de Kubernetes gerenciado | Custo fixo baixo; ainda demonstra Kubernetes, Helm e IaC | Aceita |
| 8 | 2026-10-27 | Template **TailAdmin** (versão gratuita, React + Tailwind) no frontend, no lugar de shadcn/ui | Layout de admin pronto, responsivo e na mesma stack (React, TypeScript, Tailwind, Vite), o que economiza tempo diante do prazo. Usar só os componentes do TailAdmin, sem misturar com shadcn/ui | Aceita |
| 9 | 2026-10-27 | Biblioteca de gráficos: a que já vem no TailAdmin (ApexCharts, via `react-apexcharts`), no lugar de Recharts | Evita duas bibliotecas de gráficos | Aceita |
| 10 | 2026-10-27 | Relatório de desempenho dentro do `/dashboard`, sem rota `/relatorio` | Menos telas para construir no prazo; o usuário vê as métricas logo ao entrar | Aceita (por enquanto) |
| 11 | 2026-10-27 | Auth0 no frontend com `@auth0/auth0-react`, refresh tokens e cache no `localStorage` | Mantém a sessão ao recarregar a página sem depender de cookies de terceiros (bloqueados pelos navegadores). Contrapartida: o token fica acessível a scripts da página, então é preciso evitar XSS | Aceita |
| 12 | 2026-10-27 | Usuário fictício quando o Auth0 não está configurado, só em `npm run dev` | Permite desenvolver as telas antes de criar o tenant. `import.meta.env.DEV` é falso no build, então o modo não existe em produção | Aceita |
| 13 | 2026-10-27 | Interface em português (padrão) e inglês com i18next, que já vinha no template | Projeto de portfólio para público internacional. Idioma detectado pelo navegador e salvo no `localStorage`. Textos do PostPilot no namespace `app`; páginas de demonstração do template ficam só em inglês | Aceita |
