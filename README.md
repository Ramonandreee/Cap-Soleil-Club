# Cap Soleil Lawn Tennis Club: página de pré-lançamento

Cap Soleil é uma marca de roupas e pôsteres inspirada nos clubes de tênis da Riviera Francesa, no luxo silencioso e vendida na Europa.
Esta é a página única para montar a lista de espera (**The list**) antes da abertura da Pro Shop.

- **No ar:** https://capsoleilclub.vercel.app (endereço final previsto: capsoleilclub.com)
- **Site estático:** HTML, CSS e JavaScript puro. Não tem build, framework nem npm.
- **Cadastros:** vão para o Supabase (projeto **Cap Soleil Club**, região Paris / eu-west-3).

## Documentação

> **A lei do projeto:** uma mudança só está pronta quando o código, a documentação do GitHub e o Google Drive contam a mesma história.
> Como fazer isso, sobretudo com os dois sócios mexendo ao mesmo tempo, está em **[docs/como-trabalhamos.md](docs/como-trabalhamos.md)**.

| Documento | O que tem |
|---|---|
| [docs/como-trabalhamos.md](docs/como-trabalhamos.md) | **A lei:** onde mora cada coisa, “se mudou isto, atualize aquilo”, trabalho simultâneo, organização do Drive, sincronização e a verificação automática |
| [docs/marca.md](docs/marca.md) | História (PT e EN), posicionamento, tom de voz e o **checklist para qualquer texto do site** |
| [docs/identidade-visual.md](docs/identidade-visual.md) | Emblema e regras de uso, logos alternativos, paletas (marca e site), tipografia, pôsteres, coleções, produtos-alvo e experiência da marca |
| [docs/site-e-acessos.md](docs/site-e-acessos.md) | Como as peças se ligam, status de cada uma, chaves e senhas, custos e limites, decisões pendentes e histórico do banco |
| [docs/roadmap.md](docs/roadmap.md) | Rotina das sessões do site (D1–D12), cronograma da loja (S1–S10) e o que cada etapa muda no código |
| [CLAUDE.md](CLAUDE.md) | As mesmas regras, resumidas para as sessões do Claude |

Todo PR passa pela verificação **Documentação em dia**. Para rodar no computador: `python3 scripts/check_docs.py`.

Este README é o passo a passo técnico: rodar, publicar, ligar o Supabase e conferir antes de divulgar.

```
index.html                 Home: Hero, I · The hour, II · The grounds, III · The list, rodapé
privacy.html               Política de privacidade (abre em /privacy)
assets/css/styles.css      Visual (cores, fontes, layout, animações)
assets/js/main.js          Formulário. O CONFIG com os dados do Supabase fica no topo
assets/img/og-image.jpg    Imagem de prévia do link (1200×630)
assets/img/favicon.svg     Ícone da aba
assets/img/emblema*.svg    Emblema oficial (fundo claro e fundo azul-marinho)
supabase/migrations/…sql   Só referência do banco. O banco já existe: NÃO rode este arquivo
vercel.json                Headers de segurança e endereços sem .html
.vercelignore              O que NÃO vai para o site (docs, scripts, SQL, README)
docs/                      Como trabalhamos, marca, identidade visual, peças e acessos, roadmap
CLAUDE.md                  Regras do projeto para as sessões do Claude
scripts/check_docs.py      Verificação "Documentação em dia" (roda em todo PR)
.github/                   Modelo de PR e a verificação automática
```

---

## 1. Rodar no seu computador

1. Abra o **Terminal** (no Mac: Cmd + Espaço, digite "Terminal").
2. Entre na pasta do projeto. Digite `cd ` (com espaço), arraste a pasta para a janela e aperte Enter.
3. Rode:

   ```bash
   python3 -m http.server 8000
   ```

4. Abra **http://localhost:8000** no navegador.
5. Para desligar, volte ao Terminal e aperte **Ctrl + C**.

