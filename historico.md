# Histórico de Melhorias

Registro cronológico das auditorias e correções aplicadas ao **Guarulhos Aberta**.

Formato: seções por sessão, com o estado verificado antes/depois e as pendências
que permanecem abertas. Números de cobertura e contagem de testes são medidos,
não estimados.

---

## 2026-10-16 — Auditoria de engenharia + correção da rota `correcao`

Duas frentes: primeiro a auditoria de qualidade (testes, lint, formatação, CI),
depois a correção do defeito funcional mais grave encontrado — a rota de
correção de empresas, que **confirmava sucesso sem persistir nada**.

### Frente 1 — Auditoria de engenharia

**Estado inicial (medido):**

| Métrica                   | Antes       |
| ------------------------- | ----------- |
| Testes unitários passando | 42          |
| Cobertura de statements   | 57,7%       |
| Cobertura de linhas       | 52,5%       |
| Erros de ESLint           | 33          |
| Warnings de ESLint        | 8           |
| Pipeline de CI            | inexistente |

**Principais problemas encontrados:**

1. **33 erros de ESLint** — todos `@typescript-eslint/no-require-imports`: a
   camada legada (`api/`, `lib/`) usa CommonJS, mas o ESLint estava configurado
   como se fosse um projeto ESM puro. Ruído que mascara erros reais.
2. **Testes órfãos** — 13 arquivos em `test/` (Node.js puro, ~59 testes) não eram
   executados por `npm test`, que só rodava `src/__tests__`.
3. **Coberturazerada em código crítico** — `src/lib/catalog.ts` e
   `src/db/schema.ts` com 0%.
4. **Sem CI/CD** — nada impedia regressão de chegar ao `master`.
5. **Repositório poluído** — backups (`.bak`, `.bak2`), mockup de referência e
   dashboards standalone não integrados.

**Correções aplicadas:**

- Override de ESLint para a camada CommonJS (`api/`, `lib/`, `scripts/`,
  `test/`), com `sourceType: commonjs` e globals explícitos — sem desabilitar
  nenhuma regra de segurança.
- Removidos 7 imports não utilizados e 3 variáveis mortas.
- Excluídos do lint artefatos de build e catálogos gerados (`data/**`,
  `drizzle/meta/**`, `sitemap.xml`).
- `src/__tests__/catalog.test.ts` — 20 testes para o catálogo (filtro por
  localidade, por categoria, busca por slug, resumo por categoria, ordenação).
- `src/__tests__/schema.test.ts` — 34 testes sobre as 5 tabelas do schema Drizzle.
- `.github/workflows/ci.yml` — 4 jobs: `lint`, `typecheck`, `test`, `build`.
- `playwright.config.ts` + `@playwright/test` — E2E finalmente executável.
- Scripts novos: `test:legacy`, `test:e2e`, `test:all`.
- `coverageThreshold` no Jest (70% stmts / 60% branches / 70% funcs / 70% lines).
- Removidos: `index.html.bak`, `index.html.bak2`, `index.ohub.html`,
  `admin-dashboard.html`, `supplier-dashboard.html`, `claim.html`, `app.js`,
  `styles.css`.
- `.gitignore` cobrindo `.next/`, `coverage/`, `playwright-report/`,
  `test-results/`, `*.tsbuildinfo`.

**Estado final:**

| Métrica                   | Depois |
| ------------------------- | ------ |
| Testes unitários passando | 96     |
| Cobertura de statements   | 94,4%  |
| Cobertura de linhas       | 93,2%  |
| Erros de ESLint           | 0      |
| Warnings de ESLint        | 0      |

### Frente 2 — Defeito funcional: rota `correcao`

**Defeito crítico:** `submitCorrection` simulava 800ms de latência, verificava
apenas presença de campos, **descartava tudo** e retornava `success: true`
incondicional. O usuário via "Sucesso! Analisaremos os dados em até 48 horas" e
nada era gravado. Pior: um teste unitário **codificava esse comportamento
errado como esperado** (`success: true` sem persistência), e usava ainda um
valor de `tipo` (`correcao_dados`) que nem existia no formulário
(`corrigir_dados`) — foi assim que o defeito sobreviveu.

**Problemas adicionais na mesma rota:**

