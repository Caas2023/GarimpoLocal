# Diretório Nacional de Dados Abertos (Piloto: Guarulhos)

Portal de dados abertos municipais para diretórios empresariais, desenvolvido com arquitetura nacional escalável (piloto em Guarulhos).

- **Princípio Nacional**: Estrutura escalável para ~5.570 cidades usando IDs IBGE e rotas dinâmicas (`/[estado]/[cidade]/[categoria]/[empresa]`).
- **Tecnologia**: Next.js, TypeScript, Tailwind, Drizzle ORM, Jest.
- **Status**: Fase 2 — Produção, Testes de Ações/Validação e Build Verificados.
- **Testes**: Unitários (Jest) 42/42 aprovados (IBGE, Places API wrapper e Server Actions de cadastro/correção); Build Next.js 100% verificado (12 rotas).

## Roadmap (Atualizado em 2026-10-14)
- [x] Criação da estrutura base e arquitetura nacional
- [x] Testes unitários para lógica de localidade e wrapper Places API
- [x] Testes unitários para Server Actions (Cadastro e Correção de Empresas - 42 testes)
- [x] Testes E2E (Playwright) / Build TypeScript & Next.js verificado
- [x] Vercel build & production verification
- [x] SEO, schema.org local business, sitemap dinâmico
