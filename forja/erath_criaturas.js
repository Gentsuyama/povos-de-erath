// Bestiário de Erath — criaturas geradas 100% em código (módulo puro: navegador e Node).
//   import { ESPECIES, ESP_ORDEM, catsOfEsp, baseCfgEsp, randomCfgEsp, nomeVariacao, forgeCriatura, springStep } from './erath_criaturas.js'
//   const P = forgeCriatura('fada-orvalho', baseCfgEsp('fada-orvalho'));  // P.root já na escala real; P.clips; P.springs
// Famílias: A = bípede pequeno com/sem asas (fadas, diabretes, ursos alados); B = flutuante (fantasmas, chamas, olhos...).
// Convenções iguais às da Forja: Y para cima, olha para +Z, esquerda dele = +X, metros.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const D2R = Math.PI / 180;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ramp = (v, a, b) => clamp((v - a) / (b - a), 0, 1);
const EASE = { io: s => s * s * (3 - 2 * s), in: s => s * s, out: s => 1 - (1 - s) * (1 - s), lin: s => s };
function hash3(x, y, z) {
  const f = v => { const s = Math.sin(v) * 43758.5453; return (s - Math.floor(s)) * 2 - 1; };
  return [f(x * 127.1 + y * 311.7 + z * 74.7), f(x * 269.5 + y * 183.3 + z * 246.1), f(x * 113.5 + y * 271.9 + z * 124.6)];
}
export function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hashStr = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const hex = (c, k) => '#' + new THREE.Color(c).multiplyScalar(k).getHexString();
const E = (a, order = 'YXZ') => new THREE.Quaternion().setFromEuler(new THREE.Euler(a[0] * D2R, a[1] * D2R, a[2] * D2R, order));

export const CMATS = [
  new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85, metalness: 0, side: THREE.DoubleSide, envMapIntensity: 0.5, name: 'fosco' }),
  new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.38, metalness: 0.75, envMapIntensity: 1.0, name: 'metal' }),
  new THREE.MeshBasicMaterial({ vertexColors: true, name: 'brilho' }),
  new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false, name: 'translucido' }),
];

// ======================================================================= catálogo de espécies
const P_ = (k, n) => [k, n];
const TAM = { n: 'Tamanho', o: [P_('p', 'Menor'), P_('m', 'Normal'), P_('g', 'Maior')] };
const TAMK = { p: 0.86, m: 1, g: 1.15 };
const pal = obj => ({ n: 'Cores', o: Object.entries(obj).map(([k, v]) => [k, v.n]), cor: obj });
const CAB_F = { n: 'Cabelo', o: [P_('curto', 'Curto'), P_('coque', 'Coque'), P_('longo', 'Longo'), P_('flor', 'Com flor')] };
const ACC_F = { n: 'Na mão', o: [P_('varinha', 'Varinha'), P_('flor', 'Flor'), P_('gota', 'Gota de luz'), P_('nada', 'Nada')] };
const ORELHA_D = { n: 'Orelhas', o: [P_('pontuda', 'Pontudas'), P_('morcego', 'De morcego'), P_('pequena', 'Pequenas')] };
const CHIFRE_D = { n: 'Chifres', o: [P_('chifrinhos', 'Chifrinhos'), P_('carneiro', 'Enrolados'), P_('longos', 'Longos'), P_('nenhum', 'Nenhum')] };
const CAUDA_D = { n: 'Cauda', o: [P_('flecha', 'Flecha'), P_('rato', 'Fina'), P_('mola', 'Em mola'), P_('nenhuma', 'Nenhuma')] };
const ACC_D = { n: 'Na mão', o: [P_('forquilha', 'Forquilha'), P_('tocha', 'Tocha'), P_('saco', 'Saco de moedas'), P_('nada', 'Nada')] };

