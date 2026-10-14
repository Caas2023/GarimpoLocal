# Diretório Nacional de Dados Abertos (Piloto: Guarulhos)

Portal de dados abertos municipais para diretórios empresariais, desenvolvido com arquitetura nacional escalável (piloto em Guarulhos).

- **Princípio Nacional**: Estrutura escalável para ~5.570 cidades usando IDs IBGE e rotas dinâmicas (`/[estado]/[cidade]/[categoria]/[empresa]`).
- **Tecnologia**: Next.js, TypeScript, Tailwind, Drizzle ORM, Jest.
- **Status**: Fase 2 — Produção, Testes e Build Verificados.
- **Testes**: Unitários (Jest) 36/36 aprovados (IBGE + Google Places API wrapper); Build Next.js 100% verificado (12 rotas).

## Roadmap (Atualizado em 2026-10-13)
- [x] Criação da estrutura base e arquitetura nacional
- [x] Testes unitários para lógica de localidade e wrapper Places API (36 testes)
- [x] Testes E2E (Playwright) / Build TypeScript & Next.js verificado
- [x] Vercel build & production verification
- [x] SEO, schema.org local business, sitemap dinâmico
