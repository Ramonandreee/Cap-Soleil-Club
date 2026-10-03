# A marca Cap Soleil

> **Fonte:** [Cap Soleil — História e Posicionamento](https://docs.google.com/document/d/1wpN9Pdhrv2OlHiEQjlKkS3lsVlQ_kIIqg37IqpgLLbI/edit)
> (Drive › 01 - Identidade da marca › História e posicionamento). O Drive é a fonte; este arquivo é o espelho (ver [como-trabalhamos.md](como-trabalhamos.md#onde-mora-cada-coisa)).
> **Atualizado em:** 2026-10-03 · **Sincronizado com o Drive em:** 2026-10-03

Cap Soleil é uma marca de roupas e pôsteres inspirada nos clubes de tênis da Riviera Francesa, posicionada no luxo silencioso e vendida na Europa.

## A ideia central: uma hora, não uma data

A história da marca é uma **cena, não uma data**: a hora do fim da tarde num clube de tênis da Riviera.
É daí que vem a seção *I · The hour* do site e a regra de nunca escrever uma data de fundação.

## História

### Em português

Toda tarde de verão na Côte d’Azur tem a sua hora. O sol desce atrás dos pinheiros, as quadras de saibro ficam à sombra e o mar, lá embaixo, muda de cor. O último set termina sem pressa. Alguém serve o chá no terraço, e a brisa do mar pede um agasalho sobre os ombros.

Cap Soleil é essa hora transformada em clube: um clube de tênis à beira do Mediterrâneo, entre Cannes e Antibes, com o espírito da Riviera dos anos 1950. Raquetes de madeira, branco e creme, conversas longas e nada a provar.

Não fazemos roupas para chamar atenção. Fazemos peças para essa hora: moletons bordados com o emblema do clube, bonés com o monograma e pôsteres que trazem de volta os torneios de inverno. Peças discretas, para muitas tardes como essa.

### In English

Every summer afternoon on the Côte d’Azur has its hour. The sun slips behind the pines, the clay courts fall into shade and the sea below changes colour. The last set ends unhurried. Tea is poured on the terrace, and the sea breeze calls for a sweater over the shoulders.

Cap Soleil is that hour, made into a club: a lawn tennis club by the Mediterranean, between Cannes and Antibes, in the spirit of the 1950s Riviera. Wooden rackets, cream and white, long conversations and nothing to prove.

We don’t make clothes to be noticed. We make them for that hour: sweatshirts embroidered with the club emblem, caps with its monogram, and posters that bring back the winter tournaments. Quiet pieces, for many afternoons like this one.

## Posicionamento

Para quem se veste de forma clássica e discreta, Cap Soleil traz o clima de uma tarde num clube de tênis da Riviera para o dia a dia, com peças bordadas e pôsteres de estética heritage, sem ostentação.

| Elemento | Definição |
|---|---|
| Categoria | Roupas e objetos de lifestyle com estética de clube de tênis heritage |
| Mercado | Europa, com vendas em euro |
| Público (proposta) | Adultos de 25 a 45 anos que se vestem de forma clássica, gostam de tênis, viagem e design, e preferem marcas discretas |
| Promessa | O clima de uma tarde na Riviera, vestido no dia a dia |
| Território | Tênis no saibro, pinheiros-mansos, Mediterrâneo, chá no terraço, Riviera dos anos 1950 e 60 |
| Diferencial | Um universo completo de clube (emblema, monograma, torneios, Pro Shop) em vez de estampas soltas |
| Nível | Luxo silencioso, premium acessível |
| O que evitar | Ostentação, logo como símbolo de status, iates, carros esportivos, linguagem de promoção, visual “tech” |

**Em aberto:** faixa de preço e validação do público-alvo.

## Tom de voz

A marca fala como um clube, não como uma loja: evoca cenas e convida, nunca empurra a venda.

- Inglês para o público, com toques de francês (*Tournoi d’Hiver*, *La Boutique du Club*).
- Cenas concretas (saibro, sombra de pinheiros, chá às cinco) em vez de adjetivos como “luxuoso” ou “elegante”.
- Sem linguagem de venda: nada de “shop now”, “promoção” ou “últimas unidades”. A chamada para ação é sempre uma frase conceitual.
- A loja se chama **Pro Shop**, como nos clubes de tênis.
- O clube é apresentado como atmosfera e inspiração: **sem afirmar uma data de fundação** e sem dizer que ele não existe.
- Frases curtas, muito espaço em branco, sem emojis.

### Bio do Instagram (proposta)

Nome do perfil: **Cap Soleil Lawn Tennis Club**

> *Clay, pines and the Mediterranean.*
> *When the sea breeze turns cool,*
> *the Pro Shop is still open ↓*

## Identidade visual, coleções e produtos

Tudo o que é visual está em **[identidade-visual.md](identidade-visual.md)**: o emblema oficial e as regras de uso, os logos alternativos, a paleta da marca e a do site, a tipografia, os pôsteres, as coleções, os produtos-alvo e a experiência da marca.

> **Trio do lançamento: em aberto** (cronograma, S1). Quando for decidido, ele entra nas legendas de *III · La Boutique* (`src/content/site.ts`) e na [identidade-visual.md](identidade-visual.md#os-3-primeiros-produtos-alvo).

## Como isso vira texto no site

### Checklist para qualquer texto novo

- [ ] Está em inglês, com um toque de francês só quando couber.
- [ ] Mostra uma cena concreta (saibro, sombra dos pinheiros, chá às cinco, brisa do mar) em vez de um adjetivo.
- [ ] Não tem linguagem de venda: nada de “shop now”, “sale”, “last units”, urgência ou preço em destaque.
- [ ] Não tem data de fundação (nada de “Est. 1954”) e não diz que o clube não existe.
- [ ] As frases são curtas, há espaço em branco e não há emojis.
- [ ] A loja aparece como **Pro Shop**.
- [ ] Não há nada de ostentação (iates, carros, logo como status).

### Os atos do site e o conceito por trás

O site v2 é *Le Club suit le soleil*: a portaria de um clube que ainda não abriu, na luz real daquela hora na Côte d’Azur. Todos os textos estão em `src/content/site.ts`.

| Ato | Conceito da marca | Texto atual |
|---|---|---|
| 0 · *Le Seuil* (a portaria) | O clube existe, discreto, e ainda não abriu | “A lawn tennis club on the Riviera. Not yet open.” Na hora dourada: “The courts close at sunset. The list does not.” À noite: “The club is closed for the night. The list remains open.” |
| I · *L’Heure* | A história oficial (*In English*, acima), uma frase por tela | “Every summer afternoon on the Côte d’Azur has its hour.” … “Cap Soleil is that hour, made into a club.” |
| II · *Les Règles* | Valores do clube, sem falar de produto | Cinco regras (**proposta para os sócios revisarem**): *Whites are worn on court. Nobody hurries the last set. Tea is poured at five. The sun decides when we stop. Nothing to prove.* |
| III · *La Boutique* | A Pro Shop em fragmentos, sem catálogo nem preço | “The Pro Shop opens to the list first.” Legendas no estilo *Nº 01 — Embroidered, Riviera* |
| IV · *La Liste* | Entrar para o clube, não “se cadastrar” | Chamada: “Put your name down”. Botão: “Put my name down”. Sucesso: “Your name is down. When the Pro Shop opens, the list hears first.” |
| Promessa da lista | Exclusividade por processo, sem urgência | Acesso à Pro Shop **48 horas** antes e *Les Lettres du Club*, **no máximo uma por mês** (proposta; é promessa pública) |

**Ideias do território que o site ainda não usa** (boas para a revisão de textos da sessão D6): pinheiros-mansos, o Mediterrâneo lá embaixo, chá no terraço, a brisa que pede um suéter sobre os ombros, Cannes–Antibes e a Riviera dos anos 1950.
Uma época (“1950s Riviera”) pode aparecer; uma data de fundação, não.
