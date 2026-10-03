# Roadmap: rotina do site e cronograma da loja

> **Fontes:**
> - [Cap Soleil — Rotina de desenvolvimento do site](https://docs.google.com/document/d/1eIJfsOX-VNVHajWGzx5fC0VA6DlKrinB8aup_iHfX7s/edit) (Drive › 05 - Loja e lançamento › Site — capsoleilclub.com)
> - [Cap Soleil — Cronograma de lançamento](https://docs.google.com/spreadsheets/d/1z4llc4ppFm5Wf4eG5VRcmiSKqUTArQMisDHHiI3ZHMM/edit) (Drive › 07 - Planejamento)
>
> Os ☐/✅ do dia a dia e o **Registro** das sessões ficam no Drive (a fonte). Aqui ficam o mapa e **o que cada etapa muda no código**.
> **Atualizado em:** 2026-10-03 · **Sincronizado com o Drive em:** 2026-10-03

## O site v2 (produto real)

A proposta completa do site v2 está no Drive: [Cap Soleil — Proposta do site de lançamento (v2)](https://docs.google.com/document/d/1FAFPsSY93FUrCLoEGsGT61_TLRYatLDxYpNLAzzpWU4/edit) (pasta *Site — capsoleilclub.com*).
Ela cobre posicionamento, benchmark, conceito, arquitetura da experiência, identidade digital, captação, banco de dados, arquitetura técnica e as decisões em aberto.

> Ela fica **só no Drive** de propósito. Com o repositório público, plano de lançamento e mecânicas não devem ficar abertos no GitHub.
> Aqui entra só o que vira código, conforme as decisões forem tomadas.

**Estado em 2026-10-03:**

| Etapa da proposta | Estado |
|---|---|
| Fundação: Astro, tokens, componentes, relógio de sol, testes e CI | ✅ No ar desde 03/10/2026 |
| Dados: banco v2 (esquema `club`) e função `apply` | ✅ No Supabase, testados. ☐ Turnstile (opcional) |
| Experiência: os cinco atos, o cartão de membro e o selo | ✅ Pronto. ☐ Revisão dos textos pelos sócios (Regras do Clube e promessa da lista) |
| Hospedagem: Cloudflare Pages e repositório privado | ✅ Cloudflare no ar (cap-soleil-club.pages.dev). ☐ Repositório privado e Vercel desligada |
| E-mail: dupla confirmação, número de membro, convites, cartas | ☐ Depois (decisão: sem e-mail por enquanto; o banco já está pronto) |
| Lançamento: analytics, domínio, páginas legais preenchidas, testes em aparelhos | ☐ Ver as sessões D4–D12 |

## A rotina

Sessões curtas à noite, de segunda a quinta, em horário de Brasília: **3 sessões fixas + 1 flexível** por semana.

| Dia | Horário | Formato |
|---|---|---|
| Segunda | 20:00–21:15 | 20:00–20:30: alinhamento da semana com o Felipe (cronograma). 20:30–21:15: sessão do site |
| Terça | 20:00–21:15 | Sessão do site |
| Quarta | 20:00–21:15 | **Flexível**: só se der. Se não der, a tarefa passa para a próxima noite |
| Quinta | 20:00–21:15 | Sessão do site |

- **19:40:** chega no celular a pauta da noite: a próxima sessão ☐, os passos, o critério de pronto e os bloqueios.
- **20:00:** abrir a pauta e o site no computador.
- **20:05–21:00:** fazer **uma** sessão. Se não couber, dividir em duas.
- **21:00–21:15:** fechar. Fazer o commit, trocar ☐ por ✅ e escrever uma linha no Registro do Drive.

As datas são sugestão: a rotina sempre pega a **próxima sessão ☐**.
Depois da semana 3, fica uma sessão do site por semana (quinta) para manutenção, números e ajustes.

## Sessões do site

Estado conferido em **03/10/2026**. As três primeiras sessões já estão adiantadas.

| Sessão | Data sugerida | Tema | Estado | O que muda no repositório |
|---|---|---|---|---|
| D1 | Seg 05/10 | GitHub | ✅ Repositório privado no ar e Felipe convidado | — |
| D2 | Ter 06/10 | Vercel | ✅ No ar em capsoleilclub.vercel.app | Hospedagem decidida depois: **Cloudflare Pages** ([README › passo 4](../README.md#4-publicar-na-cloudflare-pages-a-hospedagem-decidida)) |
| D3 | Qua 07/10 (flexível) | Supabase | ✅ Projeto e banco v2 (`club`) prontos, função `apply` publicada · ☐ falta o cadastro de teste depois do deploy | Nenhuma. As migrations já foram aplicadas: **não rode de novo** |
| D4 | Qui 08/10 | Domínio (com o Felipe) | ☐ | Nada no código: o domínio entra em *Cloudflare Pages › Custom domains*, e `SITE_URL` passa a ser `https://capsoleilclub.com`. A função `apply` já aceita o domínio |
| D5 | Seg 12/10 | Privacidade e contato | ☐ | Colchetes de `src/pages/privacy.astro` e `legal.astro`; `contactEmail` em `src/config.ts` (ex.: hello@capsoleilclub.com) |
| D6 | Ter 13/10 | Textos | ☐ | `src/content/site.ts`: revisar as **Regras do Clube**, a **promessa da lista** (48 h, 1 carta por mês) e as legendas da Boutique (trio). Checklist de [marca.md](marca.md#checklist-para-qualquer-texto-novo) |
| D7 | Qua 14/10 (flexível) | Compartilhamento | ☐ | `public/og-image.jpg`, se precisar (as meta tags usam `SITE_URL`). Link da bio: `https://capsoleilclub.com/?utm_source=instagram` |
| D8 | Qui 15/10 | Qualidade | ☐ | Correções pontuais. Meta: Lighthouse 90+ (local: 90–97 no celular) e formulário ok em iPhone e Android |
| D9 | Seg 19/10 | Medição sem cookies | ☐ | Ver *Antes de D9* abaixo |
| D10 | Ter 20/10 | E-mail (Brevo) | ☐ | Ver *Antes de D10* abaixo. Decisão de 2026-10-03: **sem e-mail por enquanto** |
| D11 | Qua 21/10 (flexível) | Segurança e backup | ☐ | Nada, em princípio. Supabase › Advisors, teste de e-mail repetido e inválido, backup em CSV de `club.members` |
| D12 | Qui 22/10 | Fechamento e próxima fase | ☐ | Checklist “Antes de pôr o link na bio” do README e plano da transição para a Shopify |

### Antes de D7 (link na bio)

- **Hospedagem com uso comercial:** decidida, Cloudflare Pages ([site-e-acessos.md](site-e-acessos.md#custos-e-limites)). Precisa estar no ar antes do link na bio.
- Depois de ligar o domínio, testar a prévia no *Facebook Sharing Debugger*, que é o leitor usado por WhatsApp e Instagram.

### Antes de D9 (analytics sem cookies)

Hoje o site promete **sem cookies e sem analytics** na Privacy e no README. A proposta é o **Plausible** (UE, sem cookies), desligado até haver conta. Ao ativar:

1. Libere o script e o envio do Plausible na CSP de `public/_headers` **e** do `vercel.json` (o teste exige que sejam iguais). Scripts escritos direto no HTML são bloqueados.
2. Atualize a Privacy (`src/pages/privacy.astro`: *What we collect* e provedores) e a seção de privacidade do README.
3. Rode `npm run verify` e abra o site com o console do navegador aberto: nada pode ser bloqueado pela CSP.

O funil real (candidatou, confirmou, convidou) vem do banco: `select * from club.v_daily`.
Os três números da semana: **visitas, inscrições e taxa** (inscrições ÷ visitas), anotados no Registro toda segunda.

### Antes de D10 (e-mail)

- **Decisão de 2026-10-03: sem e-mail por enquanto.** Quando houver: o provedor entra na Privacy, e a dupla confirmação usa os campos que o banco já tem (`status`, `confirmed_at`, `member_number`, `invite_code`, `club.consents` com o método `double_opt_in`).
- O consentimento de hoje é para **Les Lettres du Club**: a abertura da Pro Shop e notícias raras, no máximo uma carta por mês (versão `2026-10-03` em `supabase/functions/_shared/lead.ts`). Se os envios forem além disso, mude o texto **e** crie uma versão nova do consentimento.
- Para levar a lista: *Supabase › Table Editor › club › members › Export* (CSV), só quem tem `marketing_consent = true`.

## Cronograma da loja (resumo)

Toda segunda há um alinhamento entre Ramon e Felipe. Os responsáveis, as horas e o status de cada tarefa ficam na planilha.

| Semana | Datas | Fase | Principais entregas |
|---|---|---|---|
| S1 | 05–09 out | Fundação | Papéis dos sócios; **trio de produtos**; decisão sobre “Est. 1954” nos pôsteres e logos; domínio; pesquisa da marca na UE (EUIPO) e no Brasil (INPI); perfis do Instagram e do Threads; 5 marcas de referência |
| S2 | 12–16 out | Fornecedores, produto e conteúdo | 5 fornecedores de print-on-demand com produção na Europa; comparação de custo, prazo, qualidade e integração; faixa de preço preliminar; arquivos de produção (bordado e pôsteres); grade dos 9 primeiros posts |
| S3 | 19–23 out | Fornecedores, loja e jurídico | Amostras (moletom, boné, pôster); conta na Shopify e tema; contador para vender na UE; página Sobre e descrições; primeiros posts de atmosfera |
| S4 | 26–30 out | Loja | Estrutura (Pro Shop, Sobre, Contato); políticas de envio, trocas (14 dias na UE) e privacidade; pagamentos em euro; identidade visual na loja; começar a postar 2 a 3 vezes por semana |
| S5 | 02–06 nov | Loja | Frete e prazos por país; domínio e e-mail da loja; fornecedor ligado à Shopify; mockups de produto |
| S6 | 09–13 nov | Produto e financeiro | Avaliar amostras; fotos de produto; preço final (custo + frete + margem); produtos cadastrados |
| S7 | 16–20 nov | Pré-lançamento | Pedido teste na Europa; revisão da loja no celular; posts de pré-lançamento; lista de primeiros clientes |
| S8 | 23–27 nov | Pré-lançamento | Correções; conteúdo da semana de lançamento; dia e roteiro do lançamento |
| S9 | 30 nov–04 dez | Lançamento | Abrir a loja (lançamento discreto); **avisar a lista**; acompanhar pedidos |
| S10 | 07–11 dez | Pós-lançamento | Data limite para o Natal; resultados (visitas, vendas, seguidores); próximas 4 semanas |

### Onde o site entra no cronograma

- **S1:** o trio de produtos destrava as legendas de *III · La Boutique* (sessão D6), e o domínio destrava as sessões D4 e D7.
- **S5:** “Conectar o domínio e o e-mail da loja”. A partir daqui, `capsoleilclub.com` passa a ser da Shopify. Combinar antes como a página de pré-lançamento sai do ar.
- **S9:** “Avisar a lista” é o e-mail **“the gates are open”** para quem entrou pela página.
