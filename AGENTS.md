# AGENTS.md: instruções para o Codex (ChatGPT)

O Codex lê este arquivo; o Claude lê o [`CLAUDE.md`](CLAUDE.md). As regras são as mesmas para os dois.

**Antes de qualquer tarefa, leia o [`CLAUDE.md`](CLAUDE.md) inteiro e siga-o.** Onde ele diz “Claude”, entenda “você”. Os detalhes estão em [docs/como-trabalhamos.md](docs/como-trabalhamos.md). Converse com o Felipe e o Ramon em **português**. O texto do site é em inglês.

## Como uma mudança vai ao ar

1. Trabalhe numa **branch nova** a partir da `main`. **Nunca** faça commit na `main`.
2. Abra um **PR**. O GitHub roda dois checks:
   - **Documentação em dia**;
   - **Site (testes)**: tipos, testes, build e testes no navegador.

   A **Cloudflare Pages** publica uma **prévia** do PR e comenta o link nele.
3. Com os dois checks verdes, quem pediu a mudança faz o **merge** no GitHub. A Cloudflare publica a `main` sozinha, em cerca de 1 minuto, em https://cap-soleil-club.pages.dev.

Não existe outro passo de deploy. Não rode `wrangler`, `vercel` nem `supabase … deploy`.

## Ambiente

- Node **22** (`.node-version`), depois `npm ci`.
- Antes de abrir o PR, rode:
  - `python3 scripts/check_docs.py`
  - `npm run check`
  - `npm test`
  - `npm run build`
- **Testes no navegador:** `npm run test:e2e` precisa do Chromium do Playwright (`npx playwright install chromium`). Se o ambiente não conseguir rodá-los, o GitHub roda no PR: confira o check **Site (testes)** antes de dizer que terminou.
- `npm run dev` abre o site em http://localhost:4321.

## Fotos do site (“imagens do chat”)

Quando o Felipe disser que são **imagens do chat**, ou pedir para colocar fotos no site, siga [`.claude/skills/fotos-do-chat/SKILL.md`](.claude/skills/fotos-do-chat/SKILL.md) do começo ao fim. Ele vale para você também.

- Salve as imagens que você gerar ou que vierem anexadas em **`fotos-do-chat/`**, na raiz. A pasta é ignorada pelo git: as originais não entram no repositório, elas moram no Drive.
- Dê a cada uma o nome `Foto - <código> - vNN.png`, com o código do roteiro: H1, H1m, I3, B2…
- Prepare com `npm run fotos -- fotos-do-chat/`.
- O commit leva só os JPEGs em `src/assets/photos/`, o código e os docs que mudaram.

## O que você não faz (fica com o Ramon e o Claude)

- **Banco e função `apply` (Supabase):** você não tem acesso. Se a tarefa precisar de migration ou de publicar a função, pare e diga o que falta.
- **Chaves e senhas:** nunca no código, nos docs ou no PR.
- **Google Drive:** você não edita. Diga exatamente o que muda (documento, trecho e texto novo), como manda o `CLAUDE.md`.

## Ao terminar

Responda em português com:
- o que mudou;
- o link do PR;
- o link da prévia (no comentário da Cloudflare no PR);
- o resultado dos checks;
- o que muda no Drive.
