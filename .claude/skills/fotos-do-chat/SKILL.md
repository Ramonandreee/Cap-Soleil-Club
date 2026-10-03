---
name: fotos-do-chat
description: Use quando o Felipe ou o Ramon disserem que chegaram "imagens do chat", "fotos do ChatGPT" ou fotos novas para o site (H1, I2, B1…). Revisa cada imagem com a direção fotográfica, prepara os arquivos com `npm run fotos`, coloca no site, testa e diz o que muda no Drive.
---

# Fotos do chat (ChatGPT) → site

O Felipe gera as fotos do site no **ChatGPT**, seguindo o Google Doc *Cap Soleil — Direção fotográfica* (espelho: [docs/direcao-fotografica.md](../../../docs/direcao-fotografica.md)). Quando ele disser "são as imagens do chat", faça tudo abaixo **sem pedir instruções**. Pergunte só o que este roteiro manda perguntar.

Este roteiro vale para o **Claude** e para o **Codex** do ChatGPT (ver [`AGENTS.md`](../../../AGENTS.md)). Onde ele diz "Claude", entenda "você".

## 1. Ache os arquivos

Elas podem chegar de quatro jeitos. Use o primeiro que existir:

1. **Geradas na própria tarefa** (o Codex do ChatGPT gera imagens). Salve direto em `fotos-do-chat/`.
2. **Anexadas na conversa.** Use o caminho do arquivo que a mensagem indicar. Se a imagem aparecer só na conversa, sem arquivo no disco, dá para revisar olhando; para salvar no site, peça o arquivo pelo Drive.
3. **Drive**, na pasta *05 - Loja e lançamento › Site — capsoleilclub.com › Fotos do site*. Com o conector do Google Drive, procure pela pasta, baixe os arquivos novos (`download_file_content`) e salve no scratchpad. Sem o conector, peça para anexar na conversa.
4. **GitHub:** não use para as originais. PNG grande fica para sempre no histórico do repositório; a original mora no Drive.

Junte as originais em **`fotos-do-chat/`**, na raiz do repositório. A pasta é ignorada pelo git, então as PNGs nunca entram num commit. A original oficial fica no Drive.

## 2. Descubra o código de cada imagem

