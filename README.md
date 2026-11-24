# Povos de Erath

Kit modular low poly das 7 raças de Erath: Vran, Beorning, Vodnik, Silvano, Litomante, Aetheryn e Humano.

**Ver online:** https://gentsuyama.github.io/povos-de-erath/

- Modo "Todos os 7": as raças lado a lado, animadas.
- Provador: cabeça, tronco, braços, mãos, pernas e pés de qualquer raça em qualquer outra, com armas por mão.
- Animações: Parado, Andar, Correr, Acenar e Comemorar.

A página é um único arquivo (o modelo vai embutido); precisa de internet só para carregar o three.js.

## Forja de Erath (personagens para o jogo)

- `forja.html`: monta personagens dos 8 povos (Anão, Vran, Beorning, Vodnik, Silvano, Litomante, Aetheryn, Humano) peça por peça, com sorteio, exército e export GLB.
- `forja/erath_forja.js`: o gerador. Módulo puro, sem DOM: roda no navegador e no Node. Tudo é feito em código, com as animações (Parado, Andar, Correr, Atacar, Defender, Comemorar) próprias, sem mocap.
- `bestiario.html` + `forja/erath_criaturas.js`: criaturas do bestiário (lista e plano em `criaturas/`), com variações por espécie.
- `sprites.html` + `sprites/flow/`: teste de sprites 2D gerados só com imagens do Google Flow (Nano Banana 2.1, sem vídeo) para o lobo-falcão, o ursalado e o besouro-armadura. Fluxo: arte conceitual → folha de giro com 5 ângulos → uma folha de sprites com 10 quadros por movimento e direção (parado, andar, correr, atacar × frente, 3/4 de frente, perfil, 3/4 de costas e costas = 60 folhas em `sprites/flow/folhas`). `python sprites/fatiar_folhas.py sprites/flow/folhas sprites/flow/anim` recorta os quadros (corta a grade pelos vales, remove o fundo branco sem apagar o pelo claro, alinha pés e centro, iguala o zoom) e espelha SE, E e NE para fazer SW, W e NW: 8 direções, de 10 a 15 quadros cada. A página mostra as 8 direções animadas e tem um campo para passear com WASD.
- `galeria.html`: as 150 criaturas numa grade. As miniaturas são desenhadas no navegador pelo mesmo módulo, e há busca, filtro por grupo e por família de corpo, "só as que voam" e ordem por tamanho. 🎲 mostra outra variação, e o cartão abre a espécie no bestiário. Os filtros também valem pela URL (`#grupo=Colossais&ordem=tamd`).
- `jogo.html` (**Clareira de Erath**, protótipo jogável): escolha um dos 8 povos e explore uma clareira com criaturas do bestiário carregadas do `personagens/catalogo.json` (GLBs com meshopt, um clone por criatura). As animações tocam na velocidade do catálogo, então os pés não deslizam. Cada espécie tem um temperamento: tímida foge, agressiva ameaça (Rugir/Ameaçar/Gritar) e ataca, neutra revida. Tem combate, defesa, bestiário de espécies vistas salvo no navegador e controles de toque. Teste sem relógio: `jogo.html?teste=8&raca=anao&perto=1` (simula, escreve o estado no console e renderiza).
- `personagens/`: GLBs prontos e `catalogo.json` (veja `personagens/README.md`). Para gerar de novo: `npm install && npm run exportar`.

## Créditos

Animações transferidas do ["Mannequin Man"](https://vinish.dev/free-3d-models/) por vinish.dev, licença [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Alteração: o movimento foi adaptado (retarget) para o esqueleto e as proporções dos personagens de Erath; a malha do manequim não é usada.
