# Cap Soleil Lawn Tennis Club: site de pré-lançamento

Cap Soleil é uma marca de roupas e pôsteres inspirada nos clubes de tênis da Riviera Francesa, no luxo silencioso e vendida na Europa.
Este site é a **portaria de um clube que ainda não abriu**: a pessoa chega na luz real daquela hora na Côte d’Azur, lê as Regras do Clube, vê fragmentos da Pro Shop e põe o nome na lista (**La Liste**).

- **No ar:** https://cap-soleil-club.pages.dev (Cloudflare Pages, desde 03/10/2026). Endereço final previsto: capsoleilclub.com.
- **Hospedagem:** **Cloudflare Pages**, a única. A Vercel saiu do código em 06/10/2026.
- **Site:** [Astro](https://astro.build), que gera páginas estáticas. Tem build com npm e JavaScript pequeno, só para o céu, a rolagem e o formulário.
- **Lista:** o formulário manda para a função **`apply`** (Supabase Edge Function), que valida e grava no esquema **`club`** do banco (projeto **Cap Soleil Club**, Paris / eu-west-3).
- **Proposta completa (privada, no Drive):** [Cap Soleil — Proposta do site de lançamento (v2)](https://docs.google.com/document/d/1FAFPsSY93FUrCLoEGsGT61_TLRYatLDxYpNLAzzpWU4/edit).

## Documentação

> **A lei do projeto:** uma mudança só está pronta quando o código, a documentação do GitHub e o Google Drive contam a mesma história.
> Como fazer isso, sobretudo com os dois sócios mexendo ao mesmo tempo, está em **[docs/como-trabalhamos.md](docs/como-trabalhamos.md)**.

| Documento | O que tem |
|---|---|
| [docs/como-trabalhamos.md](docs/como-trabalhamos.md) | **A lei:** onde mora cada coisa, “se mudou isto, atualize aquilo”, trabalho simultâneo, organização do Drive, sincronização e a verificação automática |
| [docs/marca.md](docs/marca.md) | História (PT e EN), posicionamento, tom de voz e o **checklist para qualquer texto do site** |
| [docs/identidade-visual.md](docs/identidade-visual.md) | Emblema e regras de uso, logos alternativos, paletas (marca e site), tipografia, pôsteres, coleções, produtos-alvo, experiência da marca e o **relógio de sol** do site |
| [docs/direcao-fotografica.md](docs/direcao-fotografica.md) | **Direção fotográfica** da marca (site, Instagram, campanhas): luz, cor, lentes, elenco, figurino, o roteiro de fotos do site e os **prompts de produção** |
| [docs/site-e-acessos.md](docs/site-e-acessos.md) | Como as peças se ligam, status, banco de dados, segurança, chaves e senhas, custos e decisões pendentes |
| [docs/roadmap.md](docs/roadmap.md) | Rotina das sessões do site (D1–D12), cronograma da loja (S1–S10) e o que cada etapa muda no código |
| [CLAUDE.md](CLAUDE.md) | As mesmas regras, resumidas para as sessões do Claude |

Todo PR passa por duas verificações: **Documentação em dia** (`python3 scripts/check_docs.py`) e **Site (testes)** (tipos, testes, build e testes no navegador).

```
src/content/site.ts          TODOS os textos do site (inglês). Comece por aqui para mudar uma frase
src/config.ts                Configuração: e-mail de contato, promessa da lista (48 h), Instagram, endereço da função
src/styles/tokens.css        Cores e fontes do site (tokens). Mudou? Atualize docs/identidade-visual.md › No site
src/components/              Os atos da página: Threshold (0), Hour (I), Rules (II), Boutique (III), List (IV), Footer
src/pages/                   Páginas: index, privacy, legal, 404 e robots.txt
src/lib/sun.ts               O relógio de sol: posição do sol no Cap d'Antibes, fases do dia e cores do céu
src/scripts/                 JavaScript do navegador: céu, rolagem do ato I, formulário
public/                      Arquivos servidos como estão: emblema, favicon, og-image e _headers (segurança)
supabase/functions/apply/    Função que recebe as candidaturas (valida, limita tentativas, grava)
supabase/functions/_shared/  Regras da candidatura, usadas pela função e pelo formulário
supabase/migrations/         Histórico do banco (já aplicado). NÃO rode de novo
tests/                       Testes de unidade (Vitest) e de ponta a ponta (Playwright)
docs/                        Como trabalhamos, marca, identidade visual, peças e acessos, roadmap
scripts/check_docs.py        Verificação "Documentação em dia"
.github/                     Modelo de PR e as verificações automáticas
```

---

## 1. Rodar no seu computador

Precisa do **Node.js 22 ou mais novo** (nodejs.org, versão LTS). Depois, no Terminal, dentro da pasta do projeto:

```bash
npm ci          # instala as dependências (só na primeira vez ou quando o package.json mudar)
npm run dev     # abre o site em http://localhost:4321
```

- Para ver **outra hora do dia** sem esperar: `http://localhost:4321/?phase=nuit` (também `aube`, `matin`, `midi`, `heure`, `crepuscule`).
- Para desligar, aperte **Ctrl + C** no Terminal.

> ⚠️ **O formulário grava no banco de verdade**, inclusive no computador. Para testar, use um e-mail seu com `+teste` (ex.: `voce+teste@gmail.com`) e apague a linha depois (passo 6).

## 2. Onde mudar o quê

| Quero mudar… | Arquivo |
|---|---|
| Uma frase do site | `src/content/site.ts` (passe pelo checklist de [docs/marca.md](docs/marca.md#checklist-para-qualquer-texto-novo)) |
| O e-mail de contato, as horas de acesso antecipado, o Instagram | `src/config.ts` |
| Uma cor ou uma fonte | `src/styles/tokens.css` e [docs/identidade-visual.md › No site](docs/identidade-visual.md#no-site) |
| Uma foto do site | `npm run fotos -- <arquivos>` prepara em `src/assets/photos/<código>.jpg`; o texto alternativo fica em `src/lib/photos.ts`. Passo a passo em [`.claude/skills/fotos-do-chat/SKILL.md`](.claude/skills/fotos-do-chat/SKILL.md) |
| As cores do céu em cada hora | `src/lib/sun.ts` (`PALETTES`) |
| A política de privacidade ou o aviso legal | `src/pages/privacy.astro` e `src/pages/legal.astro` |
| O que o formulário aceita | `supabase/functions/_shared/lead.ts` (vale para o site **e** para a função; a função precisa ser publicada de novo, passo 5) |
| Um script, fonte ou serviço externo novo | Libere na CSP de `public/_headers` |

## 3. Testar antes do PR

```bash
npx playwright install chromium   # só na primeira vez
npm run verify                    # documentação, tipos, testes de unidade, build e testes no navegador
```

Os testes no navegador abrem o site **já construído** com os mesmos cabeçalhos de segurança da produção e conferem: as cinco fases do céu, a rolagem do ato I, o cartão de membro, todos os estados do formulário (sucesso, erro de campo, sem rede, limite de tentativas, erro do servidor), acessibilidade (axe, WCAG AA), a página sem JavaScript e com movimento reduzido.
Eles **nunca** chamam a função de verdade: o envio é interceptado.

---

## 4. Publicar na Cloudflare Pages (a hospedagem decidida)

> ✅ **Feito em 03/10/2026:** o projeto `cap-soleil-club` está no ar. Faltam o item 6 (domínio) e, do item 7, deixar o repositório privado. A Vercel saiu em 06/10/2026. Os passos ficam aqui para refazer ou conferir.

Com a Cloudflare, **todo commit na `main` publica o site**, de qualquer um dos dois sócios, mesmo com o repositório **privado**, e cada branch ou PR ganha um link de prévia. O plano grátis permite uso comercial. Isso vale também para os PRs que o Felipe abre pelo ChatGPT ([Com o ChatGPT (Codex)](docs/como-trabalhamos.md#com-o-chatgpt-codex)).

1. Entre em **dash.cloudflare.com** › **Workers & Pages › Create application**. A Cloudflare abre no caminho de **Workers**: não use. Clique no link do rodapé **“Looking to deploy Pages? Get started”** e depois em **Import an existing Git repository › Get started**.
2. Autorize o GitHub e escolha `Ramonandreee/Cap-Soleil-Club`. Dê ao projeto o nome **`cap-soleil-club`** (a função `apply` já aceita `cap-soleil-club.pages.dev` e as prévias `*.cap-soleil-club.pages.dev`).
3. Em **Build settings**:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Em **Environment variables (Production e Preview)**:
   - `NODE_VERSION` = `22`
   - `SITE_URL` = `https://cap-soleil-club.pages.dev` (depois do domínio: `https://capsoleilclub.com`)
   - `PUBLIC_TURNSTILE_SITE_KEY` = a *site key* do Turnstile, se for ligar (passo 7). Sem ela, o site funciona sem o Turnstile.
5. **Save and Deploy.** Abra o link `https://cap-soleil-club.pages.dev` no celular e faça o **teste real** (passo 6).
6. **Domínio** (quando `capsoleilclub.com` estiver registrado): no projeto, **Custom domains › Set up a custom domain**. Depois, troque `SITE_URL` para `https://capsoleilclub.com` e publique de novo.
7. **Depois que a Cloudflare estiver no ar:**
   - deixe o repositório **privado** de novo (*GitHub › Settings › General › Danger Zone › Change visibility*);
   - Vercel: o `vercel.json` e a origem `capsoleilclub.vercel.app` saíram do código em 06/10/2026. Falta apagar o projeto no painel da Vercel (*Settings › Advanced › Delete Project*) e publicar a função `apply` de novo (passo 5);
   - atualize [docs/site-e-acessos.md](docs/site-e-acessos.md#status) e o Drive.

---

## 5. A função `apply` e o banco

**O caminho de uma candidatura**

```
formulário (src/scripts/apply.ts)
   │  POST JSON, sem chave nenhuma
   ▼
Edge Function apply (supabase/functions/apply)
   │  confere a origem (CORS), o tamanho, os campos, o campo-armadilha,
   │  o tempo mínimo, o Turnstile (se ligado) e os limites de tentativas
   │  chama public.club_apply(...) com a chave secreta (só no servidor)
   ▼
banco · esquema club (não aparece na API pública)
   members · consents (prova do consentimento) · events · rate_limits
```

- **Resposta sempre igual** para nome novo e repetido: o site nunca revela quem já está na lista.
- **Limites:** 10 tentativas por IP a cada 10 minutos, 4 por e-mail por hora e 120 por minuto no total. IP e e-mail entram nos limites só como código embaralhado (HMAC), nunca em claro.
- **Logs sem dados pessoais:** só o resultado (`created`, `existing`, `rate_limited`…) e o tempo.

**Publicar a função de novo** (depois de mudar `supabase/functions/`):

```bash
npx supabase login
npx supabase functions deploy apply --project-ref anlniqjoaogsuptuvrtk
```

O `supabase/config.toml` já publica com `verify_jwt = false`: o site chama a função sem chave, e a proteção está no código da função.

**Segredos da função** (*Supabase › Edge Functions › Secrets*), todos opcionais:

| Nome | Para quê |
|---|---|
| `TURNSTILE_SECRET_KEY` | Liga a verificação do Turnstile (passo 7). Sem ele, a função não exige o Turnstile |
| `ALLOWED_ORIGINS` | Endereços extras que podem usar a função, separados por vírgula (ex.: um domínio novo). Os padrões estão em `handler.ts` |
| `HASH_SECRET` | Chave do código embaralhado dos limites. Sem ele, usa a chave secreta do projeto |

`SUPABASE_URL` e `SUPABASE_SECRET_KEYS` já vêm prontos no Supabase. **Nunca** copie a chave secreta para o código, para o GitHub ou para o Drive.

**Ver a lista:** *Supabase › Table Editor*, escolha o esquema **`club`** no seletor do topo e abra **`members`**. Para exportar: **Export › CSV**.
Números do dia por origem, país e aparelho: **SQL Editor** › `select * from club.v_daily order by day desc;`

> A tabela antiga `public.waitlist` (v1) continua no banco, vazia e **sem acesso público** desde 2026-10-06. Os códigos anti-abuso (`club.rate_limits`) são apagados de hora em hora pelo Supabase Cron. Detalhes em [docs/site-e-acessos.md › Banco de dados](docs/site-e-acessos.md#banco-de-dados).

## 6. Teste real depois de publicar

1. Abra o site no celular com `?utm_source=teste`, por exemplo: `https://cap-soleil-club.pages.dev/?utm_source=teste`.
2. Preencha nome, sobrenome, e-mail (`voce+teste@…`), país e WhatsApp, marque o consentimento e toque em **Put my name down**.
3. Deve aparecer **“Your name is down.”** e o cartão ganha o selo dourado.
4. No Supabase, em **Table Editor**, troque o esquema `public` por **`club`** (seletor no alto da lista de tabelas). Em `members`, a linha deve estar lá com `utm_source = teste`, `status = pending`, `marketing_consent = true`, `last_name` e `phone_e164` (ex.: `+5511912345678`), e em `consents` a prova do consentimento.
5. Apague o teste: em `club.members`, marque a linha e **Delete** (o consentimento e os eventos saem junto).

Se aparecer *“Something went wrong on our side”*, veja **Edge Functions › apply › Logs** no Supabase.

## 7. Ligar o Turnstile (anti-robô da Cloudflare, opcional)

1. Cloudflare › **Turnstile › Add widget**. Nome: Cap Soleil. Domínios: `cap-soleil-club.pages.dev` e, depois, `capsoleilclub.com`. Modo: **Managed**.
2. Copie a **site key** para `PUBLIC_TURNSTILE_SITE_KEY` (Cloudflare Pages, passo 4) e publique de novo.
3. Copie a **secret key** para o segredo `TURNSTILE_SECRET_KEY` da função (Supabase, passo 5).
4. Faça o teste real (passo 6). A Privacy passa a citar o Turnstile sozinha.

> Ligue os dois lados juntos: com só a secret key, a função recusa os envios; com só a site key, o Turnstile carrega à toa.

---

## 8. Checklist: antes de pôr o link na bio

- [ ] **Cloudflare no ar** (passo 4) e repositório privado de novo.
- [ ] **Domínio** ligado e `SITE_URL` trocado.
- [ ] **Colchetes preenchidos** na Privacy e no Legal notice (tabela abaixo) e **e-mail de contato** em `src/config.ts`.
      Para procurar: `grep -rn "\[[A-ZÁÉÍÓÚÇÃÕ ]*\]" src/pages`
- [ ] **Textos revisados pelos sócios**, sobretudo as **Regras do Clube** (proposta) e a **promessa da lista** (48 h de acesso antecipado e no máximo 1 carta por mês): é uma promessa pública e precisa ser cumprida.
- [ ] **Prévia do link** no WhatsApp e no Instagram (cole o link em *developers.facebook.com/tools/debug* e clique em *Scrape Again*).
- [ ] **Lighthouse 90+** no celular (*pagespeed.web.dev*).
- [ ] **iPhone (Safari) e Android (Chrome):** abrir, rolar até o fim, mandar uma candidatura, ver o selo, abrir Privacy e Legal.
- [ ] **Cadastros de teste apagados** (passo 6).

### Onde estão os campos para preencher

| Campo | Arquivo | O que colocar |
|---|---|---|
| `contactEmail` | `src/config.ts` | E-mail de contato (ex.: hello@capsoleilclub.com). Aparece no rodapé, na Privacy e no Legal notice |
| `[RESPONSÁVEL]` | `src/pages/privacy.astro` e `legal.astro` | Pessoa ou empresa responsável pelos dados e pelo site |
| `[ENDEREÇO]` | `src/pages/privacy.astro` e `legal.astro` | Endereço do responsável |
| `[FORMA JURÍDICA E REGISTRO]` | `src/pages/legal.astro` | Tipo de empresa e número de registro |
| `[DIRETOR DA PUBLICAÇÃO]` | `src/pages/legal.astro` | Quem responde pelo conteúdo (exigência francesa) |

---

## Detalhes técnicos (para quem for mexer no código)

- **Segurança:** CSP estrita em `public/_headers`: só o próprio site, a função do Supabase e o Turnstile. Nenhum script ou estilo escrito direto no HTML; o Astro gera tudo como arquivo (`inlineStylesheets: 'never'`, `assetsInlineLimit: 0`). HSTS, `frame-ancestors 'none'`, `nosniff`.
- **Sem segredos no navegador:** o site não usa mais o supabase-js nem a Publishable key. Só a função, no servidor, fala com o banco.
- **Privacidade:** sem cookies, sem analytics, nada guardado no navegador. As fontes são servidas pelo próprio site (sem Google Fonts).
- **Banco:** esquema `club` com RLS ligado e sem políticas (ninguém de fora lê nem escreve); só o `service_role` executa `public.club_apply` e `public.club_rate_limit_hit`. Detalhes em [docs/site-e-acessos.md](docs/site-e-acessos.md#banco-de-dados).
- **Acessibilidade:** AA (testado com axe), teclado, foco visível, mensagens com `role="status"`, idioma marcado. Com *reduzir movimento*, o site não anima; sem JavaScript, o texto aparece todo e o formulário explica que precisa de JavaScript.
- **Performance:** cerca de 17 KB de JavaScript, uma folha de estilo, fontes com subconjunto latino e pré-carregadas, emblema embutido no HTML. Lighthouse local: 90–97 no celular e 100 no computador.
- **Dependências:** o `npm audit` aponta um alerta no `http-cache-semantics`, usado pelo Astro só durante o build (cache de imagens remotas, que o site não usa). Não há correção publicada; não afeta o site no ar.
