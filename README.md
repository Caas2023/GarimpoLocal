# Diretório Nacional de Dados Abertos (Piloto: Guarulhos)

Portal de dados abertos municipais para diretórios empresariais, desenvolvido com arquitetura nacional escalável (piloto em Guarulhos).

- **Princípio Nacional**: Estrutura escalável para ~5.570 cidades usando IDs IBGE e rotas dinâmicas.
- **Tecnologia**: Next.js, TypeScript, Tailwind.
- **Status**: Fase 1 — Escala e Piloto.
- **Testes**: Unitários (Jest) implementados para lib `ibge` e schema local.

## Roadmap (Atualizado em 2026-10-11)
- [x] Criação da estrutura base
- [x] Testes unitários para lógica de localidade (lib IBGE)
- [ ] Testes E2E (Playwright)
- [ ] Deploy Vercel (CI/CD)