export const ESPECIES = {
  // ------------------------------------------------------------ FADAS (família A, voam)
  'fada-orvalho': { num: 1, nome: 'Fada-orvalho', grupo: 'Feéricos', fam: 'A', tam: 0.15, voa: true, desc: '4 asas de libélula, antenas, saia de pétala; voa em zigue-zague e paira.',
    cats: { cores: pal({ agua: { n: 'Água', pele: '#cfe8e0', roupa: '#5fb8a8', cab: '#2f6f8a', asa: '#a8e8ff' }, rosa: { n: 'Rosa', pele: '#f2d2c8', roupa: '#e87aa0', cab: '#8a3a5a', asa: '#ffc8e8' },
      lilas: { n: 'Lilás', pele: '#ead8f0', roupa: '#9a7ad8', cab: '#4a3a7a', asa: '#d8c8ff' }, dourado: { n: 'Dourado', pele: '#f2dcc0', roupa: '#e0b040', cab: '#a86a20', asa: '#fff0a8' } }),
      cabelo: CAB_F, antenas: { n: 'Antenas', o: [P_('sim', 'Com antenas'), P_('nao', 'Sem antenas')] }, mao: ACC_F },
    base: { cores: 'agua', cabelo: 'curto', antenas: 'sim', mao: 'varinha' },
    receita: c => ({ torso: 'fada', head: { tipo: 'humano', cabelo: c.cabelo }, asas: 'libelula', antenas: c.antenas === 'sim', mao: c.mao, flap: 9 }) },
  'pirilampa': { num: 2, nome: 'Pirilampa', grupo: 'Feéricos', fam: 'A', tam: 0.08, voa: true, desc: 'Abdômen que brilha, asas de besouro; voa aos pulos.',
    cats: { cores: pal({ ambar: { n: 'Âmbar', pele: '#e8d8b0', roupa: '#3a3a2a', cab: '#2a2a1a', asa: '#c8d8a0', brilho: '#e8ff60' }, verde: { n: 'Verde', pele: '#d8e8c0', roupa: '#2a4a2a', cab: '#1a2a1a', asa: '#a8e8a0', brilho: '#80ff90' },
      azul: { n: 'Azul', pele: '#d0e0f0', roupa: '#2a3a5a', cab: '#1a2a4a', asa: '#a0c8f0', brilho: '#70d0ff' }, rubi: { n: 'Rubi', pele: '#f0d8d0', roupa: '#4a2a2a', cab: '#3a1a1a', asa: '#f0b0a0', brilho: '#ff7050' } }),
      cabelo: CAB_F, brilho: { n: 'Brilho', o: [P_('bulbo', 'Lanterna na cauda'), P_('pontos', 'Pintas que brilham')] } },
    base: { cores: 'ambar', cabelo: 'coque', brilho: 'bulbo' },
    receita: c => ({ torso: 'fada', head: { tipo: 'humano', cabelo: c.cabelo }, asas: 'besouro', antenas: 'brilho', cauda: c.brilho === 'bulbo' ? 'brilho' : null, pintas: c.brilho === 'pontos', flap: 11 }) },
  'fada-cogumelo': { num: 3, nome: 'Fada-cogumelo', grupo: 'Feéricos', fam: 'A', tam: 0.2, voa: false, desc: 'Chapéu de cogumelo no lugar da cabeça, pés de raiz; anda gingando.',
    cats: { cores: pal({ rubro: { n: 'Rubro', pele: '#f0dcc0', roupa: '#8a6a4a', chapeu: '#d03a2a', pinta: '#f8f0e0' }, ocre: { n: 'Ocre', pele: '#f0dcc0', roupa: '#6a5a3a', chapeu: '#c8902a', pinta: '#f8f0e0' },
      azul: { n: 'Azulado', pele: '#e0e8f0', roupa: '#4a5a7a', chapeu: '#3a6ac8', pinta: '#e8f0ff' }, roxo: { n: 'Roxo', pele: '#ece0f0', roupa: '#5a4a6a', chapeu: '#8a3ab8', pinta: '#f0e0ff' } }),
      chapeu: { n: 'Chapéu', o: [P_('redondo', 'Redondo'), P_('pontudo', 'Pontudo'), P_('largo', 'Largo e chato')] }, pes: { n: 'Pés', o: [P_('raiz', 'Raízes'), P_('pernas', 'Perninhas')] } },
    base: { cores: 'rubro', chapeu: 'redondo', pes: 'raiz' },
    receita: c => ({ torso: 'fada', head: { tipo: 'cogumelo', chapeu: c.chapeu }, pernas: c.pes === 'raiz' ? 'raiz' : 'pernas', saia: false }) },
  'silfide-de-polen': { num: 4, nome: 'Sílfide-de-pólen', grupo: 'Feéricos', fam: 'A', tam: 0.12, voa: true, desc: 'Sem pernas, cauda de fumaça amarela, 2 pares de asas de mariposa; flutua.',
    cats: { cores: pal({ polen: { n: 'Pólen', pele: '#f8ecc8', roupa: '#e8c040', cab: '#c89020', asa: '#f0d890', fumaca: '#ffe070' }, cinza: { n: 'Cinza', pele: '#ece8e0', roupa: '#a8a090', cab: '#706858', asa: '#d8d0c0', fumaca: '#e8e0d0' },
      rosa: { n: 'Rosado', pele: '#f8e0e0', roupa: '#e898a8', cab: '#b05870', asa: '#f8c8d0', fumaca: '#ffb8c8' }, lua: { n: 'Luar', pele: '#e0e8f8', roupa: '#8898c8', cab: '#4a5888', asa: '#c8d8f8', fumaca: '#c0d8ff' } }),
      cabelo: CAB_F, asas: { n: 'Asas', o: [P_('mariposa', 'Mariposa'), P_('borboleta', 'Borboleta')] } },
    base: { cores: 'polen', cabelo: 'longo', asas: 'mariposa' },
    receita: c => ({ torso: 'fada', head: { tipo: 'humano', cabelo: c.cabelo }, asas: c.asas, pernas: 'fumaca', antenas: c.asas === 'mariposa' ? 'pluma' : false, flap: 5, saia: false }) },
  'duende-de-musgo': { num: 5, nome: 'Duende-de-musgo', grupo: 'Feéricos', fam: 'A', tam: 0.4, voa: false, desc: 'Barba de musgo, orelhas de folha, corcunda de pedra; anda devagar.',
    cats: { cores: pal({ musgo: { n: 'Musgo', pele: '#c8a888', roupa: '#6a5a3a', barba: '#5a8a3a', pedra: '#8a8580' }, outono: { n: 'Outono', pele: '#d0a888', roupa: '#7a4a2a', barba: '#a87a2a', pedra: '#9a8a70' },
      liquen: { n: 'Líquen', pele: '#b8b0a0', roupa: '#4a5a4a', barba: '#9ab88a', pedra: '#6a6a6a' } }),
      gorro: { n: 'Gorro', o: [P_('folha', 'Folha'), P_('pontudo', 'Pontudo'), P_('nada', 'Nada')] }, mao: { n: 'Na mão', o: [P_('cajado', 'Cajado'), P_('lanterna', 'Lanterna'), P_('nada', 'Nada')] } },
    base: { cores: 'musgo', gorro: 'folha', mao: 'cajado' },
    receita: c => ({ torso: 'redondo', head: { tipo: 'duende', gorro: c.gorro }, extras: ['corcunda'], mao: c.mao, k: { x: 1.05, y: 0.95 } }) },
  'ninfa-gota': { num: 6, nome: 'Ninfa-gota', grupo: 'Feéricos', fam: 'A', tam: 0.18, voa: false, desc: 'Corpo de água translúcida, cabelo que escorre; desliza e salta.',
    cats: { cores: pal({ rio: { n: 'Rio', agua: '#6ac8e8', cab: '#3a98c8' }, lago: { n: 'Lago', agua: '#5ab8a0', cab: '#2a8a78' }, chuva: { n: 'Chuva', agua: '#a8c8e8', cab: '#7898c8' }, fonte: { n: 'Fonte', agua: '#8ae0d0', cab: '#e8f8ff' } }),
      cabelo: { n: 'Cabelo', o: [P_('cascata', 'Cascata'), P_('coque', 'Coque'), P_('curto', 'Curto')] } },
    base: { cores: 'rio', cabelo: 'cascata' },
    receita: c => ({ torso: 'agua', head: { tipo: 'gota', cabelo: c.cabelo }, saia: false }) },
  'fada-espinho': { num: 7, nome: 'Fada-espinho', grupo: 'Feéricos', fam: 'A', tam: 0.15, voa: true, desc: 'Asas de folha seca, lança de espinho, couraça de casca; voo rasante.',
    cats: { cores: pal({ outono: { n: 'Outono', pele: '#e8c8a0', roupa: '#7a5a3a', cab: '#a83a1a', asa: '#c87a2a' }, verao: { n: 'Verão', pele: '#e8d0b0', roupa: '#5a6a3a', cab: '#3a5a1a', asa: '#6aa83a' },
      seca: { n: 'Seca', pele: '#e0c8a8', roupa: '#6a5040', cab: '#4a3020', asa: '#a89060' }, sangue: { n: 'Rubra', pele: '#f0d0c0', roupa: '#5a3a2a', cab: '#2a1a1a', asa: '#a82a2a' } }),
      cabelo: CAB_F, mao: { n: 'Arma', o: [P_('lanca', 'Lança de espinho'), P_('espada', 'Espada de espinho'), P_('nada', 'Nada')] } },
    base: { cores: 'outono', cabelo: 'curto', mao: 'lanca' },
    receita: c => ({ torso: 'fada', head: { tipo: 'humano', cabelo: c.cabelo }, asas: 'folha', extras: ['casca'], mao: c.mao, flap: 7, saia: false }) },
  'fada-semente': { num: 9, nome: 'Fada-semente', grupo: 'Feéricos', fam: 'A', tam: 0.06, voa: true, desc: 'Capuz de bolota, hélice de semente nas costas; plana girando.',
    cats: { cores: pal({ carvalho: { n: 'Carvalho', pele: '#f0d8b8', roupa: '#8a6a3a', bolota: '#7a4a22', asa: '#c8a060' }, bordo: { n: 'Bordo', pele: '#f0d8c0', roupa: '#a83a2a', bolota: '#6a3a1a', asa: '#d86a3a' },
      musgo: { n: 'Musgo', pele: '#e8dcc0', roupa: '#5a7a3a', bolota: '#5a4a2a', asa: '#a8b860' } }),
      helice: { n: 'Hélice', o: [P_('dupla', 'Dupla'), P_('simples', 'Simples')] } },
    base: { cores: 'carvalho', helice: 'dupla' },
    receita: c => ({ torso: 'fada', head: { tipo: 'bolota' }, asas: c.helice === 'dupla' ? 'semente2' : 'semente1', flap: 3, saia: false }) },
  'cantarola': { num: 10, nome: 'Cantarola', grupo: 'Feéricos', fam: 'A', tam: 0.14, voa: true, desc: 'Boca de flor-trombeta, asas de beija-flor; paira e dispara.',
    cats: { cores: pal({ lirio: { n: 'Lírio', pele: '#f2dcc8', roupa: '#e8e0f0', cab: '#e86aa0', asa: '#3ac8a0' }, sol: { n: 'Sol', pele: '#f2dcc8', roupa: '#f0c040', cab: '#e8702a', asa: '#2a8ad8' },
      noite: { n: 'Noite', pele: '#e0d8e8', roupa: '#4a3a7a', cab: '#9a5ae8', asa: '#2ad8c8' } }),
      cabelo: { n: 'Pétalas', o: [P_('petalas', 'Coroa de pétalas'), P_('curto', 'Cabelo curto')] } },
    base: { cores: 'lirio', cabelo: 'petalas' },
    receita: c => ({ torso: 'fada', head: { tipo: 'humano', cabelo: c.cabelo, boca: 'trombeta' }, asas: 'beija', flap: 14 }) },
  'pequena-geada': { num: 11, nome: 'Pequena-geada', grupo: 'Feéricos', fam: 'A', tam: 0.16, voa: true, desc: 'Asas de cristal de gelo, cabelo de agulhas; voo lento com rastro de neve.',
    cats: { cores: pal({ gelo: { n: 'Gelo', pele: '#e8f0f8', roupa: '#a8c8e8', cab: '#d8f0ff', asa: '#c8f0ff', brilho: '#a8e8ff' }, aurora: { n: 'Aurora', pele: '#e8f0f0', roupa: '#78c8b8', cab: '#c8fff0', asa: '#b8ffe8', brilho: '#80ffd0' },
      noite: { n: 'Noite polar', pele: '#d8e0f0', roupa: '#4a5a9a', cab: '#a8b8ff', asa: '#a8b8ff', brilho: '#8898ff' } }),
      cabelo: { n: 'Cabelo', o: [P_('agulhas', 'Agulhas'), P_('longo', 'Longo'), P_('coque', 'Coque')] }, mao: { n: 'Na mão', o: [P_('cristal', 'Cristal'), P_('varinha', 'Varinha'), P_('nada', 'Nada')] } },
    base: { cores: 'gelo', cabelo: 'agulhas', mao: 'cristal' },
    receita: c => ({ torso: 'fada', head: { tipo: 'humano', cabelo: c.cabelo }, asas: 'cristal', mao: c.mao, flap: 5 }) },
  'fada-teia': { num: 12, nome: 'Fada-teia', grupo: 'Feéricos', fam: 'A', tam: 0.12, voa: true, desc: '6 braços, asas de seda, fia teias; balança em fios.',
    cats: { cores: pal({ seda: { n: 'Seda', pele: '#ece4f0', roupa: '#3a3048', cab: '#e8e0f0', asa: '#f0eaff' }, sombra: { n: 'Sombra', pele: '#c8c0d8', roupa: '#1a1624', cab: '#6a5a8a', asa: '#c8b8e8' },
      ambar: { n: 'Âmbar', pele: '#f0e0c8', roupa: '#5a3a1a', cab: '#e8a040', asa: '#fff0d0' } }),
      cabelo: CAB_F, olhos: { n: 'Olhos', o: [P_('seis', 'Seis olhos'), P_('dois', 'Dois olhos')] } },
    base: { cores: 'seda', cabelo: 'longo', olhos: 'seis' },
    receita: c => ({ torso: 'fada', head: { tipo: 'humano', cabelo: c.cabelo, olhosExtra: c.olhos === 'seis' }, asas: 'libelula', bracos3: true, flap: 8 }) },
  // ------------------------------------------------------------ DIABRETES (família A)
  'diabrete-de-chamine': { num: 13, nome: 'Diabrete-de-chaminé', grupo: 'Diabretes', fam: 'A', tam: 0.35, voa: true, desc: 'Chifrinhos, cauda em flecha, asas de morcego pequenas; pula e plana.',
    cats: { cores: pal({ fuligem: { n: 'Fuligem', pele: '#5a4a52', olho: '#ffd040', asa: '#3a2a32' }, rubro: { n: 'Rubro', pele: '#b0403a', olho: '#ffe060', asa: '#6a2020' }, roxo: { n: 'Roxo', pele: '#6a4a8a', olho: '#a8ff60', asa: '#3a2a5a' }, verde: { n: 'Verde', pele: '#5a8a4a', olho: '#ffb040', asa: '#2a4a2a' } }),
      chifres: CHIFRE_D, orelhas: ORELHA_D, cauda: CAUDA_D, mao: ACC_D },
    base: { cores: 'fuligem', chifres: 'chifrinhos', orelhas: 'pontuda', cauda: 'flecha', mao: 'forquilha' },
    receita: c => ({ torso: 'redondo', head: { tipo: 'diabrete', chifres: c.chifres, orelhas: c.orelhas, boca: 'sorriso' }, asas: 'morcego', cauda: c.cauda, bracos: 'garra', pe: 'garra', mao: c.mao, flap: 6 }) },
  'brasinho': { num: 14, nome: 'Brasinho', grupo: 'Diabretes', fam: 'A', tam: 0.3, voa: false, desc: 'Corpo de carvão rachado com brasa, cabeça de chama; corre aos saltos.',
    cats: { cores: pal({ brasa: { n: 'Brasa', pele: '#2a2422', brilho: '#ff8a30', chama: '#ffc040' }, azul: { n: 'Chama azul', pele: '#22242a', brilho: '#40a8ff', chama: '#a0e0ff' }, verde: { n: 'Fogo verde', pele: '#222a24', brilho: '#50ff70', chama: '#c0ffa0' } }),
      chama: { n: 'Chama', o: [P_('alta', 'Alta'), P_('baixa', 'Baixa'), P_('tres', 'Três pontas')] }, mao: ACC_D },
    base: { cores: 'brasa', chama: 'alta', mao: 'nada' },
    receita: c => ({ torso: 'redondo', head: { tipo: 'chama', chama: c.chama }, extras: ['rachaduras'], bracos: 'garra', pe: 'garra', mao: c.mao }) },
  'roi-sapato': { num: 15, nome: 'Rói-sapato', grupo: 'Diabretes', fam: 'A', tam: 0.25, voa: false, desc: 'Dentões, orelhas de rato, mãos de 3 dedos; alterna 2 e 4 patas.',
    cats: { cores: pal({ cinza: { n: 'Cinza', pele: '#8a8480', olho: '#1a1612', asa: '#000' }, marrom: { n: 'Marrom', pele: '#8a6a4a', olho: '#1a1612' }, branco: { n: 'Branco', pele: '#e8e0d8', olho: '#c03030' }, preto: { n: 'Preto', pele: '#3a3432', olho: '#ffd040' } }),
      orelhas: { n: 'Orelhas', o: [P_('rato', 'Redondas'), P_('morcego', 'Grandes'), P_('pequena', 'Pequenas')] }, mao: { n: 'Na mão', o: [P_('sapato', 'Um sapato'), P_('queijo', 'Queijo'), P_('nada', 'Nada')] } },
    base: { cores: 'cinza', orelhas: 'rato', mao: 'sapato' },
    receita: c => ({ torso: 'redondo', head: { tipo: 'diabrete', orelhas: c.orelhas, chifres: 'nenhum', boca: 'dentes', bigode: true }, cauda: 'rato', bracos: 'garra', pe: 'garra', mao: c.mao }) },
  'gargula-de-bolso': { num: 16, nome: 'Gárgula-de-bolso', grupo: 'Diabretes', fam: 'A', tam: 0.4, voa: true, desc: 'Pele de pedra, asas pesadas, careta; voo desajeitado.',
    cats: { cores: pal({ granito: { n: 'Granito', pele: '#8a8682', olho: '#ffb040', asa: '#6a6662' }, ardosia: { n: 'Ardósia', pele: '#5a6068', olho: '#60e0ff', asa: '#40464e' }, arenito: { n: 'Arenito', pele: '#b89a72', olho: '#ff6040', asa: '#8a7452' }, musgo: { n: 'Musgosa', pele: '#7a8064', olho: '#e0ff60', asa: '#5a6048' } }),
      chifres: CHIFRE_D, cauda: CAUDA_D },
    base: { cores: 'granito', chifres: 'carneiro', cauda: 'flecha' },
    receita: c => ({ torso: 'redondo', pedra: true, head: { tipo: 'diabrete', chifres: c.chifres, orelhas: 'pontuda', boca: 'sorriso', testa: true }, asas: 'morcego', cauda: c.cauda, bracos: 'garra', pe: 'garra', flap: 4, k: { x: 1.1, y: 0.95 } }) },
  'tramelo': { num: 17, nome: 'Tramelo', grupo: 'Diabretes', fam: 'A', tam: 0.45, voa: false, desc: 'Língua comprida, olhos em hastes, barriga redonda; gingado.',
    cats: { cores: pal({ lodo: { n: 'Lodo', pele: '#7a9a4a', olho: '#f8f0d0', barriga: '#c8d890' }, ameixa: { n: 'Ameixa', pele: '#8a4a7a', olho: '#f8f0d0', barriga: '#d8a8c8' }, laranja: { n: 'Laranja', pele: '#d8803a', olho: '#f8f0d0', barriga: '#f0c890' } }),
      hastes: { n: 'Olhos', o: [P_('duas', 'Duas hastes'), P_('tres', 'Três hastes'), P_('uma', 'Uma haste')] }, cauda: CAUDA_D },
    base: { cores: 'lodo', hastes: 'duas', cauda: 'nenhuma' },
    receita: c => ({ torso: 'redondo', head: { tipo: 'hastes', hastes: c.hastes }, cauda: c.cauda, bracos: 'garra', pe: 'garra', barriga: true, k: { x: 1.15, y: 0.95 } }) },
  'diabrete-sombra': { num: 18, nome: 'Diabrete-sombra', grupo: 'Diabretes', fam: 'A', tam: 0.5, voa: true, desc: 'Sem pernas, braços longos, olhos brancos; desliza rente ao chão.',
    cats: { cores: pal({ breu: { n: 'Breu', pele: '#1a1820', olho: '#f8f8ff', fumaca: '#2a2830' }, roxo: { n: 'Roxo', pele: '#24182e', olho: '#e0a0ff', fumaca: '#3a2848' }, cinza: { n: 'Névoa', pele: '#3a3a42', olho: '#a0ffff', fumaca: '#5a5a62' } }),
      chifres: CHIFRE_D, orelhas: ORELHA_D },
    base: { cores: 'breu', chifres: 'longos', orelhas: 'pontuda' },
    receita: c => ({ torso: 'redondo', head: { tipo: 'diabrete', chifres: c.chifres, orelhas: c.orelhas, boca: 'sorriso', olhosBrilho: true }, pernas: 'fumaca', bracos: 'garra', bracoLongo: true, flap: 0, k: { x: 0.95, y: 1.05 } }) },
  'caretinha': { num: 19, nome: 'Caretinha', grupo: 'Diabretes', fam: 'A', tam: 0.2, voa: false, desc: 'Máscara no lugar do rosto, capa de folhas; corre e se esconde.',
    cats: { cores: pal({ bosque: { n: 'Bosque', pele: '#3a3028', mascara: '#f0e8d8', folha: '#4a7a3a' }, outono: { n: 'Outono', pele: '#3a2a22', mascara: '#f0e0c8', folha: '#b8602a' }, osso: { n: 'Osso', pele: '#22201e', mascara: '#e8e4dc', folha: '#6a6a4a' } }),
      mascara: { n: 'Máscara', o: [P_('sorriso', 'Sorriso'), P_('choro', 'Choro'), P_('susto', 'Susto')] }, chifres: CHIFRE_D },
    base: { cores: 'bosque', mascara: 'sorriso', chifres: 'nenhum' },
    receita: c => ({ torso: 'redondo', head: { tipo: 'mascara', mascara: c.mascara, chifres: c.chifres }, extras: ['capa-folhas'], bracos: 'garra', pe: 'garra' }) },
  'fuliguento': { num: 20, nome: 'Fuliguento', grupo: 'Diabretes', fam: 'A', tam: 0.3, voa: false, desc: 'Bola de fuligem com perninhas finas; rola e quica.',
    cats: { cores: pal({ fuligem: { n: 'Fuligem', pele: '#26221f', olho: '#f8f8f0' }, cinza: { n: 'Cinza', pele: '#5a5652', olho: '#fff0a0' }, carvao: { n: 'Brasa por dentro', pele: '#2a1e1a', olho: '#ff9040' } }),
      pelo: { n: 'Pelo', o: [P_('espetado', 'Espetado'), P_('liso', 'Liso')] }, olhos: { n: 'Olhos', o: [P_('dois', 'Dois'), P_('um', 'Um só'), P_('tres', 'Três')] } },
    base: { cores: 'fuligem', pelo: 'espetado', olhos: 'dois' },
    receita: c => ({ torso: 'bola', head: { tipo: 'nenhuma', olhosBola: c.olhos }, pelo: c.pelo, bracos: 'fino', pe: 'garra' }) },
  'diabrete-sino': { num: 21, nome: 'Diabrete-sino', grupo: 'Diabretes', fam: 'A', tam: 0.35, voa: false, desc: 'Chapéu de sino, cauda em mola; pula como mola.',
    cats: { cores: pal({ bronze: { n: 'Bronze', pele: '#c86a4a', olho: '#ffe060', sino: '#d8a040' }, prata: { n: 'Prata', pele: '#5a7ac8', olho: '#fff0a0', sino: '#c8d0d8' }, ouro: { n: 'Ouro', pele: '#4a9a6a', olho: '#ffd040', sino: '#f0c030' } }),
      orelhas: ORELHA_D, mao: ACC_D },
    base: { cores: 'bronze', orelhas: 'pontuda', mao: 'nada' },
    receita: c => ({ torso: 'redondo', head: { tipo: 'diabrete', orelhas: c.orelhas, chifres: 'nenhum', boca: 'sorriso', sino: true }, cauda: 'mola', bracos: 'garra', pe: 'garra', mao: c.mao }) },
  'espinho-risonho': { num: 22, nome: 'Espinho-risonho', grupo: 'Diabretes', fam: 'A', tam: 0.4, voa: false, desc: 'Costas de ouriço, boca larga; enrola-se e rola.',
    cats: { cores: pal({ castanho: { n: 'Castanho', pele: '#a07a5a', olho: '#1a1612', espinho: '#4a3422' }, cinza: { n: 'Cinza', pele: '#a8a098', olho: '#1a1612', espinho: '#5a5450' }, verde: { n: 'Cacto', pele: '#8aa86a', olho: '#1a1612', espinho: '#e8e0b0' } }),
      espinhos: { n: 'Espinhos', o: [P_('curtos', 'Curtos'), P_('longos', 'Longos')] }, orelhas: ORELHA_D },
    base: { cores: 'castanho', espinhos: 'curtos', orelhas: 'pequena' },
    receita: c => ({ torso: 'redondo', head: { tipo: 'diabrete', orelhas: c.orelhas, chifres: 'nenhum', boca: 'largo' }, extras: ['espinhos-' + c.espinhos], bracos: 'garra', pe: 'garra' }) },
  'mastiga-lume': { num: 23, nome: 'Mastiga-lume', grupo: 'Diabretes', fam: 'A', tam: 0.45, voa: true, desc: 'Boca de lanterna que brilha por dentro, asas de mariposa; voo curto.',
    cats: { cores: pal({ musgo: { n: 'Musgo', pele: '#4a5a3a', olho: '#ffe080', asa: '#8a8060', brilho: '#ffd060' }, noite: { n: 'Noite', pele: '#2a2a3a', olho: '#a0e0ff', asa: '#5a5a7a', brilho: '#80d0ff' }, cinza: { n: 'Cinza', pele: '#5a5452', olho: '#ffa060', asa: '#9a9088', brilho: '#ff9040' } }),
      antenas: { n: 'Antenas', o: [P_('pluma', 'Plumas'), P_('nao', 'Nenhuma')] } },
    base: { cores: 'musgo', antenas: 'pluma' },
    receita: c => ({ torso: 'redondo', head: { tipo: 'diabrete', orelhas: 'pequena', chifres: 'nenhum', boca: 'lanterna' }, asas: 'mariposa', antenas: c.antenas === 'pluma' ? 'pluma' : false, bracos: 'garra', pe: 'garra', flap: 5 }) },
  'diabrete-gemeo': { num: 24, nome: 'Diabrete-gêmeo', grupo: 'Diabretes', fam: 'A', tam: 0.5, voa: false, desc: 'Duas cabeças, cada uma manda num braço; anda trôpego.',
    cats: { cores: pal({ rubro: { n: 'Rubro', pele: '#b0403a', olho: '#ffe060' }, azul: { n: 'Azul', pele: '#4a6ab0', olho: '#ffd040' }, verde: { n: 'Verde', pele: '#5a8a4a', olho: '#ffb040' } }),
      chifres: CHIFRE_D, cauda: CAUDA_D, mao: ACC_D },
    base: { cores: 'rubro', chifres: 'chifrinhos', cauda: 'flecha', mao: 'forquilha' },
    receita: c => ({ torso: 'redondo', head: { tipo: 'duas', chifres: c.chifres, orelhas: 'pontuda', boca: 'sorriso' }, cauda: c.cauda, bracos: 'garra', pe: 'garra', mao: c.mao, k: { x: 1.2, y: 1 } }) },
  // ------------------------------------------------------------ URSOS ALADOS (família A, pesados)
  'ursalado': { num: 25, nome: 'Ursalado', grupo: 'Híbridos alados', fam: 'A', tam: 2.2, voa: true, desc: 'Urso com asas de coruja, penas no peito; anda, ergue-se e plana.',
    cats: { cores: pal({ pardo: { n: 'Pardo', pele: '#7a5236', claro: '#b08a62', asa: '#8a6a4a', asa2: '#d8c8a8' }, negro: { n: 'Negro', pele: '#2e2824', claro: '#6a5a4a', asa: '#3a3430', asa2: '#8a8070' },
      canela: { n: 'Canela', pele: '#a8683a', claro: '#e0b080', asa: '#b88050', asa2: '#f0e0c0' }, cinza: { n: 'Cinzento', pele: '#7a7672', claro: '#b8b2aa', asa: '#8a8680', asa2: '#e0dcd4' } }),
      asas: { n: 'Asas', o: [P_('coruja', 'De coruja'), P_('morcego', 'De morcego'), P_('mariposa', 'De mariposa')] }, peito: { n: 'Peito', o: [P_('penas', 'Penas'), P_('liso', 'Liso')] } },
    base: { cores: 'pardo', asas: 'coruja', peito: 'penas' },
    receita: c => ({ torso: 'urso', head: { tipo: 'urso' }, asas: c.asas, extras: c.peito === 'penas' ? ['penas-peito'] : [], bracos: 'grosso', pe: 'pata', cauda: 'urso', flap: 1.6, pesado: true, k: { x: 1.25, y: 1 } }) },
  'ursinho-mariposa': { num: 26, nome: 'Ursinho-mariposa', grupo: 'Híbridos alados', fam: 'A', tam: 1.0, voa: true, desc: 'Urso fofo com asas e antenas de mariposa; voo pesado e lento.',
    cats: { cores: pal({ creme: { n: 'Creme', pele: '#e0c8a0', claro: '#f8ecd8', asa: '#c8b8e0', asa2: '#8a78b0' }, mel: { n: 'Mel', pele: '#c8903a', claro: '#f0d090', asa: '#f0d8a0', asa2: '#a8783a' },
      lua: { n: 'Lua', pele: '#c8ccd8', claro: '#f0f2f8', asa: '#a8e0c8', asa2: '#5a9a88' }, rosa: { n: 'Rosa', pele: '#d8a8b0', claro: '#f8e0e4', asa: '#f8c8e0', asa2: '#c87898' } }),
      asas: { n: 'Asas', o: [P_('mariposa', 'Mariposa'), P_('borboleta', 'Borboleta')] }, antenas: { n: 'Antenas', o: [P_('pluma', 'Plumas'), P_('sim', 'Finas')] } },
    base: { cores: 'creme', asas: 'mariposa', antenas: 'pluma' },
    receita: c => ({ torso: 'urso', head: { tipo: 'urso' }, asas: c.asas, antenas: c.antenas, bracos: 'grosso', pe: 'pata', cauda: 'urso', flap: 2.4, pesado: true, k: { x: 1.15, y: 0.95 } }) },
  'coruja-urso-polar': { num: 36, nome: 'Coruja-urso-polar', grupo: 'Híbridos alados', fam: 'A', tam: 2.6, voa: true, desc: 'Corpo de urso, cabeça de coruja, asas brancas; gira a cabeça.',
    cats: { cores: pal({ neve: { n: 'Neve', pele: '#ece8e2', claro: '#ffffff', asa: '#e0dcd6', asa2: '#9a968e', bico: '#e8b040' }, tundra: { n: 'Tundra', pele: '#c8bca8', claro: '#ece4d4', asa: '#b8ac98', asa2: '#6a5e4a', bico: '#d89a30' },
      gelo: { n: 'Gelo', pele: '#dce4ec', claro: '#ffffff', asa: '#c8d4e0', asa2: '#7a8898', bico: '#a8b8c8' } }),
      tufos: { n: 'Tufos', o: [P_('sim', 'Com tufos'), P_('nao', 'Sem tufos')] } },
    base: { cores: 'neve', tufos: 'sim' },
    receita: c => ({ torso: 'urso', head: { tipo: 'coruja', tufos: c.tufos === 'sim' }, asas: 'coruja', extras: ['penas-peito'], bracos: 'grosso', pe: 'pata', cauda: 'urso', flap: 1.4, pesado: true, k: { x: 1.3, y: 1.05 } }) },
  // ------------------------------------------------------------ FLUTUANTES (família B)
  'lumibrim': { num: 8, nome: 'Lumibrim', grupo: 'Feéricos', fam: 'B', tam: 0.1, desc: 'Esfera de luz com 6 asinhas em anel; gira e paira.',
    cats: { cores: pal({ ouro: { n: 'Ouro', brilho: '#ffe070', asa: '#fff4c0' }, menta: { n: 'Menta', brilho: '#70ffc0', asa: '#d0fff0' }, rosa: { n: 'Rosa', brilho: '#ff90c8', asa: '#ffd8ec' }, azul: { n: 'Azul', brilho: '#70c8ff', asa: '#d0ecff' } }),
      asas: { n: 'Asinhas', o: [P_('seis', 'Seis'), P_('quatro', 'Quatro'), P_('oito', 'Oito')] } },
    base: { cores: 'ouro', asas: 'seis' } },
  'fogo-fatuo': { num: 103, nome: 'Fogo-fátuo', grupo: 'Elementais', fam: 'B', tam: 0.2, desc: 'Chama azul com rosto; deriva.',
    cats: { cores: pal({ azul: { n: 'Azul', brilho: '#60b8ff', claro: '#c8ecff' }, verde: { n: 'Verde', brilho: '#60ff90', claro: '#d0ffe0' }, violeta: { n: 'Violeta', brilho: '#b070ff', claro: '#ecd8ff' }, ambar: { n: 'Âmbar', brilho: '#ffa040', claro: '#fff0c0' } }),
      rosto: { n: 'Rosto', o: [P_('feliz', 'Feliz'), P_('travesso', 'Travesso'), P_('sono', 'Sonolento')] }, pontas: { n: 'Pontas', o: [P_('uma', 'Uma'), P_('tres', 'Três')] } },
    base: { cores: 'azul', rosto: 'feliz', pontas: 'uma' } },
  'espirito-de-vapor': { num: 105, nome: 'Espírito-de-vapor', grupo: 'Elementais', fam: 'B', tam: 1.2, desc: 'Chaleira na cabeça, corpo de vapor; flutua.',
    cats: { cores: pal({ cobre: { n: 'Cobre', metal: '#c8743a', vapor: '#f0f0f0' }, ferro: { n: 'Ferro', metal: '#5a5e66', vapor: '#e0e4ea' }, esmalte: { n: 'Esmalte azul', metal: '#3a6ab0', vapor: '#f4f4f8' }, latao: { n: 'Latão', metal: '#d0a840', vapor: '#fff8e8' } }),
      cabeca: { n: 'Cabeça', o: [P_('chaleira', 'Chaleira'), P_('bule', 'Bule')] } },
    base: { cores: 'cobre', cabeca: 'chaleira' } },
  'nuvenzinha-chuvosa': { num: 108, nome: 'Nuvenzinha-chuvosa', grupo: 'Elementais', fam: 'B', tam: 0.5, desc: 'Chove debaixo dela; flutua.',
    cats: { cores: pal({ chuva: { n: 'Chuva', nuvem: '#e8ecf2', gota: '#6ab0e8' }, tempestade: { n: 'Tempestade', nuvem: '#7a808a', gota: '#a0c8ff' }, poente: { n: 'Poente', nuvem: '#f8d8c8', gota: '#f0a080' } }),
      clima: { n: 'Debaixo', o: [P_('chuva', 'Chuva'), P_('raio', 'Raio'), P_('neve', 'Neve')] }, rosto: { n: 'Rosto', o: [P_('feliz', 'Feliz'), P_('triste', 'Triste'), P_('bravo', 'Bravo')] } },
    base: { cores: 'chuva', clima: 'chuva', rosto: 'feliz' } },
  'fantasminha-lencol': { num: 113, nome: 'Fantasminha-lençol', grupo: 'Espectrais', fam: 'B', tam: 0.6, desc: 'Lençol com buracos; flutua.',
    cats: { cores: pal({ branco: { n: 'Branco', pano: '#f0eee8' }, xadrez: { n: 'Creme', pano: '#ece2c8' }, azul: { n: 'Azulado', pano: '#d8e4f0' }, cinza: { n: 'Velho', pano: '#b8b4ac' } }),
      chapeu: { n: 'Chapéu', o: [P_('nada', 'Nada'), P_('bruxa', 'De bruxa'), P_('cartola', 'Cartola')] }, olhos: { n: 'Olhos', o: [P_('buracos', 'Buracos'), P_('brilho', 'Brilho'), P_('x', 'Remendos')] } },
    base: { cores: 'branco', chapeu: 'nada', olhos: 'buracos' } },
  'lanterna-assombrada': { num: 114, nome: 'Lanterna-assombrada', grupo: 'Espectrais', fam: 'B', tam: 0.4, desc: 'Lanterna com uma alma dentro; balança no ar.',
    cats: { cores: pal({ ferro: { n: 'Ferro', metal: '#4a4e56', brilho: '#ffb040' }, bronze: { n: 'Bronze', metal: '#a86a3a', brilho: '#ffe070' }, espectral: { n: 'Espectral', metal: '#3a4a5a', brilho: '#70ffd0' } }),
      forma: { n: 'Forma', o: [P_('quadrada', 'Quadrada'), P_('redonda', 'Redonda')] } },
    base: { cores: 'ferro', forma: 'quadrada' } },
  'carpideira-veu': { num: 117, nome: 'Carpideira-véu', grupo: 'Espectrais', fam: 'B', tam: 1.7, desc: 'Véu longo, boca aberta; desliza.',
    cats: { cores: pal({ noite: { n: 'Noite', veu: '#3a3a52', pele: '#d8dce8', brilho: '#a0c0ff' }, cinza: { n: 'Cinza', veu: '#6a6a72', pele: '#e8e8ec', brilho: '#f0f0ff' }, roxo: { n: 'Roxo', veu: '#4a2a5a', pele: '#e0d0e8', brilho: '#e0a0ff' } }),
      boca: { n: 'Boca', o: [P_('grito', 'Grito'), P_('fechada', 'Fechada')] } },
    base: { cores: 'noite', boca: 'grito' } },
  'olho-flutuante': { num: 118, nome: 'Olho-flutuante', grupo: 'Espectrais', fam: 'B', tam: 0.5, desc: 'Um olho, cílios que viram tentáculos; paira.',
    cats: { cores: pal({ ambar: { n: 'Âmbar', iris: '#e8a030', pele: '#e8dcd0', tent: '#8a5a6a' }, verde: { n: 'Verde', iris: '#5ab040', pele: '#e8e4d8', tent: '#4a6a4a' }, roxo: { n: 'Roxo', iris: '#9a50e0', pele: '#ece0e8', tent: '#5a3a6a' }, gelo: { n: 'Gelo', iris: '#50c8f0', pele: '#e8eef4', tent: '#4a5a7a' } }),
      tentaculos: { n: 'Tentáculos', o: [P_('quatro', 'Quatro'), P_('seis', 'Seis'), P_('dois', 'Dois')] } },
    base: { cores: 'ambar', tentaculos: 'quatro' } },
  'relogio-fantasma': { num: 122, nome: 'Relógio-fantasma', grupo: 'Espectrais', fam: 'B', tam: 1.2, desc: 'Relógio de pêndulo com braços; flutua no ritmo do tique-taque.',
    cats: { cores: pal({ nogueira: { n: 'Nogueira', madeira: '#6a4226', metal: '#d0a840', brilho: '#a0e0ff' }, ebano: { n: 'Ébano', madeira: '#2a2220', metal: '#c8ccd2', brilho: '#c0a0ff' }, cerejeira: { n: 'Cerejeira', madeira: '#8a3a2a', metal: '#d8b860', brilho: '#a0ffc0' } }),
      topo: { n: 'Topo', o: [P_('coroa', 'Coroa'), P_('reto', 'Reto')] } },
    base: { cores: 'nogueira', topo: 'coroa' } },
  'mascara-errante': { num: 123, nome: 'Máscara-errante', grupo: 'Espectrais', fam: 'B', tam: 0.3, desc: 'Máscara com fitas; gira.',
    cats: { cores: pal({ teatro: { n: 'Teatro', mascara: '#f0e8d8', fita: '#c83a3a', brilho: '#ffd070' }, festa: { n: 'Festa', mascara: '#e8c040', fita: '#3a8ac8', brilho: '#ff90d0' }, luto: { n: 'Luto', mascara: '#2a2628', fita: '#6a6a72', brilho: '#a0ffff' } }),
      expressao: { n: 'Expressão', o: [P_('sorriso', 'Sorriso'), P_('choro', 'Choro'), P_('neutra', 'Neutra')] } },
    base: { cores: 'teatro', expressao: 'sorriso' } },
  'cranio-de-velas': { num: 124, nome: 'Crânio-de-velas', grupo: 'Espectrais', fam: 'B', tam: 0.3, desc: 'Crânio com velas acesas; flutua.',
    cats: { cores: pal({ osso: { n: 'Osso', osso: '#e8e0cc', vela: '#f0ead8', brilho: '#ffb040' }, velho: { n: 'Velho', osso: '#c8b898', vela: '#d8c8a8', brilho: '#ff8030' }, espectral: { n: 'Espectral', osso: '#d8e0e4', vela: '#c8e0e8', brilho: '#60e0ff' } }),
      velas: { n: 'Velas', o: [P_('tres', 'Três'), P_('uma', 'Uma'), P_('cinco', 'Cinco')] } },
    base: { cores: 'osso', velas: 'tres' } },
  'bolha-sabia': { num: 142, nome: 'Bolha-sábia', grupo: 'Estranhos', fam: 'B', tam: 0.5, desc: 'Bolha de sabão com rosto; flutua e estoura.',
    cats: { cores: pal({ arco: { n: 'Arco-íris', bolha: '#c8e8ff', brilho: '#ffe0f0' }, menta: { n: 'Menta', bolha: '#c8ffe8', brilho: '#e0fff0' }, ambar: { n: 'Âmbar', bolha: '#ffe8c0', brilho: '#fff4d8' } }),
      oculos: { n: 'Óculos', o: [P_('sim', 'Óculos de sábio'), P_('nao', 'Sem óculos')] } },
    base: { cores: 'arco', oculos: 'sim' } },
};
export const ESP_ORDEM = Object.keys(ESPECIES).sort((a, b) => ESPECIES[a].num - ESPECIES[b].num);
export const GRUPOS = [...new Set(ESP_ORDEM.map(k => ESPECIES[k].grupo))];
export function catsOfEsp(id) { const S = ESPECIES[id]; return [{ k: 'tamanho', ...TAM }, ...Object.entries(S.cats).map(([k, v]) => ({ k, n: v.n, o: v.o }))]; }
export const baseCfgEsp = id => ({ tamanho: 'm', ...ESPECIES[id].base });
export const cfgKeyEsp = (id, c) => id + ':' + catsOfEsp(id).map(x => c[x.k]).join('.');
export function randomCfgEsp(id, r) { const c = {}; for (const x of catsOfEsp(id)) c[x.k] = x.o[Math.floor(r() * x.o.length)][0]; return c; }
const NOMES = ['Pim', 'Lua', 'Tico', 'Brisa', 'Nix', 'Zuza', 'Orvo', 'Fagu', 'Miro', 'Tula', 'Quim', 'Bela', 'Rufo', 'Sabi', 'Gaia', 'Teco', 'Vina', 'Dudu', 'Luz', 'Pipo'];
export function nomeVariacao(id, c) { const r = rng(hashStr(cfgKeyEsp(id, c))); return NOMES[Math.floor(r() * NOMES.length)] + ' ' + Math.floor(r() * 90 + 10); }
export const combinacoesEsp = id => catsOfEsp(id).reduce((m, c) => m * c.o.length, 1);

