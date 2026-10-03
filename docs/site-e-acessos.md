# Site: peças, acessos e decisões

> **Fonte:** [Cap Soleil — Site: projetos e acessos](https://docs.google.com/document/d/1yq_kyPL2lHnK1tnemUPZap-PdTknYysjx57eiz618CU/edit)
> (Drive › 05 - Loja e lançamento › Site — capsoleilclub.com). Aqui, o **status e os detalhes técnicos têm como fonte o GitHub**, e o Drive guarda um resumo (ver [como-trabalhamos.md](como-trabalhamos.md#onde-mora-cada-coisa)).
> **Atualizado em:** 2026-10-03 · **Sincronizado com o Drive em:** 2026-10-03 · status conferido no GitHub, na Vercel e no Supabase

A página de pré-lançamento existe para montar a lista de espera (**The list**) antes da abertura da Pro Shop.
O endereço final previsto é **capsoleilclub.com**.

## Como as peças se ligam

```
Instagram / Threads (@capsoleilclub)
        │  link da bio: …/?utm_source=instagram
        ▼
capsoleilclub.vercel.app  (no futuro: capsoleilclub.com)
        │  publicado pela Vercel a cada commit na branch main
        │◄─────────────── GitHub: Ramonandreee/Cap-Soleil-Club (privado)
        ▼
Formulário (assets/js/main.js)
        │  supabase.rpc('join_waitlist', …)   (Publishable key)
        ▼
Supabase · Cap Soleil Club · Paris (eu-west-3) · tabela waitlist
        │  só leitura pelo painel → Export CSV
        ▼
Ferramenta de e-mail (Brevo) → aviso de abertura “the gates are open”
```

O código fica no **GitHub**. A **Vercel** está ligada ao repositório e publica o site sozinha a cada commit na `main`.
O formulário chama uma função no **Supabase**, que grava a inscrição na tabela `waitlist`.
**Ninguém consegue ler a lista pela internet**: ela só é vista e exportada (CSV) pelo painel do Supabase.

## Status

Conferido em **2026-10-03**. Quem mudar o estado de uma peça atualiza esta tabela e a do Drive.

| Peça | Para quê | Onde | Status | Responsável |
|---|---|---|---|---|
| GitHub | Código e histórico | `Ramonandreee/Cap-Soleil-Club` (privado) | ✅ No ar. O Felipe é colaborador com permissão de escrita | Ramon |
| Vercel | Publica o site a cada commit | https://capsoleilclub.vercel.app | ✅ Publicado no plano Hobby (ver *Custos e limites*) | Ramon |
| Supabase | Guarda a lista de espera | Projeto *Cap Soleil Club*, Paris (eu-west-3) | ✅ Tabela e função prontas e ligadas ao site. Ainda sem cadastros (falta o de teste) | Ramon |
| Domínio | Endereço da bio | capsoleilclub.com | ☐ A verificar e registrar | Felipe |
| Instagram e Threads | Onde o link aparece | @capsoleilclub | ✅ Garantido | Ramon |

## Chaves e senhas

- **Não guarde senhas nem chaves secretas no Drive, no GitHub ou em documentos.** Use um gerenciador de senhas compartilhado entre os sócios.
- A **Publishable key** do Supabase (`sb_publishable_…`) fica no código do site (`assets/js/main.js`). Ela só permite chamar a função de inscrição.
- A **Secret key** (`sb_secret_…` ou `service_role`) nunca vai para o site, para o GitHub nem para documentos. Se uma vazar, gere outra em *Supabase › Project Settings › API Keys*.

## Custos e limites

- **Vercel:** o plano grátis (Hobby) é só para uso pessoal e não comercial. Para a página da marca no ar com o link na bio, os termos pedem o plano **Pro**.
  O site é estático e pode ir para outra hospedagem sem mudar o código. Só os headers de segurança do `vercel.json` precisariam ser recriados no novo serviço.
- **Supabase:** o plano grátis permite 2 projetos ativos por pessoa, somando todas as organizações em que ela é dona ou admin. Projetos grátis podem ser **pausados por inatividade**; se o formulário parar de funcionar, confira isso primeiro.
- **Brevo** (para enviar o e-mail de abertura): plano grátis com até 300 e-mails por dia.

## Decisões pendentes

| Decisão | Opções | Afeta no código |
|---|---|---|
| Hospedagem com uso comercial | Vercel Pro ou outra hospedagem que permita uso comercial no plano grátis | Nada; numa outra hospedagem, recriar os headers do `vercel.json` |
| Domínio | Confirmar se `capsoleilclub.com` está livre e registrar (Felipe) | `[URL DO SITE]` nas meta tags do `index.html` e do `privacy.html` |
| Privacidade e contato | Preencher responsável, endereço, e-mail, provedores e data | `privacy.html` e `[EMAIL DE CONTATO]` no `index.html` |
| Trio de produtos | Decidir no S1 do cronograma | `[TRIO DE PRODUTOS]` em *I · The hour* |
| Paleta do site × emblema | O site usa verde-clube e saibro; o emblema, azul-marinho `#1F2A44`, dourado `#B89B5E` e creme `#F4EFE6` (ver [identidade-visual.md](identidade-visual.md#no-site)) | `assets/css/styles.css`, `og-image.jpg`, `favicon.svg` e a tabela *No site* |
| “1954” nas artes | 3 logos alternativos e os 6 pôsteres v01 trazem “1954” (ver [identidade-visual.md](identidade-visual.md#pôsteres--coleção-verão)). Decidir no S1 se a data sai | Nada no site (ele já não tem data); afeta as artes no Drive |
| Nome do repositório | No Drive o nome previsto era `capsoleilclub`; no GitHub está `Cap-Soleil-Club` | Nada. Se renomear, confira depois se a Vercel continua ligada |

## Banco de dados: como chegou ao estado atual

No Drive (pasta *Site — capsoleilclub.com*) estão os dois SQLs que criaram a lista. No Supabase eles aparecem como as migrations `20261001160127_waitlist` e `20261001160910_waitlist_insert_policy`.

1. **`supabase-1-waitlist.sql`:** cria a tabela `waitlist` com RLS ligado e a função `join_waitlist` (primeira versão, `security definer`, repetidos ignorados com `on conflict do nothing`).
2. **`supabase-2-waitlist-insert-policy.sql`:** deixa tudo mais restrito.
   - A função passa a rodar com os direitos de quem chama (`security invoker`).
   - O site só pode **inserir** as colunas `email`, `first_name`, `country`, `source` e `consent`, e só com `consent = true` (policy *“Anyone can join the list”*).
   - E-mails repetidos são ignorados sem revelar que já estavam na lista.

O arquivo [`supabase/migrations/20261001000000_waitlist.sql`](../supabase/migrations/20261001000000_waitlist.sql) junta os dois no **estado final** e serve só de referência. **O banco já existe: não rode esse arquivo.**

## No lançamento

A loja (Shopify) assume `capsoleilclub.com` e a página de pré-lançamento sai do ar.
A lista é exportada do Supabase (*Table Editor › waitlist › Export › CSV*) e importada na ferramenta de e-mail para o aviso **“the gates are open”**.