Os códigos do roteiro são H1, H1m, H2, H2m, H3, H3m, I1–I4, R1, B1–B3 e L1 (tabela em [direcao-fotografica.md › Roteiro](../../../docs/direcao-fotografica.md#roteiro-lista-de-fotos)).

- **Pelo nome:** `Foto - H1 - v01.png` → H1. O script lê o código sozinho.
- **Sem código no nome** (o ChatGPT salva como "ChatGPT Image …png"): olhe a imagem e compare com a coluna "O que mostra" do roteiro. Mostre o mapeamento ("arquivo X → I3") e **confirme com quem mandou** antes de salvar. Na dúvida entre dois códigos, pergunte.

## 3. Revise cada uma (controle de qualidade)

Abra e olhe cada imagem (no Claude, com a ferramenta Read) e passe por:

- **[Controle de qualidade](../../../docs/direcao-fotografica.md#controle-de-qualidade-antes-de-salvar)** e a lista **[Nunca](../../../docs/direcao-fotografica.md#nunca)** da direção fotográfica.
- **Defeitos típicos do ChatGPT:**
  - tom amarelado em tudo;
  - pele de plástico e rostos simétricos demais;
  - raquetes tortas e cordas embaralhadas;
  - linhas da quadra e rede erradas;
  - letras inventadas em placas, roupas e no lacre;
  - emblema diferente do oficial;
  - mãos com dedos a mais;
  - céu azul elétrico e saibro laranja;
  - aspecto de render (liso demais, sem grão).
- **Lado a lado com H1** (se já existir): mesma luz, mesma cor, mesmo grão.
- **Espaço para o texto** onde o roteiro pede (topo: céu na metade de cima).

Dê um parecer por foto:

- ✅ **Aprovada.**
- ⚠️ **Aprovada com ressalva:** só resolução baixa ou um detalhe que o recorte esconde.
- ❌ **Refazer.** Escreva o ajuste exato para colar no ChatGPT (ex.: *"same scene, but the racket strings must form a regular grid; neutral white balance, no yellow tint"*).

Só seguem para o site as ✅ e ⚠️. Mande o parecer antes de continuar se houver ❌.

## 4. Prepare os arquivos

```bash
npm run fotos -- --conferir fotos-do-chat/          # relatório, sem salvar
npm run fotos -- fotos-do-chat/                     # salva em src/assets/photos/<código>.jpg
npm run fotos -- arquivo.png --codigo=I3 --foco=left  # nome sem código, ou outro foco
```

O script:
- recorta na proporção do roteiro, puxando para o `focus` de `src/lib/photos.ts` (ou `--foco=`);
- limita o lado maior a 3840 px, **sem nunca ampliar**;
- salva em JPEG qualidade 90, sRGB, sem metadados;
- se vierem várias versões do mesmo código, usa a de `vNN` mais alto.

**Resolução do ChatGPT:** ele entrega até 1536 px. O relatório marca ⚠️ abaixo do mínimo para quase todas, e tudo bem: a foto entra como **provisória**.
- O site gera as larguras até a da original, e o navegador amplia o resto.
- Diga no relatório final quais ficaram abaixo do mínimo. Uma versão maior (de um ampliador como Topaz ou Magnific, ou de outra ferramenta) entra depois como `vNN` novo.
- Não amplie com o script.

Depois de salvar, abra os JPEGs gerados e confira o recorte. Se cortou o assunto, rode de novo com outro `--foco`.

## 5. Coloque no site

| Código | Onde entra | Como está hoje |
|---|---|---|
| B1, B2, B3 | `src/components/Boutique.astro` (fragmentos da Pro Shop) | **Pronto:** basta o arquivo existir, a ilustração sai sozinha |
| H1–H3 e H1m–H3m | `src/components/Threshold.astro` (topo) | **A montar** na primeira entrega |
| I1–I4 | `src/components/Hour.astro` (*L’Heure*, uma por frase) | **A montar** |
| R1 | `src/components/Rules.astro` | **A montar** |
| L1 | `src/components/List.astro` | **A montar** |

Para montar um lugar novo, use `<Photo id="…" sizes="…">` com a ilustração atual dentro, como em `Boutique.astro`: sem o arquivo, a ilustração continua. Siga [O fio da história no site](../../../docs/direcao-fotografica.md#o-fio-da-história-no-site) e [No site (técnico)](../../../docs/direcao-fotografica.md#no-site-técnico):

- **Topo:** a foto troca com a hora real. *Midi* usa H2, *L’Heure* usa H1, *Nuit* usa H3, e as fases que faltam ficam com a mais próxima.
  - Só a foto do topo leva `priority`.
  - O céu desenhado continua como fallback.
  - O título fica legível sobre o céu da foto (contraste AA).
- **L’Heure:** uma foto por frase, com a luz caindo de quadro em quadro. A entrada é lenta (1,04 → 1 e fade), nunca carrossel.
- **Mova devagar:** respeite `prefers-reduced-motion`.
- **Sem estilo inline:** a CSP bloqueia `style="…"`. Use classes, ou `setProperty` via script.
- **Texto alternativo:** olhe a foto **real** e reescreva o `alt` dela em `src/lib/photos.ts`. Em inglês, descreva a cena, sem "photo of".

## 6. Teste

1. `npm run verify` precisa passar: tipos, testes, build, navegador e axe. Se o layout mudou, ajuste ou acrescente testes e2e.
2. Capturas no computador (1440 px) e no celular (390 px) de cada lugar que mudou. Mostre ao usuário.
3. Lighthouse no celular: meta 90+.
   - A foto do topo deve ficar em até ~250 KB em AVIF no celular.
   - A página inteira, em até ~1,5 MB no primeiro acesso.

## 7. Documente, publique e avise

- **Uma entrega = uma branch = um PR** (regras do `CLAUDE.md`). Antes do commit, `python3 scripts/check_docs.py`.
- Atualize a tabela [Fotos do site](../../../docs/site-e-acessos.md#fotos-do-site) em `docs/site-e-acessos.md`: código, versão, situação (✅ ou ⚠️ provisória) e data.
- No PR: o parecer de cada foto, o relatório do `npm run fotos` e as capturas.
- **Drive:** diga exatamente o que muda.
  - A original em *Fotos do site*, com o nome `Foto - <código> - vNN.png` e o prompt usado na descrição do arquivo.
  - O status em *Cap Soleil — Site: projetos e acessos*.
  - Nunca crie arquivo duplicado no lugar de editar.
- **Para o Felipe:** a lista do que falta (❌ para refazer, com o ajuste; ⚠️ que pedem versão maior; códigos que ainda não chegaram).
