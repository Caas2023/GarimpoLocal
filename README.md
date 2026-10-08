# Guarulhos Aberta (Portal Diretório Nacional)

Diretório local confiável, rápido e útil para moradores e empresas. Este produto está sendo validado com Guarulhos como cidade-piloto, mas com arquitetura dimensionada para as mais de 5.570 cidades brasileiras.

## Regras de Arquitetura

- **Roteamento Global**: `/estado/cidade/categoria/empresa`
- Todas as entidades estão vinculadas pelo ID do IBGE (estados e cidades).
- Não há limite no modelo (Guarulhos não é hardcoded).
- Tecnologias: Next.js (App Router), Tailwind CSS.

## Status do Projeto

- **Modelo Nacional**: 🟢 Roteamento Base estruturado
- **Vercel/GitHub Deploy**: 🔴 Não configurado (Aguardando autenticação git remota/vercel-cli)
- **Places API**: 🔴 Pendente `GOOGLE_MAPS_API_KEY` (usando mock por enquanto)

## Setup Local

```bash
npm install
npm run dev
```