Duas coisas são normais nesse teste local:

- O link **Privacy** leva para `/privacy`, que só funciona na Vercel. No computador, abra **http://localhost:8000/privacy.html**.
- O formulário já está ligado ao banco real: **um envio feito no computador cria um cadastro de verdade** na lista. Depois de testar, apague-o em **Table Editor › waitlist** (passo 5).

> No Windows, se `python3` não funcionar, instale o Python em python.org ou use `py -m http.server 8000`.

---

## 2. Subir no GitHub e convidar o Felipe

**Criar o repositório**

1. Entre em **github.com** e clique em **New** (ou **+ › New repository**).
2. Em **Repository name**, escreva `capsoleilclub`.
3. Marque **Private**. Não marque nenhuma opção de README, .gitignore ou licença.
4. Clique em **Create repository**.

**Enviar os arquivos (escolha um jeito)**

- **Pelo navegador (mais fácil):** na página do repositório vazio, clique em **uploading an existing file**, arraste **todo o conteúdo** da pasta (arquivos e pastas `assets` e `supabase`), escreva `Initial pre-launch page` como mensagem e clique em **Commit changes**.
- **Pelo Terminal**, dentro da pasta do projeto:

  ```bash
  git init
  git add .
  git commit -m "Initial pre-launch page"
  git branch -M main
  git remote add origin https://github.com/SEU-USUARIO/capsoleilclub.git
  git push -u origin main
  ```

> Se o código já estiver no GitHub com outro nome (por exemplo `Cap-Soleil-Club`), dá para renomear em
> **Settings › General › Repository name** e conferir se está privado em **Settings › General › Danger Zone › Change visibility**.

**Convidar o Felipe**

1. No repositório, vá em **Settings › Collaborators** (no menu da esquerda, em *Access*).
2. Clique em **Add people**, digite o usuário ou o e-mail do Felipe no GitHub e confirme.
3. O Felipe recebe um e-mail e precisa **aceitar o convite**.

---

## 3. Publicar na Vercel

1. Entre em **vercel.com** com a sua conta do GitHub.
2. Clique em **Add New… › Project**.
3. Ache o repositório `capsoleilclub` e clique em **Import**.
   Se ele não aparecer, clique em **Adjust GitHub App Permissions** e libere o repositório.
4. Na tela de configuração:
   - **Framework Preset:** `Other`
   - **Root Directory:** `./`
   - **Build and Output Settings:** deixe como está (sem build e sem comando).
5. Clique em **Deploy** e espere cerca de 1 minuto.
6. A Vercel mostra um link parecido com `https://capsoleilclub.vercel.app`. **Abra esse link no celular** e confira: a página abre inteira, o botão *Join the list* desce até o formulário e o link *Privacy* abre a política.

A partir daqui, **cada commit na `main` publica o site sozinho** em cerca de 1 minuto, seja do Ramon ou do Felipe. Cada branch ou PR ganha um **link de prévia** (a Vercel comenta o link no PR).