- O formulário não enviava identidade da empresa. A action não sabia qual
  empresa, município ou IBGE era alvo da solicitação.
- `page.tsx` derivava o nome da empresa do slug
  (`pizzaria-sabor-paulista` → `pizzaria sabor paulista`), ou seja, um palpite.
  Para um fluxo de verificação de propriedade, nome inventado é inutilizável.
- `generateMetadata` fixava "Guarulhos Aberta" no título, contradizendo a
  proposta de escala nacional.
- Só validava `estado.length !== 2`; `/sp/naoexiste/x/y/correcao` renderizava
  em vez de retornar 404.
- A página nunca verificava se a empresa existia no catálogo.

**Solução adotada** (reaproveitando o que já existia, sem duplicar lógica):
o pipeline correto já estava escrito e testado na camada legada
(`lib/claim_submission.js` com validação de CNPJ por dígito verificador,
padrões de e-mail/telefone, limites de tamanho, sanitização e verificação
IBGE; `lib/claim_store.js` com persistência _fail-closed_) — mas a rota Next.js
que o usuário acessava o ignorava por completo.

- `src/types/legacy.d.ts` — declarações de tipo para a camada CommonJS.
- `src/lib/claim.ts` — ponte tipada: mapeia os campos em português do
  formulário para o payload canônico e **normaliza erros em categorias
  acionáveis** (`validation` / `persistence` / `unexpected`).
- `correcao/actions.ts` — valida contexto e tipo, delega ao validador, persiste
  no Vercel KV e **falha explicitamente** quando a persistência falha.
- `correcao/page.tsx` — resolve cidade via `getCityBySlug` e empresa via
  `findCompany`, retorna `notFound()` para cidade ou empresa inexistente, e usa
  o nome real nos metadados.
- `correcao/CorrecaoForm.tsx` — campos ocultos com a identidade real da
  empresa, `maxLength`/`minLength` alinhados às restrições do validador,
  protocolo exibido ao usuário em caso de sucesso.

**Testes de regressão adicionados** (`src/__tests__/claim.test.ts` +
`actions.test.ts` reescrito):

- **Fail-closed**: com KV não configurado, a action **não** pode retornar
  sucesso — este é o teste que teria pegado o bug original.
- Mapeamento dos 3 tipos de solicitação.
- E-mail malformado, nome curto, descrição < 10 caracteres.
- Município IBGE inexistente rejeitado pelo validador.
- Sanitização de HTML em nome e descrição.

**Estado final:** 111 testes passando, cobertura 92,5% de statements.

### Ferramentas adicionadas

| Ferramenta               | Versão  | Papel                                                  |
| ------------------------ | ------- | ------------------------------------------------------ |
| `prettier`               | ^3.9.10 | formatação uniforme (`.prettierrc`, `.prettierignore`) |
| `eslint-plugin-security` | ^4.2.0  | análise estática de segurança                          |
| `@playwright/test`       | ^1.49.0 | testes E2E                                             |

Cabeçalhos de segurança adicionados em `next.config.ts` e `vercel.json`:
`X-Frame-Options: DENY`, `Strict-Transport-Security`, `Permissions-Policy` e
`Content-Security-Policy`.

---

## 2026-10-16 — Auditoria de segurança: autenticação e validação de CNPJ

Foco nos dois achados mais graves que restavam: uma **credencial de backdoor**
embutida no login e um **validador de CNPJ incorreto** em produção.

### 1. Credencial de backdoor removida

`src/app/[estado]/[cidade]/empresas/login/actions.ts` continha um par fixo no
código-fonte:

```js
if (email === 'teste@empresa.com' && senha === '123456') {
  return { success: true, error: null };
}
```

Pior no contexto: o `cadastro` **não criava conta alguma** (era um mock com
`setTimeout`), logo aquele par era a **única** forma possível de entrar. Não era
atalho de demonstração — era a única porta do sistema, publicada no repositório.

O `cadastro` também **validava quase nada**: aceitava qualquer string no campo
CNPJ (`'abc'` passava) e reportava "Conta criada com sucesso!" sem criar nada.

**Correções:**

- Backdoor removido. Sem backend de autenticação, o login agora falha com
  mensagem explícita.
