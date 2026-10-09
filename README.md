# Guarulhos Aberta (Portal Diretório Nacional)

Diretório local confiável, rápido e útil para moradores e empresas. Este produto está sendo validado com Guarulhos como cidade-piloto, mas com arquitetura dimensionada para as mais de 5.570 cidades brasileiras.

## Regras de Arquitetura

- **Roteamento Global**: `/estado/cidade/categoria/empresa`
- Todas as entidades estão vinculadas pelo ID do IBGE (estados e cidades).
- Não há limite no modelo (Guarulhos não é hardcoded).
- Tecnologias: Next.js (App Router), Tailwind CSS.

## Status do Projeto

- **Modelo Nacional**: 🟢 Roteamento Base estruturado, Mock IBGE (UFs/Cidades) configurado
- **Arquitetura Login/Cadastro**: 🟢 Módulos de autenticação implementados por tenant (`[estado]/[cidade]/empresas/...`) com design system
- **Vercel/GitHub Deploy**: 🔴 Não configurado (Aguardando autenticação git remota/vercel-cli)
- **Places API**: 🔴 Pendente `GOOGLE_MAPS_API_KEY` (usando mock por enquanto)

## Setup Local

```bash
npm install
npm run dev
```
## Progresso Atual (Cron)
- Adicionados os layouts base para as páginas de **Cidade (`[estado]/[cidade]`)** e **Listagem de Categoria (`[estado]/[cidade]/[categoria]`)**.
- Resolvidos os problemas de lint e adequadamente configurados para serem páginas baseadas em server-rendering/PPR.
- **Implementados:** `sitemap.ts`, `robots.ts`, Metadados dinâmicos e `JSON-LD Schema.org LocalBusiness` na página da empresa. Estrutura otimizada para SEO de cauda longa a nível nacional.
- **Formulário de Reivindicação/Correção:** Criada rota dinâmica `/correcao` aninhada com Server Actions e client state (`useActionState`) para gerenciamento de solicitações e ownership, acompanhando a direção de design (botões ação laranja, feedback visual).
- **Arquitetura de Login/Cadastro:** Criadas as páginas `/empresas/cadastro` e `/empresas/login` com Server Actions, tratamento de erros via `useActionState` e estilo consistente com o diretório de design. Os forms seguem o escopo de namespace geográfico `/[estado]/[cidade]`.
- Próximo passo sugerido: **Integração Google Places API** para auto-completar dados garantindo verificabilidade.
