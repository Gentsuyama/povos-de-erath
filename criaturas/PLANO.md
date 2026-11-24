# Plano de ação — Bestiário de Erath (150 criaturas)

Objetivo: gerar em código as 150 criaturas de [`lista_150.md`](lista_150.md), cada uma com **variações** (sorteio por espécie), animações próprias da família de corpo, GLBs e entrada no catálogo do jogo.

## Arquitetura
- `forja/erath_criaturas.js`: módulo puro (navegador + Node), separado dos povos (`erath_forja.js`).
  - **Famílias de esqueleto.** Cada uma tem o seu jeito de mover (clipes assados) e as correntes de mola dela.
  - **Espécies.** Cada uma é uma "receita" com categorias de variação próprias, mais `tamanho` e paletas de cor.
  - Construída no tamanho nominal (~1 m) e escalada para o tamanho real da espécie (de 6 cm a 40 m) pela raiz.
- `bestiario.html`: escolhe a espécie, monta peça por peça e sorteia variações. Também mostra um bando de 7 variações e a comparação ao lado do anão em escala real, e exporta GLB.
- `forja/exportar.mjs`: exporta o padrão mais 2 variações por espécie para `personagens/criaturas/<id>/` e acrescenta ao `catalogo.json`.

## Variação (para não saírem todas iguais)
Cada espécie tem de 3 a 5 categorias: paleta de cor (4 a 6), forma de uma parte marcante (asas, chifres, orelhas, cabelo, cauda...), acessório e tamanho (P, M ou G). O bando e o exportador sempre sorteiam combinações diferentes.

## Fases
| Fase | Família | Espécies (nº da lista) | Animações | Status |
|---|---|---|---|---|
| 1 | A: bípede pequeno, com ou sem asas | fadas 1–7, 9–12 · diabretes 13–24 · ursos alados 25, 26, 36 | Parado, Voar/Andar, Atacar, Comemorar | **feita** |
| 1 | B: flutuante | 8, 103, 105, 108, 113, 114, 117, 118, 122, 123, 124, 142 | Parado, Mover, Atacar, Comemorar | **feita** |
| 2 | C: quadrúpede (com ou sem asas) | 27–35, 37–52, 106, 121, 133, 146 | Parado, Andar, Correr, Atacar, Voar (alados) | a fazer |
| 3 | D: hexápode / octópode | 40, 65–69, 73, 75, 76, 80, 138 | ritmo alternado em tripé | a fazer |
| 4 | E: serpente / verme / corrente | 53, 56, 58, 71, 74, 92, 116, 150 | onda procedural | a fazer |
| 5 | F: radial / tentáculos | 77, 78, 83, 88, 132, 139 | correntes com mola + pulso | a fazer |
| 6 | G: amorfo / rolante / monopé | 20 (bola), 87, 90, 110, 135, 136, 140, 141, 145 | esticar e achatar, rolar, pular | a fazer |
| 7 | A+: bípedes grandes e gigantes | 89, 95, 101, 102, 107, 109, 115, 125–131, 134, 143, 147–149 | as da família A, com peso | a fazer |
| 8 | Especiais | 54, 55, 57, 59–64, 70, 72, 79, 81–86, 91, 93, 94, 96–100, 104, 111, 112, 119, 120, 137, 144 | por espécie | a fazer |
| 9 | Colossais / enxames | 63, 85, 98, 127, 132 | escala e LOD | a fazer |

## Regras herdadas da Forja
- Peças duras ficam 100% num osso; pano, cabelo e rabo vão em correntes com mola.
- Cor nos vértices, sem textura. Materiais: fosco, metal, brilho e translúcido (asas de inseto, água, bolha).
- QA visual com `?sheet=...` (folha de poses), conferindo frente, lado e costas antes de publicar.
- O teste local precisa de servidor HTTP (o módulo não abre em `file://`).