- `src/lib/cadastro.ts` — validação real: CNPJ com dígito verificador, e-mail
  via `zod`, senha com mínimo de 8 caracteres exigindo letras **e** números,
  aceite dos termos.
- Cadastro valida com rigor e então **falha de forma explícita**, dizendo que
  nenhuma conta foi criada.
- `js/auth.js` removido. Era um mock de `localStorage` com token
  `'session_' + Date.now()` — forjável pelo console — e **nada no repositório o
  importava**.
- `LoginForm.tsx` e `CadastroForm.tsx` removidos. Ambos tinham links `#` mortos
  ("Esqueceu a senha", "Termos de Uso", "Política de Privacidade") e um form que
  nunca conseguiria autenticar ninguém.
- `/login` e `/empresas/cadastro` agora exibem aviso honesto e **apontam para o
  caminho que funciona**: a reivindicação de página de qualquer empresa.
- Metadados dessas rotas deixaram de fixar "Diretório Guarulhos Aberta" e passam
  a derivar o nome da cidade — correção da mesma falha de escala nacional tratada
  na rota `correcao`.

### 2. Bug de produção: `isValidCnpj` com pesos errados

A função derivava os pesos de `weight = length - 5`, produzindo a sequência
`7,6,5,4,3,2,9,8,7,6,5,4` em vez da oficial `5,4,3,2,9,8,7,6,5,4,3,2`
(Receita Federal).

**Impacto:** o validador era inconsistente — aceitava parte dos CNPJs válidos e
recusava o restante. Uma empresa que informasse um CNPJ legítimo tinha a
reivindicação **rejeitada com "CNPJ inválido"**. Como `validateAndProcessClaim`
trata o CNPJ como opcional (`if (payload.cnpj)`), o defeito atingia justamente as
empresas que forneciam o dado mais verificável.

O teste legado não detectou porque o fixture usado (`27.865.757/0001-02`) é um
dos CNPJs que o algoritmo quebrado **acerta por acaso**.

**Correção:** pesos oficiais declarados explicitamente (`CNPJ_WEIGHTS_FIRST`,
`CNPJ_WEIGHTS_SECOND`) e a função exportada para reaproveitamento pelo cadastro,
mantendo fonte única da verdade.

Verificado contra casos conhecidos:

| CNPJ                                  | Antes        | Agora    |
| ------------------------------------- | ------------ | -------- |
| `27.865.757/0001-02` (fixture legado) | aceito       | aceito   |
| `11.222.333/0001-81`                  | **recusado** | aceito   |
| `14.292.466/0001-12`                  | **recusado** | aceito   |
| `27.865.757/0001-03`                  | recusado     | recusado |
| `11111111111111`                      | recusado     | recusado |

### 3. Banco: conexão preguiçosa

`src/db/index.ts` chamava `neon(process.env.DATABASE_URL!)` **no import do
módulo**, com asserção não-nula. Qualquer rota que importasse `db` derrubaria em
tempo de execução sem a variável — incluindo `next build`, testes e previews.
`.env.local` contém hoje um valor inválido (`postgres://abc:123@localhost`), o
que tornava o risco real e não teórico.

Substituído por `getDb()` / `tryGetDb()` / `isDatabaseConfigured()`: o cliente só
é criado na primeira chamada, e a ausência da variável gera um erro que diz qual
falta.

### 4. Dependências órfãs removidas

Instalados numa rodada anterior sem um único import no código:
`isomorphic-dompurify`, `schema-dts`, `lucide-react`, `clsx`, `tailwind-merge`.
Removidos. `zod` foi mantido e passou a ter uso real em `src/lib/cadastro.ts`.

### 5. Pipeline de testes legados corrigido

Duas falhas que impediam os testes de rodarem de verdade:

- `npm run test:legacy` usava `node --test test/`, que o Node trata como caminho
  de módulo e falha com `MODULE_NOT_FOUND` — **nunca executou** os 107 testes.
  Corrigido para o glob `node --test "test/**/*.test.js"`.
- `test/accessibility.test.js` casava regex com HTML de formatação exata. O
  Prettier quebrou tags longas em várias linhas (`</label>` + quebra) e o teste
  passou a falhar por layout, não por acessibilidade. Normalizado o HTML antes
  das asserções.
