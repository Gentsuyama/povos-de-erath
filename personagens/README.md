# Personagens de Erath (prontos para o jogo)

Gerados 100% em código pelo módulo [`../forja/erath_forja.js`](../forja/erath_forja.js), sem Blender, sem IA de imagem e sem malha importada.
Para ver e montar no navegador, abra a [Forja de Erath](https://gentsuyama.github.io/povos-de-erath/forja.html).

## O que tem aqui

- `<raca>/<raca>_padrao.glb`: o personagem-padrão de cada povo.
- `<raca>/<raca>_<nome>.glb`: variações sorteadas com semente fixa, então saem sempre iguais.
- `catalogo.json`: para cada povo, as categorias de peças, as opções e a lista de arquivos. Cada personagem traz a ficha (`cfg`) que o gerou, triângulos, ossos e velocidades de andar e correr.

Povos: Anão, Vran, Beorning, Vodnik, Silvano, Litomante, Aetheryn e Humano.

## Compressão (importante para carregar)

Os GLBs saem com **EXT_meshopt_compression** e sem os quadros de animação redundantes: em média, um terço do tamanho original.
- **three.js:** `new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)` (de `three/addons/libs/meshopt_decoder.module.js`).
- **Unity:** o glTFast lê direto.
- **Godot ou outro motor sem meshopt:** gere sem compressão com `node forja/exportar.mjs 4 2 --sem-meshopt`.

## Criaturas (bestiário)

- `criaturas/<id>/<id>_padrao.glb` + 2 variações sorteadas por espécie. No `catalogo.json`, a chave `criaturas` traz: número na lista, grupo, família de corpo, se voa, tamanho real, categorias de variação e, por arquivo, altura, animações e velocidades.
- **Família A, bípede com ou sem asas** (fadas, diabretes, ursos alados): `Parado`, `Voar`, `Andar`, `Atacar` e `Comemorar`. Os ossos têm os mesmos nomes dos povos, mais `WingA/B_L/R`, `Tail1..3`, `Ant1/2`, `Hair1/2` e `Fumaca1..3`.
- **Família C, quadrúpede com ou sem asas** (lobo-falcão, javali, alce, tartaruga-de-vento...): `Parado`, `Andar` (passo de 4 tempos), `Correr` (galope; trote nos pesados), `Atacar`, `Rugir` e `Voar` (alados). Os ossos são `Hips, Spine, Chest, Neck, Head, FrontUpLeg/FrontLeg/FrontFoot_L/R, BackUpLeg/BackLeg/BackFoot_L/R`, mais `Tail1..3`, `Mane1/2` e `WingA/B_L/R`.
- **Família D, 6 ou 8 patas** (besouro, aranha, louva, formiga, escorpião, grilo, abelha-ursa, carrapato, caranguejo, olho-aranha, lagarto-carroça): `Parado`, `Andar`, `Correr`, `Atacar`, `Ameaçar`, mais `Voar` ou `Saltar` em quem tem. Os ossos são `Hips, Abdomen, Head`, `LegN A/B/C_L/R`, mais `ArmA/B/C_L/R` (foices e pinças) e `Sting1..5` (ferrão). O caranguejo anda de lado (`direcao` no catálogo).
- **Família E, serpente ou corrente** (serpente-plumada, verme-das-dunas, cobra-de-duas-pontas, lagarta-ônibus, centopeia-trem, vinha, serpente-de-ossos, pipa-dragão): o tamanho é o **comprimento**. Animações: `Parado`, `Mover` (onda; a velocidade está no catálogo), `Atacar`, `Ameaçar`, mais `Voar` ou `Rolar` em quem tem. Os ossos são `Root`, `Seg1..N` (da cabeça à ponta), `Head` e `Jaw`, mais `Petal1..n`, `Pata*` e `Head2`.
- **Família F, tentáculos** (água-viva-do-céu, polvo-erudito, lula-pintora, anêmona, kraken-de-pedra, cabeça-de-lula): `Parado`, `Mover` (a anêmona é fixa e não tem), `Atacar` e `Ameaçar`. Os ossos são `Root`, `Body`, `TentN_1..K`, mais `RimN` (borda do sino) e `Head`/`UpperArm`/`ForeArm`/`Hand`.
- **Família B, flutuante** (fantasmas, chamas, olho, relógio...): `Parado`, `Mover`, `Atacar` e `Comemorar`. Os ossos são `Root`, `Body`, `Top`, mais correntes (braços, barra, tentáculos, fitas, pêndulo).
- A raiz já vem na escala real da espécie, de 6 cm a 10 m. O material `translucido` (asas de inseto, água, bolha) usa transparência (BLEND).
- Para ver e variar: [Bestiário](https://gentsuyama.github.io/povos-de-erath/bestiario.html). Plano das 150 criaturas: [`../criaturas/PLANO.md`](../criaturas/PLANO.md).

## Cada GLB

- **Malha:** 1 malha com pele (skinned), de 1.000 a 3.100 triângulos, sem textura (cor nos vértices). Materiais: `fosco`, `metal` e `brilho` (sem luz, `KHR_materials_unlit`).
- **Animações:** 6 animações: `Parado`, `Andar`, `Correr` (em loop), `Atacar`, `Defender` e `Comemorar`. Andar e correr ficam no lugar. Para o pé não escorregar, mova o personagem na `velocidade_andar` / `velocidade_correr` do catálogo, em m/s.
- **Ossos (os mesmos em todos):** `Hips, Spine, Chest, Neck, Head, UpperArm_L/R, ForeArm_L/R, Hand_L/R, UpLeg_L/R, Leg_L/R, Foot_L/R`.
- **Correntes de mola, quando o personagem tem:** `BeardA/B` (barba), `Tail1..N` (rabo do Vran) e `Hair1..N` (cabelo). Nos clipes elas ficam paradas; no jogo, aplique física de mola ou "spring bone".
- **Eixos:** metros, +Y para cima, o personagem olha para +Z, esquerda dele = +X.
- **Armas:** já vêm na malha, presas aos ossos `Hand_R` e `ForeArm_L` / `Hand_L`.

## Gerar de novo ou mais variações

```
npm install            # instala three@0.160.0 (só para exportar)
npm run exportar       # 1 padrão + 4 variações por povo
node forja/exportar.mjs 12   # 1 padrão + 12 variações por povo
```

## Num jogo web (three.js)

O módulo monta qualquer combinação na hora, em milissegundos:

```js
import { forge, baseCfg, randomCfg, springStep, rng } from './forja/erath_forja.js';
const P = forge('vran', { ...baseCfg('vran'), cauda: 'longa', arma: 'tridente' });
scene.add(P.root);
const mixer = new THREE.AnimationMixer(P.root);
mixer.clipAction(P.clips.find(c => c.name === 'Andar')).play();
// a cada quadro: mixer.update(dt); P.root.updateMatrixWorld(true); springStep(P, dt);
```
