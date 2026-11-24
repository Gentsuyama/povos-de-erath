// Forja de Erath — personagens low poly 100% em código (sem malha importada, sem textura).
// Módulo puro (sem DOM): roda no navegador (importmap "three") e no Node (npm three@0.160.0).
//   import { RACAS, catsOf, baseCfg, forge, springStep, randomCfg, nameOf } from './erath_forja.js'
//   const P = forge('anao', baseCfg('anao'));   // P.root (Group com SkinnedMesh + ossos), P.clips (6 animações), P.springs
// Convenções: Y para cima, personagem olha para +Z, esquerda dele = +X. Ossos com nomes estáveis (Hips, Spine, Chest, Neck, Head,
// UpperArm_L/R, ForeArm_L/R, Hand_L/R, UpLeg_L/R, Leg_L/R, Foot_L/R; correntes de mola: BeardA/B, Tail1.., Hair1..).
import * as THREE from 'three';
import { mergeGeometries, toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

export const D2R = Math.PI / 180;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ramp = (v, a, b) => clamp((v - a) / (b - a), 0, 1);
function hash3(x, y, z) {
  const f = v => { const s = Math.sin(v) * 43758.5453; return (s - Math.floor(s)) * 2 - 1; };
  return [f(x * 127.1 + y * 311.7 + z * 74.7), f(x * 269.5 + y * 183.3 + z * 246.1), f(x * 113.5 + y * 271.9 + z * 124.6)];
}
export function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hashStr = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const hex = (c, k) => '#' + new THREE.Color(c).multiplyScalar(k).getHexString();

// ======================================================================= catálogo
const P_ = (...a) => a;                                  // [chave, rótulo]
const PELE_HUM = { clara: '#f0c4a0', rosada: '#e3a782', morena: '#b97c55', escura: '#7a4b33' };
const PELO_HUM = { ruivo: '#c4532a', castanho: '#6b4126', loiro: '#d9a84e', preto: '#2e2724', grisalho: '#8f8a84', branco: '#e6e2da' };
const GLOW = { azul: '#5fc8ff', verde: '#6fffb0', laranja: '#ffa040', roxo: '#c47aff', dourado: '#ffd26a', violeta: '#b07aff' };
export const CLA = {
  brasa: { n: 'Brasa', tunic: '#2f6193', trim: '#e2ab36', steel: '#aab3bd', leather: '#7b4a2b', cloth: '#7b2f22' },
  rocha: { n: 'Rocha', tunic: '#5d6670', trim: '#d4d9e0', steel: '#9aa2ab', leather: '#5a4636', cloth: '#3e444b' },
  floresta: { n: 'Floresta', tunic: '#3f6b3a', trim: '#c08850', steel: '#a3a89c', leather: '#6b4a2b', cloth: '#5a4a2a' },
  sangue: { n: 'Sangue', tunic: '#8a2a24', trim: '#d9a441', steel: '#5d6168', leather: '#4a2e1e', cloth: '#2a2422' },
  gelo: { n: 'Gelo', tunic: '#c9d6e4', trim: '#a9cbe6', steel: '#bcc7d2', leather: '#8a6a4a', cloth: '#3f5f85' },
  mar: { n: 'Mar', tunic: '#24406b', trim: '#cfd8e0', steel: '#9fb0bd', leather: '#5a4636', cloth: '#2f8a8a' },
  veu: { n: 'Véu', tunic: '#2a2f5a', trim: '#d6dbe6', steel: '#8e98b0', leather: '#2e2a3a', cloth: '#5a3a85' },
  reino: { n: 'Reino', tunic: '#283f6b', trim: '#e2ab36', steel: '#b9c1c9', leather: '#5a3a22', cloth: '#a3262a' },
  fera: { n: 'Fera', tunic: '#6b5a45', trim: '#b9824a', steel: '#8f959c', leather: '#5a3a22', cloth: '#4f3f33' },
  bosque: { n: 'Bosque', tunic: '#4f7a3a', trim: '#b9824a', steel: '#a3a89c', leather: '#7b5233', cloth: '#6b4a2b' },
};
const COMUM = {
  porte: { n: 'Porte', o: [P_('atarracado', 'Padrão'), P_('forte', 'Forte'), P_('barrigudo', 'Barrigudo'), P_('magro', 'Magro')] },
  altura: { n: 'Altura', o: [P_('baixo', 'Baixo'), P_('medio', 'Médio'), P_('alto', 'Alto')] },
  arma: { n: 'Mão direita', o: [P_('machado', 'Machado'), P_('martelo', 'Martelo'), P_('picareta', 'Picareta'), P_('espada', 'Espada'), P_('machado2', 'Machado duplo'),
    P_('maca', 'Maça'), P_('cajado', 'Cajado'), P_('tridente', 'Tridente')] },
  esquerda: { n: 'Mão esquerda', o: [P_('redondo', 'Escudo redondo'), P_('torre', 'Escudo quadrado'), P_('broquel', 'Broquel'), P_('livro', 'Livro'), P_('orbe', 'Orbe'),
    P_('caneca', 'Caneca'), P_('nada', 'Nada')] },
  cla: { n: 'Cores', o: Object.entries(CLA).map(([k, v]) => [k, v.n]) },
};
const PORTE = { atarracado: { kx: 1, bar: 1 }, forte: { kx: 1.12, bar: 1.02 }, barrigudo: { kx: 1.04, bar: 1.2 }, magro: { kx: 0.9, bar: 0.92 } };
const ALT = { baixo: 0.92, medio: 1, alto: 1.08 };
const cores = obj => Object.keys(obj).map(k => [k, k[0].toUpperCase() + k.slice(1).replace('-', ' ')]);

export const RACAS = {
  anao: { nome: 'Anão', titulo: 'Os Filhos da Forja', k: { x: 1, y: 1 },
    cats: {
      pele: { n: 'Pele', o: cores(PELE_HUM), cor: PELE_HUM },
      olhos: { n: 'Olhos', o: [P_('bravos', 'Bravos'), P_('calmos', 'Calmos'), P_('sabio', 'Sábio'), P_('tapa', 'Tapa-olho')] },
      nariz: { n: 'Nariz', o: [P_('batata', 'Batata'), P_('comprido', 'Comprido'), P_('pequeno', 'Pequeno')] },
      barba: { n: 'Barba', o: [P_('cheia', 'Cheia'), P_('bifurcada', 'Bifurcada'), P_('longa', 'Longa'), P_('curta', 'Curta'), P_('bigode', 'Só bigode')] },
      pelo: { n: 'Cor do pelo', o: cores(PELO_HUM), cor: PELO_HUM },
      cabeca: { n: 'Cabeça', o: [P_('chifres', 'Chifres'), P_('asas', 'Asas'), P_('fechado', 'Elmo fechado'), P_('capuz', 'Capuz'), P_('coroa', 'Coroa'), P_('moicano', 'Moicano'), P_('careca', 'Careca')] },
      tronco: { n: 'Tronco', o: [P_('couraca', 'Couraça'), P_('malha', 'Cota de malha'), P_('couro', 'Couro'), P_('avental', 'Avental'), P_('tunica', 'Túnica')] },
      ombros: { n: 'Ombros', o: [P_('redondas', 'Redondas'), P_('pontudas', 'Pontudas'), P_('pele', 'Pele'), P_('nenhuma', 'Nada')] },
      pernas: { n: 'Pernas', o: [P_('malha', 'Saia de malha'), P_('saiote', 'Saiote'), P_('calca', 'Calça')] },
      pes: { n: 'Pés', o: [P_('biqueira', 'Biqueira de aço'), P_('pelo', 'Botas de pelo'), P_('simples', 'Botas simples')] },
    },
    base: { pele: 'rosada', olhos: 'bravos', nariz: 'batata', barba: 'cheia', pelo: 'ruivo', cabeca: 'chifres', tronco: 'couraca', ombros: 'redondas', pernas: 'malha', pes: 'biqueira', arma: 'machado', esquerda: 'redondo', cla: 'brasa' },
    nomes: [['Bra', 'Dur', 'Gor', 'Kha', 'Tor', 'Bal', 'Ur', 'Grim', 'Hal', 'Mor', 'Brun', 'Dag', 'Rok', 'Vor', 'Hel'], ['kk', 'nar', 'gar', 'rek', 'vik', 'dan', 'rum', 'dor', 'mek', 'stan', 'rik', 'gal', 'bur', 'tok'],
      ['Barba-de-Brasa', 'Punho-de-Ferro', 'Olho-de-Pedra', 'Martelo-Rubro', 'Pé-de-Bigorna', 'Barba-de-Gelo', 'Quebra-Rocha', 'Escudo-Fundo', 'Fogo-de-Forja', 'Caneca-Cheia']],
    fixo: ['Brakk', 'Barba-de-Brasa'] },
  vran: { nome: 'Vran', titulo: 'Os Escamados', k: { x: 1, y: 1 },
    cats: {
      escamas: { n: 'Escamas', o: cores({ verde: 1, azul: 1, vermelho: 1, areia: 1, roxo: 1 }), cor: { verde: '#5f9a3e', azul: '#3f7aa8', vermelho: '#b0473a', areia: '#c9a260', roxo: '#7a5a9e' } },
      crista: { n: 'Crista', o: [P_('espinhos', 'Espinhos'), P_('longa', 'Longa'), P_('chifrinhos', 'Chifrinhos'), P_('nenhuma', 'Nenhuma')] },
      olhos: { n: 'Olhos', o: [P_('amarelos', 'Amarelos'), P_('laranja', 'Laranja'), P_('verdes', 'Verdes'), P_('sono', 'Sonolentos')] },
      focinho: { n: 'Focinho', o: [P_('curto', 'Curto'), P_('longo', 'Longo')] },
      cauda: { n: 'Cauda', o: [P_('grossa', 'Grossa'), P_('longa', 'Longa'), P_('espinhos', 'Com espinhos')] },
      tronco: { n: 'Tronco', o: [P_('couraca', 'Couraça'), P_('tunica', 'Túnica'), P_('couro', 'Couro'), P_('malha', 'Cota de malha'), P_('mago', 'Toga de escriba')] },
      ombros: { n: 'Ombros', o: [P_('redondas', 'Redondas'), P_('pontudas', 'Pontudas'), P_('nenhuma', 'Nada')] },
      pernas: { n: 'Pernas', o: [P_('saiote', 'Saiote'), P_('calca', 'Calça'), P_('malha', 'Saia de malha')] },
      pes: { n: 'Pés', o: [P_('biqueira', 'Botas de aço'), P_('garras', 'Garras')] },
    },
    base: { escamas: 'verde', crista: 'espinhos', olhos: 'amarelos', focinho: 'curto', cauda: 'grossa', tronco: 'couraca', ombros: 'redondas', pernas: 'saiote', pes: 'biqueira', arma: 'espada', esquerda: 'livro', cla: 'sangue' },
    nomes: [['Ssa', 'Kre', 'Vass', 'Zir', 'Tha', 'Ixi', 'Sko', 'Rhe', 'Ssor'], ['ssik', 'zar', 'thor', 'ix', 'ssa', 'rek', 'iss', 'kesh'],
      ['Escama-de-Jade', 'Língua-Rápida', 'Olho-de-Âmbar', 'Cauda-Firme', 'Pena-Sábia', 'Sangue-Frio', 'Pergaminho-Vivo']] },
  beorning: { nome: 'Beorning', titulo: 'Os Filhos da Fera', k: { x: 1.1, y: 1.07 },
    cats: {
      pele: { n: 'Pele', o: cores(PELE_HUM), cor: PELE_HUM },
      pelo: { n: 'Cor do pelo', o: cores(PELO_HUM), cor: PELO_HUM },
      cabelo: { n: 'Cabelo', o: [P_('longo', 'Longo'), P_('tranca', 'Trança'), P_('rabo', 'Rabo'), P_('curto', 'Curto')] },
      barba: { n: 'Barba', o: [P_('enorme', 'Enorme'), P_('longa', 'Trançada'), P_('curta', 'Curta'), P_('bigode', 'Só bigode')] },
      cabeca: { n: 'Cabeça', o: [P_('nada', 'Nada'), P_('urso', 'Capuz de urso'), P_('faixa', 'Faixa'), P_('chifres', 'Elmo com chifres')] },
      tronco: { n: 'Tronco', o: [P_('peles', 'Lã e couro'), P_('couro', 'Couro'), P_('malha', 'Cota de malha'), P_('tunica', 'Túnica')] },
      ombros: { n: 'Ombros', o: [P_('urso', 'Gola de urso'), P_('pele', 'Peles'), P_('nenhuma', 'Nada')] },
      pernas: { n: 'Pernas', o: [P_('calca', 'Calça'), P_('saiote', 'Saiote')] },
      pes: { n: 'Pés', o: [P_('pelo', 'Botas de pelo'), P_('simples', 'Botas simples')] },
    },
    base: { pele: 'rosada', pelo: 'castanho', cabelo: 'longo', barba: 'enorme', cabeca: 'nada', tronco: 'peles', ombros: 'urso', pernas: 'calca', pes: 'pelo', arma: 'machado2', esquerda: 'redondo', cla: 'fera' },
    nomes: [['Bjor', 'Ulf', 'Grom', 'Hakk', 'Rag', 'Sten', 'Ove', 'Torv', 'Arn'], ['n', 'vald', 'ar', 'mund', 'rik', 'geir', 'olf', 'bjorn'],
      ['Pele-de-Urso', 'Uivo-do-Norte', 'Mão-Pesada', 'Neve-Rubra', 'Dente-de-Lobo', 'Pinheiro-Velho', 'Garra-Lenta']] },
  vodnik: { nome: 'Vodnik', titulo: 'O Povo das Águas', k: { x: 1, y: 0.98 }, headDrop: 0.06,
    cats: {
      pele: { n: 'Pele', o: cores({ azulada: 1, 'verde-agua': 1, coral: 1, abissal: 1, dourada: 1 }), cor: { azulada: '#8fa9b8', 'verde-agua': '#6fb3a5', coral: '#e08a6a', abissal: '#4f5a8a', dourada: '#d1b06a' } },
      barbatanas: { n: 'Barbatanas', o: [P_('laterais', 'Laterais'), P_('crista', 'Crista'), P_('ambas', 'As duas')] },
      corfin: { n: 'Cor das barbatanas', o: cores({ laranja: 1, vermelha: 1, amarela: 1, turquesa: 1 }), cor: { laranja: '#e8762e', vermelha: '#c8323a', amarela: '#e8c03a', turquesa: '#2fb8b0' } },
      olhos: { n: 'Olhos', o: [P_('dourados', 'Dourados'), P_('prata', 'Prata'), P_('vermelhos', 'Vermelhos')] },
      chapeu: { n: 'Chapéu', o: [P_('nada', 'Nada'), P_('tricornio', 'Tricórnio'), P_('bandana', 'Bandana'), P_('gorro', 'Gorro')] },
      tronco: { n: 'Tronco', o: [P_('casaco', 'Casaco de capitão'), P_('colete', 'Colete'), P_('malha', 'Cota de malha'), P_('tunica', 'Túnica')] },
      pernas: { n: 'Pernas', o: [P_('calca', 'Calça'), P_('bermuda', 'Bermuda')] },
      pes: { n: 'Pés', o: [P_('palmado', 'Palmados'), P_('simples', 'Botas')] },
    },
    base: { pele: 'azulada', barbatanas: 'laterais', corfin: 'laranja', olhos: 'dourados', chapeu: 'nada', tronco: 'casaco', pernas: 'calca', pes: 'palmado', arma: 'tridente', esquerda: 'broquel', cla: 'mar' },
    nomes: [['Mar', 'Ond', 'Kel', 'Pel', 'Nau', 'Bru', 'Sal', 'Cor', 'Ost'], ['ivo', 'ush', 'ap', 'ago', 'im', 'uro', 'ena', 'oth'],
      ['Maré-Alta', 'Olho-de-Farol', 'Escama-Prata', 'Vento-de-Popa', 'Âncora-Firme', 'Canto-das-Ondas', 'Rede-Cheia']] },
  silvano: { nome: 'Silvano', titulo: 'Os Chifrudos', k: { x: 0.95, y: 0.98 },
    cats: {
      chifres: { n: 'Chifres', o: [P_('carneiro', 'Carneiro'), P_('cabra', 'Cabra'), P_('retos', 'Retos'), P_('galhos', 'Galhos')] },
      pele: { n: 'Pele', o: cores(PELE_HUM), cor: PELE_HUM },
      pelo: { n: 'Cor do pelo', o: cores(PELO_HUM), cor: PELO_HUM },
      cabelo: { n: 'Cabelo', o: [P_('ondulado', 'Ondulado'), P_('curto', 'Curto'), P_('rabo', 'Rabo'), P_('longo', 'Longo')] },
      barba: { n: 'Barba', o: [P_('curta', 'Curta'), P_('cavanhaque', 'Cavanhaque'), P_('nenhuma', 'Sem barba'), P_('longa', 'Longa')] },
      cabeca: { n: 'Cabeça', o: [P_('nada', 'Nada'), P_('folhas', 'Coroa de folhas'), P_('faixa', 'Faixa')] },
      tronco: { n: 'Tronco', o: [P_('colete', 'Colete e bolsa'), P_('tunica', 'Túnica'), P_('couro', 'Couro'), P_('avental', 'Avental de artista')] },
      pernas: { n: 'Pernas', o: [P_('calca', 'Calça'), P_('bermuda', 'Bermuda'), P_('saiote', 'Saiote')] },
      pes: { n: 'Pés', o: [P_('simples', 'Botas curtas'), P_('cascos', 'Cascos')] },
    },
    base: { chifres: 'carneiro', pele: 'rosada', pelo: 'ruivo', cabelo: 'ondulado', barba: 'curta', cabeca: 'nada', tronco: 'colete', pernas: 'calca', pes: 'simples', arma: 'cajado', esquerda: 'nada', cla: 'bosque' },
    nomes: [['Fau', 'Lir', 'Bram', 'Ciro', 'Tam', 'Pip', 'Oren', 'Sil', 'Ewa'], ['nel', 'wyn', 'bo', 'lo', 'ras', 'dil', 'mir', 'len'],
      ['Chifre-Torto', 'Pincel-Verde', 'Canto-do-Bosque', 'Pé-Ligeiro', 'Folha-Rubra', 'Flauta-Doce', 'Musgo-Manso']] },
  litomante: { nome: 'Litomante', titulo: 'Os Nascidos da Pedra', k: { x: 1.16, y: 1.04, bar: 1.04 },
    cats: {
      rocha: { n: 'Rocha', o: cores({ cinza: 1, areia: 1, basalto: 1, musgo: 1, marmore: 1 }), cor: { cinza: '#8a8580', areia: '#b39b78', basalto: '#4f4c4c', musgo: '#7d8263', marmore: '#d9d5cc' } },
      brilho: { n: 'Cristais', o: cores({ azul: 1, verde: 1, laranja: 1, roxo: 1 }) },
      cabeca: { n: 'Cabeça', o: [P_('redonda', 'Redonda'), P_('quadrada', 'Quadrada'), P_('cristais', 'Coroa de cristais'), P_('musgo', 'Musgo')] },
      olhos: { n: 'Olhos', o: [P_('redondos', 'Redondos'), P_('fenda', 'Fenda'), P_('tres', 'Três olhos')] },
      ombros: { n: 'Ombros', o: [P_('cristais', 'Cristais'), P_('pedregulhos', 'Pedregulhos'), P_('nenhuma', 'Lisos')] },
      corpo: { n: 'Corpo', o: [P_('liso', 'Placas'), P_('rachado', 'Rachado (brilho)'), P_('musgo', 'Musgoso')] },
    },
    base: { rocha: 'cinza', brilho: 'azul', cabeca: 'redonda', olhos: 'redondos', ombros: 'cristais', corpo: 'liso', arma: 'martelo', esquerda: 'nada', cla: 'rocha' },
    nomes: [['Gra', 'Kor', 'Bas', 'Ond', 'Mag', 'Sil', 'Qua', 'Obs', 'Fel'], ['nit', 'alt', 'ix', 'rum', 'dor', 'ek', 'ul', 'orn'],
      ['Coração-de-Cristal', 'Passo-de-Montanha', 'Veio-Azul', 'Rocha-Antiga', 'Punho-de-Granito', 'Eco-Profundo', 'Musgo-Velho']] },
  aetheryn: { nome: 'Aetheryn', titulo: 'Os Nascidos do Véu', k: { x: 0.92, y: 1.07 },
    cats: {
      pele: { n: 'Pele', o: cores({ lavanda: 1, perolada: 1, 'azul-palida': 1, 'cinza-lunar': 1 }), cor: { lavanda: '#d9cce8', perolada: '#eee8f2', 'azul-palida': '#c8d6ea', 'cinza-lunar': '#b9b8c6' } },
      pelo: { n: 'Cabelo (cor)', o: cores({ prata: 1, branco: 1, violeta: 1, noite: 1 }), cor: { prata: '#c9ccd6', branco: '#f2f0f5', violeta: '#8a6ab8', noite: '#2a2f48' } },
      cabelo: { n: 'Cabelo', o: [P_('rabo', 'Rabo alto'), P_('tranca', 'Trança'), P_('longo', 'Solto'), P_('coque', 'Coque')] },
      brilho: { n: 'Brilho', o: cores({ violeta: 1, azul: 1, verde: 1, dourado: 1 }) },
      orelhas: { n: 'Orelhas', o: [P_('longa', 'Longas'), P_('pontuda', 'Curtas')] },
      cabeca: { n: 'Cabeça', o: [P_('nada', 'Nada'), P_('tiara', 'Tiara'), P_('capuz', 'Capuz')] },
      tronco: { n: 'Tronco', o: [P_('mago', 'Armadura de runas'), P_('tunica', 'Túnica'), P_('couraca', 'Couraça leve'), P_('couro', 'Couro')] },
      pernas: { n: 'Pernas', o: [P_('calca', 'Calça'), P_('saiote', 'Saiote')] },
      pes: { n: 'Pés', o: [P_('altas', 'Botas altas'), P_('simples', 'Botas curtas')] },
    },
    base: { pele: 'lavanda', pelo: 'prata', cabelo: 'rabo', brilho: 'violeta', orelhas: 'longa', cabeca: 'nada', tronco: 'mago', pernas: 'calca', pes: 'altas', arma: 'cajado', esquerda: 'orbe', cla: 'veu' },
    nomes: [['Ae', 'Ily', 'Sae', 'Vel', 'Ny', 'Thi', 'Lu', 'Ori', 'Ser'], ['ris', 'andra', 'th', 'wen', 'miel', 'sar', 'lith', 'nor'],
      ['Voz-do-Véu', 'Olhar-Estelar', 'Runa-Viva', 'Asa-de-Névoa', 'Lâmina-Lunar', 'Sussurro-Prata', 'Chama-Fria']] },
  humano: { nome: 'Humano', titulo: 'Os Povos dos Reinos', k: { x: 0.95, y: 1.05 },
    cats: {
      rosto: { n: 'Rosto', o: [P_('fem', 'Feminino'), P_('masc', 'Masculino')] },
      pele: { n: 'Pele', o: cores(PELE_HUM), cor: PELE_HUM },
      pelo: { n: 'Cor do cabelo', o: cores(PELO_HUM), cor: PELO_HUM },
      cabelo: { n: 'Cabelo', o: [P_('rabo', 'Rabo'), P_('coque', 'Coque'), P_('curto', 'Curto'), P_('longo', 'Longo'), P_('tranca', 'Trança')] },
      barba: { n: 'Barba', o: [P_('nenhuma', 'Sem barba'), P_('curta', 'Curta'), P_('cavanhaque', 'Cavanhaque'), P_('cheia', 'Cheia')] },
      cabeca: { n: 'Cabeça', o: [P_('nada', 'Nada'), P_('elmo', 'Elmo aberto'), P_('fechado', 'Elmo fechado'), P_('capuz', 'Capuz'), P_('coroa', 'Coroa')] },
      tronco: { n: 'Tronco', o: [P_('placas', 'Placas e faixa'), P_('gibao', 'Gibão'), P_('malha', 'Cota de malha'), P_('couro', 'Couro'), P_('tunica', 'Túnica')] },
      ombros: { n: 'Ombros', o: [P_('redondas', 'Redondas'), P_('pontudas', 'Pontudas'), P_('nenhuma', 'Nada')] },
      pernas: { n: 'Pernas', o: [P_('malha', 'Saia de malha'), P_('calca', 'Calça'), P_('saiote', 'Saiote')] },
      pes: { n: 'Pés', o: [P_('biqueira', 'Botas de aço'), P_('simples', 'Botas simples')] },
    },
    base: { rosto: 'fem', pele: 'clara', pelo: 'castanho', cabelo: 'rabo', barba: 'nenhuma', cabeca: 'nada', tronco: 'placas', ombros: 'redondas', pernas: 'malha', pes: 'biqueira', arma: 'espada', esquerda: 'redondo', cla: 'reino' },
    nomes: [['Ali', 'Bea', 'Cas', 'Ed', 'Ma', 'Ro', 'Isa', 'Ger', 'Lu'], ['na', 'tor', 'ric', 'lia', 'mund', 'bel', 'win', 'dra'],
      ['da Muralha', 'do Leão', 'Escudo-Rubro', 'da Aurora', 'Mão-de-Prata', 'do Vale', 'Coração-Leal']] },
};
export const RACA_ORDEM = ['anao', 'vran', 'beorning', 'vodnik', 'silvano', 'litomante', 'aetheryn', 'humano'];
export function catsOf(raca) {
  const R = RACAS[raca], out = [];
  out.push({ k: 'porte', ...COMUM.porte }, { k: 'altura', ...COMUM.altura });
  for (const [k, v] of Object.entries(R.cats)) out.push({ k, n: v.n, o: v.o });
  out.push({ k: 'arma', ...COMUM.arma }, { k: 'esquerda', ...COMUM.esquerda }, { k: 'cla', ...COMUM.cla });
  return out;
}
export const baseCfg = raca => ({ porte: 'atarracado', altura: 'medio', ...RACAS[raca].base });
export const cfgKey = (raca, c) => raca + ':' + catsOf(raca).map(x => c[x.k]).join('.');
export function randomCfg(raca, r) { const c = {}; for (const x of catsOf(raca)) c[x.k] = x.o[Math.floor(r() * x.o.length)][0]; return c; }
export function nameOf(raca, c) {
  const R = RACAS[raca];
  if (R.fixo && cfgKey(raca, c) === cfgKey(raca, baseCfg(raca))) return R.fixo;
  const r = rng(hashStr(cfgKey(raca, c))), pick = a => a[Math.floor(r() * a.length)];
  return [pick(R.nomes[0]) + pick(R.nomes[1]), pick(R.nomes[2])];
}
export const combinacoes = raca => catsOf(raca).reduce((m, c) => m * c.o.length, 1);

// ======================================================================= poses (coordenadas do personagem-base; cada um reescala)
const SX0 = 0.285, CHEST0 = V3(0, 0.76, 0), HEAD0 = V3(0, 1.0, 0);
const E = (a, order = 'YXZ') => new THREE.Quaternion().setFromEuler(new THREE.Euler(a[0] * D2R, a[1] * D2R, a[2] * D2R, order));
const AXE = (th, yaw = 0, roll = 0) => E([th, yaw, roll], 'XYZ');
function SHIELD(normal, along) {
  const x = V3(...normal).normalize(), y = V3(...along).normalize().negate();
  y.addScaledVector(x, -y.dot(x)).normalize();
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, new THREE.Vector3().crossVectors(x, y)));
}
function basePose() {
  return {
    hp: [0, 0.488, 0], hr: [0, 0, 0], sp: [0, 0, 0], ch: [0, 0, 0], nk: [0, 0, 0], hd: [0, 0, 0],
    aR: { p: [-0.30, 0.72, 0.165], q: AXE(-90, -8), pole: [-0.5, -0.2, -1] },
    aL: { p: [0.335, 0.62, 0.07], q: SHIELD([0.72, 0, 0.7], [0.12, -0.9, 0.4]), pole: [0.6, -0.2, -1] },
    fL: { g: [0.13, 0, 0.03], yaw: 12, pitch: 0 }, fR: { g: [-0.13, 0, -0.02], yaw: -14, pitch: 0 },
  };
}
function clonePose(P) {
  const arm = a => ({ p: [...a.p], q: a.q.clone(), pole: [...a.pole] }), foot = f => ({ g: [...f.g], yaw: f.yaw, pitch: f.pitch });
  return { hp: [...P.hp], hr: [...P.hr], sp: [...P.sp], ch: [...P.ch], nk: [...P.nk], hd: [...P.hd], aR: arm(P.aR), aL: arm(P.aL), fL: foot(P.fL), fR: foot(P.fR) };
}
function mk(base, o) { const P = clonePose(base); for (const k in o) { if (['aR', 'aL', 'fL', 'fR'].includes(k)) Object.assign(P[k], o[k]); else P[k] = o[k]; } return P; }
function lerpPose(A, Bp, s) {
  const L = (a, b) => a.map((v, i) => v + (b[i] - v) * s);
  const arm = (a, b) => ({ p: L(a.p, b.p), q: a.q.clone().slerp(b.q, s), pole: L(a.pole, b.pole) });
  const foot = (a, b) => ({ g: L(a.g, b.g), yaw: a.yaw + (b.yaw - a.yaw) * s, pitch: a.pitch + (b.pitch - a.pitch) * s });
  return { hp: L(A.hp, Bp.hp), hr: L(A.hr, Bp.hr), sp: L(A.sp, Bp.sp), ch: L(A.ch, Bp.ch), nk: L(A.nk, Bp.nk), hd: L(A.hd, Bp.hd),
    aR: arm(A.aR, Bp.aR), aL: arm(A.aL, Bp.aL), fL: foot(A.fL, Bp.fL), fR: foot(A.fR, Bp.fR) };
}
const EASE = { io: s => s * s * (3 - 2 * s), in: s => s * s, out: s => 1 - (1 - s) * (1 - s), lin: s => s };
function keyed(keys, t) {
  let i = 0; while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const a = keys[i], b = keys[i + 1];
  return lerpPose(a.P, b.P, EASE[b.e || 'io'](clamp((t - a.t) / (b.t - a.t), 0, 1)));
}
function idlePose(t) {
  const a = 2 * Math.PI * t / 3, b = Math.sin(a), P = basePose();
  P.hp = [0.008 * Math.sin(a), 0.488 + 0.004 * b, 0]; P.hr = [0, 3 * Math.sin(a), -1.2 * Math.sin(a)];
  P.sp = [-1 * b, 0, 0]; P.ch = [-2 * b, -2.5 * Math.sin(a), 0.8 * Math.sin(a)];
  P.hd = [1.5 * b + 2 * Math.sin(2 * a), 9 * Math.sin(a + 0.8), -2 * Math.sin(a)];
  P.aR.p[1] += 0.006 * b; P.aL.p[1] += 0.006 * b; P.aL.p[2] += 0.006 * Math.sin(2 * a);
  return P;
}
export const WALK = { T: 0.82, S: 0.30, D: 0.62, h: 0.075, x: 0.105, yaw: 7, strike: -12, toe: 30, run: false };
export const RUN = { T: 0.52, S: 0.40, D: 0.34, h: 0.14, x: 0.092, yaw: 4, strike: 0, toe: 26, run: true };
function footCycle(W, u, side) {
  let z, lift = 0, pitch;
  if (u < W.D) {
    z = W.S / 2 - W.S * (u / W.D);
    const hs = 0.12 * W.D, to = 0.7 * W.D;
    pitch = u < hs ? W.strike * (1 - u / hs) : u > to ? W.toe * EASE.in((u - to) / (W.D - to)) : 0;
  } else {
    const w = (u - W.D) / (1 - W.D);
    z = -W.S / 2 + W.S * EASE.io(w);
    lift = W.h * Math.sin(Math.PI * Math.pow(w, 0.85));
    pitch = W.toe + (W.strike - W.toe) * EASE.io(w);
  }
  return { g: [side * W.x, lift, z], yaw: side * W.yaw, pitch };
}
function locoPose(W, t) {
  const ph = t / W.T, P = basePose(), c = Math.cos(2 * Math.PI * ph), s2 = Math.sin(2 * Math.PI * ph);
  P.fL = footCycle(W, ((ph % 1) + 1) % 1, 1); P.fR = footCycle(W, (((ph + 0.5) % 1) + 1) % 1, -1);
  if (!W.run) {
    P.hp = [0.012 * s2, 0.468 - 0.011 * Math.cos(4 * Math.PI * ph), 0];
    P.hr = [3, -6 * c, -2.5 * s2]; P.sp = [2, 2 * c, 0]; P.ch = [2, 5 * c, 1.5 * s2]; P.hd = [-5, -3 * c, 0];
    P.aR = { p: [-0.305, 0.655, 0.07 + 0.08 * c], q: AXE(-52 - 8 * c, -6), pole: [-0.5, -0.2, -1] };
    P.aL = { p: [0.33, 0.645, 0.03 - 0.08 * c], q: SHIELD([0.8, 0, 0.6], [0.1, -0.9, 0.45]), pole: [0.6, -0.2, -1] };
  } else {
    const k = -Math.cos(4 * Math.PI * (ph - W.D / 2));
    P.hp = [0.01 * s2, 0.42 + 0.025 * k, 0.02];
    P.hr = [8, -8 * c, -2 * s2]; P.sp = [6, 3 * c, 0]; P.ch = [6, 8 * c, 0]; P.hd = [-14, -5 * c, 0];
    P.aR = { p: [-0.29, 0.74 + 0.04 * c, 0.05 + 0.15 * c], q: AXE(-40 - 15 * c, -8), pole: [-0.4, -0.3, -1] };
    P.aL = { p: [0.31, 0.74 - 0.04 * c, 0.02 - 0.15 * c], q: SHIELD([0.85, 0, 0.5], [0.0, -0.6, 0.8]), pole: [0.5, -0.3, -1] };
  }
  return P;
}
const READY = mk(basePose(), {
  hp: [0, 0.462, 0], hr: [0, -10, 0], sp: [4, 0, 0], ch: [4, 6, 0], hd: [-6, 6, 0],
  fL: { g: [0.15, 0, 0.08], yaw: 18, pitch: 0 }, fR: { g: [-0.14, 0, -0.09], yaw: -28, pitch: 0 },
  aR: { p: [-0.31, 0.80, 0.12], q: AXE(-72, -10), pole: [-0.8, -0.3, -0.6] },
  aL: { p: [0.25, 0.78, 0.19], q: SHIELD([0.45, 0, 0.9], [-0.5, -0.3, 0.8]), pole: [1, -0.2, -0.3] },
});
const ATTACK = [
  { t: 0, P: READY },
  { t: 0.40, e: 'io', P: mk(READY, { hp: [0, 0.472, -0.012], hr: [-3, -26, 0], sp: [-4, -8, 0], ch: [-9, -18, 0], hd: [8, 24, 0],
      aR: { p: [-0.22, 1.20, -0.04], q: AXE(-150, -5), pole: [-0.9, 0.3, 0.1] }, aL: { p: [0.22, 0.80, 0.24] } }) },
  { t: 0.50, e: 'in', P: mk(READY, { hp: [0, 0.455, 0.0], hr: [2, -6, 0], sp: [2, 0, 0], ch: [2, 0, 0], hd: [0, 4, 0],
      aR: { p: [-0.18, 1.22, 0.16], q: AXE(-60, -3), pole: [-1, 0, -0.2] }, aL: { p: [0.26, 0.76, 0.16] } }) },
  { t: 0.58, e: 'out', P: mk(READY, { hp: [0, 0.428, 0.03], hr: [8, 12, 0], sp: [10, 5, 0], ch: [18, 12, 0], hd: [-18, -12, 0],
      aR: { p: [-0.11, 0.80, 0.34], q: AXE(-40, 0), pole: [-0.6, 0, -1] },
      aL: { p: [0.31, 0.70, 0.0], q: SHIELD([0.9, 0, 0.3], [0.1, -0.9, 0.3]), pole: [0.8, -0.2, -0.8] } }) },
  { t: 0.82, e: 'lin', P: mk(READY, { hp: [0, 0.432, 0.028], hr: [7, 11, 0], sp: [9, 5, 0], ch: [16, 11, 0], hd: [-16, -11, 0],
      aR: { p: [-0.12, 0.81, 0.33], q: AXE(-44, 0), pole: [-0.6, 0, -1] },
      aL: { p: [0.31, 0.71, 0.01], q: SHIELD([0.9, 0, 0.3], [0.1, -0.9, 0.3]), pole: [0.8, -0.2, -0.8] } }) },
  { t: 1.30, e: 'io', P: READY },
];
const GUARD = mk(READY, { hp: [0, 0.43, 0], hr: [6, -6, 0], sp: [6, 0, 0], ch: [8, 12, 0], hd: [-10, 4, 0],
  aL: { p: [0.10, 0.865, 0.22], q: SHIELD([0, 0, 1], [-1, 0, 0]), pole: [1, -0.1, 0.2] },
  aR: { p: [-0.33, 0.82, -0.10], q: AXE(-125, -15), pole: [-0.7, -0.2, -0.7] } });
