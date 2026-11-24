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
- `personagens/`: GLBs prontos e `catalogo.json` (veja `personagens/README.md`). Para gerar de novo: `npm install && npm run exportar`.

## Créditos

Animações transferidas do ["Mannequin Man"](https://vinish.dev/free-3d-models/) por vinish.dev, licença [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Alteração: o movimento foi adaptado (retarget) para o esqueleto e as proporções dos personagens de Erath; a malha do manequim não é usada.
