# CLAUDE.md — Cap Soleil Lawn Tennis Club

Regras para qualquer sessão do Claude neste repositório, seja do Ramon ou do Felipe.
Os detalhes estão em [docs/como-trabalhamos.md](docs/como-trabalhamos.md).
**Esta regra é lei no projeto:** GitHub e Google Drive sempre atualizados e organizados.

## A lei: documentação sempre em dia

- **Mudou o site** (`src/`, `public/`, `supabase/`, `astro.config.mjs`, `package.json`, `tsconfig.json` ou `vercel.json`)? Atualize a documentação **no mesmo PR**: `README.md`, este arquivo ou `docs/`. Para saber qual, use a tabela “Se mudou isto, atualize aquilo” em [docs/como-trabalhamos.md](docs/como-trabalhamos.md#se-mudou-isto-atualize-aquilo).
- **Mudou um arquivo em `docs/`?** Atualize a linha `**Atualizado em:** AAAA-MM-DD` dele. Se conferiu o documento contra a fonte no Drive, atualize também `**Sincronizado com o Drive em:**` e a tabela de sincronização de `como-trabalhamos.md`.
- **Mudou uma cor** (`:root` em `src/styles/tokens.css`), **uma fonte** (`@fontsource` em `src/layouts/Base.astro`) **ou o céu** (`PALETTES` em `src/lib/sun.ts`)? Atualize [docs/identidade-visual.md › No site](docs/identidade-visual.md#no-site).
- **Antes de cada commit,** rode `python3 scripts/check_docs.py`. Ele precisa passar. Antes do PR, rode também `npm run verify` (tipos, testes, build e testes no navegador).
- **No fim de toda tarefa,** diga ao usuário exatamente o que muda no Google Drive: qual documento, qual trecho e o novo texto. Se houver conector do Google Docs ou do Drive e o usuário pedir, faça a atualização, leia o arquivo de novo para conferir e nunca crie um arquivo duplicado no lugar de editar.
- **Onde mora cada coisa:** marca, história e identidade visual têm o Drive como fonte, e o GitHub espelha. Site, código e status técnico têm o GitHub como fonte, e o Drive resume. A tabela completa está em [como-trabalhamos.md](docs/como-trabalhamos.md#onde-mora-cada-coisa).

## Fluxo de trabalho (dois sócios ao mesmo tempo)

- Nunca faça commit direto na `main`. Uma tarefa = uma branch = um PR. Antes de começar, atualize a partir da `main`.
- Faça PRs pequenos e só faça merge com a verificação **Documentação em dia** verde.
- Nunca reescreva o histórico da `main` e nunca use force push nela.
- Em conflito de merge, traga a `main` para a branch e não descarte o trabalho do outro sócio. Na dúvida, pergunte.

## Regras da marca

- Textos do site em **inglês**. README, docs e comentários de configuração em **português**.
- **Nunca** escreva data de fundação (“Est. 1954”, “Established”, “Founded in”). Uma época (“1950s Riviera”) pode.
- Tom calmo e curto, sem linguagem de venda (nada de “shop now”, “sale” ou urgência). A loja se chama **Pro Shop**. Use o checklist em [docs/marca.md](docs/marca.md#checklist-para-qualquer-texto-novo).
- Identidade visual em [docs/identidade-visual.md](docs/identidade-visual.md). Emblema: azul-marinho `#1F2A44`, dourado `#B89B5E` e creme `#F4EFE6`. As cores do site estão nos tokens de `src/styles/tokens.css`.
- Os textos do site ficam em `src/content/site.ts`. O conceito é *Le Club suit le soleil* (o céu segue o sol real do Cap d’Antibes); a proposta completa está no Drive.

## Técnico

- Site em **Astro** (estático), TypeScript, sem framework de interface. Rodar: `npm ci` e `npm run dev` (http://localhost:4321). Testes: `npm run verify`.
- O site **não fala com o banco**: o formulário manda para a Edge Function `apply` (`supabase/functions/apply`), que valida, limita tentativas e grava no esquema `club` com a chave secreta. As regras da candidatura ficam em `supabase/functions/_shared/lead.ts` e valem para o site e para a função.
- **Nunca** coloque a secret key, a service_role ou a secret key do Turnstile no código, nos docs ou no Drive. O site não tem chave nenhuma.
- `supabase/migrations/*.sql` é o **histórico do que já foi aplicado** no banco: **não rode de novo**. Mudança no banco = migration nova, aplicada uma vez e registrada em [docs/site-e-acessos.md](docs/site-e-acessos.md#banco-de-dados).
- Mudou a função? Publique de novo (`npx supabase functions deploy apply --project-ref anlniqjoaogsuptuvrtk`; o `config.toml` mantém `verify_jwt = false`).
- A CSP (`public/_headers` e, durante a transição, `vercel.json`, que precisam ser iguais) bloqueia scripts e estilos inline. O Astro está configurado para gerar tudo como arquivo; não use `define:vars`, `style="…"` no HTML nem `<script is:inline>` com código. Script, fonte ou conexão nova precisa ser liberada lá.
- O site não usa cookies, analytics nem armazenamento no navegador. Se isso mudar, atualize a Privacy (`src/pages/privacy.astro`) e os docs (ver [roadmap.md › Antes de D9](docs/roadmap.md#antes-de-d9-analytics-sem-cookies)).
- Hospedagem decidida: **Cloudflare Pages** (build `npm run build`, saída `dist`). A Vercel publica até a troca.