const DEFEND = [
  { t: 0, P: READY }, { t: 0.28, e: 'out', P: GUARD }, { t: 0.62, e: 'io', P: mk(GUARD, { hp: [0, 0.425, 0] }) },
  { t: 0.70, e: 'out', P: mk(GUARD, { hp: [0, 0.432, -0.035], ch: [2, 12, 0], hd: [-4, 4, 0], aL: { p: [0.10, 0.885, 0.18] } }) },
  { t: 0.98, e: 'io', P: GUARD }, { t: 1.25, e: 'io', P: mk(GUARD, { hp: [0, 0.428, 0] }) }, { t: 1.60, e: 'io', P: READY },
];
const IDLE0 = idlePose(0);
const UP = { aR: { p: [-0.25, 1.30, 0.06], q: AXE(-80, -10), pole: [-1, -0.2, 0] },
  aL: { p: [0.38, 1.10, 0.06], q: SHIELD([0.5, 0.3, 0.8], [0.2, 1, 0]), pole: [1, 0, -0.3] } };
const CHEER = [
  { t: 0, P: IDLE0 },
  { t: 0.30, e: 'io', P: mk(IDLE0, { hp: [0, 0.42, 0], hr: [6, 0, 0], sp: [10, 0, 0], ch: [8, 0, 0], hd: [-10, 0, 0],
      aR: { p: [-0.30, 0.70, 0.12], q: AXE(-60, -6) }, aL: { p: [0.33, 0.66, 0.09] } }) },
  { t: 0.56, e: 'out', P: mk(IDLE0, { hp: [0, 0.60, 0], hr: [-2, 0, 0], sp: [-6, 0, 0], ch: [-10, 0, 0], hd: [12, 0, 0], ...UP,
      fL: { g: [0.13, 0.105, 0.03], yaw: 12, pitch: 22 }, fR: { g: [-0.13, 0.105, -0.02], yaw: -14, pitch: 22 } }) },
  { t: 0.80, e: 'in', P: mk(IDLE0, { hp: [0, 0.435, 0], hr: [6, 0, 0], sp: [8, 0, 0], ch: [4, 0, 0], hd: [-4, 0, 0], ...UP }) },
  { t: 1.15, e: 'out', P: mk(IDLE0, { hp: [0, 0.49, 0], sp: [-4, 0, 0], ch: [-12, 0, 0], hd: [18, 0, 0],
      aR: { p: [-0.26, 1.30, 0.04], q: AXE(-85, -10), pole: [-1, -0.2, 0] }, aL: { p: [0.36, 1.06, 0.05], q: UP.aL.q, pole: UP.aL.pole } }) },
  { t: 1.55, e: 'io', P: mk(IDLE0, { hp: [0, 0.488, 0], sp: [-3, 0, 0], ch: [-10, 3, 0], hd: [15, -6, 0],
      aR: { p: [-0.26, 1.29, 0.05], q: AXE(-84, -10), pole: [-1, -0.2, 0] }, aL: { p: [0.36, 1.04, 0.05], q: UP.aL.q, pole: UP.aL.pole } }) },
  { t: 2.0, e: 'io', P: IDLE0 },
];
export const CLIPDEF = [
  { name: 'Parado', dur: 3.0, fps: 30, fn: idlePose, loop: true },
  { name: 'Andar', dur: WALK.T, fps: 60, fn: t => locoPose(WALK, t), loco: WALK, loop: true },
  { name: 'Correr', dur: RUN.T, fps: 60, fn: t => locoPose(RUN, t), loco: RUN, loop: true },
  { name: 'Atacar', dur: 1.3, fps: 30, fn: t => keyed(ATTACK, t) },
  { name: 'Defender', dur: 1.6, fps: 30, fn: t => keyed(DEFEND, t) },
  { name: 'Comemorar', dur: 2.0, fps: 30, fn: t => keyed(CHEER, t) },
];