- `.github/workflows/ci.yml` ganhou o job `test-legacy`, que antes não rodava no
  pipeline.

**Estado final:** 133 testes Jest + 107 legados, cobertura 94,4%, 0 erros de
ESLint, typecheck e build limpos.

---

## Pendências conhecidas

### Resolvidas nesta sessão

- Credencial de backdoor no login (`teste@empresa.com` / `123456`) — removida.
- `js/auth.js` (mock de `localStorage`, token forjável, sem referências) — removido.
- Cadastro que reportava sucesso sem criar conta — agora valida e falha explicitamente.
- `isValidCnpj` com pesos errados, rejeitando CNPJs legítimos — corrigido.
- `src/db/index.ts` conectando no import com asserção não-nula — agora preguiçoso.
- 5 dependências órfãs — removidas.
- `test:legacy` que nunca executou os testes — glob corrigido, 107 testes rodando.
- CI sem os testes legados — job `test-legacy` adicionado.

### Críticas

1. **Autenticação não existe (Fase 3 do ROADMAP, desmarcada).** Não há hashing de
   senha, nem sessão, nem armazenamento de credenciais. As rotas `/login` e
   `/empresas/cadastro` hoje falham de forma explícita, o que é honesto mas
   significa que **não existe painel para a empresa**. Para fechar a Fase 3 falta:
   hash de senha (argon2/bcrypt), cookie de sessão com expiração, verificação por
   e-mail, e migração de `claims` para a tabela `users`.

2. **`.env.local` contém `DATABASE_URL` inválido** (`postgres://abc:123@localhost`).
   Nada persiste no Neon. A tabela `claims` de `src/db/schema.ts` continua sem uso:
   as correções vão para o Vercel KV via `lib/claim_store.js`. Há dois modelos de
   persistência para o mesmo conceito e nenhum está documentado como oficial.

3. **Duas persistências concorrentes para `claims`:** KV (`lib/claim_store.js`,
   usada pela rota `correcao`) e a tabela `claims` do Postgres, nunca escrita.
   Escolher uma e remover a outra.

### Técnicas

4. **Homepage é um stub com links hardcoded** (`src/app/page.tsx`): aponta para
   `/sp/guarulhos/veiculos/oficina-centro`, `/rj/sao-goncalo/beleza/salao-das-flores`,
   `/sc/florianopolis/tecnologia/tech-solutions`. Provavelmente não existem no
   catálogo e retornam 404, enquanto o texto afirma "modelo para qualquer cidade do
   Brasil". Contradiz o requisito do ROADMAP de não codificar cidade como constante.

5. **`index.html` (homepage estática legada) segue no repositório** e é o alvo de
   `test/accessibility.test.js`. Não é servido pelo Next.js. Decidir entre remover
   ambos ou migrar o teste de acessibilidade para `src/app/page.tsx`.

6. **16 warnings de `security/detect-object-injection`** — acessos a `Map`/`Object`
   por chave dinâmica (`localities.js:22`, `osm_importer.js:277`,
   `claim_submission.js`, `scripts/sync_osm_companies.js:28`). Avaliados como falsos
   positivos: as chaves vêm de catálogo estático, não de entrada do usuário.
   Revisar caso dados duvidosos passem a chegar a esses pontos.

7. **Reformatação em massa do Prettier** — 67 arquivos reformatados. Consistente,
   mas é um diff grande para revisão. Isolar em commit próprio se o histórico
   importa.

8. **`schema-dts` removido** — o projeto gera JSON-LD em `lib/schema_generator.js`
   sem tipagem. Se quiser tipá-lo no futuro, reinstale e tipar
   `generateLocalBusinessSchema` e `generateBreadcrumbSchema`.

### Verificadas e não são problema

- **29 vulnerabilidades npm** — todas em `devDependencies` (`braces` via
  `eslint-config-next`, `esbuild` via `drizzle-kit`, `sprintf-js` via `ts-jest`).
  Nenhuma em dependências de produção. `npm audit fix --force` reverteria
  Next.js 16 para 14 e Jest 30 para 29 — não recomendado. Monitorar os pacotes pai.
- **Empacotamento do `claude-seo`** — ver auditoria abaixo.
