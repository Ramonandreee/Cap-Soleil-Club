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
| Cores, fontes e gráficos **do site** | GitHub: `assets/css/styles.css`, `index.html` e [identidade-visual.md › No site](identidade-visual.md#no-site) | — |
| Código, configuração, banco e segurança do site | GitHub (código, [README](../README.md) e [site-e-acessos.md](site-e-acessos.md)) | Drive: *Site: projetos e acessos* (só status e links) |
| Status das peças (GitHub, Vercel, Supabase, domínio) | GitHub: [site-e-acessos.md](site-e-acessos.md#status) | Drive: *Site: projetos e acessos* |
| Rotina e sessões do site (☐/✅ e Registro) | Drive: *Cap Soleil — Rotina de desenvolvimento do site* | [docs/roadmap.md](roadmap.md) (mapa e impacto no código) |
| Cronograma da loja (S1–S10) | Drive: planilha *Cap Soleil — Cronograma de lançamento* | [docs/roadmap.md](roadmap.md) (resumo) |
| Fornecedores, financeiro, jurídico e Instagram | Drive (pastas 03, 04 e 06) | — (não vai para o GitHub) |
| Regras de trabalho (este documento) | GitHub: `docs/como-trabalhamos.md` | Drive: *07 - Planejamento › Cap Soleil — Como trabalhamos* |
| Senhas e chaves secretas | **Gerenciador de senhas** dos sócios | **Nunca** no GitHub nem no Drive |

## Se mudou isto, atualize aquilo

| Mudou… | No GitHub, atualize | No Drive, atualize |
|---|---|---|
| Texto do site (`index.html`, `privacy.html`) | Seção certa da [marca.md](marca.md#como-isso-vira-texto-no-site), se mudar o conceito | Nada, a não ser que a frase venha de um doc do Drive |
| Cor, fonte, ilustração, favicon ou og-image | [identidade-visual.md › No site](identidade-visual.md#no-site) | *Cap Soleil — Identidade visual*, se mudar a relação com a marca |
| Emblema, logo, pôster ou coleção (arquivo novo ou aprovado) | [identidade-visual.md](identidade-visual.md) | O arquivo na pasta certa, com `vNN` novo, e o Google Doc *Identidade visual* |
| Formulário, banco ou Supabase | [README](../README.md) e [site-e-acessos.md](site-e-acessos.md) | *Site: projetos e acessos* (status) |
| Domínio, hospedagem ou link do site | [site-e-acessos.md](site-e-acessos.md#status), README e meta tags | *Site: projetos e acessos* |
| Sessão da rotina concluída | [roadmap.md](roadmap.md#sessões-do-site) (coluna Estado) | *Rotina*: ☐ → ✅ e uma linha no Registro |
| Decisão tomada (trio, paleta, 1954, hospedagem…) | Tire de “Decisões pendentes” e registre onde ela vale | O doc de origem (*História*, *Rotina*, *Cronograma*…) |
| História, posicionamento ou tom de voz | [marca.md](marca.md) | *Cap Soleil — História e Posicionamento* (a fonte) |
| Política de privacidade ou provedores | `privacy.html` e [site-e-acessos.md](site-e-acessos.md) | *Site: projetos e acessos* |

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

### Revisão semanal (5 minutos, no alinhamento de segunda)

- [ ] Algum documento do Drive mudou depois da data de sincronização da tabela acima? Se sim, atualize o espelho e a data.
- [ ] Algum PR aberto está parado? Algum está vermelho?
- [ ] Alguma “Decisão pendente” foi decidida na semana? Registre nos dois lados.
- [ ] O *Status* do Drive bate com o [site-e-acessos.md](site-e-acessos.md#status)?

## Verificação automática

Todo PR roda a verificação **“Documentação em dia”** (`.github/workflows/docs.yml`). Você também pode rodá-la no seu computador, na pasta do projeto:

```bash
python3 scripts/check_docs.py
```

| Ela confere | Se falhar |
|---|---|
| Se o PR mexe no site (`index.html`, `privacy.html`, `assets/`, `vercel.json`, `.vercelignore` ou `supabase/`) e também mexe em algum documento (`README.md`, `CLAUDE.md` ou `docs/`) | Atualize o documento certo (tabela *Se mudou isto…*). Se de fato não há o que documentar (ex.: corrigir um erro de digitação), escreva no texto do PR a linha `Docs: não se aplica — motivo` |
| Se toda cor de `:root` no `styles.css` e toda fonte do Google Fonts aparecem em [identidade-visual.md › No site](identidade-visual.md#no-site) | Inclua a cor ou a fonte na tabela |
| Se os links entre os documentos (e as âncoras `#`) existem | Corrija o link |
| Se o site menciona data de fundação (“Est. 1954”, “Established”, “Founded in”) | Tire a data: é regra da marca |
| Se cada documento em `docs/` tem a linha **Atualizado em** | Acrescente a linha no topo |

> **Bloquear o merge de verdade:** com o repositório público, o GitHub grátis permite *branch protection*. Em **Settings › Branches › Add rule** (ou *Rulesets*), para a `main`: exigir PR antes do merge e exigir a verificação **Documentação em dia**.
> Enquanto isso não estiver ligado, a regra é: **PR vermelho não entra.**

## Com o Claude

O arquivo [`CLAUDE.md`](../CLAUDE.md), na raiz, passa estas mesmas regras para qualquer sessão do Claude, do Ramon ou do Felipe.
Ao pedir uma mudança, o Claude atualiza a documentação no mesmo PR e diz o que precisa mudar no Drive. Se o conector do Google Docs estiver ligado, ele mesmo faz a atualização no Drive.