// ======================================================================= IK (pernas dos que andam)
const _X = V3(1, 0, 0), _Y = V3(0, 1, 0);
function ik(b1, b2, b3, target, pole, l1, l2, qEnd) {
  const P = new THREE.Vector3().setFromMatrixPosition(b1.matrixWorld);
  const v = target.clone().sub(P); const d0 = v.length(); const vh = v.divideScalar(d0 || 1);
  const d = clamp(d0, Math.abs(l1 - l2) + 1e-3, (l1 + l2) * 0.9995);
  const a = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const bend = Math.PI - Math.acos(clamp((l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2), -1, 1));
  const p = pole.clone().addScaledVector(vh, -pole.dot(vh)); if (p.lengthSq() < 1e-8) p.set(0, 0, 1); p.normalize();
  const dir1 = vh.clone().multiplyScalar(Math.cos(a)).addScaledVector(p, Math.sin(a));
  const n = new THREE.Vector3().crossVectors(vh, p).normalize();
  const xA = n.clone().negate(), yA = dir1.clone().negate(), zA = new THREE.Vector3().crossVectors(xA, yA);
  const qW = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xA, yA, zA));
  b1.quaternion.copy(b1.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(qW));
  const qB = new THREE.Quaternion().setFromAxisAngle(_X, bend);
  b2.quaternion.copy(qB);
  b3.quaternion.copy(qW.clone().multiply(qB).invert().multiply(qEnd));
}

// ======================================================================= montagem comum
function makeKit(Mv) {
  const PARTS = [[], [], [], []]; let partN = 0, BI = {};
  function add(g, o) {
    if (o.pre) o.pre(g);                                      // deformação no espaço da própria peça (antes de posicionar)
    g.applyMatrix4(new THREE.Matrix4().compose(V3(...(o.pos || [0, 0, 0])),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...(o.rot || [0, 0, 0]).map(d => d * D2R), 'XYZ')), V3(...(o.scl || [1, 1, 1]))));
    if (o.deform) o.deform(g);
    const pa = g.attributes.position, jit = o.jit ?? 0.004;
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
      for (let j = 0; j < 3; j++) { const i = (f * 3 + j) * 3; col[i] = base.r * k; col[i + 1] = base.g * k; col[i + 2] = base.b * k; }
    }
    const tmp = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      tmp.fromBufferAttribute(p, i);
      let ws = typeof o.b === 'string' ? [[o.b, 1]] : o.b(tmp);
      ws = ws.filter(w => w[1] > 1e-4 && BI[w[0]] !== undefined).sort((a, b) => b[1] - a[1]).slice(0, 4);
      if (!ws.length) ws = [[Object.keys(BI)[0], 1]];
      const tot = ws.reduce((s, w) => s + w[1], 0);
      ws.forEach((w, j) => { si[i * 4 + j] = BI[w[0]]; sw[i * 4 + j] = w[1] / tot; });
    }
    for (let i = 0; i < n; i++) {                           // corpo: escala da espécie; peça com âncora: escala própria em volta da âncora
      tmp.fromBufferAttribute(p, i);
      if (o.anc) { const a = o.anc[0], s = o.anc[1], A = Mv(a); p.setXYZ(i, A.x + (tmp.x - a.x) * s, A.y + (tmp.y - a.y) * s, A.z + (tmp.z - a.z) * s); }
      else { const q = Mv(tmp); p.setXYZ(i, q.x, q.y, q.z); }
    }
    ng.computeVertexNormals();
    ng.setAttribute('color', new THREE.BufferAttribute(col, 3));
    ng.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
    ng.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
    PARTS[o.mat ?? (o.glow ? 2 : o.metal ? 1 : 0)].push(ng);
  }
  const G = {
    cyl: (rt, rb, h, seg, open = false) => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open),
    sph: (r, ws, hs, ts = 0, tl = Math.PI, ps = 0, pl = Math.PI * 2) => new THREE.SphereGeometry(r, ws, hs, ps, pl, ts, tl),
    box: (w, h, d, hs = 1) => new THREE.BoxGeometry(w, h, d, 1, hs, 1),
    ico: (r, det = 0) => new THREE.IcosahedronGeometry(r, det),
    octa: r => new THREE.OctahedronGeometry(r, 0),
    cone: (r, h, seg) => new THREE.ConeGeometry(r, h, seg),
    tube(a, b, ra, rb, seg) { a = V3(...a); b = V3(...b); const d = b.clone().sub(a), g = new THREE.CylinderGeometry(rb, ra, d.length(), seg, 1);
      g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(_Y, d.clone().normalize())); g.translate(...a.clone().addScaledVector(d, 0.5).toArray()); return g; },
    flat(pts) { const sh = new THREE.Shape(); sh.moveTo(...pts[0]); for (const q of pts.slice(1)) sh.lineTo(...q); sh.closePath(); return new THREE.ShapeGeometry(sh); },
    slab(pts, depth) { const sh = new THREE.Shape(); sh.moveTo(...pts[0]); for (const q of pts.slice(1)) sh.lineTo(...q); sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false }); g.translate(0, 0, -depth / 2); return g; },
  };
  return { add, G, PARTS, setBI: b => { BI = b; } };
}
function chainW(ch) {
  const P = ch.pts.map(a => V3(...a));
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
function buildSkeleton(bdef, chains, mapPos) {
  for (const ch of chains) {
    ch.names.forEach((nm, i) => bdef.push([nm, i ? ch.names[i - 1] : ch.parent, ch.pts[i], ch.head]));
    bdef.push([ch.end, ch.names[ch.names.length - 1], ch.pts[ch.pts.length - 1], ch.head]);
  }
  const B = {}, REST = {}, BI = {}, bones = [], PARENT = {};
  for (const [n, p, pos, kind] of bdef) {
    const b = new THREE.Bone(); b.name = n; REST[n] = mapPos(V3(...pos), kind); PARENT[n] = p;
    if (p) { B[p].add(b); b.position.copy(REST[n]).sub(REST[p]); } else b.position.copy(REST[n]);
    B[n] = b; BI[n] = bones.length; bones.push(b);
  }
  return { B, REST, BI, bones, PARENT };
}
function finish(kit, skel, chains, name, clipdefs, applyPose, extra) {
  const { B, REST, bones, PARENT } = skel;
  const groups = kit.PARTS.map(a => a.length ? mergeGeometries(a) : null);
  const used = groups.map((g, i) => g ? i : -1).filter(i => i >= 0);
  const geo = mergeGeometries(used.map(i => groups[i]), true);
  const mesh = new THREE.SkinnedMesh(geo, used.map(i => CMATS[i]));
  mesh.name = name; mesh.castShadow = true; mesh.frustumCulled = false;
  const root = new THREE.Group(); root.name = name + '_raiz'; root.add(bones[0]); root.add(mesh);
  root.updateMatrixWorld(true); mesh.bind(new THREE.Skeleton(bones));
  const endNames = new Set(chains.map(c => c.end));
  const TRACKED = bones.filter(b => !endNames.has(b.name)), clips = [];
  for (const cd of clipdefs) {
    const N = Math.max(2, Math.round(cd.dur * cd.fps)), times = [], qa = TRACKED.map(() => []), pos = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N * cd.dur; applyPose(cd.fn(Math.min(t, cd.dur - 1e-6)));
      times.push(t); TRACKED.forEach((b, j) => qa[j].push(...b.quaternion.toArray())); pos.push(...bones[0].position.toArray());
    }
    const tracks = TRACKED.map((b, j) => new THREE.QuaternionKeyframeTrack(b.name + '.quaternion', times, qa[j]));
    tracks.push(new THREE.VectorKeyframeTrack(bones[0].name + '.position', times, pos));
    clips.push(new THREE.AnimationClip(cd.name, cd.dur, tracks));
  }
  const restPose = () => { for (const b of bones) { b.quaternion.identity(); const p = PARENT[b.name]; b.position.copy(REST[b.name]).sub(p ? REST[p] : V3(0, 0, 0)); } root.updateMatrixWorld(true); };
  restPose();
  const springs = [];
  for (const ch of chains) ch.names.forEach((nm, i) => springs.push({ b: B[nm], c: B[i < ch.names.length - 1 ? ch.names[i + 1] : ch.end], ...ch.spring[i], max: ch.spring[i].max * D2R }));
  const box = new THREE.Box3().setFromBufferAttribute(geo.attributes.position);
  return { root, mesh, geo, bones, B, REST, PARENT, clips, springs, restPose, tris: geo.attributes.position.count / 3, nominalH: box.max.y - Math.min(0, box.min.y),
    info: { ossos: TRACKED.length, molas: chains.map(c => c.label || c.name) }, ...extra };
}