> No plano Hobby, a Vercel só publica commits do Felipe porque o repositório é **público**. Se ele voltar a ser privado, os commits do Felipe deixam de publicar, e aí é preciso o plano Pro com o Felipe como membro. Detalhes em [docs/site-e-acessos.md](docs/site-e-acessos.md#custos-e-limites).

---

## 4. Ligar o formulário ao Supabase

> ✅ **Já feito.** O CONFIG do `main.js` já está preenchido com a Project URL
> (`https://anlniqjoaogsuptuvrtk.supabase.co`) e a Publishable key do projeto **Cap Soleil Club**.
> Neste passo, basta fazer o **cadastro de teste** (mais abaixo). As instruções de colar
> ficam aqui para quando for preciso trocar a chave ou o projeto.

**Pegar os dois dados no Supabase**

1. Entre em **supabase.com** e abra o projeto **Cap Soleil Club**.
2. Em **Project Settings › Data API**, copie a **Project URL** (algo como `https://abcdefgh.supabase.co`).
3. Em **Project Settings › API Keys**, copie a **Publishable key** (começa com `sb_publishable_`).

> ⚠️ Use **somente a Publishable key**. **Nunca** copie a *secret key* (`sb_secret_…`) nem a *service_role*.
> A Publishable key foi feita para ficar visível no site: o banco só deixa **entrar** na lista,
> pela função `join_waitlist`, e **ninguém de fora consegue ler** a lista (RLS ativo).
> Se alguém colar uma chave secreta por engano, o próprio site se recusa a usá-la. Mesmo assim, ela terá ficado
> exposta: apague-a do arquivo e gere uma nova em **Project Settings › API Keys**.

**Colar no site**

1. No GitHub, abra `assets/js/main.js` e clique no **lápis** (Edit).
2. Logo no topo, troque os dois valores entre colchetes, mantendo as aspas:

   ```js
   const CONFIG = {
     SUPABASE_URL: 'https://abcdefgh.supabase.co',
     SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_xxxxxxxxxxxxxxxx',
   };
   ```

3. Clique em **Commit changes** e espere a Vercel publicar (cerca de 1 minuto).

**Fazer um cadastro de teste**

1. No celular, abra o site com `?utm_source=teste` no final, por exemplo:
   `https://capsoleilclub.vercel.app/?utm_source=teste`
2. Preencha nome, e-mail e país, marque a caixa de consentimento e clique em **Join the list**.
3. Deve aparecer **"Thank you, (nome)."**. Se aparecer uma mensagem de erro, confira se a URL e a chave foram coladas inteiras e entre aspas.

---

## 5. Conferir o cadastro no Supabase

1. No Supabase, abra **Table Editor › waitlist**.
2. O cadastro de teste deve estar lá: e-mail em minúsculas, `source` = `teste`, `consent` = `true` e a data/hora.
3. Para apagar o teste: marque a linha e clique em **Delete**.

Como funciona a coluna `source`: ela guarda o `utm_source` do link. Sem `utm_source`, fica `direct`.
Por isso, na bio do Instagram, use o link com `?utm_source=instagram` (ex.: `https://capsoleilclub.vercel.app/?utm_source=instagram`).
E-mail repetido não cria linha nova e mostra a mesma mensagem de sucesso, para o site não revelar quem já está inscrito.

---

## 6. Checklist: antes de pôr o link na bio

- [ ] **Nenhum colchete sobrando no `privacy.html`**: `[RESPONSÁVEL]`, `[ENDEREÇO]`, `[EMAIL DE CONTATO]`, `[PROVEDORES]` e `[DATA]` (veja a tabela abaixo).
- [ ] **Nenhum colchete sobrando no resto do site**: `[URL DO SITE]`, `[EMAIL DE CONTATO]` e `[TRIO DE PRODUTOS]` no `index.html`.
      Para procurar tudo de uma vez, no Terminal, dentro da pasta:
      `grep -rnE "\[(URL DO SITE|EMAIL DE CONTATO|TRIO DE PRODUTOS|RESPONSÁVEL|ENDEREÇO|PROVEDORES|DATA)\]" --include=*.html .`
      Se não aparecer nada, está tudo trocado.
- [ ] **Prévia do link ok no WhatsApp e no Instagram**: mande o link para você mesmo no WhatsApp e numa DM do Instagram. Deve aparecer a imagem verde com a quadra, o título e a descrição.
      Se a prévia vier sem imagem, confira o `[URL DO SITE]` e cole o link em **developers.facebook.com/tools/debug** (clique em *Scrape Again*): WhatsApp e Instagram usam o mesmo leitor da Meta. O WhatsApp guarda prévias antigas; para testar de novo, acrescente `?v=2` no fim do link.
- [ ] **Lighthouse 90+** nas quatro notas: no Chrome do computador, abra o site numa janela anônima, aperte **F12 › Lighthouse**, escolha **Mobile** e clique em **Analyze page load**. Ou use **pagespeed.web.dev**.
- [ ] **Teste num iPhone (Safari) e num Android (Chrome)**: abrir, rolar até o fim, tocar em *Join the list*, enviar um cadastro, ver o *Thank you*, abrir *Privacy* e o link do Instagram.
- [ ] **Cadastros de teste apagados** do Supabase (passo 5).
- [ ] **Hospedagem com uso comercial:** o plano Hobby da Vercel é só para uso pessoal e não comercial. Passe para o Pro (ou outra hospedagem) antes de divulgar. Veja [docs/site-e-acessos.md](docs/site-e-acessos.md#custos-e-limites).
- [ ] **Textos revisados** com o checklist de [docs/marca.md](docs/marca.md#checklist-para-qualquer-texto-novo).

### Onde estão os campos para preencher

| Campo | Arquivo | O que colocar |
|---|---|---|
| `[URL DO SITE]` | `index.html` e `privacy.html` (meta tags no topo) | Endereço final do site, **sem barra no fim**. Ex.: `https://capsoleilclub.vercel.app` |
| `[EMAIL DE CONTATO]` | `index.html` (aviso do formulário e rodapé) e `privacy.html` | E-mail de contato do clube. Troque **todas** as ocorrências, inclusive as que ficam dentro de `mailto:` (use *Localizar e substituir* do editor) |
| `[TRIO DE PRODUTOS]` | `index.html`, seção *I · The hour* | A frase sobre os três produtos, quando o trio for decidido |
| `[RESPONSÁVEL]` | `privacy.html` | Nome da pessoa ou empresa responsável pelos dados |
| `[ENDEREÇO]` | `privacy.html` | Endereço do responsável |
| `[PROVEDORES]` | `privacy.html` | Lista dos serviços usados. Sugestão no comentário logo acima: Supabase, Vercel, Google Fonts, jsDelivr e o serviço de e-mail |
| `[DATA]` | `privacy.html` | Data da última atualização, em inglês. Ex.: `3 October 2026` |

---

## Detalhes técnicos (para quem for mexer no código)

- **Formulário:** valida e-mail e consentimento antes de enviar; tem honeypot invisível contra robôs; o botão fica desabilitado durante o envio; as mensagens usam `aria-live`. Em erro de rede, mostra um aviso e deixa tentar de novo. O envio é **só** pela função `supabase.rpc('join_waitlist', …)`. O site nunca lê a tabela.
- **supabase-js:** versão `2.117.2`, carregada do jsDelivr com verificação de integridade (SRI), e só quando o visitante chega perto do formulário, para a página abrir mais rápido. Se um dia trocar a versão, atualize também o `integrity` em `main.js`:
  `curl -s URL_DO_ARQUIVO | openssl dgst -sha384 -binary | openssl base64 -A`
- **Segurança (`vercel.json`):** CSP liberando apenas o próprio site, o jsDelivr (script), o Google Fonts (fontes) e `*.supabase.co` (envio). Se adicionar outro script ou serviço, ele precisa ser liberado ali, senão o navegador bloqueia.
- **Privacidade:** sem cookies, sem analytics, sem nada salvo no navegador. Como as fontes vêm do Google Fonts e a biblioteca do jsDelivr, esses serviços recebem o IP de quem visita. Por isso eles aparecem na sugestão de `[PROVEDORES]`.
- **Acessibilidade e movimento:** navegação completa por teclado, foco visível, contraste AA. As animações são discretas e desligam sozinhas quando o aparelho pede movimento reduzido.
- **Banco:** `supabase/migrations/20261001000000_waitlist.sql` documenta a tabela `waitlist`, as regras de acesso (RLS) e a função `join_waitlist` como estão hoje. É só referência: **não rode**.
