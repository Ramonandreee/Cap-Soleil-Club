# CLAUDE.md — Cap Soleil Lawn Tennis Club

Regras para qualquer sessão do Claude neste repositório, seja do Ramon ou do Felipe.
Os detalhes estão em [docs/como-trabalhamos.md](docs/como-trabalhamos.md).
**Esta regra é lei no projeto:** GitHub e Google Drive sempre atualizados e organizados.

## A lei: documentação sempre em dia

- **Mudou o site** (`index.html`, `privacy.html`, `assets/`, `vercel.json` ou `supabase/`)? Atualize a documentação **no mesmo PR**: `README.md`, este arquivo ou `docs/`. Para saber qual, use a tabela “Se mudou isto, atualize aquilo” em [docs/como-trabalhamos.md](docs/como-trabalhamos.md#se-mudou-isto-atualize-aquilo).
- **Mudou um arquivo em `docs/`?** Atualize a linha `**Atualizado em:** AAAA-MM-DD` dele. Se conferiu o documento contra a fonte no Drive, atualize também `**Sincronizado com o Drive em:**` e a tabela de sincronização de `como-trabalhamos.md`.
- **Mudou uma cor** (`:root` em `assets/css/styles.css`) **ou uma fonte** (Google Fonts no `<head>`)? Atualize [docs/identidade-visual.md › No site](docs/identidade-visual.md#no-site).
- **Antes de cada commit,** rode `python3 scripts/check_docs.py`. Ele precisa passar.
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
- Identidade visual em [docs/identidade-visual.md](docs/identidade-visual.md). Emblema: azul-marinho `#1F2A44`, dourado `#B89B5E` e creme `#F4EFE6`. As cores do site estão nos tokens de `styles.css`.

## Técnico

- Site estático: HTML, CSS e JavaScript puro. Sem framework, bundler ou npm. Para testar no computador: `python3 -m http.server 8000`.
- Supabase: o site só chama `supabase.rpc('join_waitlist', …)`, com a Publishable key (`sb_publishable_…`). **Nunca** coloque a secret key ou a service_role no código, nos docs ou no Drive.
- O banco já existe. `supabase/migrations/*.sql` é só referência: **não rode**.
- A CSP do `vercel.json` bloqueia scripts inline. Qualquer script, fonte ou conexão nova precisa ser liberada lá.
- O site não usa cookies nem analytics. Se isso mudar, atualize a `privacy.html` e os docs (ver [roadmap.md › Antes de D9](docs/roadmap.md#antes-de-d9-vercel-web-analytics)).
