# Como trabalhamos: GitHub e Drive sempre em dia

> **Fonte:** este arquivo. Há uma cópia no Drive: [Cap Soleil — Como trabalhamos (GitHub e Drive)](https://docs.google.com/document/d/1gzJ54-_tb3c9mlNeBZretGxF4SdpEdZcEEZPS8bJKJM/edit) (07 - Planejamento).
> **Atualizado em:** 2026-10-03

## A lei do projeto

> **Uma mudança só está pronta quando o código, a documentação do GitHub e o Google Drive contam a mesma história.**

Na prática:

1. **Mudou o site?** Atualize o documento do GitHub que fala daquilo **no mesmo PR**.
2. **Mudou uma decisão, um status ou um arquivo da marca?** Atualize o Drive **no mesmo dia** e o espelho no GitHub **no próximo PR**, que pode ser só de documentação.
3. **Nada vai direto para a `main`.** Toda mudança passa por um PR, e a verificação automática precisa ficar verde (ver [Verificação automática](#verificação-automática)).
4. **Na dúvida sobre onde algo mora,** consulte a tabela abaixo. Se não estiver lá, inclua na tabela.

## Onde mora cada coisa

Cada assunto tem **uma fonte**. As outras cópias são **espelhos**, que dizem de onde vieram e quando foram sincronizados.

| Assunto | Fonte (vale esta) | Espelho |
|---|---|---|
| História, posicionamento e tom de voz | Drive: *Cap Soleil — História e Posicionamento* | [docs/marca.md](marca.md) |
| Identidade visual: emblema, logos, paleta da marca, pôsteres, coleções, experiência | Drive: *01 - Identidade da marca*, *02 - Coleção e produtos* e o Google Doc [Cap Soleil — Identidade visual](https://docs.google.com/document/d/1YhPwr9-X6vkbqh4BLxdR4LzmLq_bPlczWNrwP4PMneM/edit) | [docs/identidade-visual.md](identidade-visual.md) |
| Direção fotográfica (luz, cor, elenco, figurino, roteiro e prompts) | Drive: o Google Doc [Cap Soleil — Direção fotográfica](https://docs.google.com/document/d/1dLr6m-h7s_Ibe2cCZMgjK5hsHVVu4LXlHL9POmkCyDY/edit) (01 - Identidade da marca) | [docs/direcao-fotografica.md](direcao-fotografica.md) |
| Fotos do site (originais) | Drive: *05 - Loja e lançamento › Site — capsoleilclub.com › Fotos do site* | `src/assets/photos/` (as escolhidas, já tratadas) |
| Cores, fontes e gráficos **do site** | GitHub: `src/styles/tokens.css`, `src/lib/sun.ts`, os componentes em `src/components/` e [identidade-visual.md › No site](identidade-visual.md#no-site) | — |
| Textos do site (inglês) | GitHub: `src/content/site.ts` | Drive: o doc de origem, quando a frase vem de lá (ex.: a história) |
| Código, configuração, banco e segurança do site | GitHub (código, [README](../README.md) e [site-e-acessos.md](site-e-acessos.md)) | Drive: *Site: projetos e acessos* (só status e links) |
| Proposta do site v2 (conceito, experiência, decisões) | Drive: *Cap Soleil — Proposta do site de lançamento (v2)* | [roadmap.md](roadmap.md) (só o que vira código) |
| Status das peças (GitHub, Cloudflare, Vercel, Supabase, domínio) | GitHub: [site-e-acessos.md](site-e-acessos.md#status) | Drive: *Site: projetos e acessos* |
| Rotina e sessões do site (☐/✅ e Registro) | Drive: *Cap Soleil — Rotina de desenvolvimento do site* | [docs/roadmap.md](roadmap.md) (mapa e impacto no código) |
| Cronograma da loja (S1–S10) | Drive: planilha *Cap Soleil — Cronograma de lançamento* | [docs/roadmap.md](roadmap.md) (resumo) |
| Fornecedores, financeiro, jurídico e Instagram | Drive (pastas 03, 04 e 06) | — (não vai para o GitHub) |
| Regras de trabalho (este documento) | GitHub: `docs/como-trabalhamos.md` | Drive: *07 - Planejamento › Cap Soleil — Como trabalhamos* |
| Senhas e chaves secretas | **Gerenciador de senhas** dos sócios | **Nunca** no GitHub nem no Drive |

## Se mudou isto, atualize aquilo

| Mudou… | No GitHub, atualize | No Drive, atualize |
|---|---|---|
| Texto do site (`src/content/site.ts`, `src/pages/`) | Seção certa da [marca.md](marca.md#como-isso-vira-texto-no-site), se mudar o conceito | Nada, a não ser que a frase venha de um doc do Drive |
| Cor, fonte, céu do relógio de sol, ilustração, favicon ou og-image | [identidade-visual.md › No site](identidade-visual.md#no-site) | *Cap Soleil — Identidade visual*, se mudar a relação com a marca |
| Emblema, logo, pôster ou coleção (arquivo novo ou aprovado) | [identidade-visual.md](identidade-visual.md) | O arquivo na pasta certa, com `vNN` novo, e o Google Doc *Identidade visual* |
| Foto nova ou trocada no site | [site-e-acessos.md › Fotos do site](site-e-acessos.md#fotos-do-site) (situação de cada foto), o texto alternativo em `src/lib/photos.ts` e, se mudar o roteiro, [direcao-fotografica.md](direcao-fotografica.md#roteiro-lista-de-fotos) | A original em *Fotos do site*, com `vNN` novo e o prompt na descrição |
| Formulário, função `apply`, banco ou Supabase | [README](../README.md) e [site-e-acessos.md](site-e-acessos.md#banco-de-dados) | *Site: projetos e acessos* (status) |
| Domínio, hospedagem ou link do site | [site-e-acessos.md](site-e-acessos.md#status), README e `SITE_URL` na hospedagem | *Site: projetos e acessos* |
| Sessão da rotina concluída | [roadmap.md](roadmap.md#sessões-do-site) (coluna Estado) | *Rotina*: ☐ → ✅ e uma linha no Registro |
| Decisão tomada (trio, paleta, 1954, hospedagem…) | Tire de “Decisões pendentes” e registre onde ela vale | O doc de origem (*História*, *Rotina*, *Cronograma*…) |
| História, posicionamento ou tom de voz | [marca.md](marca.md) | *Cap Soleil — História e Posicionamento* (a fonte) |
| Política de privacidade, aviso legal ou provedores | `src/pages/privacy.astro`, `src/pages/legal.astro` e [site-e-acessos.md](site-e-acessos.md) | *Site: projetos e acessos* |
| Script, fonte ou serviço externo novo | CSP em `public/_headers` **e** `vercel.json`, a Privacy e [site-e-acessos.md](site-e-acessos.md#segurança) | *Site: projetos e acessos* |

## Trabalhando os dois ao mesmo tempo

**No GitHub**

1. **Antes de começar,** traga a `main` atualizada (no GitHub Desktop: *Fetch origin › Pull*; no Terminal: `git pull`).
2. **Uma tarefa = uma branch = um PR.** Nomeie a branch com o seu nome e o assunto: `ramon/trio-de-produtos`, `felipe/dominio`.
3. **PRs pequenos e frequentes.** Um PR de uma noite é melhor que um de uma semana: menos conflito e revisão mais fácil.
4. **Avise no PR o que mudou no Drive.** O modelo de PR já traz a lista.
5. **O outro sócio revisa** antes do merge, sempre que der. Se for urgente, faça o merge e avise no alinhamento de segunda.
6. **Se o GitHub acusar conflito,** traga a `main` para a sua branch (botão *Update branch* no PR) e resolva escolhendo, linha a linha, o texto que deve ficar. Na dúvida, chame o outro sócio antes de escolher.
7. **Nunca** apague a branch do outro, nem force (`--force`) nada na `main`.

**No Drive**

- Google Docs e Sheets aceitam edição simultânea. **Arquivos de arte** (PNG, SVG) não: combine antes quem mexe em qual.
- **Não renomeie nem mova** pastas e arquivos sem avisar, porque os links do GitHub apontam para eles.
- Quem fez a mudança atualiza o status (☐/✅, *Status*, *Registro*) **na mesma noite**.

## Organização do Drive

```
Drive da Cap Soleil
├── 01 - Identidade da marca       História e posicionamento · Logo (Aprovada / Alternativas) · Experiência · Referências
├── 02 - Coleção e produtos        Conceitos de coleção · Produtos-alvo · Pôsteres
├── 03 - Fornecedores
├── 04 - Instagram e conteúdo
├── 05 - Loja e lançamento         Site — capsoleilclub.com
├── 06 - Financeiro e documentos
├── 07 - Planejamento              Cronograma · Como trabalhamos
└── 99 - Arquivo                   Versões aposentadas
```

- **Nome de arquivo:** `Tipo - Nome - vNN.ext` (ex.: `Pôster - Sous les Pins - v02.png`).
- **Nome de documento:** `Cap Soleil — Nome` (ex.: `Cap Soleil — Identidade visual`).
- **Versão nova é arquivo novo** (`v02`), nunca uma substituição. A versão antiga vai para *99 - Arquivo* quando não for mais usada.
- **Aprovado fica separado do que está em estudo:** por exemplo, *Logo › Aprovada* e *Logo › Alternativas*.
- **Nada de senhas ou chaves** no Drive.

## Sincronização Drive ↔ GitHub

Cada documento em `docs/` traz no topo:

```
> **Fonte:** …
> **Atualizado em:** AAAA-MM-DD · **Sincronizado com o Drive em:** AAAA-MM-DD
```

- **Atualizado em** muda toda vez que o arquivo muda.
- **Sincronizado com o Drive em** muda quando alguém confere o documento contra a fonte no Drive e acerta o espelho.

| Espelho no GitHub | Fonte no Drive | Sincronizado em |
|---|---|---|
| [marca.md](marca.md) | *Cap Soleil — História e Posicionamento* | 2026-10-03 |
| [identidade-visual.md](identidade-visual.md) | *01 - Identidade da marca*, *02 - Coleção e produtos* e *Cap Soleil — Identidade visual* | 2026-10-03 |
| [site-e-acessos.md](site-e-acessos.md) | *Cap Soleil — Site: projetos e acessos* | 2026-10-03 |
| [roadmap.md](roadmap.md) | *Cap Soleil — Rotina de desenvolvimento do site* e *Cronograma de lançamento* | 2026-10-03 |
| [direcao-fotografica.md](direcao-fotografica.md) | *Cap Soleil — Direção fotográfica* | 2026-10-03 |

### Revisão semanal (5 minutos, no alinhamento de segunda)

- [ ] Algum documento do Drive mudou depois da data de sincronização da tabela acima? Se sim, atualize o espelho e a data.
- [ ] Algum PR aberto está parado? Algum está vermelho?
- [ ] Alguma “Decisão pendente” foi decidida na semana? Registre nos dois lados.
- [ ] O *Status* do Drive bate com o [site-e-acessos.md](site-e-acessos.md#status)?

## Verificação automática

Todo PR roda duas verificações: **“Documentação em dia”** (`.github/workflows/docs.yml`, descrita abaixo) e **“Site (testes)”** (`.github/workflows/site.yml`: tipos, testes de unidade, build e testes no navegador com a CSP de produção; ver [README › Testar antes do PR](../README.md#3-testar-antes-do-pr)).

A de documentação você também pode rodar no seu computador, na pasta do projeto:

```bash
python3 scripts/check_docs.py
```

| Ela confere | Se falhar |
|---|---|
| Se o PR mexe no site (`src/`, `public/`, `supabase/`, `astro.config.mjs`, `package.json`, `tsconfig.json` ou `vercel.json`) e também mexe em algum documento (`README.md`, `CLAUDE.md` ou `docs/`) | Atualize o documento certo (tabela *Se mudou isto…*). Se de fato não há o que documentar (ex.: corrigir um erro de digitação), escreva no texto do PR a linha `Docs: não se aplica — motivo` |
| Se toda cor de `:root` em `src/styles/tokens.css` e toda fonte `@fontsource` de `src/layouts/Base.astro` aparecem em [identidade-visual.md › No site](identidade-visual.md#no-site) | Inclua a cor ou a fonte na tabela |
| Se os links entre os documentos (e as âncoras `#`) existem | Corrija o link |
| Se o site (`src/`) menciona data de fundação (“Est. 1954”, “Established”, “Founded in”) | Tire a data: é regra da marca |
| Se cada documento em `docs/` tem a linha **Atualizado em** | Acrescente a linha no topo |

> **Bloquear o merge de verdade:** com o repositório público, o GitHub grátis permite *branch protection*. Em **Settings › Branches › Add rule** (ou *Rulesets*), para a `main`: exigir PR antes do merge e exigir as verificações **Documentação em dia** e **Site (testes)**.
> Quando o repositório voltar a ser privado (Cloudflare), o GitHub grátis deixa de aplicar essas regras em repositório privado de conta pessoal. A regra continua valendo do mesmo jeito: **PR vermelho não entra.**

## Com o Claude

O arquivo [`CLAUDE.md`](../CLAUDE.md), na raiz, passa estas mesmas regras para qualquer sessão do Claude, do Ramon ou do Felipe.
Ao pedir uma mudança, o Claude atualiza a documentação no mesmo PR e diz o que precisa mudar no Drive. Se o conector do Google Docs estiver ligado, ele mesmo faz a atualização no Drive.

## Com o ChatGPT (Codex)

O Felipe também pode mudar o site pelo **Codex**, que fica dentro do ChatGPT (na web, no app do computador e no celular).
- O Codex lê o [`AGENTS.md`](../AGENTS.md), que manda seguir o mesmo `CLAUDE.md`, inclusive o roteiro das fotos.
- Ele abre um PR. O **merge publica o site**: a Cloudflare põe a `main` no ar sozinha, venha a mudança do Claude, do Codex ou do site do GitHub.

**Uma vez só:**

1. **Plano:** o Codex na nuvem precisa do ChatGPT **Plus** ou superior.
2. **GitHub (Felipe):** no ChatGPT, abra o Codex e conecte o GitHub com a conta `felipe44moreira44-dot`. Ela já é colaboradora do repositório, com permissão de escrita.
3. **App no repositório (Ramon):** o repositório é da conta do Ramon, então é ele quem aprova o app ***ChatGPT Codex Connector***.
   - Ao conectar, o Felipe pede o acesso.
   - O Ramon aprova pela notificação do GitHub ou em *GitHub › Settings › Applications*, liberando só `Cap-Soleil-Club`.
4. **Ambiente (Felipe):** no Codex, *Work in › Cloud › Select environment › Create environment*. Escolha `Ramonandreee/Cap-Soleil-Club` e escreva:
   > Prepare este repositório. Use Node 22 e rode npm ci. Tente instalar o Chromium do Playwright (npx playwright install chromium). Depois rode python3 scripts/check_docs.py, npm run check, npm test e npm run build. Não publique nada.

   Em *Allow domains*, escolha **Package managers**. Revise o relatório e clique em **Publish**. Se o Chromium não instalar, tudo bem: os testes no navegador rodam no PR.

**No dia a dia:**

1. Nova tarefa nesse ambiente: “são as imagens do chat” (com as imagens anexadas, ou pedindo para o Codex gerar) ou qualquer outra mudança.
2. O Codex faz a mudança, roda as verificações e abre o PR (*Create PR* na tarefa).
3. No PR, espere **Documentação em dia** e **Site (testes)** ficarem verdes e confira a prévia da Cloudflare (link no comentário).
4. **Merge pull request.** Em cerca de 1 minuto a mudança está em https://cap-soleil-club.pages.dev.

Banco, função `apply` e chaves continuam com o Ramon (Claude): o Codex não tem acesso ao Supabase.

## Roteiros prontos

Para tarefas que se repetem, há roteiros prontos em `.claude/skills/`, que valem para o Claude e para o Codex. Hoje há um: **[fotos-do-chat](../.claude/skills/fotos-do-chat/SKILL.md)**. É só dizer “são as imagens do chat”: ele revisa as fotos do ChatGPT, prepara, coloca no site, testa e diz o que muda no Drive.
