# Site: peças, acessos e decisões

> **Fonte:** [Cap Soleil — Site: projetos e acessos](https://docs.google.com/document/d/1yq_kyPL2lHnK1tnemUPZap-PdTknYysjx57eiz618CU/edit)
> (Drive › 05 - Loja e lançamento › Site — capsoleilclub.com). Aqui, o **status e os detalhes técnicos têm como fonte o GitHub**, e o Drive guarda um resumo (ver [como-trabalhamos.md](como-trabalhamos.md#onde-mora-cada-coisa)).
> **Atualizado em:** 2026-10-04 · **Sincronizado com o Drive em:** 2026-10-03 · status conferido no GitHub, na Vercel e no Supabase

O site de pré-lançamento é a portaria de um clube que ainda não abriu: monta a lista (**La Liste**) antes da abertura da Pro Shop.
O endereço final previsto é **capsoleilclub.com**. A proposta completa (posicionamento, experiência, identidade digital, dados e arquitetura) está no Drive: *Cap Soleil — Proposta do site de lançamento (v2)*.

## Como as peças se ligam

```
Instagram / Threads (@capsoleilclub)
        │  link da bio: …/?utm_source=instagram
        ▼
Site (Astro, estático) ── Cloudflare Pages: cap-soleil-club.pages.dev (a Vercel ainda publica até ser desligada)
        │  publicado a cada commit na main · cada PR ganha uma prévia
        │◄─────────────── GitHub: Ramonandreee/Cap-Soleil-Club
        ▼
Formulário (src/scripts/apply.ts)
        │  POST, sem chave · Turnstile (opcional)
        ▼
Supabase Edge Function "apply" ── valida, limita tentativas, chave secreta só aqui
        │  public.club_apply(...)
        ▼
Supabase · Cap Soleil Club · Paris (eu-west-3) · esquema club
        │  members · consents · events · rate_limits · v_daily
        ▼
(futuro) e-mail: cartas, dupla confirmação, número de membro, convites
```

O site **não fala mais direto com o banco**: não carrega o supabase-js nem usa a Publishable key.
Quem grava é a função `apply`, no servidor. O esquema `club` não aparece na API pública, e **ninguém de fora lê a lista**: ela só é vista e exportada pelo painel do Supabase.

## Status

Conferido em **2026-10-03**. Quem mudar o estado de uma peça atualiza esta tabela e a do Drive.

| Peça | Para quê | Onde | Status | Responsável |
|---|---|---|---|---|
| GitHub | Código e histórico | `Ramonandreee/Cap-Soleil-Club` | ✅ No ar, **público** desde 2026-10-03 (para a Vercel Hobby publicar os commits do Felipe). ☐ Voltar a ser privado: a Cloudflare já publica | Ramon |
| Site v2 (Astro) | A experiência em cinco atos | `src/` | ✅ No ar desde 03/10/2026 (PR #3) | Ramon |
| Cloudflare Pages | Hospedagem (uso comercial, deploy dos dois sócios com repositório privado) | https://cap-soleil-club.pages.dev | ✅ No ar desde 03/10/2026, publicando a `main`. ☐ Domínio | Ramon |
| Codex (ChatGPT) | O Felipe muda o site pelo ChatGPT: o Codex abre o PR e o merge publica | `AGENTS.md` e o app *ChatGPT Codex Connector* no GitHub | ☐ Conectar ([passos](como-trabalhamos.md#com-o-chatgpt-codex)) | Felipe e Ramon |
| Vercel | Hospedagem anterior | https://capsoleilclub.vercel.app | ✅ Ainda publica a v2. ☐ Desligar e remover o `vercel.json` ([README › passo 4, item 7](../README.md#4-publicar-na-cloudflare-pages-a-hospedagem-decidida)) | Ramon |
| Supabase · banco v2 | A lista, os consentimentos e os eventos | Esquema `club`, migrations `20261003054108_club_v2` e `20261003210000_club_apply_name_phone` | ✅ Aplicado e testado em 2026-10-03; cadastro de teste ponta a ponta feito e apagado | Ramon |
| Supabase · função `apply` | Recebe as candidaturas | `…supabase.co/functions/v1/apply` | ✅ Publicada (versão 2, com sobrenome e WhatsApp, desde 2026-10-03; `verify_jwt = false`) e respondendo | Ramon |
| Supabase · banco v1 | Lista do site antigo | `public.waitlist` | ✅ Ainda ligada ao site v1, vazia. Aposentar depois da virada | Ramon |
| Turnstile | Anti-robô da Cloudflare (opcional) | Cloudflare › Turnstile | ☐ Não ligado ([README › passo 7](../README.md#7-ligar-o-turnstile-anti-robô-da-cloudflare-opcional)) | Ramon |
| Domínio | Endereço da bio | capsoleilclub.com | ☐ A verificar e registrar | Felipe |
| Instagram e Threads | Onde o link aparece | @capsoleilclub | ✅ Garantido | Ramon |

## Banco de dados

Tudo da v2 fica no esquema **`club`**, nas migrations aplicadas em 2026-10-03:

1. [`20261003054108_club_v2.sql`](../supabase/migrations/20261003054108_club_v2.sql): cria o esquema. É **aditiva**: não mexe na tabela da v1.
2. [`20261003210000_club_apply_name_phone.sql`](../supabase/migrations/20261003210000_club_apply_name_phone.sql): a candidatura passa a gravar **sobrenome** (`last_name`) e **WhatsApp** (`phone_e164`). Os dois parâmetros novos têm valor padrão, então a função antiga continuou funcionando até a nova ser publicada.

| Tabela | Para quê | Principais campos |
|---|---|---|
| `club.members` | Um registro por pessoa (o lead) | `id`, `email` (único, sem diferenciar maiúsculas), `first_name`, `last_name`, `phone_e164` (o WhatsApp no formato internacional, ex.: `+5511912345678`), `country_code` (ISO), `locale`, `status` (*pending*, *confirmed*, *unsubscribed*, *bounced*, *shop_invited*, *customer*), `member_number` (vazio até haver confirmação por e-mail), `invite_code` (8 letras), `invited_by`, `invitations_left` (3), origem (`utm_*`, `referrer_host`, `landing_path`), `device_class`, consentimento atual (`marketing_consent`, `consent_version`, `consent_at`), datas, `crm_contact_id` e `crm_synced_at` (integração futura), `metadata` (ex.: a hora do dia no site). Nome, sobrenome, e-mail e WhatsApp são obrigatórios no formulário desde 2026-10-03; quem entrou antes pode estar sem sobrenome e WhatsApp |
| `club.consents` | Prova de consentimento (GDPR art. 7) | membro, finalidade (`club_letters`), concedido ou não, versão do texto aceito, método (`web_form`, `double_opt_in`…), data |
| `club.events` | Histórico para campanhas e auditoria | membro, tipo (`applied`, `applied_again`, `invite_used`…), dados, data |
| `club.rate_limits` | Freio contra abuso | chave com HMAC (nunca IP ou e-mail em claro), janela, contagem. Limpa sozinha |
| `club.v_daily` | Painel | candidaturas por dia, status, origem, país e aparelho |

**Como uma candidatura é gravada:** a função chama `public.club_apply(...)`, que só o `service_role` pode executar.
- E-mail novo: cria o membro, grava o consentimento e o evento `applied` (e `invite_used` para quem convidou, se houver convite).
- E-mail repetido: **não sobrescreve nada** (um terceiro poderia ter digitado o e-mail de outra pessoa), só registra `applied_again`. Quem tinha saído da lista e voltou a consentir é reativado.
- Sem consentimento ou sem versão do texto, a função recusa.
- O WhatsApp chega já no formato internacional: quem digita o número local tem o código do país escolhido somado na hora (o 0 de tronco sai, menos na Itália, em San Marino e no Vaticano). Sem país, o número precisa começar com `+`. As regras estão em `normalisePhone`, em `supabase/functions/_shared/lead.ts`.

**Segurança no banco:** RLS ligado em todas as tabelas do `club`, sem políticas (negação total para `anon` e `authenticated`); nenhum privilégio para eles no esquema; funções com `search_path` vazio. Os *advisors* do Supabase só apontam avisos informativos esperados (RLS sem políticas, de propósito, e índices ainda sem uso).

**Testes feitos em 2026-10-03** (numa transação desfeita no fim, sem deixar dados): cadastro novo, e-mail repetido com outra caixa de letras, convite, sem consentimento, e-mail inválido, reativação de quem saiu, limite de tentativas, visão do painel, e as recusas para `anon` e `authenticated`. A v1 (`join_waitlist`) continuou funcionando.

### Histórico: a v1

No Drive (pasta *Site — capsoleilclub.com*) estão os dois SQLs que criaram a lista v1. No Supabase eles aparecem como as migrations `20261001160127_waitlist` e `20261001160910_waitlist_insert_policy`.

1. **`supabase-1-waitlist.sql`:** cria a tabela `waitlist` com RLS ligado e a função `join_waitlist`.
2. **`supabase-2-waitlist-insert-policy.sql`:** deixa tudo mais restrito (função `security invoker`; o site só pode inserir algumas colunas e só com `consent = true`; repetidos ignorados sem revelar nada).

O arquivo [`supabase/migrations/20261001000000_waitlist.sql`](../supabase/migrations/20261001000000_waitlist.sql) junta os dois no estado final. Os arquivos em `supabase/migrations/` são o **histórico do que já foi aplicado: não rode de novo**.

**Na virada para a v2:** copiar o que houver em `public.waitlist` para `club.members` (o trecho já está no fim da migration v2 e pode ser rodado de novo sem duplicar) e, depois, revogar o acesso público à `join_waitlist`.

## Fotos do site

O Felipe gera as fotos no **ChatGPT** a partir do Google Doc *Cap Soleil — Direção fotográfica* e as manda **anexadas na conversa com o Claude** ou na pasta do Drive *Fotos do site*. Ao ouvir “imagens do chat”, o Claude segue [`.claude/skills/fotos-do-chat/SKILL.md`](../.claude/skills/fotos-do-chat/SKILL.md):

1. revisa cada foto;
2. prepara com `npm run fotos`: recorta na proporção do roteiro, até 3840 px, JPEG qualidade 90, em `src/assets/photos/<código>.jpg`;
3. coloca no site e testa;
4. atualiza esta tabela.

O ChatGPT entrega no máximo 1536 px: as fotos entram como **provisórias** (⚠️) até chegar uma versão maior.

| Código | Lugar no site | Versão no site | Situação |
|---|---|---|---|
| H1, H1m, H2, H2m, H3, H3m | Topo (muda com a hora) | — | ☐ Aguardando (o lugar é montado com a primeira foto) |
| I1, I2, I3, I4 | *L’Heure* | — | ☐ Aguardando (idem) |
| R1 | *Les Règles* | — | ☐ Aguardando (idem) |
| B1, B2, B3 | *Pro Shop* | B1 v3, B2 v3, B3 v2 (ChatGPT, 1122×1402, publicadas pelo Felipe) | ⚠️ Provisórias, no ar desde 03/10. Abaixo do mínimo do roteiro (2000 px); antes da campanha, pedem versão maior, emblema fiel ao oficial e saibro menos laranja em B2 |
| L1 | *La Liste* | — | ☐ Aguardando (o lugar é montado com a primeira foto) |

## Segurança

- **No navegador:** CSP estrita (`public/_headers`; a mesma no `vercel.json` durante a transição, e um teste confere que são iguais), HSTS, `frame-ancestors 'none'`, nenhum script ou estilo escrito direto no HTML, nenhum segredo.
- **Na função `apply`:** só aceita origens conhecidas (CORS), só `POST` com JSON de até 4 KB, valida cada campo no servidor (as mesmas regras do formulário, em `supabase/functions/_shared/lead.ts`), recusa envios em menos de 1,2 s, tem campo-armadilha, Turnstile opcional, e limites por IP, por e-mail e no total. Responde igual para nome novo e repetido. Os logs não têm dados pessoais.
- **No banco:** esquema fora da API, RLS sem políticas, execução só pelo `service_role`.

## Chaves e senhas

- **Não guarde senhas nem chaves secretas no Drive, no GitHub ou em documentos.** Use um gerenciador de senhas compartilhado entre os sócios.
- O site **não tem chave nenhuma**. A Publishable key (`sb_publishable_…`) continua existindo só para a v1, até a virada.
- A **Secret key** (`sb_secret_…` ou `service_role`) existe só dentro do Supabase (a função lê de `SUPABASE_SECRET_KEYS`). Se uma vazar, gere outra em *Supabase › Project Settings › API Keys*.
- A **secret key do Turnstile**, quando houver, vai só nos segredos da função (*Supabase › Edge Functions › Secrets*). A *site key* é pública e vai nas variáveis da Cloudflare Pages.

## Custos e limites

- **Cloudflare Pages (decidido):** plano grátis com uso comercial permitido, deploy de qualquer commit (os dois sócios, repositório privado) e prévia por PR. Limite de 500 builds por mês.
- **Vercel (até a troca):** o plano Hobby é só para uso pessoal e não comercial, e só publica commits de outra pessoa com o repositório **público**. Por isso a troca.
- **Repositório público = documentação pública:** enquanto estiver público, `docs/`, `CLAUDE.md` e o histórico podem ser lidos por qualquer pessoa. A proposta v2 fica só no Drive por isso. Os documentos do Drive citados continuam fechados.
- **Supabase:** o plano grátis permite 2 projetos ativos por pessoa. Projetos grátis podem ser **pausados por inatividade**; se o formulário parar de funcionar, confira isso primeiro. Edge Functions: 500 mil chamadas por mês no plano grátis.
- **Brevo** (quando houver e-mail): plano grátis com até 300 e-mails por dia.

## Decisões tomadas (site v2, 2026-10-03)

| Decisão | Escolha |
|---|---|
| Base técnica | **Astro** (site estático com build) |
| E-mail e dupla confirmação | **Sem e-mail por enquanto.** O banco já tem os campos de confirmação, número de membro e convites, para quando houver |
| Hospedagem e repositório | **Cloudflare Pages + repositório privado** |
| Imagens | ~~Ilustração + texturas~~ → **fotografia editorial** (decisão revista em 2026-10-03): gerada pelos sócios com os prompts de [direcao-fotografica.md](direcao-fotografica.md), revisada e otimizada pelo Claude. As ilustrações ficam até as fotos chegarem |
| Telefone | Não coletar no lançamento (a coluna fica pronta) |
| Número de membro | Não aparece na tela (só por e-mail e no cartão privado, quando houver e-mail) |
| Idioma | Inglês com toques de francês |
| Fontes | Servidas pelo próprio site (sem Google Fonts) |

## Decisões pendentes

| Decisão | Opções | Afeta no código |
|---|---|---|
| Promessa da lista | Proposta: **48 h** de acesso antecipado e **no máximo 1 carta por mês** (já no site, para revisão). Os convites (3) só valem quando houver e-mail | `src/config.ts` (`earlyAccessHours`) e `src/content/site.ts` |
| Regras do Clube | As cinco regras de *Les Règles* são proposta, para os sócios revisarem | `src/content/site.ts` (`RULES`) |
| Entidade jurídica | Quem é o responsável pelos dados e qual o endereço (com o contador, cronograma S3) | Colchetes de `src/pages/privacy.astro` e `legal.astro` |
| Contato | E-mail público do clube (ex.: hello@capsoleilclub.com) | `src/config.ts` (`contactEmail`) |
| Domínio | Confirmar se `capsoleilclub.com` está livre e registrar (Felipe) | `SITE_URL` na Cloudflare; origem já aceita pela função |
| Provedor de e-mail | Brevo para tudo, ou Resend/Postmark para as cartas e Brevo para marketing | Nova função (`confirm`), tabela de tokens e textos da Privacy |
| Analytics | Plausible (UE, sem cookies), desligado até haver conta | CSP em `public/_headers` e `vercel.json`, e a Privacy |
| Trio de produtos | Decidir no S1 do cronograma | Legendas de *La Boutique* (`BOUTIQUE.fragments`) |
| “1954” nas artes | 3 logos alternativos e os 6 pôsteres v01 trazem “1954” (ver [identidade-visual.md](identidade-visual.md#pôsteres--coleção-verão)). Decidir no S1 se a data sai | Nada no site (ele não tem data); afeta as artes no Drive |
| Nome do repositório | No Drive o nome previsto era `capsoleilclub`; no GitHub está `Cap-Soleil-Club` | Nada. Se renomear, reconecte a Cloudflare |

## No lançamento

A loja (Shopify) assume `capsoleilclub.com` e o site de pré-lançamento sai do ar (ou vira a página do clube).
A lista sai de `club.members` (*Table Editor › club › members › Export › CSV*, só quem tem `marketing_consent = true`) para a ferramenta de e-mail, para a carta **“the gates are open”**.


### Fotos integradas em 2026-10-03

| Código | Versão | Situação | Data |
|---|---|---|---|
| H1 | v01 | ⚠️ Provisória, 1672 × 941 px; fim de tarde | 2026-10-03 |
| H2 | v01 | ⚠️ Provisória, 1672 × 941 px; dia | 2026-10-03 |
| H3 | v01 | ⚠️ Provisória, 1672 × 941 px; hora azul | 2026-10-03 |



## Experiência aprovada em 2026-10-03

Portaria, L’Heure e regras compartilham a mesma quadra de saibro sobre o Mediterrâneo. A rolagem passa de H2 (dia) a H1 (fim de tarde) e H3 (hora azul), respeitando movimento reduzido. O cabeçalho único entra do alto antes de L’Heure e permanece fixo após encaixar no topo, sem recalcular sua posição.

O cartão tem proporção 85,6 × 54 mm, cantos arredondados, papel marfim texturizado, moldura dupla dourada, emblema oficial em relevo, marca-d’água e selo dourado. Campos, validação e envio do formulário preservados. Produtos B1–B3 sem alteração.

H1–H3: imagens geradas com image_gen, 1672 × 941 px, provisórias por resolução abaixo do mínimo; sem ampliação artificial. Recorte responsivo no celular; versões verticais próprias ainda pendentes. Originais e prompts aguardam arquivamento no Drive por Ramon/Claude.

## Convite da La Liste

A coluna do cartão em La Liste apresenta “Your place at the club.” acima, emblema discreto ao fundo e “Les Lettres du Club” abaixo, com a promessa de acesso antecipado à Pro Shop e correspondência ocasional (no máximo uma por mês). Composição aprovada pelo Felipe em 04/10/2026. Textos em `src/content/site.ts`; apresentação em `src/components/List.astro`. O cartão continua acompanhando nome e país digitados. Os campos, consentimento e envio permanecem iguais.

## Organização editorial aprovada em 2026-10-04

Boutique com título à esquerda e introdução à direita, fotos intactas e legendas numeradas alinhadas. L’Heure alterna alinhamentos em quadros de 58 svh (55 no celular). La Liste concentra acesso antecipado e frequência das cartas em dois blocos junto ao formulário; o cartão comunica pertencimento, sem repetir a promessa. Paleta, fontes, transição dia/noite, cabeçalho estável, zoom e validação preservados. Textos centralizados em `src/content/site.ts`.



## Páginas de produto — 2026-10-04

Imagens da boutique levam a `/riviera`, `/polo` e `/navy-cap`. Layout editorial responsivo com detalhes, navegação entre peças e acesso ao formulário original. Fotos principais B1–B3 preservadas. Detalhe B1-detail v02: suéter dobrado, gerado por image_gen, 1536 × 1024, provisório por resolução; JPEG sRGB qualidade 90, sem ampliação. Original em `fotos-do-chat/Foto - B1-detail - v02.png`, aguardando arquivamento no Drive. Prompt: preservar modelo B1, tecido marinho e zíper prateado; dobrar como referência, em cadeira de vime sob luz mediterrânea e bordado discreto.