// ======================================================================= FAMÍLIA A — bípede pequeno (asas opcionais)
function forgeA(id, S, cfg) {
  const R = { torso: 'fada', head: { tipo: 'humano' }, asas: null, pernas: 'pernas', pe: 'sapato', bracos: 'fino', cauda: null, antenas: false, extras: [], mao: 'nada', saia: true, flap: 8, k: { x: 1, y: 1 }, ...S.receita(cfg) };
  const COL = S.cats.cores.cor[cfg.cores];
  const C = { pele: COL.pele || COL.agua || '#e0c8b0', roupa: COL.roupa || hex(COL.pele || '#a08070', 0.8), cab: COL.cab || COL.barba || '#6a4a2a', asa: COL.asa || '#c8d8e8',
    brilho: COL.brilho || '#ffe070', olho: COL.olho || '#1b1712', claro: COL.claro || hex(COL.pele || '#c0a080', 1.25), asa2: COL.asa2 || hex(COL.asa || '#c8d8e8', 0.6), ...COL };
  C.peleD = hex(C.pele, 0.78); C.peleL = hex(C.pele, 1.15); C.roupaD = hex(C.roupa, 0.75); C.cabD = hex(C.cab, 0.8);
  const urso = R.torso === 'urso', red = R.torso === 'redondo' || R.torso === 'agua' && false, bola = R.torso === 'bola';
  const AX = { fada: 0.13, agua: 0.13, redondo: 0.17, urso: 0.23, bola: 0.25 }[R.torso], LX = { fada: 0.055, agua: 0.055, redondo: 0.08, urso: 0.11, bola: 0.1 }[R.torso];
  const kx = R.k.x, ky = R.k.y, kz = 1 + (kx - 1) * 0.6;
  const Mv = v => V3(v.x * kx, v.y * ky, v.z * kz);
  const HEAD0 = V3(0, 0.78, 0), hs = urso ? 1.0 : 1;
  const kit = makeKit(Mv), { add, G } = kit;
  const HA = [HEAD0, hs], HD = { anc: HA };
  const legless = R.pernas === 'fumaca';

  // ---------- correntes
  const chains = [];
  if (R.cauda === 'flecha' || R.cauda === 'rato' || R.cauda === 'mola') {
    const pts = R.cauda === 'rato' ? [[0, 0.40, -0.09], [0, 0.30, -0.25], [0, 0.16, -0.38], [0, 0.06, -0.52]] : [[0, 0.40, -0.10], [0, 0.32, -0.22], [0, 0.26, -0.34], [0, 0.30, -0.46]];
    chains.push({ name: 'Tail', label: 'cauda', parent: 'Hips', pts, names: ['Tail1', 'Tail2', 'Tail3'], end: 'TailEnd', spring: [{ k: 60, d: 6, g: 0.3, max: 25 }, { k: 45, d: 5, g: 0.3, max: 35 }, { k: 35, d: 4, g: 0.3, max: 45 }] });
  }
  if (legless) chains.push({ name: 'Fumaca', label: 'fumaça', parent: 'Hips', pts: [[0, 0.40, 0], [0, 0.27, -0.04], [0, 0.15, -0.1], [0, 0.04, -0.18]], names: ['Fumaca1', 'Fumaca2', 'Fumaca3'], end: 'FumacaEnd',
    spring: [{ k: 50, d: 5, g: 0.2, max: 30 }, { k: 38, d: 4, g: 0.2, max: 40 }, { k: 28, d: 3.5, g: 0.2, max: 50 }] });
  if (R.antenas) for (const [s, L] of [[1, '_L'], [-1, '_R']]) chains.push({ name: 'Ant' + L, label: 'antenas', parent: 'Head', head: 'h', pts: [[s * 0.05, 1.05, 0.03], [s * 0.09, 1.15, 0.06], [s * 0.12, 1.23, 0.05]],
    names: ['Ant1' + L, 'Ant2' + L], end: 'AntEnd' + L, spring: [{ k: 90, d: 6, g: 0.2, max: 30 }, { k: 70, d: 5, g: 0.2, max: 40 }] });
  if (R.head.cabelo === 'longo' || (R.head.tipo === 'gota' && R.head.cabelo === 'cascata')) chains.push({ name: 'Hair', label: 'cabelo', parent: 'Head', head: 'h', pts: [[0, 0.95, -0.15], [0, 0.82, -0.18], [0, 0.66, -0.17]],
    names: ['Hair1', 'Hair2'], end: 'HairEnd', spring: [{ k: 60, d: 6, g: 0.4, max: 30 }, { k: 45, d: 5, g: 0.4, max: 40 }] });
  if (R.head.tipo === 'hastes') { const n = { uma: [0], duas: [-1, 1], tres: [-1, 0, 1] }[R.head.hastes];
    n.forEach((s, i) => chains.push({ name: 'Olho' + i, label: 'olhos em haste', parent: 'Head', head: 'h', pts: [[s * 0.06, 0.98, 0.04], [s * 0.1, 1.1, 0.06], [s * 0.12, 1.2, 0.07]], names: ['Olho' + i + 'a', 'Olho' + i + 'b'], end: 'Olho' + i + 'End',
      spring: [{ k: 80, d: 5, g: 0.3, max: 30 }, { k: 60, d: 4, g: 0.3, max: 40 }] })); }

  // ---------- esqueleto
  const bdef = [['Hips', null, [0, 0.40, 0]], ['Spine', 'Hips', [0, 0.50, 0]], ['Chest', 'Spine', [0, 0.62, 0]], ['Neck', 'Chest', [0, 0.74, 0]], ['Head', 'Neck', [0, 0.78, 0], 'h']];
  if (R.head.tipo === 'duas') { bdef[4] = ['Head', 'Neck', [0.1, 0.78, 0], 'h']; bdef.push(['Head2', 'Neck', [-0.1, 0.78, 0], 'h']); }
  for (const [s, L] of [[1, '_L'], [-1, '_R']]) {
    bdef.push(['UpperArm' + L, 'Chest', [s * AX, 0.71, 0]], ['ForeArm' + L, 'UpperArm' + L, [s * AX, 0.57, 0]], ['Hand' + L, 'ForeArm' + L, [s * AX, 0.45, 0]],
      ['UpLeg' + L, 'Hips', [s * LX, 0.38, 0]], ['Leg' + L, 'UpLeg' + L, [s * LX, 0.22, 0]], ['Foot' + L, 'Leg' + L, [s * LX, 0.07, 0]]);
    if (R.bracos3) bdef.push(['UpperArm2' + L, 'Chest', [s * AX * 0.9, 0.64, 0.02]], ['ForeArm2' + L, 'UpperArm2' + L, [s * AX * 0.9, 0.52, 0.02]],
      ['UpperArm3' + L, 'Spine', [s * AX * 0.85, 0.56, 0.02]], ['ForeArm3' + L, 'UpperArm3' + L, [s * AX * 0.85, 0.45, 0.02]]);
    if (R.asas) {
      const bird = ['morcego', 'coruja'].includes(R.asas);
      const wy = urso ? 0.66 : 0.68, wz = urso ? -0.17 : red ? -0.12 : -0.08;
      bdef.push(['WingA' + L, 'Chest', [s * 0.05, wy, wz]]);
      bdef.push(bird ? ['WingB' + L, 'WingA' + L, [s * (urso ? 0.55 : 0.32), wy + (urso ? 0.2 : 0.12), wz - 0.03]] : ['WingB' + L, 'Chest', [s * 0.05, wy - 0.04, wz]]);
    }
  }
  const skel = buildSkeleton(bdef, chains, (v, kind) => kind === 'h' ? HEAD0.clone().add(Mv(HEAD0).sub(HEAD0)).add(v.clone().sub(HEAD0).multiplyScalar(hs)) : Mv(v));
  kit.setBI(skel.BI);
  const { B, REST } = skel;
  const legBlend = (top, h, amt) => p => { const t = ramp(top - p.y, 0, h), sf = ramp(Math.abs(p.x), 0.01, 0.06), w = amt * t * sf; return [['Hips', 1 - w], [p.x > 0 ? 'UpLeg_L' : 'UpLeg_R', w]]; };
  const torsoW = p => p.y > 0.6 ? [['Chest', 1]] : p.y > 0.44 ? [['Spine', 1]] : [['Hips', 1]];
  const skinMat = R.torso === 'agua' ? 3 : 0, pedra = !!R.pedra, J = pedra ? 0.01 : 0.004;

  // ---------- tronco
  if (R.torso === 'fada' || R.torso === 'agua') {
    const cC = R.torso === 'agua' ? C.pele : C.roupa;
    add(G.sph(0.075, 8, 6), { c: cC, mat: skinMat, b: 'Hips', pos: [0, 0.42, 0], scl: [1, 0.8, 0.85] });
    add(G.cyl(0.068, 0.072, 0.12, 8), { c: cC, mat: skinMat, b: 'Spine', pos: [0, 0.52, 0] });
    add(G.cyl(0.085, 0.07, 0.13, 8), { c: cC, mat: skinMat, b: 'Chest', pos: [0, 0.645, 0], scl: [1, 1, 0.85] });
    add(G.cyl(0.032, 0.036, 0.06, 6), { c: C.pele, mat: skinMat, b: 'Neck', pos: [0, 0.75, 0] });
    if (R.saia) for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2;
      add(G.sph(1, 6, 4), { c: i % 2 ? C.roupa : hex(C.roupa, 1.15), b: legBlend(0.44, 0.12, 0.6), pos: [Math.sin(a) * 0.07, 0.37, Math.cos(a) * 0.06], scl: [0.055, 0.1, 0.014], rot: [0, a / D2R, 0],
        deform: g => { const q = new THREE.Quaternion().setFromAxisAngle(V3(Math.cos(a), 0, -Math.sin(a)), 0.45); g.translate(-Math.sin(a) * 0.07, -0.37, -Math.cos(a) * 0.06); g.applyQuaternion(q); g.translate(Math.sin(a) * 0.07, 0.37, Math.cos(a) * 0.06); } }); }
    if (R.pintas) for (const [x, y, z] of [[0.05, 0.6, 0.05], [-0.05, 0.55, 0.05], [0, 0.48, -0.06], [0.04, 0.45, -0.05]]) add(G.ico(0.012), { c: C.brilho, glow: true, b: torsoW, pos: [x, y, z], jit: 0 });
  } else if (R.torso === 'redondo') {
    const bc = pedra ? C.pele : C.pele;
    add(G.sph(0.16, 9, 7), { c: bc, b: p => p.y < 0.42 ? [['Hips', 1]] : [['Spine', 1]], pos: [0, 0.5, 0], scl: [1, 1, 0.95], jit: J });
    add(G.sph(0.12, 8, 6), { c: bc, b: 'Chest', pos: [0, 0.65, 0], scl: [1.05, 0.9, 0.95], jit: J });
    if (R.barriga) add(G.sph(0.12, 8, 6), { c: C.barriga, b: p => p.y < 0.42 ? [['Hips', 1]] : [['Spine', 1]], pos: [0, 0.48, 0.07], scl: [1, 1.05, 0.7] });
  } else if (R.torso === 'urso') {
    add(G.sph(0.2, 10, 8), { c: C.pele, b: p => p.y < 0.43 ? [['Hips', 1]] : [['Spine', 1]], pos: [0, 0.48, 0.0], scl: [1.05, 1, 0.95], vary: 0.1 });
    add(G.sph(0.18, 10, 7), { c: C.pele, b: 'Chest', pos: [0, 0.65, 0], scl: [1.05, 0.9, 0.95], vary: 0.1 });
    add(G.sph(0.13, 8, 6), { c: C.claro, b: p => p.y < 0.43 ? [['Hips', 1]] : p.y > 0.6 ? [['Chest', 1]] : [['Spine', 1]], pos: [0, 0.53, 0.1], scl: [1, 1.25, 0.6] });
  } else if (bola) {
    add(G.ico(0.26, 1), { c: C.pele, b: p => p.y > 0.6 ? [['Chest', 1]] : p.y > 0.4 ? [['Spine', 1]] : [['Hips', 1]], pos: [0, 0.5, 0], jit: 0.012, vary: 0.12 });
    if (R.pelo === 'espetado') for (let i = 0; i < 26; i++) { const t = i / 26, ph = i * 2.4, yy = 1 - 2 * t, rr = Math.sqrt(1 - yy * yy), d = V3(Math.cos(ph) * rr, yy, Math.sin(ph) * rr);
      if (d.z > 0.55 && Math.abs(d.y) < 0.5) continue;
      add(G.cone(0.035, 0.09, 4), { c: hex(C.pele, 0.85), b: p => p.y > 0.6 ? [['Chest', 1]] : p.y > 0.4 ? [['Spine', 1]] : [['Hips', 1]], pos: V3(0, 0.5, 0).addScaledVector(d, 0.27).toArray(),
        pre: g => { g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(_Y, d)); }, jit: 0.003 }); }
  }
  // extras
  for (const ex of R.extras) {
    if (ex === 'corcunda') add(new THREE.DodecahedronGeometry(0.11, 0), { c: C.pedra, b: 'Chest', pos: [0, 0.66, -0.12], scl: [1.1, 0.9, 0.8], jit: 0.008 });
    if (ex === 'casca') for (const [y, s] of [[0.66, 1], [0.58, -1], [0.5, 1]]) add(G.box(0.12, 0.05, 0.03), { c: '#6a4a2a', b: torsoW, pos: [0, y, 0.065], rot: [0, 0, s * 6], jit: 0.003 });
    if (ex === 'capa-folhas') for (let i = 0; i < 7; i++) { const a = (i - 3) * 0.32;
      add(G.sph(1, 5, 4), { c: i % 2 ? C.folha : hex(C.folha, 1.2), b: torsoW, pos: [Math.sin(a) * 0.13, 0.55, -0.08 - Math.cos(a) * 0.08], scl: [0.06, 0.13, 0.015], rot: [10, a / D2R, 0] }); }
    if (ex.startsWith('espinhos')) { const L = ex.endsWith('longos') ? 0.16 : 0.1;
      for (let i = 0; i < 22; i++) { const u = i / 22, a = (u * 5.3) % 1 * Math.PI - Math.PI / 2, yy = 0.42 + (i % 6) * 0.055, d = V3(Math.sin(a) * 0.8, 0.35, -Math.cos(a)).normalize();
        add(G.cone(0.025, L, 4), { c: C.espinho, b: yy > 0.6 ? 'Chest' : 'Spine', pos: V3(0, yy, 0).addScaledVector(d, 0.15).toArray(), pre: g => g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(_Y, d)), jit: 0.002 }); } }
    if (ex === 'rachaduras') for (const [x, y, z, r] of [[0.06, 0.55, 0.14, 30], [-0.05, 0.48, 0.15, -40], [0.1, 0.62, 0.08, 10], [-0.09, 0.66, 0.07, -20], [0, 0.5, -0.15, 50]])
      add(G.box(0.06, 0.012, 0.012), { c: C.brilho, glow: true, b: torsoW, pos: [x, y, z], rot: [0, 0, r], jit: 0 });
    if (ex === 'penas-peito') for (let i = 0; i < 9; i++) { const xx = ((i % 3) - 1) * 0.07, yy = 0.66 - Math.floor(i / 3) * 0.06;
      add(G.sph(1, 5, 3), { c: i % 2 ? C.claro : hex(C.claro, 0.9), b: 'Chest', pos: [xx, yy, 0.155], scl: [0.045, 0.05, 0.02], rot: [-20, 0, 0] }); }
  }

  // ---------- braços
  const armSets = [['', 0.71, 0.57, 0.45, AX]];
  if (R.bracos3) armSets.push(['2', 0.64, 0.52, 0.42, AX * 0.9], ['3', 0.56, 0.45, 0.35, AX * 0.85]);
  for (const [s, L] of [[1, '_L'], [-1, '_R']]) for (const [suf, y0, y1, y2, ax] of armSets) {
    const x = s * ax, gross = R.bracos === 'grosso', long = R.bracoLongo ? 1.35 : 1;
    const ru = gross ? 0.065 : R.bracos === 'garra' ? 0.035 : 0.026, rf = gross ? 0.06 : ru * 0.9;
    const armC = R.torso === 'fada' && !suf ? C.roupa : C.pele;
    add(G.tube([x, y0, 0], [x, y1, 0], ru, ru * 0.9, 7), { c: urso ? C.pele : armC, mat: skinMat, b: 'UpperArm' + suf + L, vary: urso ? 0.1 : 0.07 });
    const fy = y1 - (y1 - y2) * long - (long - 1) * 0.05;
    add(G.tube([x, y1, 0], [x, suf ? y2 : fy, 0], rf, rf * 0.85, 7), { c: C.pele, mat: skinMat, b: suf ? 'ForeArm' + suf + L : 'ForeArm' + L });
    if (!suf) {
      const hy = y2 - 0.02 - (long - 1) * 0.06, hr = gross ? 0.075 : R.bracos === 'garra' ? 0.04 : 0.032;
      add(G.sph(hr, 7, 5), { c: C.pele, mat: skinMat, b: 'Hand' + L, pos: [x, hy, 0.005], scl: [0.9, 1, 1] });
      if (R.bracos === 'garra' || gross) for (const dz of [-0.022, 0, 0.022].map(v => v * (gross ? 1.8 : 1))) add(G.cone(gross ? 0.014 : 0.008, gross ? 0.05 : 0.03, 4), { c: '#e8e0c8', b: 'Hand' + L, pos: [x + s * hr * 0.4, hy - hr * 0.8, dz + hr * 0.3], rot: [180, 0, 0], jit: 0 });
    }
  }
  // ---------- pernas
  for (const [s, L] of [[1, '_L'], [-1, '_R']]) {
    const x = s * LX;
    if (legless) continue;
    if (R.pernas === 'raiz') {
      add(G.tube([x, 0.4, 0], [x * 1.3, 0.08, 0.0], 0.06, 0.04, 6), { c: '#6a4a2a', b: p => p.y > 0.25 ? [['UpLeg' + L, 1]] : [['Leg' + L, 1]] });
      for (const a of [-0.6, 0, 0.6, 2.6]) add(G.tube([x * 1.3, 0.08, 0], [x * 1.3 + Math.sin(a) * 0.07, 0.0, Math.cos(a) * 0.08], 0.022, 0.006, 4), { c: '#5a3a1a', b: 'Foot' + L, jit: 0.002 });
      continue;
    }
    const gross = R.pe === 'pata', rl = gross ? 0.075 : R.torso === 'redondo' || bola ? 0.035 : 0.03;
    const legC = R.torso === 'fada' ? C.pele : C.pele;
    add(G.tube([x, 0.39, 0], [x, 0.22, 0], rl, rl * 0.9, 7), { c: legC, mat: skinMat, b: 'UpLeg' + L, vary: gross ? 0.1 : 0.07 });
    add(G.tube([x, 0.22, 0], [x, 0.07, 0], rl * 0.9, rl * 0.85, 7), { c: legC, mat: skinMat, b: 'Leg' + L });
    if (R.pe === 'sapato') { add(G.sph(0.035, 6, 4), { c: C.roupaD, b: 'Foot' + L, pos: [x, 0.035, 0.025], scl: [0.9, 0.7, 1.6] });
      add(G.cone(0.012, 0.04, 4), { c: C.roupaD, b: 'Foot' + L, pos: [x, 0.05, 0.085], rot: [-60, 0, 0], jit: 0 }); }
    else if (R.pe === 'garra') { add(G.box(0.06, 0.04, 0.08), { c: C.peleD, b: 'Foot' + L, pos: [x, 0.02, 0.025], jit: J });
      for (const dx of [-0.02, 0.02]) add(G.cone(0.01, 0.035, 4), { c: '#e8e0c8', b: 'Foot' + L, pos: [x + dx, 0.012, 0.075], rot: [90, 0, 0], jit: 0 }); }
    else if (gross) { add(G.sph(0.085, 8, 5), { c: C.pele, b: 'Foot' + L, pos: [x, 0.04, 0.03], scl: [1, 0.55, 1.3], vary: 0.1 });
      add(G.sph(0.05, 6, 4), { c: C.claro, b: 'Foot' + L, pos: [x, 0.02, 0.1], scl: [1, 0.5, 0.6] }); }
  }
  if (legless) { const ch = chains.find(c => c.name === 'Fumaca'), W = { b: chainW(ch) }, fc = C.fumaca || C.pele;
    const rr = [0.08, 0.065, 0.045, 0.012]; for (let i = 0; i < 3; i++) add(G.tube(ch.pts[i], ch.pts[i + 1], rr[i], rr[i + 1], 7), { c: fc, mat: R.torso === 'redondo' ? 0 : 3, vary: 0.12, ...W }); }

  // ---------- cauda
  const tail = chains.find(c => c.name === 'Tail');
  if (tail) { const W = { b: chainW(tail) }, rr = R.cauda === 'rato' ? [0.025, 0.018, 0.012, 0.004] : [0.03, 0.024, 0.018, 0.01];
    for (let i = 0; i < 3; i++) add(G.tube(tail.pts[i], tail.pts[i + 1], rr[i], rr[i + 1], 6), { c: C.pele, ...W });
    const tip = tail.pts[3];
    if (R.cauda === 'flecha') add(G.slab([[0, 0.05], [0.045, -0.02], [0, 0.0], [-0.045, -0.02]], 0.012), { c: C.peleD, pos: [tip[0], tip[1] + 0.01, tip[2] - 0.03], rot: [-80, 0, 0], ...W });
    if (R.cauda === 'mola') for (let i = 0; i < 3; i++) add(new THREE.TorusGeometry(0.035, 0.012, 4, 8), { c: C.pele, pos: [0, 0.3 + i * 0.012, -0.46 - i * 0.04], rot: [70, 0, 0], ...W });
  }
  if (R.cauda === 'urso') add(G.sph(0.07, 6, 5), { c: C.pele, b: 'Hips', pos: [0, 0.38, -0.2], vary: 0.1 });
  if (R.cauda === 'brilho') add(G.sph(0.055, 7, 5), { c: C.brilho, glow: true, b: 'Hips', pos: [0, 0.37, -0.09], scl: [1, 0.9, 1.3], jit: 0 });

  // ---------- cabeça
  const H = R.head, HC = 0.92;
  const faceEyes = (x0, b, big = true, col = '#1b1712') => { for (const s of [1, -1]) {
    add(G.box(big ? 0.036 : 0.03, big ? 0.05 : 0.036, 0.02), { c: col, b, pos: [x0 + s * 0.055, HC - 0.005, 0.148], jit: 0, vary: 0, ...HD });
    add(G.box(0.012, 0.012, 0.01), { c: '#fff6e0', b, pos: [x0 + s * 0.05, HC + 0.008, 0.158], jit: 0, vary: 0, ...HD }); } };
  const hairCap = col => { add(G.sph(0.17, 9, 5, 0, 1.25), { c: col, b: 'Head', pos: [0, HC + 0.005, -0.005], vary: 0.1, ...HD }); add(G.sph(0.172, 9, 4, 1.1, 0.95, Math.PI, Math.PI), { c: col, b: 'Head', pos: [0, HC, -0.006], vary: 0.1, ...HD }); };
  const flower = (x, y, z, col) => { for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2;
    add(G.sph(1, 5, 3), { c: col, b: 'Head', pos: [x + Math.cos(a) * 0.025, y + Math.sin(a) * 0.025, z], scl: [0.022, 0.022, 0.008], jit: 0, ...HD }); }
    add(G.ico(0.013), { c: '#f0d040', b: 'Head', pos: [x, y, z + 0.006], jit: 0, ...HD }); };
  function headDiabrete(x0, bone) {
    const pele = C.pele, J2 = pedra ? 0.01 : 0.004, D = { anc: HA };
    add(G.sph(0.17, 9, 7), { c: pele, b: bone, pos: [x0, HC, 0], scl: [1.05, 0.95, 0.95], jit: J2, ...D });
    const ob = H.olhosBrilho;
    for (const s of [1, -1]) {
      add(G.ico(0.042, 1), { c: ob ? C.olho : C.olho, glow: ob, b: bone, pos: [x0 + s * 0.065, HC + 0.01, 0.13], scl: [1, ob ? 0.6 : 1, 0.7], jit: 0, vary: 0, ...D });
      if (!ob) add(G.box(0.01, 0.04, 0.01), { c: '#14110c', b: bone, pos: [x0 + s * 0.07, HC + 0.01, 0.16], jit: 0, vary: 0, ...D });
      if (H.testa) add(G.box(0.08, 0.025, 0.04), { c: hex(pele, 0.75), b: bone, pos: [x0 + s * 0.065, HC + 0.06, 0.13], rot: [0, 0, s * 14], jit: 0.004, ...D });
      const o = H.orelhas;
      if (o === 'pontuda') add(G.tube([x0 + s * 0.15, HC + 0.01, -0.01], [x0 + s * 0.27, HC + 0.08, -0.04], 0.04, 0.004, 5), { c: pele, b: bone, jit: 0.002, ...D });
      if (o === 'morcego') add(G.slab([[0, 0], [0.13, 0.04], [0.06, 0.16]], 0.012), { c: pele, b: bone, pos: [x0 + s * 0.12, HC + 0.04, -0.02], rot: [0, s > 0 ? -10 : 190, s * 10], jit: 0.002, ...D });
      if (o === 'pequena') add(G.cone(0.035, 0.06, 5), { c: pele, b: bone, pos: [x0 + s * 0.15, HC + 0.07, -0.02], rot: [0, 0, -s * 50], ...D });
      if (o === 'rato') { add(G.cyl(0.075, 0.075, 0.012, 9), { c: pele, b: bone, pos: [x0 + s * 0.13, HC + 0.12, -0.03], rot: [80, 0, s * 25], ...D });
        add(G.cyl(0.05, 0.05, 0.014, 9), { c: '#e8a0a0', b: bone, pos: [x0 + s * 0.13, HC + 0.12, -0.022], rot: [80, 0, s * 25], jit: 0, ...D }); }
      const ch = H.chifres;
      if (ch === 'chifrinhos') add(G.cone(0.025, 0.07, 5), { c: '#e8dcc0', b: bone, pos: [x0 + s * 0.08, HC + 0.17, 0.0], rot: [-10, 0, -s * 20], jit: 0, ...D });
      if (ch === 'longos') add(G.tube([x0 + s * 0.07, HC + 0.14, 0], [x0 + s * 0.16, HC + 0.3, -0.08], 0.03, 0.004, 5), { c: '#2a2422', b: bone, jit: 0.002, ...D });
      if (ch === 'carneiro') { const pts = [[0.1, HC + 0.12, 0.0], [0.17, HC + 0.16, -0.06], [0.22, HC + 0.1, -0.08], [0.21, HC + 0.03, -0.02], [0.17, HC + 0.03, 0.03]];
        for (let i = 0; i < 4; i++) add(G.tube([x0 + s * pts[i][0], pts[i][1], pts[i][2]], [x0 + s * pts[i + 1][0], pts[i + 1][1], pts[i + 1][2]], 0.03 - i * 0.005, 0.025 - i * 0.005, 6), { c: '#c8b898', b: bone, jit: 0.002, ...D }); }
    }
    add(G.ico(0.022), { c: hex(pele, 0.88), b: bone, pos: [x0, HC - 0.035, 0.165], jit: 0, ...D });
    const bo = H.boca;
    if (bo === 'sorriso' || bo === 'largo') { const w = bo === 'largo' ? 0.2 : 0.13;
      add(G.box(w, 0.016, 0.02), { c: '#2a1418', b: bone, pos: [x0, HC - 0.08, 0.15], jit: 0, vary: 0, ...D, deform: g => { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) pa.setY(i, pa.getY(i) + 3 * pa.getX(i) * pa.getX(i) - (bo === 'largo' ? 0.01 : 0)); } });
      for (const s of [1, -1]) add(G.cone(0.01, 0.025, 4), { c: '#f8f4e8', b: bone, pos: [x0 + s * 0.035, HC - 0.088, 0.156], rot: [180, 0, 0], jit: 0, ...D }); }
    if (bo === 'dentes') { add(G.box(0.07, 0.01, 0.02), { c: '#2a1418', b: bone, pos: [x0, HC - 0.075, 0.155], jit: 0, ...D });
      for (const s of [1, -1]) add(G.box(0.022, 0.04, 0.01), { c: '#f8f0d8', b: bone, pos: [x0 + s * 0.012, HC - 0.095, 0.158], jit: 0, ...D }); }
    if (bo === 'lanterna') { add(G.cyl(0.07, 0.07, 0.02, 10), { c: C.brilho, glow: true, b: bone, pos: [x0, HC - 0.06, 0.14], rot: [80, 0, 0], jit: 0, ...D });
      for (let i = 0; i < 5; i++) add(G.cone(0.01, 0.025, 4), { c: '#f8f4e8', b: bone, pos: [x0 - 0.05 + i * 0.025, HC - 0.01, 0.16], rot: [180, 0, 0], jit: 0, ...D }); }
    if (H.bigode) for (const s of [1, -1]) for (const dy of [0, 0.015]) add(G.box(0.08, 0.004, 0.004), { c: '#2a2422', b: bone, pos: [x0 + s * 0.07, HC - 0.03 + dy, 0.16], rot: [0, 0, s * (dy ? -8 : 8)], jit: 0, ...D });
    if (H.sino) { add(G.cyl(0.06, 0.15, 0.13, 9, true), { c: C.sino, metal: true, b: bone, pos: [x0, HC + 0.18, -0.01], rot: [-10, 0, 0], ...D });
      add(G.ico(0.03), { c: C.sino, metal: true, b: bone, pos: [x0, HC + 0.265, -0.02], jit: 0, ...D }); add(G.ico(0.025), { c: hex(C.sino, 0.7), metal: true, b: bone, pos: [x0, HC + 0.1, 0.01], jit: 0, ...D }); }
  }
  if (H.tipo === 'humano' || H.tipo === 'gota') {
    const pm = H.tipo === 'gota' ? 3 : 0;
    add(G.sph(0.16, 9, 7), { c: C.pele, mat: pm, b: 'Head', pos: [0, HC, 0], scl: [1, 1, 0.95], ...HD });
    faceEyes(0, 'Head', true, H.tipo === 'gota' ? '#1a4a6a' : '#1b1712');
    add(G.ico(0.014), { c: hex(C.pele, 0.9), mat: pm, b: 'Head', pos: [0, HC - 0.04, 0.155], jit: 0, ...HD });
    if (H.boca === 'trombeta') { add(G.cyl(0.05, 0.012, 0.09, 8, true), { c: C.roupa, b: 'Head', pos: [0, HC - 0.07, 0.19], rot: [90, 0, 0], ...HD }); }
    else add(G.box(0.035, 0.008, 0.01), { c: '#8a3a3a', b: 'Head', pos: [0, HC - 0.075, 0.15], jit: 0, vary: 0, ...HD });
    for (const s of [1, -1]) add(G.tube([s * 0.145, HC, -0.01], [s * 0.22, HC + 0.05, -0.04], 0.03, 0.004, 5), { c: C.pele, mat: pm, b: 'Head', jit: 0.002, ...HD });
    if (H.olhosExtra) for (const [x, y] of [[0.03, HC + 0.06], [-0.03, HC + 0.06], [0.075, HC + 0.045], [-0.075, HC + 0.045]]) add(G.box(0.016, 0.016, 0.012), { c: '#1b1712', b: 'Head', pos: [x, y, 0.147], jit: 0, vary: 0, ...HD });
    const cb = H.cabelo, cm = H.tipo === 'gota' ? 3 : 0;
    if (cb === 'petalas') for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2;
      add(G.sph(1, 5, 3), { c: i % 2 ? C.cab : hex(C.cab, 1.2), b: 'Head', pos: [Math.sin(a) * 0.15, HC + 0.08 + Math.cos(a) * 0.02, Math.cos(a) * 0.12 - 0.02], scl: [0.05, 0.1, 0.015], rot: [-30, a / D2R, 0], ...HD }); }
    else if (cb === 'agulhas') for (let i = 0; i < 14; i++) { const ph = i * 2.4, yy = 1 - (i / 14) * 0.9, rr = Math.sqrt(1 - yy * yy), d = V3(Math.cos(ph) * rr, yy, Math.sin(ph) * rr - 0.2).normalize();
      add(G.cone(0.02, 0.12, 4), { c: C.cab, glow: true, b: 'Head', pos: V3(0, HC, 0).addScaledVector(d, 0.16).toArray(), pre: g => g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(_Y, d)), jit: 0, ...HD }); }
    else if (cb === 'cascata') { add(G.sph(0.17, 9, 5, 0, 1.25), { c: C.cab, mat: 3, b: 'Head', pos: [0, HC + 0.005, -0.005], ...HD }); }
    else { hairCap(C.cab);
      if (cb === 'coque') add(G.sph(0.06, 7, 5), { c: C.cab, b: 'Head', pos: [0, HC + 0.15, -0.1], ...HD });
      if (cb === 'flor') flower(0.11, HC + 0.11, 0.07, C.roupa === C.cab ? '#f8f0f8' : hex(C.roupa, 1.2));
    }
    const hair = chains.find(c => c.name === 'Hair');
    if (hair) add(G.box(0.2, 0.26, 0.035, 3), { c: C.cab, mat: cm, b: chainW(hair), pos: [0, 0.82, -0.155], ...HD,
      deform: g => { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) { const t = ramp(pa.getY(i), 0.69, 0.95); pa.setX(i, pa.getX(i) * (0.75 + 0.3 * t)); } } });
  } else if (H.tipo === 'cogumelo') {
    add(G.sph(0.13, 9, 7), { c: C.pele, b: 'Head', pos: [0, HC - 0.04, 0], ...HD });
    faceEyes(0, 'Head', true); add(G.box(0.03, 0.008, 0.01), { c: '#8a3a3a', b: 'Head', pos: [0, HC - 0.1, 0.125], jit: 0, ...HD });
    const sh = H.chapeu, sc = sh === 'pontudo' ? [0.9, 1.1, 0.9] : sh === 'largo' ? [1.3, 0.45, 1.3] : [1, 0.65, 1];
    add(G.sph(0.24, 10, 5, 0, Math.PI / 2), { c: C.chapeu, b: 'Head', pos: [0, HC + 0.02, 0], scl: sc, vary: 0.05, ...HD,
      deform: sh === 'pontudo' ? g => { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) { const y = pa.getY(i); pa.setX(i, pa.getX(i) * (1 - y * 2.2)); pa.setZ(i, pa.getZ(i) * (1 - y * 2.2)); } } : null });
    add(G.cyl(0.235 * sc[0], 0.2 * sc[0], 0.02, 10), { c: hex(C.pinta, 0.9), b: 'Head', pos: [0, HC + 0.01, 0], ...HD });
    for (let i = 0; i < 7; i++) { const a = i * 2.4, rr = 0.1 + (i % 3) * 0.04; add(G.cyl(0.025, 0.025, 0.01, 6), { c: C.pinta, b: 'Head', pos: [Math.cos(a) * rr * sc[0], HC + 0.02 + 0.24 * sc[1] * Math.sqrt(Math.max(0, 1 - (rr / 0.24) ** 2)), Math.sin(a) * rr * sc[0]], jit: 0, ...HD }); }
  } else if (H.tipo === 'bolota') {
    add(G.sph(0.15, 9, 7), { c: C.pele, b: 'Head', pos: [0, HC - 0.01, 0], ...HD });
    faceEyes(0, 'Head', true); add(G.box(0.03, 0.008, 0.01), { c: '#8a3a3a', b: 'Head', pos: [0, HC - 0.08, 0.145], jit: 0, ...HD });
    add(G.sph(0.17, 9, 4, 0, 1.35), { c: C.bolota, b: 'Head', pos: [0, HC + 0.01, 0], vary: 0.15, ...HD });
    add(G.tube([0, HC + 0.17, 0], [0.02, HC + 0.23, -0.01], 0.015, 0.01, 5), { c: hex(C.bolota, 0.8), b: 'Head', ...HD });
  } else if (H.tipo === 'duende') {
    add(G.sph(0.16, 9, 7), { c: C.pele, b: 'Head', pos: [0, HC, 0], scl: [1, 0.95, 0.95], ...HD });
    faceEyes(0, 'Head', false);
    add(G.ico(0.04), { c: hex(C.pele, 0.9), b: 'Head', pos: [0, HC - 0.03, 0.16], scl: [1, 0.9, 1.2], ...HD });
    for (let i = 0; i < 9; i++) { const a = (i / 8 - 0.5) * 2.4; add(G.ico(0.04, 0), { c: i % 2 ? C.barba : hex(C.barba, 1.15), b: 'Head', pos: [Math.sin(a) * 0.1, HC - 0.1 - Math.cos(a) * 0.04, 0.09 + Math.cos(a) * 0.03], jit: 0.005, vary: 0.12, ...HD }); }
    for (const s of [1, -1]) add(G.sph(1, 5, 3), { c: '#6a9a3a', b: 'Head', pos: [s * 0.2, HC + 0.03, -0.02], scl: [0.09, 0.04, 0.012], rot: [0, 0, s * 25], ...HD });
    if (H.gorro === 'folha') add(G.sph(1, 6, 3), { c: '#5a8a3a', b: 'Head', pos: [0, HC + 0.15, 0], scl: [0.17, 0.05, 0.19], rot: [-10, 0, 0], ...HD });
    if (H.gorro === 'pontudo') add(G.cone(0.15, 0.28, 8), { c: C.roupa, b: 'Head', pos: [0, HC + 0.22, -0.03], rot: [-15, 0, 0], ...HD });
  } else if (H.tipo === 'diabrete' || H.tipo === 'hastes' || H.tipo === 'mascara') {
    if (H.tipo === 'hastes') {
      add(G.sph(0.17, 9, 7), { c: C.pele, b: 'Head', pos: [0, HC - 0.02, 0], scl: [1.1, 0.85, 0.95], ...HD });
      add(G.box(0.16, 0.016, 0.02), { c: '#2a1418', b: 'Head', pos: [0, HC - 0.07, 0.15], jit: 0, ...HD });
      add(G.box(0.03, 0.006, 0.12), { c: '#e86a8a', b: 'Head', pos: [0, HC - 0.08, 0.2], rot: [20, 0, 0], jit: 0, ...HD });
      for (const ch of chains.filter(c => c.name.startsWith('Olho'))) {
        const W = { b: chainW(ch), ...HD };
        add(G.tube(ch.pts[0], ch.pts[2], 0.018, 0.012, 5), { c: C.pele, ...W });
        add(G.sph(0.04, 7, 5), { c: C.olho, pos: ch.pts[2], jit: 0, vary: 0, ...W });
        add(G.sph(0.018, 5, 4), { c: '#14110c', pos: [ch.pts[2][0], ch.pts[2][1], ch.pts[2][2] + 0.032], jit: 0, ...W }); }
    } else {
      headDiabrete(0, 'Head');
      if (H.tipo === 'mascara') {
        add(G.cyl(0.13, 0.13, 0.025, 12), { c: C.mascara, b: 'Head', pos: [0, HC, 0.15], rot: [90, 0, 0], jit: 0.002, ...HD });
        for (const s of [1, -1]) add(G.box(0.04, H.mascara === 'susto' ? 0.05 : 0.03, 0.01), { c: '#14110c', b: 'Head', pos: [s * 0.045, HC + 0.02, 0.165], rot: [0, 0, s * (H.mascara === 'choro' ? -20 : H.mascara === 'sorriso' ? 15 : 0)], jit: 0, ...HD });
        add(G.box(H.mascara === 'susto' ? 0.04 : 0.08, H.mascara === 'susto' ? 0.04 : 0.014, 0.01), { c: '#14110c', b: 'Head', pos: [0, HC - 0.06, 0.165], jit: 0, ...HD,
          deform: g => { const pa = g.attributes.position, k = H.mascara === 'sorriso' ? 6 : H.mascara === 'choro' ? -6 : 0; for (let i = 0; i < pa.count; i++) pa.setY(i, pa.getY(i) + k * pa.getX(i) * pa.getX(i)); } });
      }
    }
  } else if (H.tipo === 'duas') { headDiabrete(0.1, 'Head'); headDiabrete(-0.1, 'Head2'); }
  else if (H.tipo === 'chama') {
    add(G.sph(0.13, 8, 6), { c: C.pele, b: 'Head', pos: [0, HC - 0.03, 0], jit: 0.008, ...HD });
    for (const s of [1, -1]) add(G.box(0.035, 0.03, 0.02), { c: C.brilho, glow: true, b: 'Head', pos: [s * 0.045, HC - 0.02, 0.122], rot: [0, 0, s * 12], jit: 0, ...HD });
    add(G.box(0.07, 0.012, 0.01), { c: C.brilho, glow: true, b: 'Head', pos: [0, HC - 0.08, 0.12], jit: 0, ...HD });
    const tips = H.chama === 'tres' ? [[0, 0.3, 0], [0.08, 0.22, -0.02], [-0.08, 0.22, -0.02]] : H.chama === 'baixa' ? [[0, 0.17, 0]] : [[0, 0.32, -0.02]];
    tips.forEach(([x, h, z], i) => { add(G.cone(0.1 - i * 0.02, h, 7), { c: C.brilho, glow: true, b: 'Head', pos: [x, HC + 0.05 + h / 2, z - 0.02], jit: 0.006, ...HD });
      add(G.cone(0.06 - i * 0.015, h * 0.7, 6), { c: C.chama, glow: true, b: 'Head', pos: [x, HC + 0.04 + h * 0.35, z + 0.03], jit: 0.004, ...HD }); });
  } else if (H.tipo === 'nenhuma' && bola) {
    const n = H.olhosBola, xs = n === 'um' ? [0] : n === 'tres' ? [-0.08, 0, 0.08] : [-0.06, 0.06];
    xs.forEach((x, i) => { const y = 0.56 + (n === 'tres' && i === 1 ? 0.06 : 0);
      add(G.sph(n === 'um' ? 0.07 : 0.045, 7, 5), { c: C.olho, b: 'Chest', pos: [x, y, 0.23], scl: [1, 1, 0.6], jit: 0, vary: 0 });
      add(G.sph(n === 'um' ? 0.03 : 0.02, 5, 4), { c: '#14110c', b: 'Chest', pos: [x, y, 0.26], jit: 0, vary: 0 }); });
  } else if (H.tipo === 'urso') {
    add(G.sph(0.18, 10, 8), { c: C.pele, b: 'Head', pos: [0, HC, 0], scl: [1.05, 0.95, 0.95], vary: 0.1, ...HD });
    add(G.sph(1, 8, 6), { c: C.claro, b: 'Head', pos: [0, HC - 0.05, 0.14], scl: [0.085, 0.065, 0.075], ...HD });
    add(G.ico(0.03), { c: '#1b1712', b: 'Head', pos: [0, HC - 0.025, 0.215], scl: [1.3, 0.8, 1], jit: 0, ...HD });
    add(G.box(0.03, 0.006, 0.01), { c: '#1b1712', b: 'Head', pos: [0, HC - 0.085, 0.205], jit: 0, ...HD });
    for (const s of [1, -1]) {
      add(G.box(0.028, 0.03, 0.02), { c: '#1b1712', b: 'Head', pos: [s * 0.065, HC + 0.035, 0.155], jit: 0, vary: 0, ...HD });
      add(G.box(0.01, 0.01, 0.01), { c: '#fff6e0', b: 'Head', pos: [s * 0.06, HC + 0.045, 0.166], jit: 0, vary: 0, ...HD });
      add(G.sph(0.055, 7, 5), { c: C.pele, b: 'Head', pos: [s * 0.13, HC + 0.14, -0.02], scl: [1, 1, 0.6], ...HD });
      add(G.sph(0.03, 6, 4), { c: C.claro, b: 'Head', pos: [s * 0.13, HC + 0.14, 0.008], scl: [1, 1, 0.4], ...HD });
    }
  } else if (H.tipo === 'coruja') {
    add(G.sph(0.19, 10, 8), { c: C.pele, b: 'Head', pos: [0, HC, 0], scl: [1.05, 0.95, 0.95], vary: 0.1, ...HD });
    add(G.cyl(0.16, 0.16, 0.03, 12), { c: C.claro, b: 'Head', pos: [0, HC - 0.01, 0.16], rot: [90, 0, 0], scl: [1.15, 1, 0.9], ...HD });
    for (const s of [1, -1]) {
      add(G.cyl(0.055, 0.055, 0.02, 10), { c: '#f0a830', b: 'Head', pos: [s * 0.068, HC + 0.02, 0.178], rot: [90, 0, 0], jit: 0, ...HD });
      add(G.cyl(0.03, 0.03, 0.02, 8), { c: '#14110c', b: 'Head', pos: [s * 0.068, HC + 0.02, 0.188], rot: [90, 0, 0], jit: 0, ...HD });
      if (H.tufos) add(G.cone(0.04, 0.12, 4), { c: C.pele, b: 'Head', pos: [s * 0.12, HC + 0.18, -0.01], rot: [0, 0, -s * 25], ...HD });
    }
    add(G.cone(0.025, 0.06, 4), { c: C.bico || '#e8b040', b: 'Head', pos: [0, HC - 0.05, 0.19], rot: [180, 0, 0], jit: 0, ...HD });
  }
  // antenas
  for (const ch of chains.filter(c => c.name.startsWith('Ant'))) {
    const W = { b: chainW(ch), ...HD }, pl = R.antenas === 'pluma';
    add(G.tube(ch.pts[0], ch.pts[1], 0.008, 0.007, 4), { c: C.cabD, ...W }); add(G.tube(ch.pts[1], ch.pts[2], 0.007, 0.005, 4), { c: C.cabD, ...W });
    if (pl) for (let i = 0; i < 4; i++) { const q = V3(...ch.pts[1]).lerp(V3(...ch.pts[2]), i / 4); add(G.box(0.05, 0.004, 0.012), { c: hex(C.asa, 0.9), pos: q.toArray(), rot: [0, 0, 30], jit: 0, ...W }); }
    else add(G.ico(0.02), { c: R.antenas === 'brilho' ? C.brilho : C.cab, glow: R.antenas === 'brilho', pos: ch.pts[2], jit: 0, ...W });
  }

  // ---------- asas
  function wing(L, s, type) {
    const A = REST['WingA' + L], wa = [s * 0.05, A.y / ky, A.z / kz];
    const place = (g, bone, mat, col, o = {}) => add(g, { c: col, mat, b: bone, jit: 0.001, vary: 0.05, ...o });
    const mirror = g => { if (s < 0) { g.scale(-1, 1, 1); const idx = g.index; if (idx) { const a = idx.array; for (let i = 0; i < a.length; i += 3) { const t = a[i]; a[i] = a[i + 2]; a[i + 2] = t; } } } return g; };
    const at = (pts, ox, oy, oz, rx = 0, rz = 0) => { const g = mirror(G.flat(pts)); g.rotateX((-25 + rx) * D2R); g.rotateZ(s * rz * D2R); g.translate(wa[0] + s * ox, wa[1] + oy, wa[2] + oz); return g; };
    const ell = (len, wid, n = 10) => { const p = []; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2; p.push([len / 2 + Math.cos(a) * len / 2, Math.sin(a) * wid / 2]); } return p; };
    const fan = (len, wid, n = 10) => { const p = [[0, 0]]; for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + i / n * Math.PI; p.push([Math.cos(a) * len * 0.5 + len * 0.5, Math.sin(a) * wid]); } return p; };
    if (type === 'libelula') { place(at(ell(0.46, 0.08), 0, 0.02, 0, 0, 14), 'WingA' + L, 3, C.asa); place(at(ell(0.4, 0.07), 0, -0.03, 0.005, 0, -18), 'WingB' + L, 3, hex(C.asa, 0.92)); }
    if (type === 'besouro') { place(at(ell(0.3, 0.07), 0, 0.02, 0, 0, 20), 'WingA' + L, 3, C.asa); place(at(ell(0.26, 0.06), 0, -0.02, 0, 0, -10), 'WingB' + L, 3, C.asa);
      add(G.sph(0.06, 6, 4, 0, Math.PI, 0, Math.PI), { c: C.roupa, b: 'Chest', pos: [s * 0.04, 0.58, -0.06], scl: [0.8, 1.6, 0.6], rot: [0, s * 20, 0] }); }
    if (type === 'borboleta' || type === 'mariposa') { const moth = type === 'mariposa', m = urso ? 2.0 : 1;
      place(at(fan(0.3 * m, 0.16 * m).map(([u, v]) => [u, v + (moth ? 0 : 0.04 * m * (u / (0.3 * m)))]), 0, 0.03, 0, 0, 22), 'WingA' + L, moth ? 0 : 3, C.asa);
      place(at(fan(0.22 * m, 0.11 * m), 0, -0.04 * m, 0.004, 0, -35), 'WingB' + L, moth ? 0 : 3, hex(C.asa, 0.88));
      const eye = G.cyl(0.035 * m, 0.035 * m, 0.004, 8); eye.rotateX(Math.PI / 2 - 25 * D2R); eye.rotateZ(s * 22 * D2R); eye.translate(wa[0] + s * 0.17 * m, wa[1] + 0.03 + 0.07 * m, wa[2] - 0.01);
      place(eye, 'WingA' + L, 0, C.asa2, { jit: 0 }); }
    if (type === 'folha') { const leaf = [[0, 0], [0.12, 0.06], [0.28, 0.05], [0.36, 0], [0.28, -0.05], [0.12, -0.06]];
      place(at(leaf, 0, 0.02, 0, 0, 18), 'WingA' + L, 0, C.asa); place(at(leaf.map(([u, v]) => [u * 0.8, v * 0.8]), 0, -0.03, 0.004, 0, -22), 'WingB' + L, 0, hex(C.asa, 0.82));
      const rib = G.box(0.3, 0.006, 0.006); rib.translate(0.15, 0, 0.003); rib.rotateX(-25 * D2R); rib.rotateZ(18 * D2R); if (s < 0) rib.scale(-1, 1, 1); rib.translate(wa[0], wa[1] + 0.02, wa[2]); place(rib, 'WingA' + L, 0, hex(C.asa, 0.6), { jit: 0 }); }
    if (type === 'cristal') { const sh = [[0, 0], [0.1, 0.07], [0.22, 0.11], [0.34, 0.04], [0.26, -0.02], [0.14, -0.05]];
      place(at(sh, 0, 0.02, 0, 0, 20), 'WingA' + L, 3, C.asa); place(at(sh.map(([u, v]) => [u * 0.75, -v * 0.8]), 0, -0.03, 0.004, 0, -25), 'WingB' + L, 3, C.asa);
      for (const u of [0.12, 0.22]) { const g = G.octa(0.014); g.translate(wa[0] + s * u, wa[1] + 0.04, wa[2] - 0.01); place(g, 'WingA' + L, 2, C.brilho, { jit: 0, glow: true }); } }
    if (type === 'beija') { for (let i = 0; i < 5; i++) { const g = G.box(0.22 - i * 0.02, 0.025, 0.006); g.translate(0.11 - i * 0.01, 0, 0); g.rotateZ((25 - i * 12) * D2R); if (s < 0) g.scale(-1, 1, 1);
        g.rotateX(-25 * D2R); g.translate(wa[0], wa[1], wa[2]); place(g, i < 3 ? 'WingA' + L : 'WingB' + L, 0, i % 2 ? C.asa : hex(C.asa, 1.2), { jit: 0 }); } }
    if (type === 'semente2' || type === 'semente1') { if (type === 'semente1' && s < 0) return;
      const sam = [[0, -0.02], [0.05, -0.03], [0.3, -0.05], [0.36, 0.0], [0.3, 0.05], [0.05, 0.03]];
      place(at(sam, 0, 0.03, 0, -40, 35), 'WingA' + L, 3, C.asa); add(G.sph(0.03, 6, 4), { c: C.bolota, b: 'WingA' + L, pos: [wa[0] + s * 0.01, wa[1] + 0.03, wa[2]], jit: 0 }); }
    if (type === 'morcego' || type === 'coruja') {
      const Bp = REST['WingB' + L], wb = [Bp.x / kx, Bp.y / ky, Bp.z / kz], col = type === 'morcego' ? C.asa : C.asa, col2 = C.asa2;
      if (type === 'morcego') {
        add(G.tube(wa, wb, urso ? 0.03 : 0.014, urso ? 0.025 : 0.011, 5), { c: hex(col, 0.75), b: 'WingA' + L });
        const inner = [[wa[0], wa[1] - 0.02], [wb[0], wb[1]], [wb[0] - s * 0.04, wb[1] - (urso ? 0.45 : 0.25)], [wa[0] + s * 0.03, wa[1] - (urso ? 0.3 : 0.17)]];
        const g = G.flat(inner.map(([x, y]) => [x, y])); g.translate(0, 0, wa[2] - 0.01); add(g, { c: col, b: 'WingA' + L, jit: 0.001 });
        const fl = urso ? [0.55, 0.5, 0.42] : [0.3, 0.27, 0.22];
        [[15, fl[0]], [-20, fl[1]], [-55, fl[2]]].forEach(([ang, len], i) => {
          const tip = [wb[0] + s * Math.cos(ang * D2R) * len, wb[1] + Math.sin(ang * D2R) * len];
          add(G.tube([wb[0], wb[1], wb[2]], [tip[0], tip[1], wb[2] - 0.02], urso ? 0.018 : 0.008, 0.003, 4), { c: hex(col, 0.7), b: 'WingB' + L });
          const prev = i === 0 ? [wb[0] + s * 0.02, wb[1] + 0.02] : [wb[0] + s * Math.cos(([15, -20, -55][i - 1]) * D2R) * fl[i - 1], wb[1] + Math.sin(([15, -20, -55][i - 1]) * D2R) * fl[i - 1]];
          const m = G.flat([[wb[0], wb[1]], prev, tip]); m.translate(0, 0, wb[2] - 0.015); add(m, { c: col, b: 'WingB' + L, jit: 0.001 }); });
        const last = [wb[0] + s * Math.cos(-55 * D2R) * fl[2], wb[1] + Math.sin(-55 * D2R) * fl[2]];
        const m = G.flat([[wb[0], wb[1]], last, [wb[0] - s * 0.04, wb[1] - (urso ? 0.45 : 0.25)]]); m.translate(0, 0, wb[2] - 0.012); add(m, { c: col, b: 'WingB' + L, jit: 0.001 });
      } else {                                               // asa de ave: penas em leque
        const n = 9, sp = urso ? 1 : 0.6;
        const mem = G.flat([[wa[0], wa[1]], [wb[0], wb[1]], [wb[0] + s * 0.02, wb[1] - 0.3 * sp], [wa[0] + s * 0.05, wa[1] - 0.3 * sp]]); mem.translate(0, 0, wa[2] - 0.005);
        add(mem, { c: hex(col, 0.85), b: 'WingA' + L, jit: 0.001 });
        for (let i = 0; i < n; i++) { const u = i / (n - 1), p0 = V3(...wa).lerp(V3(...wb), u);
          const fb = G.box(0.12 * sp, (0.38 - u * 0.08) * sp, 0.012); fb.translate(0, -(0.17 - u * 0.04) * sp, 0); fb.rotateZ(-s * (8 + u * 12) * D2R); fb.translate(p0.x, p0.y, p0.z - 0.01 * i);
          add(fb, { c: i % 2 ? col : hex(col, 1.1), b: 'WingA' + L, jit: 0.002 }); }
        for (let i = 0; i < 6; i++) { const ang = 20 - i * 18, len = (0.5 - i * 0.03) * sp;
          const fb = G.box(len, 0.11 * sp, 0.012); fb.translate(len / 2, 0, 0); fb.rotateZ(ang * D2R); if (s < 0) fb.scale(-1, 1, 1); fb.translate(wb[0], wb[1], wb[2] - 0.01 * i);
          add(fb, { c: i % 2 ? col2 : hex(col2, 1.15), b: 'WingB' + L, jit: 0.002 }); }
        add(G.tube(wa, wb, 0.04 * sp, 0.03 * sp, 5), { c: col, b: 'WingA' + L, vary: 0.1 });
      }
    }
  }
  if (R.asas) for (const [s, L] of [[1, '_L'], [-1, '_R']]) wing(L, s, R.asas);

  // ---------- na mão
  {
    const x = -AX, hy = 0.43, T = (z, y = 0) => [x, hy + y, z], W = { b: 'Hand_R', anc: [V3(-AX, 0.45, 0), 1] }, m = R.mao, sc = urso ? 2 : R.torso === 'redondo' ? 1.2 : 1;
    const S2 = (a) => a.map(v => v * sc);
    if (m === 'varinha') { add(G.tube(T(-0.03), T(0.16 * sc), 0.006, 0.005, 5), { c: '#e8d8b0', jit: 0, ...W }); add(G.octa(0.025), { c: C.brilho, glow: true, pos: T(0.17 * sc), jit: 0, ...W }); }
    if (m === 'flor') { add(G.tube(T(-0.02), T(0.12), 0.005, 0.005, 4), { c: '#4a8a3a', jit: 0, ...W }); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; add(G.sph(1, 5, 3), { c: '#f088b0', pos: [x + Math.cos(a) * 0.02, hy + Math.sin(a) * 0.02, 0.13], scl: [0.02, 0.02, 0.006], jit: 0, ...W }); } }
    if (m === 'gota' || m === 'cristal') add(m === 'gota' ? G.ico(0.03, 1) : G.octa(0.035), { c: C.brilho, glow: true, pos: T(0.05, 0.02), scl: m === 'cristal' ? [0.7, 1.5, 0.7] : [1, 1, 1], jit: 0, ...W });
    if (m === 'lanca' || m === 'espada') { add(G.tube(T(-0.1), T(m === 'lanca' ? 0.22 : 0.02), 0.006, 0.006, 4), { c: '#6a4a2a', jit: 0, ...W });
      add(G.cone(m === 'lanca' ? 0.014 : 0.02, m === 'lanca' ? 0.07 : 0.18, 4), { c: '#c8b878', pos: T(m === 'lanca' ? 0.255 : 0.11), rot: [90, 0, 0], jit: 0, ...W }); }
    if (m === 'forquilha') { add(G.tube(T(-0.12 * sc), T(0.22 * sc), 0.008 * sc, 0.008 * sc, 5), { c: '#3a2a22', jit: 0, ...W });
      for (const dy of [-0.025, 0, 0.025]) add(G.tube(T(0.21 * sc, dy * sc), T(0.28 * sc, dy * sc), 0.005 * sc, 0.002, 4), { c: '#8a8e96', metal: true, jit: 0, ...W }); }
    if (m === 'tocha') { add(G.tube(T(-0.04), T(0.13 * sc), 0.01 * sc, 0.012 * sc, 5), { c: '#6a4a2a', jit: 0, ...W }); add(G.cone(0.03 * sc, 0.08 * sc, 6), { c: '#ffb040', glow: true, pos: T(0.17 * sc), rot: [90, 0, 0], jit: 0, ...W }); }
    if (m === 'saco') add(G.sph(0.05 * sc, 6, 5), { c: '#8a6a3a', pos: [x, hy - 0.06 * sc, 0.02], scl: [1, 1.1, 1], ...W });
    if (m === 'sapato') add(G.box(0.05, 0.05, 0.11), { c: '#5a3a22', pos: T(0.04, -0.02), ...W });
    if (m === 'queijo') add(G.slab([[0, 0], [0.08, 0], [0, 0.06]], 0.04), { c: '#f0c840', pos: [x, hy - 0.02, 0.03], rot: [0, 90, 0], ...W });
    if (m === 'cajado') { add(G.tube(T(-0.2), T(0.34), 0.012, 0.014, 5), { c: '#6a4a2a', jit: 0.002, ...W }); add(G.ico(0.03), { c: '#5a8a3a', pos: T(0.36), jit: 0.004, ...W }); }
    if (m === 'lanterna') { add(G.box(0.05, 0.07, 0.05), { c: '#3a3a3a', metal: true, pos: [x, hy - 0.07, 0.03], ...W }); add(G.box(0.035, 0.05, 0.035), { c: '#ffd060', glow: true, pos: [x, hy - 0.07, 0.03], jit: 0, ...W }); }
  }

  // ---------- poses (FK + IK nos pés quando anda)
  const L_LEG = [REST.UpLeg_L.distanceTo(REST.Leg_L), REST.Leg_L.distanceTo(REST.Foot_L)];
  const hasW = !!R.asas, pesado = !!R.pesado, voa = S.voa;
  const arm = (L, u, f, h = [0, 0, 0]) => { B['UpperArm' + L].quaternion.copy(E(u, 'XYZ')); B['ForeArm' + L].quaternion.setFromAxisAngle(_X, -f * D2R); B['Hand' + L].quaternion.copy(E(h, 'XYZ')); };
  function applyPose(P) {
    B.Hips.position.set(P.hp[0] * kx, P.hp[1] * ky, P.hp[2] * kz); B.Hips.quaternion.copy(E(P.hr));
    B.Spine.quaternion.copy(E(P.sp)); B.Chest.quaternion.copy(E(P.ch)); B.Neck.quaternion.copy(E([0, 0, 0])); B.Head.quaternion.copy(E(P.hd));
    if (B.Head2) B.Head2.quaternion.copy(E([P.hd[0] * 0.6 - 4, -P.hd[1] * 0.8, -P.hd[2]]));
    arm('_L', [P.aL[0], P.aL[1], P.aL[2]], P.aL[3]); arm('_R', [P.aR[0], -P.aR[1], -P.aR[2]], P.aR[3]);
    if (R.bracos3) for (const [s, L] of [[1, '_L'], [-1, '_R']]) { B['UpperArm2' + L].quaternion.copy(E([P.a2[0], 0, s * P.a2[1]], 'XYZ')); B['ForeArm2' + L].quaternion.setFromAxisAngle(_X, -P.a2[2] * D2R);
      B['UpperArm3' + L].quaternion.copy(E([P.a2[0] * 0.7, 0, s * P.a2[1] * 1.2], 'XYZ')); B['ForeArm3' + L].quaternion.setFromAxisAngle(_X, -P.a2[2] * 0.8 * D2R); }
    for (const [s, L] of [[1, '_L'], [-1, '_R']]) if (B['WingA' + L]) {
      B['WingA' + L].quaternion.copy(E([P.w[2] || 0, s * P.w[1], s * P.w[0]], 'XYZ'));
      const bird = ['morcego', 'coruja'].includes(R.asas);
      B['WingB' + L].quaternion.copy(bird ? E([0, s * P.w[1] * 1.6, s * P.w[3]], 'XYZ') : E([P.w[2] || 0, s * P.w[1], s * P.w[3]], 'XYZ'));
    }
    for (const ch of chains) for (const nm of ch.names) B[nm].quaternion.identity();
    if (B.Tail1 && P.tw) B.Tail1.quaternion.copy(E([0, P.tw, 0]));
    if (P.fk) { for (const [s, L, l] of [[1, '_L', P.fk[0]], [-1, '_R', P.fk[1]]]) { B['UpLeg' + L].quaternion.copy(E([l[0], 0, s * l[1]], 'XYZ')); B['Leg' + L].quaternion.setFromAxisAngle(_X, l[2] * D2R); B['Foot' + L].quaternion.copy(E([l[3] || 0, 0, 0], 'XYZ')); } }
    skel.bones[0].parent?.updateMatrixWorld?.(true);
    B.Hips.updateMatrixWorld(true);
    if (P.ik) for (const [f, L, s] of [[P.ik[0], '_L', 1], [P.ik[1], '_R', -1]]) {
      const ankle = V3(f[0] * kx, f[1] * ky + REST.Foot_L.y, f[2] * kz); const q = E([f[3] || 0, s * 6, 0]);
      ik(B['UpLeg' + L], B['Leg' + L], B['Foot' + L], ankle, V3(s * 0.15, 0, 1), L_LEG[0], L_LEG[1], q);
    }
    B.Hips.updateMatrixWorld(true);
  }
  // poses
  const f = R.flap, hov = pesado ? 0.55 : 0.6;
  const flapA = pesado ? 38 : 32;
  const base = () => ({ hp: [0, 0.4, 0], hr: [0, 0, 0], sp: [0, 0, 0], ch: [0, 0, 0], hd: [0, 0, 0], aL: [-10, 0, 14, 25], aR: [-10, 0, 14, 25], a2: [-20, 25, 30], w: [10, 30, 0, 10], tw: 0 });
  const LX0 = LX;
  const stand = (t, P) => { P.ik = [[LX0, 0, 0.01], [-LX0, 0, -0.01]]; P.hp[1] = 0.385; return P; };
  const dur = n => voa && hasW && f > 0 ? Math.max(1, Math.round(n * f)) / f : n;
  const clipdefs = [];
  if (voa) {
    const DI = dur(1.6), DV = dur(1.0);
    const hover = (t, fwd) => { const P = base(), ph = 2 * Math.PI * f * t, sl = 2 * Math.PI * t / DI, A = flapA * (fwd ? 1.25 : 1);
      const fl = hasW && f > 0 ? Math.sin(ph) : 0;
      P.hp = [0.01 * Math.sin(sl), hov + (hasW ? 0.012 * Math.cos(ph) : 0) + 0.025 * Math.sin(sl) * (fwd ? 0.4 : 1), 0];
      P.hr = [fwd ? 32 : 6 + 2 * Math.sin(sl), 4 * Math.sin(sl), 0]; P.hd = [fwd ? -26 : -2, 8 * Math.sin(sl + 0.6), 0];
      P.aL = fwd ? [30, 0, 25, 20] : [-15 + 5 * Math.sin(sl), 0, 22, 40]; P.aR = fwd ? [30, 0, 25, 20] : [-25 + 5 * Math.sin(sl + 1), 0, 18, 55];
      P.w = [hasW ? A * fl + 12 : 0, 8, 0, hasW ? A * Math.sin(ph - 0.6) - 4 : 0];
      if (legless) P.fk = [[10, 3, 0], [10, 3, 0]];
      else P.fk = fwd ? [[45, 4, 25, 30], [52, 4, 30, 30]] : [[12 + 6 * Math.sin(sl), 4, 30 + 6 * Math.sin(sl), 25], [6 + 6 * Math.sin(sl + 1), 4, 40, 25]];
      P.tw = 15 * Math.sin(sl); P.a2 = [-30 + 10 * Math.sin(sl), 30, 40];
      return P; };
    clipdefs.push({ name: 'Parado', dur: DI, fps: Math.max(30, Math.min(120, f * 8)), fn: t => hover(t, false), loop: true });
    clipdefs.push({ name: 'Voar', dur: DV, fps: Math.max(30, Math.min(120, f * 8)), fn: t => hover(t, true), loop: true });
    const atk = t => { const P = hover(t, false), u = t / 0.9, w = u < 0.35 ? EASE.io(u / 0.35) : u < 0.5 ? 1 - EASE.in((u - 0.35) / 0.15) * 1.6 : -0.6 + EASE.io((u - 0.5) / 0.5) * 0.6;
      P.aR = [-25 - 125 * Math.max(0, w) + 60 * Math.max(0, -w), 0, 18, 55 - 30 * Math.max(0, -w)]; P.hp[2] = 0.12 * Math.max(0, -w) * 1.6; P.hr[0] += 20 * Math.max(0, -w); P.hd[0] -= 10 * Math.max(0, -w); return P; };
    clipdefs.push({ name: 'Atacar', dur: dur(0.9), fps: 60, fn: atk });
    const cheer = t => { const P = hover(t, false), u = t / dur(1.6); P.hr[1] = 360 * EASE.io(clamp(u / 0.7, 0, 1)); P.hp[1] += 0.12 * Math.sin(Math.PI * clamp(u / 0.7, 0, 1));
      P.aL = [-160, 0, 25, 10]; P.aR = [-160, 0, 25, 10]; return P; };
    clipdefs.push({ name: 'Comemorar', dur: dur(1.6), fps: 60, fn: cheer });
  }
  if (!legless) {
    const T = pesado ? 0.95 : 0.6, Sx = pesado ? 0.2 : 0.16, Dd = 0.6, h = pesado ? 0.06 : 0.05;
    const foot = (u, s) => { let z, lift = 0; if (u < Dd) z = Sx / 2 - Sx * u / Dd; else { const w = (u - Dd) / (1 - Dd); z = -Sx / 2 + Sx * EASE.io(w); lift = h * Math.sin(Math.PI * w); } return [s * LX0, lift, z, 0]; };
    const walk = t => { const P = base(), ph = t / T, c = Math.cos(2 * Math.PI * ph);
      P.ik = [foot(ph % 1, 1), foot((ph + 0.5) % 1, -1)]; P.hp = [0.012 * Math.sin(2 * Math.PI * ph), 0.375 - 0.008 * Math.cos(4 * Math.PI * ph), 0];
      P.hr = [4, -8 * c, (pesado ? 6 : 3) * Math.sin(2 * Math.PI * ph)]; P.ch = [2, 8 * c, 0]; P.hd = [-4, -4 * c, 0];
      P.aL = [-28 * c, 0, 12, 30]; P.aR = [28 * c, 0, 12, 30]; P.w = [hasW ? 4 : 0, 55, 0, 8]; P.tw = 25 * Math.sin(2 * Math.PI * ph); P.a2 = [-20 * c, 20, 30]; return P; };
    clipdefs.push({ name: 'Andar', dur: T, fps: 60, fn: walk, loop: true, v: Sx / (Dd * T) });
    if (!voa) {
      clipdefs.unshift({ name: 'Parado', dur: 2.4, fps: 30, loop: true, fn: t => { const P = stand(t, base()), a = 2 * Math.PI * t / 2.4;
        P.hp = [0.006 * Math.sin(a), 0.385 + 0.004 * Math.sin(a), 0]; P.ch = [-2 * Math.sin(a), 0, 0]; P.hd = [2 * Math.sin(2 * a), 12 * Math.sin(a), 0]; P.aL[0] += 4 * Math.sin(a); P.aR[0] -= 4 * Math.sin(a);
        P.w = [6, 55, 0, 8]; P.tw = 20 * Math.sin(a); return P; } });
      clipdefs.push({ name: 'Atacar', dur: 0.9, fps: 60, fn: t => { const P = stand(t, base()), u = t / 0.9, w = u < 0.35 ? EASE.io(u / 0.35) : u < 0.5 ? 1 - EASE.in((u - 0.35) / 0.15) * 1.6 : -0.6 + EASE.io((u - 0.5) / 0.5) * 0.6;
        P.aR = [-25 - 125 * Math.max(0, w) + 60 * Math.max(0, -w), 0, 18, 55 - 30 * Math.max(0, -w)]; P.hp = [0, 0.37, 0.04 * Math.max(0, -w)]; P.hr = [12 * Math.max(0, -w), -15 * Math.max(0, w), 0]; P.w = [6, 55, 0, 8]; return P; } });
      clipdefs.push({ name: 'Comemorar', dur: 1.4, fps: 60, fn: t => { const u = t / 1.4, j = Math.sin(Math.PI * clamp((u - 0.15) / 0.5, 0, 1)), P = base();
        P.ik = [[LX0, 0.12 * j, 0.01, 20 * j], [-LX0, 0.12 * j, -0.01, 20 * j]]; P.hp = [0, 0.375 + 0.16 * j - 0.03 * Math.sin(Math.PI * clamp(u / 0.2, 0, 1)), 0];
        P.aL = [-160 * EASE.io(clamp(u / 0.3, 0, 1)), 0, 25, 10]; P.aR = [-160 * EASE.io(clamp(u / 0.3, 0, 1)), 0, 25, 10]; P.hd = [12 * j, 0, 0]; P.w = [hasW ? 30 * j : 6, 55 - 40 * j, 0, 8]; return P; } });
    }
  }
  const P0 = finish(kit, skel, chains, S.nome, clipdefs, applyPose, {});
  P0.vel = Object.fromEntries(clipdefs.filter(c => c.v || c.name === 'Voar').map(c => [c.name, c.v || (pesado ? 1.6 : 2.4)]));
  return P0;
}