// ======================================================================= materiais e IK
export const MATS = [
  new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85, metalness: 0, side: THREE.DoubleSide, envMapIntensity: 0.5, name: 'fosco' }),
  new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.38, metalness: 0.75, envMapIntensity: 1.0, name: 'metal' }),
  new THREE.MeshBasicMaterial({ vertexColors: true, name: 'brilho' }),
];
// qualidade "liso": as mesmas peças com normais suavizadas (quinas acima de ~50° continuam vivas)
export const MATS_LISO = MATS.map(m => { const c = m.clone(); if (c.isMeshStandardMaterial) c.flatShading = false; c.name = m.name; return c; });
// cfg._q = { seg: multiplicador de segmentos das peças redondas (1 = atual), liso: normais suaves, vinco: ângulo em graus }
const _X = V3(1, 0, 0), _Y = V3(0, 1, 0);
export function ik(b1, b2, b3, target, pole, l1, l2, leg, qEnd, twist) {
  const P = new THREE.Vector3().setFromMatrixPosition(b1.matrixWorld);
  const v = target.clone().sub(P); const d0 = v.length(); const vh = v.divideScalar(d0 || 1);
  const d = clamp(d0, Math.abs(l1 - l2) + 1e-3, (l1 + l2) * 0.9995);
  const a = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const bend = Math.PI - Math.acos(clamp((l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2), -1, 1));
  const p = pole.clone().addScaledVector(vh, -pole.dot(vh));
  if (p.lengthSq() < 1e-8) p.set(0, 0, leg ? 1 : -1); p.normalize();
  const dir1 = vh.clone().multiplyScalar(Math.cos(a)).addScaledVector(p, Math.sin(a));
  const n = new THREE.Vector3().crossVectors(vh, p).normalize();
  const xA = leg ? n.clone().negate() : n, yA = dir1.clone().negate(), zA = new THREE.Vector3().crossVectors(xA, yA);
  const qW = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xA, yA, zA));
  b1.quaternion.copy(b1.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(qW));
  const qB = new THREE.Quaternion().setFromAxisAngle(_X, leg ? bend : -bend);
  const hl = qW.clone().multiply(qB).invert().multiply(qEnd);
  if (twist) {
    const tw = new THREE.Quaternion(0, hl.y, 0, hl.w); if (tw.length() < 1e-6) tw.identity(); else tw.normalize();
    b2.quaternion.copy(qB).multiply(tw); b3.quaternion.copy(tw.clone().invert().multiply(hl));
  } else { b2.quaternion.copy(qB); b3.quaternion.copy(hl); }
}