// ======================================================================= FAMÍLIA B — flutuante
function forgeB(id, S, cfg) {
  const COL = S.cats.cores.cor[cfg.cores];
  const kit = makeKit(v => v.clone()), { add, G } = kit;
  const chains = [];
  const bdef = [['Root', null, [0, 0, 0]], ['Body', 'Root', [0, 0.45, 0]], ['Top', 'Body', [0, 0.65, 0]]];
  const ring = id === 'lumibrim';
  if (ring) bdef.push(['Ring', 'Body', [0, 0.45, 0]]);
  const sp = (k, d, g, max) => ({ k, d, g, max });
  const addChain = (name, label, parent, pts, spr) => chains.push({ name, label, parent, pts, names: pts.slice(0, -1).map((_, i) => name + (i + 1)), end: name + 'End', spring: pts.slice(0, -1).map((_, i) => sp(spr[0] - i * 8, spr[1], spr[2], spr[3] + i * 8)) });
  // correntes por espécie
  if (id === 'fogo-fatuo') { addChain('Chama', 'chama', 'Top', [[0, 0.55, 0], [0, 0.72, -0.02], [0, 0.9, -0.05]], [50, 5, -0.6, 30]); if (cfg.pontas === 'tres') { addChain('ChamaL', 'chama', 'Top', [[0.08, 0.55, 0], [0.13, 0.68, -0.02], [0.15, 0.8, -0.04]], [55, 5, -0.6, 30]); addChain('ChamaR', 'chama', 'Top', [[-0.08, 0.55, 0], [-0.13, 0.68, -0.02], [-0.15, 0.8, -0.04]], [55, 5, -0.6, 30]); } }
  if (id === 'espirito-de-vapor' || id === 'carpideira-veu') for (const [s, L] of [[1, 'L'], [-1, 'R']]) addChain('Braco' + L, 'braços', 'Body', id === 'carpideira-veu' ? [[s * 0.14, 0.62, 0], [s * 0.3, 0.5, 0.04], [s * 0.42, 0.36, 0.06]] : [[s * 0.18, 0.5, 0], [s * 0.32, 0.44, 0.04], [s * 0.42, 0.34, 0.06]], [45, 5, 0.3, 35]);
  if (id === 'espirito-de-vapor' || id === 'fantasminha-lencol' || id === 'carpideira-veu') addChain('Cauda', 'barra', 'Body', id === 'carpideira-veu' ? [[0, 0.4, 0], [0, 0.24, -0.06], [0, 0.08, -0.14]] : [[0, 0.32, 0], [0, 0.2, -0.05], [0, 0.08, -0.12]], [40, 4, 0.2, 35]);
  if (id === 'lanterna-assombrada') addChain('Alca', 'alça', 'Root', [[0, 0.9, 0], [0, 0.78, 0], [0, 0.66, 0]], [30, 3, 0.8, 40]);
  if (id === 'olho-flutuante') { const n = { dois: 2, quatro: 4, seis: 6 }[cfg.tentaculos];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + (n === 2 ? Math.PI / 2 : 0), d = V3(Math.cos(a), 0, Math.sin(a) * 0.6 - 0.4).normalize();
      addChain('Tent' + i, 'tentáculos', 'Body', [V3(0, 0.45, 0).addScaledVector(d, 0.17).add(V3(0, -0.06, 0)).toArray(), V3(0, 0.3, 0).addScaledVector(d, 0.28).toArray(), V3(0, 0.16, 0).addScaledVector(d, 0.34).toArray(), V3(0, 0.04, 0).addScaledVector(d, 0.36).toArray()], [40, 4, 0.3, 35]); } }
  if (id === 'relogio-fantasma') addChain('Pendulo', 'pêndulo', 'Body', [[0, 0.4, 0.05], [0, 0.18, 0.06], [0, 0.06, 0.06]], [6, 0.4, 2.5, 60]);
  if (id === 'mascara-errante') for (const [s, L] of [[1, 'L'], [-1, 'R']]) addChain('Fita' + L, 'fitas', 'Body', [[s * 0.1, 0.48, -0.03], [s * 0.15, 0.36, -0.1], [s * 0.18, 0.24, -0.16], [s * 0.2, 0.12, -0.2]], [30, 3, 0.4, 40]);
  if (id === 'nuvenzinha-chuvosa' && cfg.clima !== 'raio') addChain('Chuva', 'chuva', 'Body', [[0, 0.32, 0], [0, 0.2, 0], [0, 0.08, 0]], [20, 2, 0.3, 40]);
  const skel = buildSkeleton(bdef, chains, v => v);
  kit.setBI(skel.BI);
  const { B } = skel;
  const CW = nm => chainW(chains.find(c => c.name === nm));
  const face = (y, z, style, col = '#1b1712', bone = 'Body', w = 0.06) => {
    for (const s of [1, -1]) { add(style === 'sono' ? G.box(0.04, 0.01, 0.02) : G.box(0.035, 0.045, 0.02), { c: col, b: bone, pos: [s * w, y, z], rot: [0, 0, style === 'travesso' ? s * 20 : 0], jit: 0, vary: 0 });
      if (style !== 'sono' && col === '#1b1712') add(G.box(0.012, 0.012, 0.01), { c: '#fff6e0', b: bone, pos: [s * w - 0.005, y + 0.01, z + 0.01], jit: 0, vary: 0 }); }
    const k = style === 'triste' ? -5 : style === 'bravo' ? -2 : 6;
    add(G.box(style === 'travesso' ? 0.1 : 0.06, 0.012, 0.02), { c: col, b: bone, pos: [0, y - 0.07, z], jit: 0, vary: 0, deform: g => { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) pa.setY(i, pa.getY(i) + k * pa.getX(i) * pa.getX(i)); } });
  };
  const c = COL;
  if (id === 'lumibrim') {
    add(G.ico(0.16, 1), { c: c.brilho, glow: true, b: 'Body', pos: [0, 0.45, 0], jit: 0 });
    add(G.ico(0.2, 1), { c: c.asa, mat: 3, b: 'Body', pos: [0, 0.45, 0], jit: 0 });
    face(0.47, 0.155, 'feliz', hex(c.brilho, 0.35));
    const n = { quatro: 4, seis: 6, oito: 8 }[cfg.asas];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, g = G.flat([[0, 0], [0.08, 0.04], [0.16, 0.0], [0.08, -0.04]]);
      g.rotateX(Math.PI / 2); g.translate(0.2, 0, 0); g.rotateY(a); g.translate(0, 0.45, 0); add(g, { c: c.asa, mat: 3, b: 'Ring', jit: 0 }); }
  }
  if (id === 'fogo-fatuo') {
    add(G.sph(0.14, 9, 7), { c: c.brilho, glow: true, b: 'Body', pos: [0, 0.42, 0], scl: [1, 1.05, 0.9], jit: 0 });
    add(G.sph(0.17, 9, 7), { c: c.claro, mat: 3, b: 'Body', pos: [0, 0.43, 0], scl: [1, 1.1, 0.9], jit: 0 });
    face(0.44, 0.13, cfg.rosto, hex(c.brilho, 0.3));
    for (const ch of chains) { const W = { b: CW(ch.name) }; add(G.tube(ch.pts[0], ch.pts[1], ch.name === 'Chama' ? 0.11 : 0.05, ch.name === 'Chama' ? 0.07 : 0.03, 7), { c: c.brilho, glow: true, jit: 0, ...W });
      add(G.tube(ch.pts[1], ch.pts[2], ch.name === 'Chama' ? 0.07 : 0.03, 0.004, 7), { c: c.claro, glow: true, jit: 0, ...W }); }
  }
  if (id === 'espirito-de-vapor') {
    const M = c.metal, chaleira = cfg.cabeca === 'chaleira';
    add(G.sph(0.17, 10, 7), { c: M, metal: true, b: 'Top', pos: [0, 0.78, 0], scl: chaleira ? [1, 0.85, 1] : [1.05, 0.7, 1.05] });
    add(G.cyl(0.06, 0.08, 0.05, 8), { c: hex(M, 0.8), metal: true, b: 'Top', pos: [0, 0.92, 0] }); add(G.ico(0.025), { c: hex(M, 0.7), metal: true, b: 'Top', pos: [0, 0.96, 0], jit: 0 });
    add(G.tube([0.12, 0.74, 0.05], [0.26, 0.86, 0.1], 0.035, 0.018, 6), { c: M, metal: true, b: 'Top' });
    add(new THREE.TorusGeometry(0.1, 0.018, 5, 10, Math.PI), { c: hex(M, 0.7), metal: true, b: 'Top', pos: [-0.14, 0.8, 0], rot: [0, 90, 90] });
    face(0.79, 0.165, 'feliz', '#f8f0e0', 'Top', 0.055);
    for (const [y, r] of [[0.58, 0.16], [0.45, 0.18], [0.34, 0.14]]) add(G.ico(r, 1), { c: c.vapor, mat: 3, b: 'Body', pos: [0, y, 0], jit: 0.01 });
    for (const ch of chains) { const W = { b: CW(ch.name) }; for (let i = 0; i < ch.pts.length; i++) add(G.ico(0.07 - i * 0.015, 0), { c: c.vapor, mat: 3, pos: ch.pts[i], jit: 0.006, ...W }); }
    add(G.ico(0.05, 0), { c: c.vapor, mat: 3, b: 'Top', pos: [0.3, 0.9, 0.12], jit: 0.005 });
  }
  if (id === 'nuvenzinha-chuvosa') {
    for (const [x, y, z, r] of [[0, 0.5, 0, 0.16], [0.14, 0.45, 0.02, 0.12], [-0.14, 0.46, 0, 0.13], [0.07, 0.58, -0.03, 0.12], [-0.08, 0.57, 0.03, 0.11], [0.22, 0.4, 0, 0.08], [-0.22, 0.41, 0, 0.08]])
      add(G.ico(r, 1), { c: c.nuvem, b: 'Body', pos: [x, y, z], jit: 0.006, vary: 0.05 });
    face(0.49, 0.155, cfg.rosto);
    if (cfg.clima === 'raio') add(G.slab([[0, 0], [0.05, 0], [0.01, -0.1], [0.06, -0.1], [-0.03, -0.26], [0.0, -0.13], [-0.05, -0.13]], 0.02), { c: '#fff070', glow: true, b: 'Body', pos: [0, 0.34, 0], jit: 0 });
    else { const W = { b: CW('Chuva') }; for (let i = 0; i < 9; i++) { const x = ((i % 3) - 1) * 0.1, z = (Math.floor(i / 3) - 1) * 0.07, y = 0.3 - (i * 0.37 % 1) * 0.22;
      add(cfg.clima === 'neve' ? G.octa(0.018) : G.box(0.01, 0.05, 0.01), { c: cfg.clima === 'neve' ? '#ffffff' : c.gota, mat: cfg.clima === 'neve' ? 0 : 3, pos: [x, y, z], jit: 0, ...W }); } }
  }
  if (id === 'fantasminha-lencol') {
    const W = { b: p => p.y > 0.42 ? [['Body', 1]] : CW('Cauda')(p) };
    add(G.sph(0.2, 10, 6, 0, Math.PI / 2), { c: c.pano, b: 'Body', pos: [0, 0.5, 0], vary: 0.04 });
    add(G.cyl(0.2, 0.27, 0.42, 12, true), { c: c.pano, vary: 0.05, pos: [0, 0.29, 0], ...W,
      deform: g => { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) { if (pa.getY(i) < -0.2) { const a = Math.atan2(pa.getZ(i), pa.getX(i)); pa.setY(i, pa.getY(i) + 0.04 * Math.sin(a * 6)); } } } });
    const eo = cfg.olhos;
    for (const s of [1, -1]) {
      if (eo === 'x') { for (const r of [45, -45]) add(G.box(0.05, 0.012, 0.01), { c: '#6a5a4a', b: 'Body', pos: [s * 0.07, 0.55, 0.19], rot: [0, 0, r], jit: 0 }); }
      else add(G.sph(0.035, 7, 5), { c: eo === 'brilho' ? '#a0e0ff' : '#1b1712', glow: eo === 'brilho', b: 'Body', pos: [s * 0.07, 0.55, 0.185], scl: [1, 1.3, 0.4], jit: 0, vary: 0 });
    }
    add(G.sph(0.03, 7, 5), { c: '#1b1712', b: 'Body', pos: [0, 0.46, 0.2], scl: [1.2, 0.8, 0.3], jit: 0, vary: 0 });
    for (const s of [1, -1]) add(G.sph(0.06, 6, 4), { c: c.pano, b: 'Body', pos: [s * 0.22, 0.38, 0.04], scl: [1, 0.7, 0.8] });
    if (cfg.chapeu === 'bruxa') { add(G.cyl(0.25, 0.25, 0.015, 12), { c: '#2a2238', b: 'Body', pos: [0, 0.66, 0] }); add(G.cone(0.13, 0.3, 9), { c: '#2a2238', b: 'Body', pos: [0, 0.81, -0.02], rot: [-12, 0, 0] }); }
    if (cfg.chapeu === 'cartola') { add(G.cyl(0.22, 0.22, 0.015, 12), { c: '#1e1a1a', b: 'Body', pos: [0, 0.67, 0] }); add(G.cyl(0.12, 0.12, 0.2, 10), { c: '#1e1a1a', b: 'Body', pos: [0, 0.77, 0] }); add(G.cyl(0.123, 0.123, 0.03, 10), { c: '#a82a2a', b: 'Body', pos: [0, 0.7, 0] }); }
  }
  if (id === 'lanterna-assombrada') {
    const M = c.metal, red = cfg.forma === 'redonda';
    add(red ? G.sph(0.13, 9, 7) : G.box(0.2, 0.24, 0.2), { c: c.brilho, mat: 3, b: 'Body', pos: [0, 0.45, 0], jit: 0 });
    add(G.ico(0.07, 1), { c: c.brilho, glow: true, b: 'Body', pos: [0, 0.45, 0], jit: 0 });
    face(0.47, red ? 0.135 : 0.105, 'travesso', '#2a1a10', 'Body', 0.04);
    for (const [x, z] of [[0.1, 0.1], [-0.1, 0.1], [0.1, -0.1], [-0.1, -0.1]]) if (!red) add(G.box(0.02, 0.26, 0.02), { c: M, metal: true, b: 'Body', pos: [x, 0.45, z] });
    add(G.cyl(0.14, 0.12, 0.05, red ? 10 : 4), { c: M, metal: true, b: 'Body', pos: [0, 0.6, 0], rot: [0, 45, 0] }); add(G.cone(0.1, 0.08, red ? 10 : 4), { c: M, metal: true, b: 'Body', pos: [0, 0.66, 0], rot: [0, 45, 0] });
    add(G.cyl(0.13, 0.15, 0.04, red ? 10 : 4), { c: M, metal: true, b: 'Body', pos: [0, 0.31, 0], rot: [0, 45, 0] });
    const W = { b: CW('Alca') }; add(new THREE.TorusGeometry(0.05, 0.01, 4, 10), { c: M, metal: true, pos: [0, 0.74, 0], ...W }); add(G.tube([0, 0.7, 0], [0, 0.88, 0], 0.008, 0.008, 4), { c: M, metal: true, ...W });
  }
  if (id === 'carpideira-veu') {
    add(G.cone(0.32, 1.0, 12, true), { c: c.veu, b: p => p.y > 0.55 ? [['Body', 1]] : CW('Cauda')(p), pos: [0, 0.6, -0.02], mat: 3, vary: 0.06,
      deform: g => { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) if (pa.getY(i) < -0.45) { const a = Math.atan2(pa.getZ(i), pa.getX(i)); pa.setY(i, pa.getY(i) + 0.05 * Math.sin(a * 5)); } } });
    add(G.sph(0.13, 9, 7), { c: c.pele, b: 'Top', pos: [0, 0.98, 0.02], scl: [0.9, 1.1, 0.9] });
    add(G.sph(0.16, 9, 6, 0, 1.9, Math.PI / 2 + 0.8, Math.PI * 2 - 1.6), { c: c.veu, b: 'Top', pos: [0, 1.0, 0.0], mat: 3 });
    for (const s of [1, -1]) add(G.box(0.03, 0.04, 0.02), { c: c.brilho, glow: true, b: 'Top', pos: [s * 0.045, 1.0, 0.13], jit: 0 });
    add(cfg.boca === 'grito' ? G.sph(0.03, 7, 5) : G.box(0.04, 0.008, 0.01), { c: '#14110c', b: 'Top', pos: [0, 0.91, 0.125], scl: cfg.boca === 'grito' ? [0.8, 1.4, 0.4] : [1, 1, 1], jit: 0 });
    for (const ch of chains.filter(c2 => c2.name.startsWith('Braco'))) { const W = { b: CW(ch.name) };
      for (let i = 0; i < 2; i++) add(G.tube(ch.pts[i], ch.pts[i + 1], 0.05 - i * 0.015, 0.035 - i * 0.015, 6), { c: c.veu, mat: 3, ...W });
      add(G.sph(0.03, 6, 4), { c: c.pele, pos: ch.pts[2], ...W }); }
  }
  if (id === 'olho-flutuante') {
    add(G.sph(0.18, 12, 9), { c: c.pele, b: 'Body', pos: [0, 0.45, 0], vary: 0.03 });
    add(G.sph(0.09, 10, 6, 0, 0.9), { c: c.iris, b: 'Body', pos: [0, 0.45, 0.1], rot: [90, 0, 0], jit: 0 });
    add(G.sph(0.045, 8, 5), { c: '#14110c', b: 'Body', pos: [0, 0.45, 0.165], scl: [1, 1, 0.4], jit: 0, vary: 0 });
    add(G.box(0.02, 0.02, 0.01), { c: '#ffffff', b: 'Body', pos: [0.03, 0.48, 0.18], jit: 0, vary: 0 });
    add(G.sph(0.19, 12, 5, 0, 0.75), { c: c.tent, b: 'Body', pos: [0, 0.45, 0], rot: [25, 0, 0] });
    for (let i = 0; i < 6; i++) add(G.cone(0.012, 0.05, 4), { c: '#2a1a1a', b: 'Body', pos: [-0.09 + i * 0.036, 0.6, 0.12], rot: [-30, 0, 0], jit: 0 });
    for (const ch of chains) { const W = { b: CW(ch.name) }; const rr = [0.04, 0.03, 0.02, 0.006]; for (let i = 0; i < 3; i++) add(G.tube(ch.pts[i], ch.pts[i + 1], rr[i], rr[i + 1], 6), { c: c.tent, ...W }); }
  }
  if (id === 'relogio-fantasma') {
    const Md = c.madeira, Mt = c.metal;
    add(G.box(0.32, 0.6, 0.18, 3), { c: Md, b: p => p.y > 0.6 ? [['Top', 1]] : [['Body', 1]], pos: [0, 0.55, 0] });
    add(G.cyl(0.12, 0.12, 0.02, 12), { c: '#f0e8d0', b: 'Top', pos: [0, 0.72, 0.095], rot: [90, 0, 0], jit: 0 });
    add(G.box(0.008, 0.08, 0.008), { c: '#1b1712', b: 'Top', pos: [0.0, 0.75, 0.11], rot: [0, 0, -30], jit: 0 }); add(G.box(0.008, 0.06, 0.008), { c: '#1b1712', b: 'Top', pos: [0.02, 0.72, 0.11], rot: [0, 0, 70], jit: 0 });
    add(new THREE.TorusGeometry(0.125, 0.01, 4, 12), { c: Mt, metal: true, b: 'Top', pos: [0, 0.72, 0.1], jit: 0 });
    for (const s of [1, -1]) add(G.box(0.03, 0.04, 0.02), { c: c.brilho, glow: true, b: 'Top', pos: [s * 0.05, 0.9, 0.095], jit: 0 });
    if (cfg.topo === 'coroa') add(G.slab([[-0.18, 0], [0.18, 0], [0.12, 0.08], [0, 0.13], [-0.12, 0.08]], 0.16), { c: Md, b: 'Top', pos: [0, 0.85, 0] });
    else add(G.box(0.36, 0.05, 0.2), { c: hex(Md, 0.85), b: 'Top', pos: [0, 0.87, 0] });
    add(G.box(0.2, 0.32, 0.01), { c: hex(Md, 0.6), b: 'Body', pos: [0, 0.38, 0.092] });
    const W = { b: CW('Pendulo') }; add(G.tube([0, 0.4, 0.1], [0, 0.18, 0.1], 0.006, 0.006, 4), { c: Mt, metal: true, ...W }); add(G.cyl(0.05, 0.05, 0.015, 10), { c: Mt, metal: true, pos: [0, 0.17, 0.1], rot: [90, 0, 0], ...W });
    for (const s of [1, -1]) { add(G.tube([s * 0.16, 0.6, 0], [s * 0.3, 0.45, 0.05], 0.025, 0.02, 5), { c: c.brilho, mat: 3, b: 'Body' }); add(G.sph(0.035, 6, 4), { c: c.brilho, mat: 3, b: 'Body', pos: [s * 0.31, 0.43, 0.06] }); }
  }
  if (id === 'mascara-errante') {
    add(G.sph(0.15, 10, 7, 0, Math.PI, 0, Math.PI), { c: c.mascara, b: 'Body', pos: [0, 0.5, 0], scl: [1, 1.15, 0.5], rot: [0, 0, 0] });
    const ex = cfg.expressao;
    for (const s of [1, -1]) add(G.box(0.05, 0.035, 0.05), { c: c.brilho, glow: true, b: 'Body', pos: [s * 0.055, 0.54, 0.06], rot: [0, 0, s * (ex === 'choro' ? -18 : ex === 'sorriso' ? 14 : 0)], jit: 0 });
    add(G.box(0.1, 0.02, 0.05), { c: '#14110c', b: 'Body', pos: [0, 0.43, 0.06], jit: 0, deform: g => { const pa = g.attributes.position, k = ex === 'sorriso' ? 8 : ex === 'choro' ? -8 : 0; for (let i = 0; i < pa.count; i++) pa.setY(i, pa.getY(i) + k * pa.getX(i) * pa.getX(i)); } });
    for (const ch of chains) { const W = { b: CW(ch.name) }; for (let i = 0; i < 3; i++) add(G.tube(ch.pts[i], ch.pts[i + 1], 0.016, 0.01, 4), { c: c.fita, ...W }); }
  }
  if (id === 'cranio-de-velas') {
    add(G.sph(0.15, 10, 8), { c: c.osso, b: 'Body', pos: [0, 0.46, 0], scl: [1, 0.95, 1.05] });
    add(G.box(0.16, 0.06, 0.12), { c: c.osso, b: 'Body', pos: [0, 0.34, 0.06] });
    for (const s of [1, -1]) add(G.sph(0.04, 7, 5), { c: '#14110c', b: 'Body', pos: [s * 0.055, 0.46, 0.13], scl: [1, 1.1, 0.5], jit: 0, vary: 0 });
    add(G.cone(0.025, 0.04, 3), { c: '#14110c', b: 'Body', pos: [0, 0.4, 0.15], rot: [180, 0, 0], jit: 0 });
    for (let i = 0; i < 5; i++) add(G.box(0.022, 0.03, 0.01), { c: '#f8f4e8', b: 'Body', pos: [-0.044 + i * 0.022, 0.35, 0.125], jit: 0 });
    const n = { uma: 1, tres: 3, cinco: 5 }[cfg.velas];
    for (let i = 0; i < n; i++) { const a = n === 1 ? 0 : (i / (n - 1) - 0.5) * 1.6, x = Math.sin(a) * 0.09, z = -Math.cos(a) * 0.03, h = 0.08 + (i % 2) * 0.04;
      add(G.cyl(0.02, 0.022, h, 7), { c: c.vela, b: 'Top', pos: [x, 0.6 + h / 2, z] }); add(G.cone(0.014, 0.04, 5), { c: c.brilho, glow: true, b: 'Top', pos: [x, 0.62 + h, z], jit: 0 });
      add(G.sph(0.012, 5, 3), { c: c.vela, b: 'Top', pos: [x + 0.015, 0.6 + h * 0.7, z + 0.01], scl: [1, 1.8, 1] }); }
  }
  if (id === 'bolha-sabia') {
    add(G.sph(0.22, 14, 10), { c: c.bolha, mat: 3, b: 'Body', pos: [0, 0.45, 0], jit: 0, vary: 0.15 });
    add(G.sph(0.05, 6, 4), { c: '#ffffff', glow: true, b: 'Body', pos: [0.1, 0.58, 0.15], scl: [1, 0.6, 0.4], jit: 0 });
    face(0.46, 0.2, 'feliz', '#3a4a6a');
    if (cfg.oculos === 'sim') for (const s of [1, -1]) { add(new THREE.TorusGeometry(0.04, 0.007, 4, 10), { c: '#c8a040', metal: true, b: 'Body', pos: [s * 0.06, 0.46, 0.215], jit: 0 }); }
    if (cfg.oculos === 'sim') add(G.box(0.04, 0.006, 0.006), { c: '#c8a040', metal: true, b: 'Body', pos: [0, 0.465, 0.22], jit: 0 });
  }
  // ---------- poses
  const applyPose = P => {
    B.Root.position.set(P.p[0], P.p[1], P.p[2]); B.Root.quaternion.copy(E(P.r));
    B.Body.quaternion.copy(E(P.b)); B.Top.quaternion.copy(E(P.t)); if (B.Ring) B.Ring.quaternion.copy(E([0, P.ring || 0, 0]));
    for (const ch of chains) for (const nm of ch.names) B[nm].quaternion.identity();
    B.Root.updateMatrixWorld(true);
  };
  const DI = 2.0;
  const idle = (t, fwd) => { const a = 2 * Math.PI * t / DI; return { p: [0.01 * Math.sin(a), 0.06 + 0.035 * Math.sin(a) + (fwd ? 0.02 : 0), 0], r: [fwd ? 18 : 0, 6 * Math.sin(a), 3 * Math.sin(2 * a)], b: [3 * Math.sin(a + 1), 0, 0], t: [0, 10 * Math.sin(a + 0.5), 0], ring: 360 * t / DI }; };
  const clipdefs = [
    { name: 'Parado', dur: DI, fps: 30, loop: true, fn: t => idle(t, false) },
    { name: 'Mover', dur: DI / 2, fps: 30, loop: true, v: 1.2, fn: t => { const P = idle(t * 2, true); P.ring = 720 * t / DI; return P; } },
    { name: 'Atacar', dur: 0.9, fps: 60, fn: t => { const P = idle(t, false), u = t / 0.9, w = u < 0.35 ? -EASE.io(u / 0.35) * 0.4 : u < 0.5 ? -0.4 + EASE.out((u - 0.35) / 0.15) * 1.4 : 1 - EASE.io((u - 0.5) / 0.5);
      P.p[2] = 0.18 * w; P.r[0] = 25 * w; P.t[0] = -10 * w; P.ring = 900 * u; return P; } },
    { name: 'Comemorar', dur: 1.6, fps: 60, fn: t => { const P = idle(t, false), u = t / 1.6; P.r[1] = 360 * EASE.io(clamp(u / 0.75, 0, 1)); P.p[1] += 0.15 * Math.sin(Math.PI * clamp(u / 0.75, 0, 1)); P.ring = 1080 * u; return P; } },
  ];
  const P0 = finish(kit, skel, chains, S.nome, clipdefs, applyPose, {});
  P0.vel = { Mover: 1.2 };
  return P0;
}

// ======================================================================= entrada
export function forgeCriatura(id, cfgIn) {
  const S = ESPECIES[id], cfg = { ...baseCfgEsp(id), ...cfgIn };
  const P = S.fam === 'A' ? forgeA(id, S, cfg) : forgeB(id, S, cfg);
  const scale = S.tam * TAMK[cfg.tamanho] / P.nominalH;
  P.root.scale.setScalar(scale);
  P.root.updateMatrixWorld(true);
  P.escala = scale; P.altura = S.tam * TAMK[cfg.tamanho];
  for (const k in P.vel) P.vel[k] *= scale;
  P.id = id; P.cfg = cfg; P.especie = S;
  return P;
}
export function springStep(P, dt) {
  for (const s of P.springs) {
    s.b.updateMatrixWorld(true);
    const head = new THREE.Vector3().setFromMatrixPosition(s.b.matrixWorld), tip = new THREE.Vector3().setFromMatrixPosition(s.c.matrixWorld);
    const sc = P.escala || 1;
    if (!s.P) { s.P = tip.clone(); s.V = new THREE.Vector3(); }
    const nsub = Math.max(1, Math.ceil(dt * 240)), h = dt / nsub;
    for (let i = 0; i < nsub; i++) { const acc = tip.clone().sub(s.P).multiplyScalar(s.k).addScaledVector(s.V, -s.d); acc.y -= s.g * sc; s.V.addScaledVector(acc, h); s.P.addScaledVector(s.V, h); }
    const len = tip.distanceTo(head); s.P.sub(head).setLength(len).add(head);
    let qd = new THREE.Quaternion().setFromUnitVectors(tip.clone().sub(head).normalize(), s.P.clone().sub(head).normalize());
    const ang = 2 * Math.acos(Math.min(1, Math.abs(qd.w))); if (ang > s.max) qd = new THREE.Quaternion().slerp(qd, s.max / ang);
    const qn = qd.multiply(s.b.getWorldQuaternion(new THREE.Quaternion()));
    s.b.quaternion.copy(s.b.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(qn));
    s.b.updateMatrixWorld(true);
  }
}
export const resetSprings = P => P.springs.forEach(s => { s.P = null; });
export function exportGeometry(P) {
  const geo = P.geo, g = new THREE.BufferGeometry(), n = geo.attributes.position.count;
  g.setAttribute('position', geo.attributes.position);
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