// ======================================================================= forja
export function forge(raca, cfgIn) {
  const R = RACAS[raca], cfg = { ...baseCfg(raca), ...cfgIn }, Q = { seg: 1, liso: false, vinco: 50, ...(cfg._q || {}) };
  const SG = n => n >= 5 ? Math.max(n, Math.round(n * Q.seg)) : n;   // 3 e 4 lados são forma (dentes, espinhos): ficam
  const pr = PORTE[cfg.porte], kx = pr.kx * R.k.x, ky = ALT[cfg.altura] * R.k.y, kz = 1 + (kx - 1) * 0.6, bar = pr.bar * (R.k.bar || 1);
  const bb = 1 + (bar - 1) * 0.8, cb = 1 + (bar - 1) * 0.45;
  const pal = CLA[cfg.cla];
  const catCor = k => R.cats[k] && R.cats[k].cor ? R.cats[k].cor[cfg[k]] : null;
  const SKIN = catCor('pele') || catCor('escamas') || catCor('rocha') || '#e3a782';
  const HAIR = catCor('pelo') || '#6b4126', HAIRD = hex(HAIR, 0.78);
  const GLW = GLOW[cfg.brilho] || (raca === 'aetheryn' ? GLOW.violeta : GLOW.azul);
  const C = { steel: pal.steel, steelD: hex(pal.steel, 0.68), trim: pal.trim, tunic: pal.tunic, tunicD: hex(pal.tunic, 0.75), leather: pal.leather, leatherD: hex(pal.leather, 0.7),
    cloth: pal.cloth, chain: '#8e959d', pants: '#6b5638', boot: '#5c3b22', sole: '#2a1c13', glove: '#5f3a22', eye: '#1b1712', glint: '#fff6e0',
    horn: '#eee2c4', wood: '#8a5a2e', woodD: '#5e3c1e', fur: '#7d6248', furL: '#a08465', edge: '#dfe6ec', skin: SKIN, skinD: hex(SKIN, 0.82), skinL: hex(SKIN, 1.12) };
  const Mv = v => V3(v.x * kx, v.y * ky, v.z * kz);
  const drop = R.headDrop || 0;
  const HOFF = Mv(HEAD0).sub(HEAD0).add(V3(0, -drop, 0));
  const bz = 0.2006 * (cb * kz - 1);
  const isLito = raca === 'litomante';

  // ---------- correntes de mola (rabo, cabelo, barba)
  const BEARD_BONES = { cheia: [[0, 0.88, 0.19], [0, 0.70, 0.21]], enorme: [[0, 0.86, 0.21], [0, 0.66, 0.23]], bifurcada: [[0, 0.88, 0.20], [0, 0.68, 0.22]],
    longa: [[0, 0.86, 0.20], [0, 0.56, 0.22]] };
  const hasBeardChain = !!BEARD_BONES[cfg.barba];
  const chains = [];
  if (hasBeardChain) chains.push({ name: 'Beard', parent: 'Head', head: true, bz: true, pts: [[0, 1.0, 0.17], BEARD_BONES[cfg.barba][0], BEARD_BONES[cfg.barba][1]],
    names: ['BeardA', 'BeardB'], end: 'BeardEnd', spring: [{ k: 75, d: 9, g: 0.4, max: 22 }, { k: cfg.barba === 'longa' ? 40 : 55, d: cfg.barba === 'longa' ? 5.5 : 7, g: 0.4, max: cfg.barba === 'longa' ? 40 : 34 }] });
  if (raca === 'vran') {
    const pts = cfg.cauda === 'longa' ? [[0, 0.5, -0.15], [0, 0.42, -0.31], [0, 0.32, -0.45], [0, 0.22, -0.58], [0, 0.14, -0.72]] : [[0, 0.5, -0.15], [0, 0.42, -0.30], [0, 0.33, -0.42], [0, 0.26, -0.53]];
    chains.push({ name: 'Tail', parent: 'Hips', pts, names: pts.slice(0, -1).map((_, i) => 'Tail' + (i + 1)), end: 'TailEnd',
      spring: pts.slice(0, -1).map((_, i) => ({ k: 70 - i * 12, d: 7 - i, g: 0.2, max: 18 + i * 6 })) });
  }
  const hairStyle = cfg.cabelo, hairHidden = ['fechado', 'capuz', 'urso'].includes(cfg.cabeca);
  if (hairStyle && !hairHidden) {
    let pts = null;
    if (hairStyle === 'rabo') pts = raca === 'aetheryn' ? [[0, 1.27, -0.15], [0, 1.14, -0.27], [0, 0.98, -0.31]] : [[0, 1.2, -0.17], [0, 1.08, -0.25], [0, 0.95, -0.27]];
    if (hairStyle === 'tranca') pts = [[0, 1.1, -0.17], [0, 0.96, -0.22], [0, 0.80, -0.225], [0, 0.64, -0.21]];
    if (hairStyle === 'longo') pts = [[0, 1.12, -0.17], [0, 0.98, -0.21], [0, 0.82, -0.215]];
    if (pts) chains.push({ name: 'Hair', parent: 'Head', head: true, pts, names: pts.slice(0, -1).map((_, i) => 'Hair' + (i + 1)), end: 'HairEnd',
      spring: pts.slice(0, -1).map((_, i) => ({ k: 60 - i * 10, d: 6.5 - i, g: 0.5, max: 30 + i * 8 })) });
  }

  // ---------- esqueleto
  const bdef = [['Hips', null, [0, 0.52, 0]], ['Spine', 'Hips', [0, 0.62, 0]], ['Chest', 'Spine', [0, 0.76, 0]], ['Neck', 'Chest', [0, 0.95, 0], 'neck'], ['Head', 'Neck', [0, 1.0, 0], 'head']];
  for (const [s, L] of [[1, '_L'], [-1, '_R']]) bdef.push(
    ['UpperArm' + L, 'Chest', [s * SX0, 0.92, 0]], ['ForeArm' + L, 'UpperArm' + L, [s * SX0, 0.72, 0]], ['Hand' + L, 'ForeArm' + L, [s * SX0, 0.555, 0]],
    ['UpLeg' + L, 'Hips', [s * 0.11, 0.50, 0]], ['Leg' + L, 'UpLeg' + L, [s * 0.11, 0.315, 0]], ['Foot' + L, 'Leg' + L, [s * 0.11, 0.115, 0]]);
  for (const ch of chains) {
    ch.names.forEach((nm, i) => bdef.push([nm, i ? ch.names[i - 1] : ch.parent, ch.pts[i], ch.head ? 'chainH' : 'chain', ch.bz]));
    bdef.push([ch.end, ch.names[ch.names.length - 1], ch.pts[ch.pts.length - 1], ch.head ? 'chainH' : 'chain', ch.bz]);
  }
  const B = {}, REST = {}, BI = {}, bones = [], PARENT = {};
  for (const [n, p, pos, kind, useBz] of bdef) {
    const b = new THREE.Bone(); b.name = n; const base = V3(...pos);
    if (kind === 'head' || kind === 'chainH') REST[n] = base.clone().add(HOFF).add(V3(0, 0, useBz ? bz : 0));
    else if (kind === 'neck') REST[n] = Mv(base).add(V3(0, -drop * 0.7, 0));
    else REST[n] = Mv(base);
    PARENT[n] = p;
    if (p) { B[p].add(b); b.position.copy(REST[n]).sub(REST[p]); } else b.position.copy(REST[n]);
    B[n] = b; BI[n] = bones.length; bones.push(b);
  }
  const L_ARM = [REST.UpperArm_L.distanceTo(REST.ForeArm_L), REST.ForeArm_L.distanceTo(REST.Hand_L)];
  const L_LEG = [REST.UpLeg_L.distanceTo(REST.Leg_L), REST.Leg_L.distanceTo(REST.Foot_L)];

  // ---------- modelagem
  const PARTS = [[], [], []]; let partN = 0;
  // o: c cor, metal, glow, b osso ou função(p base) -> [[osso, peso]], pos/rot/scl, jit, vary, deform(g), off (peça rígida: só desloca)
  function add(g, o) {
    g.applyMatrix4(new THREE.Matrix4().compose(V3(...(o.pos || [0, 0, 0])),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...(o.rot || [0, 0, 0]).map(d => d * D2R), 'XYZ')), V3(...(o.scl || [1, 1, 1]))));
    if (o.deform) o.deform(g);
    const pa = g.attributes.position, jit = (o.jit ?? 0.0045) * (Q.liso ? 0.5 : 1);
    if (jit > 0) for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i);
      const h = hash3(Math.round(x * 2000) / 2000, Math.round(y * 2000) / 2000, Math.round(z * 2000) / 2000);
      pa.setXYZ(i, x + h[0] * jit, y + h[1] * jit, z + h[2] * jit);
    }
    const ng = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(ng.attributes)) if (k !== 'position') ng.deleteAttribute(k);
    const p = ng.attributes.position, n = p.count, base = new THREE.Color(o.c), vary = o.glow ? 0 : (o.vary ?? 0.07);
    const col = new Float32Array(n * 3), si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
    partN++;
    for (let f = 0; f < n / 3; f++) {
      const cx = p.getX(f * 3) + p.getX(f * 3 + 1) + p.getX(f * 3 + 2), cy = p.getY(f * 3) + p.getY(f * 3 + 1) + p.getY(f * 3 + 2);
      const k = 1 + hash3(cx * 13.1 + partN, cy * 17.3, f * 0.37)[0] * vary;
      for (let j = 0; j < 3; j++) { const i = (f * 3 + j) * 3, v = f * 3 + j;
        const kv = Q.liso ? 1 + hash3(Math.round(p.getX(v) * 300) + partN * 0.13, Math.round(p.getY(v) * 300), Math.round(p.getZ(v) * 300))[0] * vary * 0.6 : k;   // liso: tom por vértice (degradê), não por face
        col[i] = base.r * kv; col[i + 1] = base.g * kv; col[i + 2] = base.b * kv; }
    }
    const tmp = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      tmp.fromBufferAttribute(p, i);
      let ws = typeof o.b === 'string' ? [[o.b, 1]] : o.b(tmp);
      ws = ws.filter(w => w[1] > 1e-4 && BI[w[0]] !== undefined).sort((a, b) => b[1] - a[1]).slice(0, 4);
      if (!ws.length) ws = [['Hips', 1]];
      const tot = ws.reduce((s, w) => s + w[1], 0);
      ws.forEach((w, j) => { si[i * 4 + j] = BI[w[0]]; sw[i * 4 + j] = w[1] / tot; });
    }
    for (let i = 0; i < n; i++) {
      if (o.off) p.setXYZ(i, p.getX(i) + o.off.x, p.getY(i) + o.off.y, p.getZ(i) + o.off.z);
      else p.setXYZ(i, p.getX(i) * kx, p.getY(i) * ky, p.getZ(i) * kz);
    }
    if (Q.liso) toCreasedNormals(ng, Q.vinco * D2R); else ng.computeVertexNormals();
    ng.setAttribute('color', new THREE.BufferAttribute(col, 3));
    ng.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
    ng.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
    PARTS[o.glow ? 2 : o.metal ? 1 : 0].push(ng);
  }
  const cyl = (rt, rb, h, seg, open = false) => new THREE.CylinderGeometry(rt, rb, h, SG(seg), 1, open);
  const sph = (r, ws, hs, ts = 0, tl = Math.PI, ps = 0, pl = Math.PI * 2) => new THREE.SphereGeometry(r, SG(ws), hs >= 4 ? Math.max(hs, Math.round(hs * Q.seg)) : hs, ps, pl, ts, tl);
  const box = (w, h, d, hs = 1) => new THREE.BoxGeometry(w, h, d, 1, hs, 1);
  const ico = (r, det = 0) => new THREE.IcosahedronGeometry(r, det + (Q.seg >= 2 && Q.liso ? 1 : 0));
  const octa = r => new THREE.OctahedronGeometry(r, 0);
  const cone = (r, h, seg) => new THREE.ConeGeometry(r, h, SG(seg));
  function tube(a, b, ra, rb, seg) {
    a = V3(...a); b = V3(...b);
    const d = b.clone().sub(a), g = cyl(rb, ra, d.length(), seg);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(_Y, d.clone().normalize()));
    g.translate(...a.clone().addScaledVector(d, 0.5).toArray());
    return g;
  }
  function blade(pts, depth, flipY = false) {
    const sh = new THREE.Shape(); const P2 = pts.map(([u, v]) => [u, flipY ? -v : v]);
    sh.moveTo(...P2[0]); for (const q of P2.slice(1)) sh.lineTo(...q); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false }); g.translate(0, 0, -depth / 2); g.rotateY(-Math.PI / 2); return g;
  }
  function polyTube(pts, radii, seg, o) { for (let i = 0; i < pts.length - 1; i++) add(tube(pts[i], pts[i + 1], radii[i], radii[i + 1], seg), { ...o }); }
  function chainW(ch) {
    const P = ch.pts.map(a => V3(...a).add(V3(0, 0, ch.bz ? 0 : 0)));
    return p => {
      let best = 1e9, bi = 0, bt = 0;
      for (let i = 0; i < P.length - 1; i++) { const a = P[i], ab = P[i + 1].clone().sub(a);
        const t = clamp(p.clone().sub(a).dot(ab) / ab.lengthSq(), 0, 1), d = a.clone().addScaledVector(ab, t).distanceToSquared(p);
        if (d < best) { best = d; bi = i; bt = t; } }
      const nm = ch.names, w = [[nm[bi], 1]];
      if (bt > 0.75 && bi < nm.length - 1) { const s = (bt - 0.75) / 0.25 * 0.5; w[0][1] = 1 - s; w.push([nm[bi + 1], s]); }
      else if (bt < 0.25) { const s = (0.25 - bt) / 0.25 * 0.5; w[0][1] = 1 - s; w.push([bi > 0 ? nm[bi - 1] : ch.parent, s]); }
      return w;
    };
  }
  const chainBy = nm => chains.find(c => c.name === nm);
  const H = { off: HOFF };
  const beardW = p => { const ch = chainBy('Beard'); if (!ch) return [['Head', 1]];
    const by = ch.pts[1][1]; const tA = ramp(1.0 - p.y, 0, 0.09), tB = ramp(by + 0.025 - p.y, 0, 0.08);
    return [['Head', 1 - tA], ['BeardA', tA * (1 - tB)], ['BeardB', tA * tB]]; };
  const legBlend = (top, h, amt) => p => { const t = ramp(top - p.y, 0, h), sf = ramp(Math.abs(p.x), 0.02, 0.12), w = amt * t * sf;
    return [['Hips', 1 - w], [p.x > 0 ? 'UpLeg_L' : 'UpLeg_R', w]]; };
  const torsoW = p => p.y > 0.76 ? [['Chest', 1]] : p.y > 0.6 ? [['Spine', 1]] : [['Hips', 1]];

  // =============================================================== CORPO VESTIDO (todas menos Litomante)
  function bodyClothed() {
    // quadril e cinto
    add(cyl(0.185 * bb, 0.19 * bb, 0.12, 9), { c: C.pants, b: 'Hips', pos: [0, 0.52, 0], scl: [1, 1, 0.86] });
    add(cyl(0.216 * bb, 0.216 * bb, 0.066, 10), { c: C.leather, b: 'Hips', pos: [0, 0.597, 0], scl: [1, 1, 0.87] });
    add(box(0.10, 0.082, 0.03), { c: C.trim, metal: true, b: 'Hips', pos: [0, 0.597, 0.19 * bb] });
    add(box(0.05, 0.034, 0.014), { c: C.leatherD, b: 'Hips', pos: [0, 0.597, 0.207 * bb], jit: 0.001 });
    add(box(0.07, 0.085, 0.05), { c: C.leatherD, b: 'Hips', pos: [0.17 * bb, 0.56, 0.09 * bb], rot: [0, 35, 0] });
    if (raca === 'vran') { add(tube([-0.19 * bb, 0.50, 0.02], [-0.17 * bb, 0.66, -0.03], 0.03, 0.03, 7), { c: C.leather, b: 'Hips' });
      add(cyl(0.033, 0.033, 0.014, 7), { c: C.trim, metal: true, b: 'Hips', pos: [-0.168 * bb, 0.665, -0.032], jit: 0 }); }
    else add(box(0.05, 0.06, 0.045), { c: C.leather, b: 'Hips', pos: [-0.185 * bb, 0.565, 0.0], rot: [0, -80, 0] });
    if (raca !== 'vodnik') add(cyl(0.095, 0.112, 0.075, 8), { c: ['placas', 'malha', 'couraca'].includes(cfg.tronco) ? C.chain : C.tunicD, b: 'Neck', pos: [0, 0.955, 0] });

    // pernas
    const pernas = cfg.pernas, pes = cfg.pes, bare = ['garras', 'palmado', 'cascos'].includes(pes);
    if (pernas === 'malha') add(cyl(0.214 * bb, 0.248 * bb, 0.15, 10, true), { c: C.chain, b: legBlend(0.575, 0.15, 0.55), pos: [0, 0.50, 0], scl: [1, 1, 0.87], vary: 0.1 });
    if (pernas === 'saiote') for (let i = 0; i < 8; i++) {
      const a = (i + 0.5) / 8 * Math.PI * 2, r = 0.205 * bb;
      if (raca === 'vran' && Math.abs(Math.cos(a)) > 0.8 && Math.cos(a) < 0) continue;      // abre espaço para o rabo
      const col = raca === 'aetheryn' ? (i % 2 ? C.cloth : C.tunic) : (i % 2 ? C.leather : C.leatherD);
      add(box(0.11 * bb, 0.17, 0.025, 3), { c: col, b: legBlend(0.58, 0.17, 0.6), pos: [Math.sin(a) * r, 0.495, Math.cos(a) * r * 0.87], rot: [-8, a / D2R, 0], jit: 0.003 });
      add(ico(0.013), { c: C.trim, metal: true, b: legBlend(0.58, 0.17, 0.6), pos: [Math.sin(a) * (r + 0.014), 0.46, Math.cos(a) * (r + 0.014) * 0.87], jit: 0 });
    }
    if (pernas === 'calca' || pernas === 'bermuda') add(cyl(0.2 * bb, 0.205 * bb, 0.05, 10), { c: C.tunic, b: 'Hips', pos: [0, 0.555, 0], scl: [1, 1, 0.86] });
    for (const [s, L] of [[1, '_L'], [-1, '_R']]) {
      const x = s * 0.11, pantC = pernas === 'calca' || pernas === 'bermuda' ? C.cloth : C.pants;
      if (pernas === 'bermuda') { add(cyl(0.09, 0.086, 0.12, 8), { c: pantC, b: 'UpLeg' + L, pos: [x, 0.445, 0] }); add(cyl(0.07, 0.066, 0.12, 8), { c: C.skin, b: 'UpLeg' + L, pos: [x, 0.36, 0] }); }
      else add(cyl(0.088, 0.078, 0.20, 8), { c: pantC, b: 'UpLeg' + L, pos: [x, 0.41, 0] });
      if (pes === 'biqueira') add(sph(0.066, 6, 4), { c: C.steel, metal: true, b: 'Leg' + L, pos: [x, 0.315, 0.02] });
      else add(sph(0.06, 6, 4), { c: pernas === 'bermuda' ? C.skin : pantC, b: 'Leg' + L, pos: [x, 0.315, 0.0] });
      if (pes === 'cascos') {
        add(cyl(0.07, 0.055, 0.17, 7), { c: HAIR, b: 'Leg' + L, pos: [x, 0.21, -0.01], vary: 0.12 });
        add(cyl(0.055, 0.07, 0.11, 7), { c: '#3a2a20', b: 'Foot' + L, pos: [x, 0.055, 0.02] });
        add(box(0.012, 0.11, 0.08), { c: '#241a14', b: 'Foot' + L, pos: [x, 0.055, 0.06], jit: 0 });
        continue;
      }
      if (bare) {                                            // perna nua (escamas / pele) + pé descalço
        add(cyl(0.068, 0.06, 0.2, 7), { c: C.skin, b: 'Leg' + L, pos: [x, 0.21, 0] });
        add(sph(0.06, 7, 4), { c: C.skin, b: 'Foot' + L, pos: [x, 0.1, 0] });
        if (pes === 'garras') {
          add(box(0.11, 0.07, 0.18), { c: C.skin, b: 'Foot' + L, pos: [x, 0.035, 0.04] });
          for (const dx of [-0.035, 0, 0.035]) add(cone(0.014, 0.05, 4), { c: C.horn, b: 'Foot' + L, pos: [x + dx, 0.02, 0.15], rot: [90, 0, 0], jit: 0 });
        } else {
          add(box(0.13, 0.045, 0.2), { c: C.skin, b: 'Foot' + L, pos: [x, 0.023, 0.05] });
          for (const dx of [-0.045, 0, 0.045]) add(box(0.03, 0.02, 0.07), { c: C.skinD, b: 'Foot' + L, pos: [x + dx, 0.012, 0.16], jit: 0.002 });
          add(box(0.15, 0.006, 0.06), { c: hex(catCor('corfin') || '#e8762e', 0.9), b: 'Foot' + L, pos: [x, 0.008, 0.17], jit: 0 });
        }
        continue;
      }
      const tall = pes === 'altas';
      add(cyl(0.078, 0.086, tall ? 0.24 : 0.19, 8), { c: tall ? C.leatherD : C.boot, b: 'Leg' + L, pos: [x, tall ? 0.215 : 0.19, 0] });
      if (pes === 'pelo') for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2;
        add(ico(0.04), { c: i % 2 ? C.fur : C.furL, b: 'Leg' + L, pos: [x + Math.sin(a) * 0.088, 0.275, Math.cos(a) * 0.088], jit: 0.006 }); }
      else if (tall) add(cyl(0.094, 0.088, 0.03, 8), { c: C.trim, metal: true, b: 'Leg' + L, pos: [x, 0.33, 0], jit: 0.001 });
      else add(cyl(0.096, 0.09, 0.045, 8), { c: C.leather, b: 'Leg' + L, pos: [x, 0.272, 0] });
      const bootC = tall ? C.leatherD : C.boot;
      add(sph(0.072, 7, 4), { c: bootC, b: 'Foot' + L, pos: [x, 0.105, 0] });
      add(box(0.122, 0.09, 0.20), { c: bootC, b: 'Foot' + L, pos: [x, 0.05, 0.035] });
      if (pes === 'biqueira') add(sph(0.066, 7, 4), { c: C.steel, metal: true, b: 'Foot' + L, pos: [x, 0.046, 0.122], scl: [0.95, 0.68, 1] });
      else add(sph(0.064, 7, 4), { c: pes === 'pelo' || tall ? bootC : C.leather, b: 'Foot' + L, pos: [x, 0.045, 0.12], scl: [0.98, 0.7, 1.05] });
      if (pes === 'simples') add(box(0.126, 0.012, 0.02), { c: C.leatherD, b: 'Foot' + L, pos: [x, 0.095, 0.05], jit: 0.001 });
      add(box(0.132, 0.022, 0.228), { c: C.sole, b: 'Foot' + L, pos: [x, 0.011, 0.04], jit: 0.002 });
    }

    // tronco
    const t = cfg.tronco;
    const bellyC = t === 'malha' ? C.chain : t === 'gibao' || t === 'placas' ? C.tunic : t === 'peles' ? C.tunic : C.tunic;
    add(cyl(0.21 * bar, 0.215 * bar, 0.15, 10), { c: bellyC, b: 'Spine', pos: [0, 0.68, 0], scl: [1, 1, 0.85] });
    add(cyl(0.20 * cb, 0.215 * cb, 0.20, 10), { c: t === 'malha' ? C.chain : C.tunic, b: 'Chest', pos: [0, 0.84, 0], scl: [1, 1, 0.85] });
    if (raca === 'vran') add(cyl(0.12 * bar, 0.13 * bar, 0.13, 8), { c: C.skinL, b: 'Spine', pos: [0, 0.69, 0.07], scl: [1, 1, 0.9] });
    if (t === 'couraca' || t === 'placas') {
      add(cyl(0.207 * cb, 0.228 * cb, 0.17, 10), { c: C.steel, metal: true, b: 'Chest', pos: [0, 0.825, 0.006], scl: [1, 1, 0.88] });
      add(cyl(0.21 * cb, 0.21 * cb, 0.022, 10), { c: C.trim, metal: true, b: 'Chest', pos: [0, 0.906, 0.006], scl: [1, 1, 0.88] });
      add(cyl(0.232 * cb, 0.232 * cb, 0.022, 10), { c: C.trim, metal: true, b: 'Chest', pos: [0, 0.745, 0.006], scl: [1, 1, 0.88] });
      for (const s of [1, -1]) add(ico(0.022), { c: C.trim, metal: true, b: 'Chest', pos: [s * 0.135 * cb, 0.86, 0.168 * cb], jit: 0 });
      add(octa(0.055), { c: C.trim, metal: true, b: 'Chest', pos: [0, 0.83, -0.2 * cb], scl: [1, 1.25, 0.35] });
      if (t === 'placas') {                                   // faixa diagonal com emblema
        add(box(0.06, 0.46, 0.022), { c: C.cloth, b: torsoW, pos: [0.0, 0.78, 0.205 * cb], rot: [0, 0, 34], jit: 0.002 });
        add(box(0.06, 0.46, 0.022), { c: C.cloth, b: torsoW, pos: [0.0, 0.78, -0.205 * cb], rot: [0, 0, -34], jit: 0.002 });
        add(octa(0.03), { c: C.trim, metal: true, b: 'Chest', pos: [0.05, 0.84, 0.222 * cb], scl: [1, 1.2, 0.5], jit: 0 });
      } else for (const s of [1, -1]) add(box(0.05, 0.17, 0.02), { c: C.leatherD, b: 'Chest', pos: [s * 0.1, 0.83, -0.198 * cb] });
    }
    if (t === 'malha') {
      add(cyl(0.217 * bar, 0.222 * bar, 0.03, 10), { c: C.trim, metal: true, b: 'Spine', pos: [0, 0.73, 0], scl: [1, 1, 0.86] });
      add(box(0.17, 0.30, 0.02, 3), { c: C.tunic, b: torsoW, pos: [0, 0.77, 0.186 * cb] });
      add(box(0.17, 0.30, 0.02, 3), { c: C.tunic, b: torsoW, pos: [0, 0.77, -0.186 * cb] });
      add(octa(0.045), { c: C.trim, metal: true, b: 'Chest', pos: [0, 0.82, -0.2 * cb], scl: [1, 1.25, 0.35] });
    }
    if (t === 'couro' || t === 'colete' || t === 'peles') {
      const vestC = t === 'colete' ? C.leather : t === 'peles' ? C.leatherD : C.leather;
      add(cyl(0.206 * cb, 0.222 * cb, 0.18, 10, t === 'colete'), { c: vestC, b: 'Chest', pos: [0, 0.83, 0.004], scl: [1, 1, 0.87],
        deform: t === 'colete' ? g => { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) if (pa.getZ(i) > 0.1 && Math.abs(pa.getX(i)) < 0.06) pa.setX(i, Math.sign(pa.getX(i) || 1) * 0.06); } : null });
      if (t !== 'colete') for (const s of [1, -1]) for (const zs of [1, -1]) add(box(0.04, 0.25, 0.02), { c: C.leatherD, b: 'Chest', pos: [0, 0.83, zs * 0.19 * cb], rot: [0, 0, s * 38] });
      if (t === 'couro') for (const zs of [1, -1]) add(box(0.045, 0.045, 0.02), { c: C.trim, metal: true, b: 'Chest', pos: [0, 0.83, zs * 0.205 * cb] });
      if (t === 'peles') { add(cyl(0.222 * bar, 0.222 * bar, 0.03, 10), { c: C.cloth, b: 'Spine', pos: [0, 0.73, 0], scl: [1, 1, 0.86] });
        for (const zs of [1, -1]) add(ico(0.03), { c: C.trim, metal: true, b: 'Chest', pos: [0, 0.83, zs * 0.205 * cb], jit: 0 }); }
      if (t === 'colete') {                                   // alça da bolsa
        add(box(0.04, 0.5, 0.02), { c: C.leatherD, b: torsoW, pos: [0, 0.76, 0.205 * cb], rot: [0, 0, -36] });
        add(box(0.04, 0.5, 0.02), { c: C.leatherD, b: torsoW, pos: [0, 0.76, -0.205 * cb], rot: [0, 0, 36] });
        add(box(0.12, 0.1, 0.06), { c: C.leather, b: 'Hips', pos: [0.2 * bb, 0.55, -0.02], rot: [0, 80, 0] });
        add(box(0.124, 0.04, 0.064), { c: C.leatherD, b: 'Hips', pos: [0.2 * bb, 0.59, -0.02], rot: [0, 80, 0] });
      }
    }
    if (t === 'avental') {
      add(box(0.26 * bar, 0.48, 0.02, 6), { c: C.leather, vary: 0.1, pos: [0, 0.66, 0.196 * bar],
        b: p => p.y > 0.76 ? [['Chest', 1]] : p.y > 0.6 ? [['Spine', 1]] : [['Hips', 0.6], ['UpLeg_L', 0.2], ['UpLeg_R', 0.2]],
        deform: g => { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) { const y = pa.getY(i);
          pa.setZ(i, pa.getZ(i) + 0.03 * Math.sin(clamp((y - 0.45) / 0.45, 0, 1) * Math.PI) * bar); } } });
      add(box(0.11, 0.07, 0.03), { c: C.leatherD, b: 'Spine', pos: [0.06, 0.66, 0.225 * bar] });
      for (const s of [1, -1]) add(box(0.025, 0.2, 0.02), { c: C.leatherD, b: 'Chest', pos: [s * 0.1, 0.86, 0.17 * cb], rot: [-10, 0, s * 8] });
      if (raca === 'silvano') for (const [dx, col] of [[-0.06, '#c8323a'], [0, '#3a7ac8'], [0.06, '#e8c03a']]) add(ico(0.016), { c: col, b: 'Spine', pos: [dx, 0.70, 0.215 * bar], jit: 0 });
    }
    if (t === 'tunica') {
      add(box(0.05, 0.42, 0.02), { c: C.cloth, b: torsoW, pos: [0.02, 0.77, 0.19 * cb], rot: [0, 0, 32] });
      add(box(0.05, 0.42, 0.02), { c: C.cloth, b: torsoW, pos: [-0.02, 0.77, -0.19 * cb], rot: [0, 0, 32] });
      add(cyl(0.203 * cb, 0.203 * cb, 0.02, 10), { c: C.trim, metal: true, b: 'Chest', pos: [0, 0.93, 0], scl: [1, 1, 0.86] });
    }
    if (t === 'gibao') {                                     // acolchoado: faixas horizontais
      for (const y of [0.66, 0.72, 0.80, 0.87]) add(cyl((y > 0.76 ? 0.212 * cb : 0.218 * bar), (y > 0.76 ? 0.214 * cb : 0.22 * bar), 0.012, 10), { c: C.tunicD, b: y > 0.76 ? 'Chest' : 'Spine', pos: [0, y, 0], scl: [1, 1, 0.86], jit: 0.002 });
      add(box(0.02, 0.3, 0.02), { c: C.tunicD, b: torsoW, pos: [0, 0.77, 0.19 * cb] });
    }
    if (t === 'casaco') {                                    // casaco de capitão: abas atrás, botões, golas
      add(cyl(0.208 * cb, 0.224 * cb, 0.19, 10), { c: C.tunic, b: 'Chest', pos: [0, 0.83, 0.004], scl: [1, 1, 0.87] });
      add(cyl(0.222 * bar, 0.226 * bar, 0.13, 10), { c: C.tunic, b: 'Spine', pos: [0, 0.68, 0.0], scl: [1, 1, 0.86] });
      for (const y of [0.86, 0.79, 0.72, 0.65]) for (const s of [1, -1]) add(ico(0.014), { c: C.trim, metal: true, b: y > 0.76 ? 'Chest' : 'Spine', pos: [s * 0.045, y, 0.198 * (y > 0.76 ? cb : bar)], jit: 0 });
      for (const s of [1, -1]) add(box(0.02, 0.32, 0.022), { c: C.cloth, b: torsoW, pos: [s * 0.075, 0.76, 0.196 * cb], jit: 0.002 });
      for (const s of [1, -1]) add(box(0.13, 0.22, 0.02, 3), { c: C.tunic, b: legBlend(0.6, 0.22, 0.5), pos: [s * 0.09, 0.47, -0.19 * bb], rot: [8, 0, 0] });
      add(cyl(0.21 * cb, 0.18, 0.05, 10), { c: C.cloth, b: 'Chest', pos: [0, 0.94, 0], scl: [1, 1, 0.9] });
    }
    if (t === 'mago') {                                      // armadura de runas: tabardo com runas que brilham + aba até o quadril
      for (const zs of [1, -1]) {
        add(box(0.16, 0.42, 0.02, 4), { c: C.cloth, b: torsoW, pos: [0, 0.72, zs * 0.19 * cb] });
        for (const [y, r] of [[0.84, 0], [0.76, 45], [0.68, 0]]) add(box(0.04, 0.012, 0.01), { c: GLW, glow: true, b: torsoW, pos: [0, y, zs * 0.202 * cb], rot: [0, 0, r], jit: 0 });
        add(box(0.012, 0.05, 0.01), { c: GLW, glow: true, b: torsoW, pos: [0, 0.80, zs * 0.202 * cb], jit: 0 });
      }
      add(cyl(0.204 * cb, 0.204 * cb, 0.022, 10), { c: C.trim, metal: true, b: 'Chest', pos: [0, 0.92, 0], scl: [1, 1, 0.86] });
      add(cyl(0.222 * bb, 0.24 * bb, 0.12, 10, true), { c: C.tunic, b: legBlend(0.57, 0.12, 0.5), pos: [0, 0.515, 0], scl: [1, 1, 0.87] });
    }

    // braços e ombros
    for (const [s, L] of [[1, '_L'], [-1, '_R']]) {
      const x = s * SX0, UA = 'UpperArm' + L, om = cfg.ombros || 'nenhuma';
      if (om === 'redondas' || om === 'pontudas') {
        add(sph(0.105, 7, 5), { c: C.steel, metal: true, b: UA, pos: [x + s * 0.005, 0.935, 0], scl: [1.05, 0.75, 1] });
        add(sph(0.11, 7, 4), { c: C.steelD, metal: true, b: UA, pos: [x + s * 0.015, 0.885, 0], scl: [1, 0.45, 0.95] });
        add(ico(0.016), { c: C.trim, metal: true, b: UA, pos: [x + s * 0.035, 0.995, 0.03], jit: 0 });
        if (om === 'pontudas') {
          add(tube([x + s * 0.04, 0.975, -0.02], [x + s * 0.10, 1.085, -0.04], 0.026, 0.003, 6), { c: C.steelD, metal: true, b: UA, jit: 0.001 });
          add(tube([x + s * 0.06, 0.965, 0.04], [x + s * 0.125, 1.05, 0.06], 0.02, 0.003, 6), { c: C.steelD, metal: true, b: UA, jit: 0.001 });
        }
      } else if (om === 'pele' || om === 'urso') {
        add(ico(0.082, 0), { c: C.fur, b: UA, pos: [x + s * 0.01, 0.93, 0], scl: [1.1, 0.85, 1.05], jit: 0.01 });
        add(ico(0.06, 0), { c: C.furL, b: UA, pos: [x + s * 0.04, 0.9, 0.03], jit: 0.01 });
      } else add(sph(0.07, 7, 5), { c: t === 'malha' ? C.chain : C.tunic, b: UA, pos: [x, 0.92, 0], scl: [1.05, 0.9, 1] });
      add(cyl(0.062, 0.058, 0.17, 7), { c: t === 'malha' ? C.chain : C.tunic, b: UA, pos: [x, 0.83, 0] });
      add(sph(0.058, 6, 4), { c: ['couraca', 'placas', 'malha'].includes(t) ? C.steel : C.tunic, metal: ['couraca', 'placas', 'malha'].includes(t), b: 'ForeArm' + L, pos: [x, 0.72, 0] });
      const gaunt = t === 'placas';
      add(cyl(0.058, 0.069, 0.14, 7), { c: gaunt ? C.steel : C.leather, metal: gaunt, b: 'ForeArm' + L, pos: [x, 0.635, 0] });
      add(cyl(0.072, 0.072, 0.02, 7), { c: C.trim, metal: true, b: 'ForeArm' + L, pos: [x, 0.585, 0], jit: 0.001 });
      hand(s, L, gaunt ? 'manopla' : ['vran'].includes(raca) ? 'garra' : raca === 'vodnik' ? 'palmada' : ['beorning', 'silvano', 'aetheryn'].includes(raca) ? 'nua' : 'luva');
    }
    if (cfg.ombros === 'pele' || cfg.ombros === 'urso') for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2, r = 0.19 * cb;
      add(ico(cfg.ombros === 'urso' ? 0.075 : 0.065, 0), { c: i % 3 ? C.fur : C.furL, b: 'Chest', pos: [Math.sin(a) * r, 0.935 + 0.012 * Math.cos(3 * a), Math.cos(a) * r * 0.86], jit: 0.012 });
    }
  }
  function hand(s, L, kind) {
    const x = s * SX0, off = Mv(V3(x, 0.555, 0)).sub(V3(x, 0.555, 0)), O = { b: 'Hand' + L, off };
    if (kind === 'pedra') { add(ico(0.075, 0), { c: C.skin, pos: [x, 0.51, 0], scl: [1, 0.95, 1.1], jit: 0.008, ...O }); return; }
    const fist = kind === 'luva' ? C.glove : kind === 'manopla' ? C.steel : C.skin;
    add(box(0.085, 0.08, 0.095), { c: fist, metal: kind === 'manopla', pos: [x, 0.515, 0], ...O });
    add(box(0.03, 0.026, 0.085), { c: kind === 'manopla' ? C.steelD : kind === 'luva' ? C.leatherD : C.skinD, metal: kind === 'manopla', pos: [x + s * 0.042, 0.508, 0], jit: 0.002, ...O });
    add(box(0.032, 0.042, 0.032), { c: fist, metal: kind === 'manopla', pos: [x - s * 0.03, 0.53, 0.05], ...O });
    if (kind === 'garra') for (const dz of [-0.03, 0, 0.03]) add(cone(0.011, 0.04, 4), { c: C.horn, pos: [x + s * 0.06, 0.49, dz], rot: [0, 0, -s * 120], jit: 0, ...O });
    if (kind === 'palmada') add(box(0.008, 0.05, 0.07), { c: hex(catCor('corfin') || '#e8762e', 0.9), pos: [x - s * 0.046, 0.53, 0.0], jit: 0, ...O });
  }

  // =============================================================== CORPO DE PEDRA (Litomante)
  function bodyStone() {
    const rk = C.skin, rkD = hex(C.skin, 0.8), rkL = hex(C.skin, 1.1), moss = '#5f7a3a';
    const J = 0.012;
    add(ico(0.2, 0), { c: rk, b: 'Hips', pos: [0, 0.52, 0], scl: [1.05 * bb, 0.62, 0.9], jit: J });
    add(ico(0.21, 0), { c: rkD, b: 'Spine', pos: [0, 0.67, 0], scl: [1.0 * bar, 0.72, 0.88], jit: J });
    add(ico(0.235, 1), { c: rk, b: 'Chest', pos: [0, 0.84, 0], scl: [1.0 * cb, 0.78, 0.84], jit: J });
    add(new THREE.DodecahedronGeometry(0.11, 0), { c: rkL, b: 'Chest', pos: [0.07, 0.86, 0.15 * cb], scl: [1, 0.8, 0.45], jit: J });
    add(new THREE.DodecahedronGeometry(0.1, 0), { c: rkL, b: 'Chest', pos: [-0.08, 0.83, 0.15 * cb], scl: [1, 0.85, 0.45], jit: J });
    add(new THREE.DodecahedronGeometry(0.12, 0), { c: rkD, b: 'Chest', pos: [0, 0.85, -0.15 * cb], scl: [1.3, 0.8, 0.5], jit: J });
    if (cfg.corpo === 'rachado') {
      const cr = [[0.84, 0.18, 30], [0.80, 0.18, -40], [0.70, 0.19, 20], [0.66, 0.19, -25], [0.86, -0.18, 15], [0.72, -0.19, -30]];
      for (const [y, z, r] of cr) add(box(0.07, 0.012, 0.012), { c: GLW, glow: true, b: y > 0.76 ? 'Chest' : 'Spine', pos: [z > 0 ? 0.03 : -0.03, y, z * (y > 0.76 ? cb : bar)], rot: [0, 0, r], jit: 0 });
    }
    if (cfg.corpo === 'musgo') for (const [x, y, z, r] of [[0.1, 0.93, 0.12, 0.06], [-0.12, 0.92, -0.1, 0.07], [0.05, 0.9, -0.16, 0.06], [-0.08, 0.7, 0.16, 0.05]])
      add(ico(r, 0), { c: moss, b: y > 0.76 ? 'Chest' : 'Spine', pos: [x, y, z], scl: [1, 0.45, 1], jit: 0.006, vary: 0.15 });
    for (const [s, L] of [[1, '_L'], [-1, '_R']]) {
      const x = s * SX0, UA = 'UpperArm' + L;
      add(ico(0.072, 0), { c: rk, b: UA, pos: [x, 0.83, 0], scl: [1, 1.45, 1], jit: J });
      add(ico(0.06, 0), { c: rkD, b: 'ForeArm' + L, pos: [x, 0.72, 0], jit: J });
      add(ico(0.075, 0), { c: rk, b: 'ForeArm' + L, pos: [x, 0.635, 0], scl: [1.05, 1.25, 1.05], jit: J });
      for (const [dy, dz, a] of [[0.66, 0.05, 20], [0.62, -0.04, -15]]) add(octa(0.025), { c: GLW, glow: true, b: 'ForeArm' + L, pos: [x + s * 0.06, dy, dz], scl: [0.7, 1.8, 0.7], rot: [a, 0, -s * 30], jit: 0 });
      const om = cfg.ombros;
      if (om === 'cristais') { add(ico(0.08, 0), { c: rkD, b: UA, pos: [x + s * 0.01, 0.93, 0], jit: J });
        for (const [dx, dz, rz, h] of [[0.02, 0, 20, 2.6], [0.05, 0.04, 40, 2], [-0.01, -0.05, 5, 2.2]]) add(octa(0.03), { c: GLW, glow: true, b: UA, pos: [x + s * dx, 1.0, dz], scl: [0.7, h, 0.7], rot: [0, 0, -s * rz], jit: 0 }); }
      else if (om === 'pedregulhos') add(new THREE.DodecahedronGeometry(0.11, 0), { c: rk, b: UA, pos: [x + s * 0.02, 0.95, 0], scl: [1.1, 0.85, 1.05], jit: J });
      else add(ico(0.075, 0), { c: rkD, b: UA, pos: [x, 0.925, 0], jit: J });
      if (cfg.corpo === 'musgo') add(ico(0.06, 0), { c: moss, b: UA, pos: [x + s * 0.02, 0.98, 0], scl: [1.1, 0.4, 1.1], jit: 0.006, vary: 0.15 });
      hand(s, L, 'pedra');
      const lx = s * 0.11;
      add(ico(0.085, 0), { c: rk, b: 'UpLeg' + L, pos: [lx, 0.41, 0], scl: [1, 1.3, 1], jit: J });
      add(ico(0.062, 0), { c: rkD, b: 'Leg' + L, pos: [lx, 0.315, 0.01], jit: J });
      add(ico(0.078, 0), { c: rk, b: 'Leg' + L, pos: [lx, 0.2, 0], scl: [1, 1.35, 1], jit: J });
      add(box(0.14, 0.1, 0.22, 2), { c: rkD, b: 'Foot' + L, pos: [lx, 0.05, 0.035], jit: J });
      add(ico(0.06, 0), { c: rk, b: 'Foot' + L, pos: [lx, 0.05, 0.13], scl: [1.1, 0.8, 1], jit: J });
    }
  }

  // =============================================================== CABEÇAS
  const brows = (style, col) => { for (const s of [1, -1]) {
    const b = { bravos: [[0.078, 0.026, 0.045], 1.183, s * 16], calmos: [[0.074, 0.022, 0.042], 1.19, -s * 6], sabio: [[0.092, 0.032, 0.05], 1.18, -s * 22], fino: [[0.07, 0.016, 0.03], 1.19, -s * 4] }[style];
    add(box(...b[0]), { c: col, b: 'Head', pos: [s * 0.06, b[1], 0.152], rot: [0, 0, b[2]], jit: 0.002, ...H }); } };
  function eyes(style, col) {
    for (const s of [1, -1]) {
      if (style === 'fechados') { add(box(0.034, 0.008, 0.02), { c: C.eye, b: 'Head', pos: [s * 0.058, 1.145, 0.153], rot: [0, 0, s * -8], jit: 0, vary: 0, ...H }); continue; }
      if (style === 'tapa' && s < 0) {
        add(box(0.052, 0.048, 0.02), { c: '#1a1614', b: 'Head', pos: [s * 0.058, 1.15, 0.157], jit: 0.001, ...H });
        add(tube([s * 0.035, 1.168, 0.16], [-s * 0.07, 1.205, 0.14], 0.006, 0.006, 4), { c: '#1a1614', b: 'Head', jit: 0, ...H });
        add(tube([-s * 0.07, 1.205, 0.14], [-s * 0.165, 1.2, 0.0], 0.006, 0.006, 4), { c: '#1a1614', b: 'Head', jit: 0, ...H });
        add(tube([s * 0.08, 1.14, 0.15], [s * 0.168, 1.13, 0.0], 0.006, 0.006, 4), { c: '#1a1614', b: 'Head', jit: 0, ...H });
        continue;
      }
      if (style === 'brilho') { add(box(0.034, 0.03, 0.02), { c: col, glow: true, b: 'Head', pos: [s * 0.058, 1.148, 0.152], rot: [0, 0, s * 10], jit: 0, ...H }); continue; }
      add(box(0.03, style === 'grandes' ? 0.042 : 0.036, 0.02), { c: C.eye, b: 'Head', pos: [s * 0.058, 1.148, 0.152], jit: 0, vary: 0, ...H });
      add(box(0.01, 0.01, 0.01), { c: C.glint, b: 'Head', pos: [s * 0.052, 1.158, 0.163], jit: 0, vary: 0, ...H });
      if (style === 'grandes') add(box(0.022, 0.008, 0.01), { c: C.eye, b: 'Head', pos: [s * 0.076, 1.175, 0.15], rot: [0, 0, s * 25], jit: 0, vary: 0, ...H });  // cílio
    }
  }
  function ears(style) { for (const s of [1, -1]) {
    if (style === 'normal') add(ico(0.035), { c: C.skin, b: 'Head', pos: [s * 0.168, 1.115, -0.005], scl: [0.55, 1, 0.8], ...H });
    else { const len = style === 'longa' ? 0.17 : 0.09;
      add(tube([s * 0.155, 1.12, -0.01], [s * (0.155 + len * 0.85), 1.12 + len * 0.45, -0.03 - len * 0.25], 0.035, 0.004, 5), { c: C.skin, b: 'Head', jit: 0.002, ...H }); } } }
  function beard(style) {
    const bp = (x, y, z) => [x, y, z + bz];
    const BW = { b: beardW, ...H };
    if (style === 'cheia' || style === 'enorme') {
      const big = style === 'enorme' ? 1.18 : 1;
      add(sph(1, 9, 7), { c: HAIR, pos: bp(0, 0.93 - (big - 1) * 0.12, 0.155), scl: [0.172 * big, 0.165 * big, 0.105 * big], jit: 0.006, vary: 0.1, ...BW,
        deform: g => { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) { const y = pa.getY(i), t = ramp(y, 0.765 - (big - 1) * 0.3, 1.095); pa.setX(i, pa.getX(i) * (0.5 + 0.5 * t)); pa.setZ(i, pa.getZ(i) + (1 - t) * 0.03); } } });
      if (style === 'cheia') for (const s of [1, -1]) {
        for (let i = 0; i < 3; i++) add(octa(0.03), { c: HAIR, pos: bp(s * 0.045, 0.785 - i * 0.046, 0.215), scl: [1, 1.35, 1], ...BW });
        add(cyl(0.027, 0.027, 0.024, 7), { c: C.trim, metal: true, pos: bp(s * 0.045, 0.763, 0.215), jit: 0.001, ...BW });
        add(cyl(0.025, 0.025, 0.024, 7), { c: C.trim, metal: true, pos: bp(s * 0.045, 0.672, 0.215), jit: 0.001, ...BW });
        add(tube(bp(s * 0.045, 0.66, 0.215), bp(s * 0.05, 0.62, 0.218), 0.022, 0.004, 6), { c: HAIRD, ...BW });
      }
    } else if (style === 'bifurcada') {
      add(sph(1, 9, 6), { c: HAIR, pos: bp(0, 0.985, 0.15), scl: [0.168, 0.115, 0.1], jit: 0.006, vary: 0.1, ...BW });
      for (const s of [1, -1]) {
        add(tube(bp(s * 0.05, 0.94, 0.17), bp(s * 0.085, 0.69, 0.205), 0.075, 0.012, 7), { c: HAIR, jit: 0.005, vary: 0.1, ...BW });
        add(cyl(0.026, 0.03, 0.026, 7), { c: C.trim, metal: true, pos: bp(s * 0.08, 0.73, 0.2), jit: 0.001, ...BW });
      }
    } else if (style === 'longa') {
      add(sph(1, 9, 7), { c: HAIR, pos: bp(0, 0.95, 0.155), scl: [0.15, 0.15, 0.1], jit: 0.006, vary: 0.1, ...BW,
        deform: g => { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) { const t = ramp(pa.getY(i), 0.8, 1.1); pa.setX(i, pa.getX(i) * (0.55 + 0.45 * t)); } } });
      for (let i = 0; i < 6; i++) add(octa(0.037 - i * 0.002), { c: HAIR, pos: bp(0, 0.80 - i * 0.045, 0.225 + i * 0.002), scl: [1, 1.3, 1], ...BW });
      for (const y of [0.775, 0.64]) add(cyl(0.03, 0.03, 0.026, 7), { c: C.trim, metal: true, pos: bp(0, y, 0.226), jit: 0.001, ...BW });
      add(tube(bp(0, 0.56, 0.228), bp(0, 0.52, 0.23), 0.026, 0.004, 6), { c: HAIRD, ...BW });
    } else if (style === 'curta') {
      add(sph(1, 9, 6), { c: HAIR, b: 'Head', pos: bp(0, 1.0, 0.125), scl: [0.168, 0.09, 0.1], jit: 0.005, vary: 0.1, ...H });
    } else if (style === 'cavanhaque') {
      add(tube([0, 1.04, 0.16], [0, 0.96, 0.175], 0.04, 0.012, 6), { c: HAIR, b: 'Head', jit: 0.003, ...H });
    }
    if (['cheia', 'enorme', 'bifurcada', 'longa', 'curta', 'bigode', 'cavanhaque'].includes(style)) for (const s of [1, -1]) {
      if (style !== 'bigode' && style !== 'cavanhaque') add(box(0.05, 0.13, 0.085), { c: HAIR, b: 'Head', pos: [s * 0.148, 1.075, 0.055], ...H });
      add(tube([s * 0.012, 1.078, 0.195], [s * 0.085, 1.05, 0.18], 0.026, 0.02, 6), { c: HAIRD, b: 'Head', ...H });
      add(tube([s * 0.085, 1.05, 0.18], [s * 0.13, style === 'bigode' || style === 'cavanhaque' ? 1.0 : 0.985, 0.155], 0.02, 0.008, 6), { c: HAIRD, b: 'Head', ...H });
    }
  }
  function hairCap(col) { add(sph(0.18, 10, 5, 0, 1.2), { c: col, b: 'Head', pos: [0, 1.125, -0.005], scl: [1, 1, 0.97], vary: 0.1, ...H }); }
  function hairBack(len, col) { add(sph(0.183, 10, 4, 1.05, len, Math.PI, Math.PI), { c: col, b: 'Head', pos: [0, 1.12, -0.008], vary: 0.1, ...H }); }
  function hair(style, col) {
    const ch = chainBy('Hair'), W = ch ? { b: chainW(ch), ...H } : { b: 'Head', ...H };
    if (style === 'curto' || style === 'ondulado') { hairCap(col); hairBack(0.95, col);
      for (const s of [1, -1]) add(box(0.045, 0.1, 0.07), { c: col, b: 'Head', pos: [s * 0.155, 1.13, 0.04], ...H });
      if (style === 'ondulado') for (const [x, y, z] of [[0.13, 1.25, 0.08], [-0.13, 1.25, 0.08], [0.17, 1.17, -0.06], [-0.17, 1.17, -0.06], [0.06, 1.29, 0.1], [-0.06, 1.29, 0.1], [0, 1.24, -0.16], [0.12, 1.12, -0.14], [-0.12, 1.12, -0.14]])
        add(ico(0.034, 0), { c: (x * 7 + y * 3) % 0.02 > 0.01 ? HAIRD : col, b: 'Head', pos: [x * 1.02, y - 0.01, z], jit: 0.003, vary: 0.12, ...H });
      return; }
    hairCap(col); hairBack(1.15, col);
    for (const s of [1, -1]) add(box(0.045, 0.12, 0.07), { c: col, b: 'Head', pos: [s * 0.155, 1.12, 0.04], ...H });
    add(box(0.12, 0.035, 0.04), { c: col, b: 'Head', pos: [0.03, 1.215, 0.15], rot: [0, 0, -12], ...H });        // franja
    if (style === 'rabo') { const p = ch.pts;
      add(cyl(0.032, 0.032, 0.03, 7), { c: C.trim, metal: true, b: 'Head', pos: p[0], rot: [60, 0, 0], jit: 0.001, ...H });
      polyTube(p, [0.05, 0.045, 0.012], 7, { c: col, jit: 0.003, vary: 0.1, ...W }); }
    if (style === 'tranca') { const p = ch.pts;
      for (let i = 0; i < p.length - 1; i++) for (let k = 0; k < 3; k++) { const t = (k + 0.5) / 3, q = V3(...p[i]).lerp(V3(...p[i + 1]), t);
        add(octa(0.036 - (i * 3 + k) * 0.002), { c: col, pos: q.toArray(), scl: [1, 1.3, 1], ...W }); }
      add(cyl(0.022, 0.022, 0.024, 6), { c: C.trim, metal: true, pos: p[p.length - 1], jit: 0, ...W }); }
    if (style === 'longo') { const p = ch.pts;
      add(box(0.27, 0.32, 0.05, 4), { c: col, pos: [0, 0.97, -0.205], vary: 0.1, ...W,
        deform: g => { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) { const t = ramp(pa.getY(i), 0.81, 1.13); pa.setX(i, pa.getX(i) * (0.8 + 0.25 * t)); pa.setZ(i, pa.getZ(i) - 0.02 * (1 - t)); } } }); }
    if (style === 'coque') { add(sph(0.07, 7, 5), { c: col, b: 'Head', pos: [0, 1.25, -0.13], jit: 0.003, ...H });
      add(cyl(0.05, 0.05, 0.02, 7), { c: C.trim, metal: true, b: 'Head', pos: [0, 1.22, -0.11], rot: [40, 0, 0], jit: 0, ...H }); }
  }
  const helmet = () => {
    add(sph(0.188, 8, 4, 0, Math.PI / 2), { c: C.steel, metal: true, b: 'Head', pos: [0, 1.197, 0], scl: [1, 1.05, 1], ...H });
    add(cyl(0.186, 0.193, 0.046, 8), { c: C.trim, metal: true, b: 'Head', pos: [0, 1.197, 0], ...H });
    add(box(0.03, 0.085, 0.024), { c: C.steelD, metal: true, b: 'Head', pos: [0, 1.168, 0.178], ...H });
    for (const a of [45, 135, 225, 315]) add(ico(0.014), { c: C.steelD, metal: true, b: 'Head', pos: [Math.sin(a * D2R) * 0.195, 1.197, Math.cos(a * D2R) * 0.195], jit: 0, ...H });
  };
  const horns = () => { for (const s of [1, -1]) {
    const hp = [[0.15, 1.275, 0], [0.235, 1.315, 0.01], [0.295, 1.395, 0.03], [0.31, 1.49, 0.07]], hr = [0.038, 0.03, 0.02, 0.005];
    for (let i = 0; i < 3; i++) add(tube([s * hp[i][0], hp[i][1], hp[i][2]], [s * hp[i + 1][0], hp[i + 1][1], hp[i + 1][2]], hr[i], hr[i + 1], 6), { c: C.horn, b: 'Head', jit: 0.002, ...H });
    add(tube([s * 0.13, 1.265, 0], [s * 0.175, 1.285, 0.003], 0.046, 0.044, 7), { c: C.trim, metal: true, b: 'Head', jit: 0.001, ...H }); } };
  const closedHelm = () => {
    add(cyl(0.192, 0.198, 0.25, 8), { c: C.steel, metal: true, b: 'Head', pos: [0, 1.125, 0], scl: [1, 1, 0.98], ...H });
    add(sph(0.192, 8, 4, 0, Math.PI / 2), { c: C.steel, metal: true, b: 'Head', pos: [0, 1.25, 0], scl: [1, 0.75, 0.98], ...H });
    add(box(0.25, 0.026, 0.05), { c: '#121010', b: 'Head', pos: [0, 1.16, 0.178], jit: 0, ...H });
    add(box(0.024, 0.11, 0.05), { c: C.steelD, metal: true, b: 'Head', pos: [0, 1.11, 0.19], ...H });
    add(cyl(0.2, 0.2, 0.03, 8), { c: C.trim, metal: true, b: 'Head', pos: [0, 1.25, 0], ...H });
    add(box(0.03, 0.06, 0.32), { c: C.trim, metal: true, b: 'Head', pos: [0, 1.39, -0.01], ...H });
    for (const s of [1, -1]) for (let i = 0; i < 3; i++) add(box(0.012, 0.012, 0.03), { c: '#121010', b: 'Head', pos: [s * (0.06 + i * 0.022), 1.06, 0.18], jit: 0, ...H });
  };
  const hood = col => {
    add(sph(0.205, 9, 7, 0, Math.PI * 0.62, Math.PI / 2 + 0.95, Math.PI * 2 - 1.9), { c: col, b: 'Head', pos: [0, 1.13, -0.01], vary: 0.09, ...H });
    add(tube([0, 1.12, -0.17], [0, 0.98, -0.27], 0.07, 0.01, 6), { c: col, b: 'Head', ...H });
    add(cyl(0.165, 0.235 * cb, 0.08, 10), { c: col, b: 'Chest', pos: [0, 0.94, 0], scl: [1, 1, 0.88] });
  };
  const crown = () => {
    add(cyl(0.142, 0.15, 0.05, 8, true), { c: C.trim, metal: true, b: 'Head', pos: [0, 1.255, 0], ...H });
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; add(cone(0.022, 0.06, 4), { c: C.trim, metal: true, b: 'Head', pos: [Math.sin(a) * 0.142, 1.305, Math.cos(a) * 0.142], jit: 0, ...H }); }
    add(octa(0.022), { c: '#c0303a', b: 'Head', pos: [0, 1.258, 0.152], scl: [1, 1.2, 0.6], jit: 0, ...H });
  };
  const headband = col => {
    add(cyl(0.176, 0.178, 0.035, 10, true), { c: col, b: 'Head', pos: [0, 1.21, -0.005], scl: [1, 1, 0.97], ...H });
    for (const s of [1, -1]) add(box(0.03, 0.11, 0.012), { c: col, b: 'Head', pos: [s * 0.03, 1.15, -0.19], rot: [12, 0, s * 15], ...H });
  };
  const bearHood = () => {
    add(sph(0.205, 9, 6, 0, 1.6, Math.PI / 2 + 0.9, Math.PI * 2 - 1.8), { c: C.fur, b: 'Head', pos: [0, 1.14, -0.01], vary: 0.12, jit: 0.006, ...H });
    add(ico(0.1, 0), { c: C.fur, b: 'Head', pos: [0, 1.3, 0.07], scl: [1.1, 0.75, 1.15], jit: 0.006, ...H });
    add(ico(0.055, 0), { c: C.furL, b: 'Head', pos: [0, 1.28, 0.17], scl: [1, 0.75, 1.1], ...H });
    add(ico(0.02, 0), { c: '#1b1712', b: 'Head', pos: [0, 1.295, 0.225], jit: 0, ...H });
    for (const s of [1, -1]) { add(ico(0.04, 0), { c: C.fur, b: 'Head', pos: [s * 0.1, 1.37, 0.0], scl: [1, 1, 0.6], ...H });
      add(box(0.016, 0.016, 0.016), { c: '#1b1712', b: 'Head', pos: [s * 0.05, 1.32, 0.15], jit: 0, ...H });
      add(cone(0.012, 0.03, 4), { c: C.horn, b: 'Head', pos: [s * 0.035, 1.235, 0.19], rot: [180, 0, 0], jit: 0, ...H }); }
    add(tube([0, 1.1, -0.18], [0, 0.9, -0.24], 0.1, 0.05, 7), { c: C.fur, b: 'Head', jit: 0.006, ...H });
  };

  function headHumanoid() {
    const faceHidden = cfg.cabeca === 'fechado';
    add(sph(0.17, 9, 7), { c: C.skin, b: 'Head', pos: [0, 1.12, 0], scl: raca === 'aetheryn' ? [0.95, 1.02, 0.94] : [1, 1, 0.95], ...H });
    if (!faceHidden) {
      add(ico(raca === 'humano' || raca === 'aetheryn' ? 0.03 : 0.036), { c: hex(C.skin, 0.93), b: 'Head', pos: [0, 1.1, 0.165], scl: [1, 0.9, 1.1], ...H });
      const fem = cfg.rosto === 'fem' || raca === 'aetheryn';
      eyes(raca === 'aetheryn' ? 'brilho' : fem ? 'grandes' : 'normal', GLW);
      brows(fem ? 'fino' : raca === 'beorning' ? 'bravos' : 'calmos', HAIRD);
      const noBeard = !cfg.barba || ['nenhuma', 'cavanhaque'].includes(cfg.barba);
      if (noBeard) add(box(0.05, 0.01, 0.012), { c: hex(C.skin, 0.6), b: 'Head', pos: [0, 1.055, 0.158], jit: 0, vary: 0, ...H });
      ears(raca === 'aetheryn' ? cfg.orelhas : raca === 'silvano' ? 'pontuda' : 'normal');
      if (cfg.barba) beard(cfg.barba);
    }
    const gear = cfg.cabeca || 'nada';
    if (!['fechado', 'capuz', 'urso'].includes(gear) && cfg.cabelo) hair(cfg.cabelo, HAIR);
    if (gear === 'elmo') { helmet(); add(tube([0, 1.39, -0.02], [0, 1.47, -0.12], 0.03, 0.012, 6), { c: C.cloth, b: 'Head', ...H }); }
    if (gear === 'chifres') { helmet(); horns(); }
    if (gear === 'fechado') closedHelm();
    if (gear === 'capuz') hood(C.cloth);
    if (gear === 'coroa') crown();
    if (gear === 'faixa') headband(C.cloth);
    if (gear === 'urso') bearHood();
    if (gear === 'tiara') { add(cyl(0.173, 0.175, 0.016, 10, true), { c: C.trim, metal: true, b: 'Head', pos: [0, 1.215, 0.0], rot: [-12, 0, 0], scl: [1, 1, 0.97], ...H });
      add(octa(0.022), { c: GLW, glow: true, b: 'Head', pos: [0, 1.235, 0.165], scl: [1, 1.4, 0.5], jit: 0, ...H }); }
    if (gear === 'folhas') for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2;
      add(octa(0.035), { c: i % 2 ? '#4f8a3a' : '#6aa64a', b: 'Head', pos: [Math.sin(a) * 0.168, 1.225 + 0.01 * Math.sin(3 * a), Math.cos(a) * 0.16], scl: [0.5, 1, 1.4], rot: [0, a / D2R, 30], jit: 0.002, ...H }); }
    if (raca === 'silvano') {                                // chifres
      const HC = '#b59a72', HCD = '#8a7352', ht = cfg.chifres;
      for (const s of [1, -1]) {
        let pts, r;
        if (ht === 'carneiro') { pts = [[0.11, 1.25, 0.0], [0.18, 1.3, -0.07], [0.245, 1.27, -0.12], [0.27, 1.18, -0.09], [0.245, 1.105, -0.02], [0.2, 1.11, 0.04]]; r = [0.045, 0.042, 0.036, 0.03, 0.022, 0.012]; }
        else if (ht === 'cabra') { pts = [[0.07, 1.27, 0.03], [0.1, 1.37, -0.05], [0.12, 1.43, -0.17], [0.13, 1.41, -0.28]]; r = [0.036, 0.03, 0.02, 0.005]; }
        else if (ht === 'retos') { pts = [[0.08, 1.27, 0.03], [0.1, 1.36, 0.02], [0.115, 1.44, 0.0]]; r = [0.034, 0.022, 0.004]; }
        else { pts = [[0.09, 1.27, 0.0], [0.15, 1.36, -0.02], [0.2, 1.45, -0.05], [0.22, 1.54, -0.04]]; r = [0.026, 0.022, 0.016, 0.006];
          add(tube([s * 0.15, 1.36, -0.02], [s * 0.12, 1.45, 0.06], 0.014, 0.004, 5), { c: HC, b: 'Head', jit: 0.001, ...H });
          add(tube([s * 0.2, 1.45, -0.05], [s * 0.27, 1.5, -0.02], 0.012, 0.004, 5), { c: HC, b: 'Head', jit: 0.001, ...H }); }
        polyTube(pts.map(p => [s * p[0], p[1], p[2]]), r, 7, { c: HC, b: 'Head', jit: 0.002, ...H });
        if (ht === 'carneiro') for (let i = 1; i < 4; i++) add(cyl(r[i] + 0.004, r[i] + 0.004, 0.01, 7), { c: HCD, b: 'Head', pos: [s * pts[i][0], pts[i][1], pts[i][2]], rot: [70, 0, s * 40], jit: 0, ...H });
      }
    }
  }
  function headVran() {
    add(sph(0.16, 9, 7), { c: C.skin, b: 'Head', pos: [0, 1.13, -0.01], scl: [1, 0.95, 1.05], ...H });
    const long = cfg.focinho === 'longo';
    add(sph(1, 8, 5), { c: C.skin, b: 'Head', pos: [0, 1.075, long ? 0.16 : 0.13], scl: [0.105, 0.075, long ? 0.16 : 0.12], ...H });
    add(sph(1, 7, 4), { c: C.skinL, b: 'Head', pos: [0, 1.035, long ? 0.12 : 0.1], scl: [0.09, 0.04, long ? 0.12 : 0.09], ...H });
    add(box(0.15, 0.008, 0.02), { c: hex(C.skin, 0.45), b: 'Head', pos: [0, 1.052, long ? 0.255 : 0.215], jit: 0, vary: 0, ...H });
    for (const s of [1, -1]) {
      add(box(0.012, 0.008, 0.012), { c: hex(C.skin, 0.45), b: 'Head', pos: [s * 0.025, 1.105, long ? 0.31 : 0.245], jit: 0, ...H });
      const ec = { amarelos: '#f2c230', laranja: '#f08a28', verdes: '#9ee05a', sono: '#f2c230' }[cfg.olhos];
      add(ico(0.042, 1), { c: ec, b: 'Head', pos: [s * 0.088, 1.16, 0.095], jit: 0, vary: 0, ...H });
      add(box(0.008, 0.042, 0.01), { c: '#14110c', b: 'Head', pos: [s * 0.1, 1.16, 0.133], jit: 0, vary: 0, ...H });
      if (cfg.olhos === 'sono') add(sph(0.046, 7, 4, 0, Math.PI / 2), { c: C.skinD, b: 'Head', pos: [s * 0.088, 1.157, 0.095], rot: [25, 0, 0], ...H });
      add(box(0.07, 0.022, 0.05), { c: C.skinD, b: 'Head', pos: [s * 0.085, 1.205, 0.095], rot: [0, 0, s * 12], ...H });
    }
    const cr = cfg.crista, crC = hex(C.skin, 0.62);
    if (cr === 'espinhos' || cr === 'longa') { const n = cr === 'longa' ? 8 : 5;
      for (let i = 0; i < n; i++) { const a = -0.35 + i * (cr === 'longa' ? 0.32 : 0.36), r = 0.16;
        add(cone(0.028, cr === 'longa' ? 0.1 - i * 0.006 : 0.065, 4), { c: crC, b: 'Head', pos: [0, 1.13 + Math.cos(a) * r, -0.01 + Math.sin(-a) * r * -1 * -1 - Math.sin(a) * 0], rot: [-a / D2R - 20, 0, 0], jit: 0.001, ...H }); } }
    if (cr === 'chifrinhos') for (const s of [1, -1]) add(tube([s * 0.07, 1.25, -0.06], [s * 0.11, 1.32, -0.16], 0.025, 0.004, 5), { c: C.horn, b: 'Head', jit: 0.001, ...H });
    for (const s of [1, -1]) add(cone(0.02, 0.05, 4), { c: crC, b: 'Head', pos: [s * 0.15, 1.08, -0.04], rot: [0, 0, s * 110], jit: 0, ...H });
    // rabo
    const ch = chainBy('Tail'), W = { b: chainW(ch) };
    const radii = ch.pts.length === 5 ? [0.1, 0.08, 0.06, 0.04, 0.008] : [0.11, 0.085, 0.06, 0.012];
    polyTube(ch.pts, radii, 8, { c: C.skin, jit: 0.004, ...W });
    if (cfg.cauda === 'espinhos') for (let i = 0; i < ch.pts.length - 1; i++) { const q = V3(...ch.pts[i]).lerp(V3(...ch.pts[i + 1]), 0.5);
      add(cone(0.022, 0.06, 4), { c: crC, pos: [q.x, q.y + radii[i] * 0.8, q.z], rot: [-30, 0, 0], jit: 0, ...W }); }
  }
  function headVodnik() {
    add(sph(0.19, 10, 8), { c: C.skin, b: 'Head', pos: [0, 1.1, 0.0], scl: [1.08, 0.92, 1.0], ...H });
    add(sph(1, 9, 5), { c: C.skinL, b: 'Head', pos: [0, 1.03, 0.07], scl: [0.165, 0.085, 0.12], ...H });
    add(box(0.18, 0.02, 0.03), { c: '#2a1c22', b: 'Head', pos: [0, 1.035, 0.17], jit: 0, vary: 0, ...H,
      deform: g => { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) pa.setY(i, pa.getY(i) + 0.9 * pa.getX(i) * pa.getX(i)); } });
    const ec = { dourados: '#f0b830', prata: '#d8dde4', vermelhos: '#e04838' }[cfg.olhos];
    for (const s of [1, -1]) {
      add(sph(0.056, 8, 6), { c: ec, b: 'Head', pos: [s * 0.105, 1.15, 0.115], jit: 0, vary: 0, ...H });
      add(sph(0.028, 6, 5), { c: '#14110c', b: 'Head', pos: [s * 0.112, 1.152, 0.162], jit: 0, vary: 0, ...H });
      add(box(0.012, 0.012, 0.01), { c: C.glint, b: 'Head', pos: [s * 0.1, 1.17, 0.178], jit: 0, vary: 0, ...H });
      for (let i = 0; i < 3; i++) add(box(0.005, 0.045, 0.012), { c: C.skinD, b: 'Head', pos: [s * (0.17 - i * 0.012), 1.07, 0.02 + i * 0.03], rot: [0, s * 30, 0], jit: 0, ...H });
    }
    const FIN = catCor('corfin'), FIND = hex(FIN, 0.8), hat = cfg.chapeu;
    if (cfg.barbatanas !== 'crista') for (const s of [1, -1]) for (let i = 0; i < 3; i++)
      add(box(0.008, 0.12 - i * 0.02, 0.05), { c: i % 2 ? FIND : FIN, b: 'Head', pos: [s * (0.205 + i * 0.01), 1.12 + i * 0.012, -0.02 - i * 0.04], rot: [-20 - i * 18, 0, -s * (35 + i * 8)], jit: 0.001, ...H });
    if (cfg.barbatanas !== 'laterais' && hat === 'nada') for (let i = 0; i < 4; i++) { const a = -0.3 + i * 0.4;
      add(box(0.01, 0.11 - i * 0.015, 0.06), { c: i % 2 ? FIND : FIN, b: 'Head', pos: [0, 1.1 + Math.cos(a) * 0.19, Math.sin(a) * -0.19], rot: [a / D2R - 10, 0, 0], jit: 0.001, ...H }); }
    if (hat === 'tricornio') {
      add(cyl(0.27, 0.27, 0.025, 3), { c: C.tunicD, b: 'Head', pos: [0, 1.25, -0.01], rot: [0, 60, 0], ...H });
      add(cyl(0.14, 0.16, 0.1, 8), { c: C.tunicD, b: 'Head', pos: [0, 1.3, -0.01], ...H });
      add(cyl(0.162, 0.162, 0.02, 8), { c: C.trim, metal: true, b: 'Head', pos: [0, 1.265, -0.01], ...H });
    }
    if (hat === 'bandana') { add(sph(0.196, 9, 4, 0, 1.05), { c: C.cloth, b: 'Head', pos: [0, 1.1, 0], scl: [1.08, 0.92, 1.0], ...H });
      add(ico(0.035, 0), { c: C.cloth, b: 'Head', pos: [0, 1.17, -0.19], ...H });
      for (const s of [1, -1]) add(box(0.035, 0.1, 0.012), { c: C.cloth, b: 'Head', pos: [s * 0.03, 1.11, -0.2], rot: [10, 0, s * 18], ...H }); }
    if (hat === 'gorro') { add(cyl(0.12, 0.18, 0.14, 9), { c: C.cloth, b: 'Head', pos: [0, 1.29, -0.01], ...H });
      add(cyl(0.188, 0.19, 0.04, 9), { c: hex(C.cloth, 0.8), b: 'Head', pos: [0, 1.225, -0.01], ...H }); }
  }
  function headStone() {
    const rk = C.skin, rkD = hex(rk, 0.78), hc = cfg.cabeca;
    if (hc === 'quadrada') add(box(0.32, 0.28, 0.3, 2), { c: rk, b: 'Head', pos: [0, 1.13, 0], jit: 0.014, ...H });
    else add(ico(0.18, 1), { c: rk, b: 'Head', pos: [0, 1.13, 0], scl: [1.05, 0.95, 1], jit: 0.014, ...H });
    add(box(0.26, 0.05, 0.08), { c: rkD, b: 'Head', pos: [0, 1.19, 0.13], jit: 0.008, ...H });
    add(new THREE.DodecahedronGeometry(0.07, 0), { c: rkD, b: 'Head', pos: [0, 1.05, 0.13], scl: [1.4, 0.6, 0.7], jit: 0.008, ...H });
    const eo = cfg.olhos;
    const eye = (x, y) => eo === 'fenda' ? add(box(0.06, 0.016, 0.02), { c: GLW, glow: true, b: 'Head', pos: [x, y, 0.165], jit: 0, ...H })
      : add(ico(0.026, 0), { c: GLW, glow: true, b: 'Head', pos: [x, y, 0.16], jit: 0, ...H });
    eye(0.065, 1.145); eye(-0.065, 1.145); if (eo === 'tres') eye(0, 1.23);
    if (hc === 'cristais') for (const [x, z, rz, rx, h] of [[0, 0, 0, 0, 3], [0.07, 0.02, -25, 10, 2.2], [-0.07, 0.01, 25, 5, 2.4], [0.03, -0.08, -10, -25, 2], [-0.04, -0.07, 12, -20, 1.8]])
      add(octa(0.035), { c: GLW, glow: true, b: 'Head', pos: [x, 1.32, z], scl: [0.7, h, 0.7], rot: [rx, 0, rz], jit: 0, ...H });
    if (hc === 'musgo') { add(ico(0.15, 1), { c: '#5f7a3a', b: 'Head', pos: [0, 1.24, -0.01], scl: [1.05, 0.4, 1.0], jit: 0.01, vary: 0.15, ...H });
      for (const [x, z] of [[0.08, 0.06], [-0.06, -0.05]]) add(cone(0.02, 0.05, 5), { c: '#e8e0c8', b: 'Head', pos: [x, 1.31, z], jit: 0, ...H }); }
    if (cfg.corpo === 'rachado') add(box(0.06, 0.01, 0.01), { c: GLW, glow: true, b: 'Head', pos: [0.08, 1.25, 0.11], rot: [0, 0, 35], jit: 0, ...H });
  }
  function headAnao() {
    const faceHidden = cfg.cabeca === 'fechado';
    add(sph(0.17, 9, 7), { c: C.skin, b: 'Head', pos: [0, 1.12, 0], scl: [1, 1, 0.95], ...H });
    if (!faceHidden) {
      const NOSE = { batata: [0.046, [1, 0.9, 1], [0, 1.103, 0.168]], comprido: [0.04, [0.8, 0.8, 1.6], [0, 1.098, 0.18]], pequeno: [0.032, [1, 0.9, 1], [0, 1.105, 0.163]] }[cfg.nariz];
      add(ico(NOSE[0]), { c: hex(C.skin, 0.93), b: 'Head', pos: NOSE[2], scl: NOSE[1], rot: cfg.nariz === 'comprido' ? [18, 0, 0] : [0, 0, 0], ...H });
      eyes(cfg.olhos === 'sabio' ? 'fechados' : cfg.olhos === 'tapa' ? 'tapa' : 'normal');
      if (cfg.olhos === 'tapa') { const b = [[0.078, 0.026, 0.045], 1.183, 16]; add(box(...b[0]), { c: HAIRD, b: 'Head', pos: [0.06, b[1], 0.152], rot: [0, 0, b[2]], jit: 0.002, ...H }); add(box(...b[0]), { c: HAIRD, b: 'Head', pos: [-0.06, b[1], 0.152], rot: [0, 0, -b[2]], jit: 0.002, ...H }); }
      else brows(cfg.olhos === 'sabio' ? 'sabio' : cfg.olhos, cfg.olhos === 'sabio' ? PELO_HUM.branco : HAIRD);
      ears('normal');
      beard(cfg.barba);
    }
    const hairBand = () => {
      add(sph(0.178, 9, 4, 0.75, 1.3, Math.PI, Math.PI), { c: HAIR, b: 'Head', pos: [0, 1.11, -0.01], ...H });
      for (let i = 0; i < 3; i++) add(octa(0.034), { c: HAIR, b: 'Head', pos: [0, 1.04 - i * 0.05, -0.172 - i * 0.012], scl: [1, 1.3, 1], ...H });
      add(cyl(0.028, 0.028, 0.022, 7), { c: C.trim, metal: true, b: 'Head', pos: [0, 0.915, -0.2], ...H });
    };
    const g = cfg.cabeca;
    if (g === 'chifres' || g === 'asas') { hairBand(); helmet();
      if (g === 'chifres') horns();
      else for (const s of [1, -1]) for (let i = 0; i < 4; i++) add(box(0.012, 0.15 - i * 0.022, 0.05), { c: i % 2 ? C.steel : C.steelD, metal: true, b: 'Head',
        pos: [s * (0.2 + i * 0.012), 1.30 + i * 0.004, -0.02 - i * 0.035], rot: [-12 - i * 14, 0, -s * (18 + i * 6)], jit: 0.001, ...H }); }
    else if (g === 'fechado') closedHelm();
    else if (g === 'capuz') hood(C.cloth);
    else if (g === 'coroa') { hairBand(); add(sph(0.177, 9, 4, 0, 0.95), { c: HAIR, b: 'Head', pos: [0, 1.12, 0], scl: [1, 1, 0.95], ...H }); crown(); }
    else if (g === 'moicano') { for (let i = 0; i < 7; i++) { const a = (-0.25 + i * 0.27);
        add(octa(0.05), { c: HAIR, b: 'Head', pos: [0, 1.12 + Math.cos(a) * 0.175, Math.sin(a) * 0.175], scl: [0.55, 1.5, 1], rot: [a / D2R, 0, 0], ...H }); }
      for (let i = 0; i < 3; i++) add(octa(0.03), { c: HAIR, b: 'Head', pos: [0, 1.0 - i * 0.045, -0.175 - i * 0.01], scl: [1, 1.3, 1], ...H }); }
    else if (g === 'careca') { hairBand();
      for (const [r, xr] of [[0, 0], [1, 0.05], [-1, -0.05]]) add(box(0.012, 0.012, 0.09), { c: '#2f4f7a', b: 'Head', pos: [xr, 1.285 - Math.abs(r) * 0.006, 0.02], rot: [-8, 0, r * 12], jit: 0, vary: 0, ...H }); }
  }

  // =============================================================== ARMAS
  function weaponR() {
    const F = [-SX0, 0.515, 0], T = (z, y = 0, xo = 0) => [F[0] + xo, F[1] + y, F[2] + z], W = { b: 'Hand_R', off: Mv(V3(-SX0, 0.555, 0)).sub(V3(-SX0, 0.555, 0)) };
    const haft = (a, b, r = 0.019) => { add(tube(T(a), T(b), r, r * 0.9, 6), { c: C.wood, jit: 0.0015, ...W }); add(tube(T(-0.06), T(0.06), r + 0.004, r + 0.004, 6), { c: C.leatherD, jit: 0.001, ...W }); };
    const AXB = [[0.455, -0.025], [0.555, -0.025], [0.585, -0.09], [0.64, -0.19], [0.56, -0.218], [0.45, -0.218], [0.37, -0.19], [0.425, -0.09]];
    const AXE_EDGE = [[0.64, -0.19], [0.56, -0.218], [0.45, -0.218], [0.37, -0.19], [0.385, -0.17], [0.46, -0.196], [0.55, -0.196], [0.62, -0.17]];
    const a = cfg.arma;
    if (a === 'machado' || a === 'machado2') {
      haft(-0.13, 0.57);
      add(ico(0.03), { c: C.trim, metal: true, pos: T(-0.145), jit: 0, ...W }); add(ico(0.022), { c: C.trim, metal: true, pos: T(0.575), jit: 0, ...W });
      add(box(0.05, 0.06, 0.115), { c: C.steelD, metal: true, pos: T(0.505), ...W });
      for (const flip of a === 'machado2' ? [false, true] : [false]) {
        add(blade(AXB, 0.024, flip), { c: C.steel, metal: true, pos: F, jit: 0.002, ...W });
        add(blade(AXE_EDGE, 0.028, flip), { c: C.edge, metal: true, pos: F, jit: 0.001, vary: 0.03, ...W });
      }
      if (a === 'machado') { add(tube(T(0.505, 0.025), T(0.505, 0.115), 0.026, 0.004, 5), { c: C.steelD, metal: true, jit: 0.001, ...W });
        add(octa(0.02), { c: C.trim, metal: true, pos: T(0.505, -0.09, 0), scl: [1.6, 1, 1], jit: 0, ...W }); }
    } else if (a === 'martelo') {
      haft(-0.13, 0.52); add(ico(0.03), { c: C.trim, metal: true, pos: T(-0.145), jit: 0, ...W });
      add(box(0.10, 0.23, 0.11), { c: C.steel, metal: true, pos: T(0.50), jit: 0.004, ...W });
      for (const yy of [-0.085, 0.085]) add(box(0.112, 0.022, 0.122), { c: C.trim, metal: true, pos: T(0.50, yy), jit: 0.001, ...W });
      for (const yy of [-0.122, 0.122]) add(box(0.085, 0.012, 0.09), { c: C.steelD, metal: true, pos: T(0.50, yy), jit: 0.001, ...W });
    } else if (a === 'picareta') {
      haft(-0.12, 0.54); add(box(0.05, 0.055, 0.07), { c: C.steelD, metal: true, pos: T(0.50), ...W });
      add(tube(T(0.50, -0.02), T(0.485, -0.13), 0.026, 0.02, 5), { c: C.steel, metal: true, jit: 0.001, ...W });
      add(tube(T(0.485, -0.13), T(0.44, -0.24), 0.02, 0.004, 5), { c: C.steel, metal: true, jit: 0.001, ...W });
      add(tube(T(0.50, 0.02), T(0.49, 0.12), 0.024, 0.008, 5), { c: C.steel, metal: true, jit: 0.001, ...W });
    } else if (a === 'espada') {
      add(tube(T(-0.065), T(0.065), 0.02, 0.02, 6), { c: C.leatherD, jit: 0.001, ...W });
      add(ico(0.03), { c: C.trim, metal: true, pos: T(-0.085), jit: 0, ...W });
      add(box(0.034, 0.2, 0.032), { c: C.trim, metal: true, pos: T(0.08), jit: 0.002, ...W });
      add(blade([[0.095, -0.032], [0.48, -0.03], [0.56, 0], [0.48, 0.03], [0.095, 0.032]], 0.014), { c: C.steel, metal: true, pos: F, jit: 0.001, ...W });
      add(blade([[0.11, -0.006], [0.46, -0.006], [0.46, 0.006], [0.11, 0.006]], 0.018), { c: C.steelD, metal: true, pos: F, jit: 0, ...W });
    } else if (a === 'maca') {
      haft(-0.12, 0.44, 0.02); add(ico(0.028), { c: C.trim, metal: true, pos: T(-0.135), jit: 0, ...W });
      add(ico(0.072, 0), { c: C.steelD, metal: true, pos: T(0.49), jit: 0.003, ...W });
      for (let i = 0; i < 6; i++) { const q = i / 6 * Math.PI * 2;
        add(box(0.012, 0.075, 0.11), { c: C.steel, metal: true, pos: T(0.49, Math.cos(q) * 0.06, Math.sin(q) * 0.06), rot: [0, 0, -q / D2R + 90], jit: 0.001, ...W }); }
    } else if (a === 'cajado') {
      add(tube(T(-0.32), T(0.5), 0.018, 0.022, 6), { c: C.woodD, jit: 0.002, ...W });
      add(tube(T(-0.06), T(0.06), 0.024, 0.024, 6), { c: C.leather, jit: 0.001, ...W });
      for (const q of [0, 2.1, 4.2]) add(tube(T(0.48), T(0.62, Math.cos(q) * 0.05, Math.sin(q) * 0.05), 0.014, 0.006, 5), { c: C.woodD, jit: 0.001, ...W });
      add(octa(0.045), { c: GLW, glow: true, pos: T(0.58), scl: [0.8, 0.8, 1.5], rot: [90, 0, 0], jit: 0, ...W });
    } else if (a === 'tridente') {
      add(tube(T(-0.3), T(0.5), 0.017, 0.017, 6), { c: C.wood, jit: 0.002, ...W });
      add(tube(T(-0.06), T(0.06), 0.022, 0.022, 6), { c: C.leatherD, jit: 0.001, ...W });
      add(box(0.03, 0.15, 0.03), { c: C.steelD, metal: true, pos: T(0.51), jit: 0.001, ...W });
      for (const yy of [-0.065, 0, 0.065]) { add(tube(T(0.51, yy), T(yy ? 0.64 : 0.68, yy), 0.012, 0.012, 5), { c: C.steel, metal: true, jit: 0, ...W });
        add(cone(0.02, 0.06, 4), { c: C.steel, metal: true, pos: T(yy ? 0.665 : 0.705, yy), rot: [90, 0, 0], jit: 0, ...W }); }
    }
  }
  function leftHand() {
    const cx = SX0 + 0.088, cy = 0.64, S = { b: 'ForeArm_L', off: Mv(V3(SX0, 0.64, 0)).sub(V3(SX0, 0.64, 0)) };
    const HL = { b: 'Hand_L', off: Mv(V3(SX0, 0.555, 0)).sub(V3(SX0, 0.555, 0)) }, mx = SX0 + 0.085, my = 0.515;
    const e = cfg.esquerda;
    if (e === 'redondo') {
      add(cyl(0.195, 0.195, 0.03, 12), { c: C.wood, pos: [cx, cy, 0], rot: [0, 0, 90], vary: 0.12, ...S });
      for (const z of [-0.075, 0.075]) add(box(0.006, 0.36, 0.012), { c: C.woodD, pos: [cx + 0.016, cy, z], jit: 0.001, ...S });
      add(new THREE.TorusGeometry(0.195, 0.022, 4, 12), { c: C.steel, metal: true, pos: [cx, cy, 0], rot: [0, 90, 0], ...S });
      add(sph(0.068, 7, 4), { c: C.steel, metal: true, pos: [cx + 0.016, cy, 0], scl: [0.55, 1, 1], ...S });
      for (const r of [45, -45]) add(box(0.008, 0.25, 0.034), { c: C.trim, metal: true, pos: [cx + 0.018, cy, 0], rot: [r, 0, 0], jit: 0.001, ...S });
      add(box(0.04, 0.045, 0.12), { c: C.leatherD, pos: [SX0 + 0.06, cy, 0], ...S });
    } else if (e === 'torre') {
      add(box(0.03, 0.42, 0.36, 2), { c: C.tunic, pos: [cx, cy - 0.01, 0], vary: 0.08,
        deform: g => { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) pa.setX(i, pa.getX(i) - 4 * Math.pow(pa.getZ(i), 2) * 0.35); }, ...S });
      for (const z of [-0.185, 0.185]) add(box(0.04, 0.43, 0.02), { c: C.steel, metal: true, pos: [cx - 4 * 0.034 * 0.35, cy - 0.01, z], ...S });
      for (const y of [cy + 0.205, cy - 0.225]) add(box(0.04, 0.025, 0.37), { c: C.steel, metal: true, pos: [cx - 0.012, y, 0], ...S });
      add(octa(0.07), { c: C.trim, metal: true, pos: [cx + 0.02, cy - 0.01, 0], scl: [0.35, 1.3, 1], ...S });
      add(box(0.04, 0.045, 0.12), { c: C.leatherD, pos: [SX0 + 0.06, cy, 0], ...S });
    } else if (e === 'broquel') {
      add(cyl(0.12, 0.12, 0.02, 10), { c: C.steel, metal: true, pos: [cx - 0.005, cy - 0.04, 0], rot: [0, 0, 90], ...S });
      add(sph(0.055, 7, 4), { c: C.trim, metal: true, pos: [cx + 0.008, cy - 0.04, 0], scl: [0.6, 1, 1], ...S });
      add(new THREE.TorusGeometry(0.12, 0.012, 4, 10), { c: C.steelD, metal: true, pos: [cx - 0.005, cy - 0.04, 0], rot: [0, 90, 0], ...S });
      add(box(0.04, 0.04, 0.08), { c: C.leatherD, pos: [SX0 + 0.055, cy - 0.04, 0], ...S });
    } else if (e === 'caneca') {
      add(cyl(0.052, 0.056, 0.13, 8), { c: C.wood, pos: [mx, my, 0], ...HL });
      for (const y of [my - 0.045, my + 0.045]) add(cyl(0.058, 0.058, 0.014, 8), { c: C.steel, metal: true, pos: [mx, y, 0], jit: 0.001, ...HL });
      add(ico(0.05, 0), { c: '#f5efdc', pos: [mx, my + 0.075, 0], scl: [1.05, 0.55, 1.05], jit: 0.004, ...HL });
    } else if (e === 'livro') {
      add(box(0.05, 0.15, 0.12), { c: C.cloth, pos: [mx, my, 0.0], ...HL });
      add(box(0.042, 0.14, 0.114), { c: '#efe6cc', pos: [mx + 0.006, my, 0.0], jit: 0.001, ...HL });
      add(octa(0.025), { c: C.trim, metal: true, pos: [mx + 0.027, my, 0], scl: [0.3, 1, 1], jit: 0, ...HL });
    } else if (e === 'orbe') {
      add(ico(0.06, 1), { c: GLW, glow: true, pos: [mx + 0.01, my, 0], jit: 0, ...HL });
      for (const q of [0, 2.1, 4.2]) add(tube([mx - 0.03, my - 0.03, 0], [mx + 0.01 + Math.cos(q) * 0.05, my - 0.01, Math.sin(q) * 0.05], 0.008, 0.004, 4), { c: C.trim, metal: true, jit: 0, ...HL });
    }
  }

  // =============================================================== montar
  if (isLito) { bodyStone(); headStone(); }
  else {
    bodyClothed();
    if (raca === 'anao') headAnao(); else if (raca === 'vran') headVran(); else if (raca === 'vodnik') headVodnik(); else headHumanoid();
  }
  weaponR(); leftHand();

  const groups = PARTS.map(a => a.length ? mergeGeometries(a) : null);
  const used = groups.map((g, i) => g ? i : -1).filter(i => i >= 0);
  const geo = mergeGeometries(used.map(i => groups[i]), true);
  const mesh = new THREE.SkinnedMesh(geo, used.map(i => (Q.liso ? MATS_LISO : MATS)[i]));
  mesh.name = RACAS[raca].nome; mesh.castShadow = true; mesh.frustumCulled = false;
  const root = new THREE.Group(); root.name = RACAS[raca].nome + '_raiz'; root.add(B.Hips); root.add(mesh);
  root.updateMatrixWorld(true); mesh.bind(new THREE.Skeleton(bones));

  // ---------- poses deste corpo
  const HEEL = V3(0, -0.115 * ky, -0.07 * kz), BALL = V3(0, -0.115 * ky, 0.10 * kz), armOut = (bar - 1) * 0.25 + (isLito ? 0.03 : 0);
  function applyPose(P) {
    B.Hips.position.set(P.hp[0] * kx, P.hp[1] * ky, P.hp[2] * ky); B.Hips.quaternion.copy(E(P.hr));
    B.Spine.quaternion.copy(E(P.sp)); B.Chest.quaternion.copy(E(P.ch)); B.Neck.quaternion.copy(E(P.nk)); B.Head.quaternion.copy(E(P.hd));
    for (const ch of chains) for (const nm of ch.names) B[nm].quaternion.identity();
    root.updateMatrixWorld(true);
    const qc = B.Chest.getWorldQuaternion(new THREE.Quaternion());
    for (const [a, L, s] of [[P.aL, '_L', 1], [P.aR, '_R', -1]]) {
      const rel = V3(...a.p).sub(CHEST0); rel.set(rel.x * kx + s * armOut, rel.y * ky, rel.z * kz);
      ik(B['UpperArm' + L], B['ForeArm' + L], B['Hand' + L], B.Chest.localToWorld(rel), V3(...a.pole).applyQuaternion(qc), L_ARM[0], L_ARM[1], false, qc.clone().multiply(a.q), true);
    }
    for (const [f, L, s] of [[P.fL, '_L', 1], [P.fR, '_R', -1]]) {
      const q = E([f.pitch, f.yaw, 0]), qy = new THREE.Quaternion().setFromAxisAngle(_Y, f.yaw * D2R);
      const pv = f.pitch >= 0 ? BALL : HEEL;
      const ankle = V3(f.g[0] * kx, f.g[1] * ky, f.g[2] * ky).add(V3(0, 0, pv.z).applyQuaternion(qy)).sub(pv.clone().applyQuaternion(q));
      ik(B['UpLeg' + L], B['Leg' + L], B['Foot' + L], ankle, V3(Math.sin(f.yaw * D2R) + s * 0.12, 0, Math.cos(f.yaw * D2R)), L_LEG[0], L_LEG[1], true, q, false);
    }
    root.updateMatrixWorld(true);
  }
  const endNames = new Set(chains.map(c => c.end));
  const TRACKED = bones.filter(b => !endNames.has(b.name)), clips = [], meas = {};
  for (const cd of CLIPDEF) {
    const N = Math.round(cd.dur * cd.fps), times = [], qa = TRACKED.map(() => []), pos = [], ank = { L: [], R: [] };
    for (let i = 0; i <= N; i++) {
      const t = i / cd.fps; applyPose(cd.fn(Math.min(t, cd.dur - 1e-6) % cd.dur));
      times.push(t); TRACKED.forEach((b, j) => qa[j].push(...b.quaternion.toArray())); pos.push(...B.Hips.position.toArray());
      if (cd.loco) for (const L of ['L', 'R']) ank[L].push(new THREE.Vector3().setFromMatrixPosition(B['Foot_' + L].matrixWorld));
    }
    const tracks = TRACKED.map((b, j) => new THREE.QuaternionKeyframeTrack(b.name + '.quaternion', times, qa[j]));
    tracks.push(new THREE.VectorKeyframeTrack('Hips.position', times, pos));
    clips.push(new THREE.AnimationClip(cd.name, cd.dur, tracks));
    if (cd.loco) {
      const v = cd.loco.S * ky / (cd.loco.D * cd.loco.T), yc = 0.115 * ky + 0.0015; let sum = 0, cnt = 0;
      for (const L of ['L', 'R']) for (let i = 1; i < ank[L].length; i++) { const a = ank[L][i - 1], b = ank[L][i];
        if (a.y < yc && b.y < yc) { sum += -(b.z - a.z) * cd.fps; cnt++; } }
      meas[cd.name] = { v, med: sum / Math.max(cnt, 1), yc };
    }
  }
  const restPose = () => { for (const b of bones) { b.quaternion.identity(); const p = PARENT[b.name]; b.position.copy(REST[b.name]).sub(p ? REST[p] : V3(0, 0, 0)); } root.updateMatrixWorld(true); };
  restPose();
  const springs = [];
  for (const ch of chains) ch.names.forEach((nm, i) => springs.push({ b: B[nm], c: B[i < ch.names.length - 1 ? ch.names[i + 1] : ch.end], ...ch.spring[i], max: ch.spring[i].max * D2R }));
  return { raca, cfg, root, mesh, geo, bones, B, REST, PARENT, clips, meas, springs, restPose, tris: geo.attributes.position.count / 3, ky, liso: Q.liso, q: Q,
    height: REST.Head.y + 0.3, info: { ossos: TRACKED.length, molas: chains.map(c => c.name) } };
}

// física secundária (molas) — chamar a cada quadro depois do mixer.update()
export function springStep(P, dt) {
  for (const s of P.springs) {
    s.b.updateMatrixWorld(true);
    const head = new THREE.Vector3().setFromMatrixPosition(s.b.matrixWorld), tip = new THREE.Vector3().setFromMatrixPosition(s.c.matrixWorld);
    if (!s.P) { s.P = tip.clone(); s.V = new THREE.Vector3(); }
    const nsub = Math.max(1, Math.ceil(dt * 240)), h = dt / nsub;
    for (let i = 0; i < nsub; i++) { const acc = tip.clone().sub(s.P).multiplyScalar(s.k).addScaledVector(s.V, -s.d); acc.y -= s.g; s.V.addScaledVector(acc, h); s.P.addScaledVector(s.V, h); }
    const len = tip.distanceTo(head); s.P.sub(head).setLength(len).add(head);
    let qd = new THREE.Quaternion().setFromUnitVectors(tip.clone().sub(head).normalize(), s.P.clone().sub(head).normalize());
    const ang = 2 * Math.acos(Math.min(1, Math.abs(qd.w))); if (ang > s.max) qd = new THREE.Quaternion().slerp(qd, s.max / ang);
    const qn = qd.multiply(s.b.getWorldQuaternion(new THREE.Quaternion()));
    s.b.quaternion.copy(s.b.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(qn));
    s.b.updateMatrixWorld(true);
  }
}
export const resetSprings = P => P.springs.forEach(s => { s.P = null; });

// geometria enxuta para exportar (sem normais; cor/ossos/pesos em 8 bits)
export function exportGeometry(P) {
  const geo = P.geo, g = new THREE.BufferGeometry(), n = geo.attributes.position.count;
  g.setAttribute('position', geo.attributes.position);
  if (P.liso) g.setAttribute('normal', geo.attributes.normal);   // liso precisa das normais; facetado o leitor recalcula
  const c8 = new Uint8Array(n * 3), j8 = new Uint8Array(n * 4), w8 = new Uint8Array(n * 4);
  const ca = geo.attributes.color, si = geo.attributes.skinIndex, sw = geo.attributes.skinWeight;
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < 3; k++) c8[i * 3 + k] = Math.round(clamp(ca.array[i * 3 + k], 0, 1) * 255);
    let tot = 0, big = 0;
    for (let k = 0; k < 4; k++) { j8[i * 4 + k] = si.getComponent(i, k); w8[i * 4 + k] = Math.round(sw.getComponent(i, k) * 255); tot += w8[i * 4 + k]; if (w8[i * 4 + k] > w8[i * 4 + big]) big = k; }
    w8[i * 4 + big] += 255 - tot;
  }
  g.setAttribute('color', new THREE.BufferAttribute(c8, 3, true));
  g.setAttribute('skinIndex', new THREE.BufferAttribute(j8, 4));
  g.setAttribute('skinWeight', new THREE.BufferAttribute(w8, 4, true));
  for (const gr of geo.groups) g.addGroup(gr.start, gr.count, gr.materialIndex);
  return g;
}
