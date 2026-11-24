// Bestiário de Erath — criaturas geradas 100% em código (módulo puro: navegador e Node).
//   import { ESPECIES, ESP_ORDEM, catsOfEsp, baseCfgEsp, randomCfgEsp, nomeVariacao, forgeCriatura, springStep } from './erath_criaturas.js'
//   const P = forgeCriatura('fada-orvalho', baseCfgEsp('fada-orvalho'));  // P.root já na escala real; P.clips; P.springs
// Famílias: A = bípede pequeno com/sem asas (fadas, diabretes, ursos alados); B = flutuante (fantasmas, chamas, olhos...);
// C = quadrúpede com/sem asas (lobo-falcão, javali, alce, tartaruga-de-vento...); D = 6/8 patas (insetos, aranhas, caranguejo); E = serpentes e corpos em corrente (tamanho = comprimento); F = tentáculos e radiais; G = amorfos, rolantes e monopés (com trilhas de escala); H = bípedes grandes e gigantes (poses e IK dos povos).
// Convenções iguais às da Forja: Y para cima, olha para +Z, esquerda dele = +X, metros.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CLIPDEF as POSES_POVO, ik as ikPovo } from './erath_forja.js';

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
// ------------------------------------------------------------ QUADRÚPEDES (família C)
const PAD = { n: 'Pelagem', o: [P_('liso', 'Lisa'), P_('listras', 'Listras'), P_('pintas', 'Pintas')] };
const ESP_C = {
  'lobo-falcao': { num: 27, nome: 'Lobo-falcão', grupo: 'Híbridos alados', fam: 'C', tam: 1.6, voa: true, desc: 'Cabeça de lobo, asas e garras de falcão; corre e decola.',
    cats: { cores: pal({ cinza: { n: 'Cinza', pele: '#8a8a8e', claro: '#dcdad4', escuro: '#4a4a50', asa: '#6a5a4a', asa2: '#e8e0d0' }, pardo: { n: 'Pardo', pele: '#8a6a4a', claro: '#d8c0a0', escuro: '#4a3424', asa: '#7a5a3a', asa2: '#e0c8a0' },
      neve: { n: 'Neve', pele: '#e8e8ec', claro: '#ffffff', escuro: '#9a9aa4', asa: '#d8d8e0', asa2: '#8a8a98' }, noite: { n: 'Noite', pele: '#3a3a44', claro: '#8a8a96', escuro: '#1a1a20', asa: '#2a2a32', asa2: '#6a6a7a' } }),
      padrao: PAD, asas: { n: 'Asas', o: [P_('ave', 'De falcão'), P_('morcego', 'De morcego')] } },
    base: { cores: 'cinza', padrao: 'liso', asas: 'ave' },
    receita: c => ({ corpo: { L: 0.85, R: 0.15, H: 0.42, pesc: 0.16 }, cabeca: { tipo: 'canino', orelhas: 'pontuda' }, cauda: 'peluda', asas: c.asas, pe: 'garra', pelagem: c.padrao, flap: 2.6 }) },
  'gato-morcego': { num: 28, nome: 'Gato-morcego', grupo: 'Híbridos alados', fam: 'C', tam: 0.45, voa: true, desc: 'Asas de membrana, orelhas enormes; pendura-se de cabeça para baixo.',
    cats: { cores: pal({ preto: { n: 'Preto', pele: '#2a2628', claro: '#5a5458', escuro: '#141214', asa: '#3a3036', olho: '#f0d040' }, cinza: { n: 'Cinza', pele: '#7a7a80', claro: '#c8c8cc', escuro: '#3a3a40', asa: '#5a5058', olho: '#80e040' },
      laranja: { n: 'Laranja', pele: '#d88a3a', claro: '#f8e0c0', escuro: '#8a4a1a', asa: '#8a4a3a', olho: '#40c0f0' }, branco: { n: 'Branco', pele: '#ece8e4', claro: '#ffffff', escuro: '#a8a4a0', asa: '#d8b8c0', olho: '#4080f0' } }),
      orelhas: { n: 'Orelhas', o: [P_('enorme', 'Enormes'), P_('felina', 'Normais')] }, padrao: PAD },
    base: { cores: 'preto', orelhas: 'enorme', padrao: 'liso' },
    receita: c => ({ corpo: { L: 0.7, R: 0.15, H: 0.3, pesc: 0.1 }, cabeca: { tipo: 'felino', orelhas: c.orelhas }, cauda: 'fina', asas: 'morcego', pe: 'pata', pelagem: c.padrao, flap: 5 }) },
  'javali-zumbidor': { num: 29, nome: 'Javali-zumbidor', grupo: 'Híbridos alados', fam: 'C', tam: 1.3, voa: true, desc: 'Presas, asas curtas de abelhão; voo zumbido, atropela.',
    cats: { cores: pal({ pardo: { n: 'Pardo', pele: '#6a4a32', claro: '#a8886a', escuro: '#3a2818', extra: '#f0e8d0', asa: '#d8e8f0' }, negro: { n: 'Negro', pele: '#2e2826', claro: '#6a5e58', escuro: '#141010', extra: '#f0e8d0', asa: '#c8d8e8' },
      ruivo: { n: 'Ruivo', pele: '#a85a2a', claro: '#e0a878', escuro: '#5a2a10', extra: '#f8f0d8', asa: '#f0e8c8' } }),
      presas: { n: 'Presas', o: [P_('curvas', 'Curvas'), P_('longas', 'Longas'), P_('quatro', 'Quatro')] }, asas: { n: 'Asas', o: [P_('abelhao', 'Abelhão'), P_('libelula', 'Libélula')] } },
    base: { cores: 'pardo', presas: 'curvas', asas: 'abelhao' },
    receita: c => ({ corpo: { L: 0.9, R: 0.2, H: 0.32, pesc: 0.06 }, cabeca: { tipo: 'suino', presas: c.presas }, cauda: 'curta', asas: c.asas, pe: 'casco', pelagem: 'liso', extras: ['crina'], flap: 9 }) },
  'lebre-cervo-alada': { num: 30, nome: 'Lebre-cervo-alada', grupo: 'Híbridos alados', fam: 'C', tam: 0.5, voa: true, desc: 'Galhadas, asas de pardal; salta e plana.',
    cats: { cores: pal({ campo: { n: 'Campo', pele: '#b08a62', claro: '#f0e0c8', escuro: '#6a4a2a', extra: '#e8dcc0', asa: '#8a6a4a', asa2: '#d8c0a0' }, neve: { n: 'Neve', pele: '#ece8e0', claro: '#ffffff', escuro: '#a8a090', extra: '#d8ccb0', asa: '#d8d0c0', asa2: '#ffffff' },
      cinza: { n: 'Cinza', pele: '#8a8680', claro: '#d8d4cc', escuro: '#4a4640', extra: '#e8dcc0', asa: '#6a6660', asa2: '#c8c4bc' } }),
      galhadas: { n: 'Galhadas', o: [P_('pequenas', 'Pequenas'), P_('grandes', 'Grandes')] } },
    base: { cores: 'campo', galhadas: 'pequenas' },
    receita: c => ({ corpo: { L: 0.55, R: 0.14, H: 0.3, pesc: 0.1 }, cabeca: { tipo: 'lebre', galhadas: c.galhadas }, cauda: 'pompom', asas: 'ave', pe: 'pata', flap: 6 }) },
  'raposa-de-nove-penas': { num: 31, nome: 'Raposa-de-nove-penas', grupo: 'Híbridos alados', fam: 'C', tam: 0.9, voa: false, desc: 'Nove caudas de penas; corre com as caudas abertas em leque.',
    cats: { cores: pal({ fogo: { n: 'Fogo', pele: '#e0702a', claro: '#f8f0e0', escuro: '#3a2418', asa: '#e8a040', asa2: '#ffe0a0' }, neve: { n: 'Neve', pele: '#f0eee8', claro: '#ffffff', escuro: '#8a8a94', asa: '#c8e0f0', asa2: '#ffffff' },
      noite: { n: 'Noite', pele: '#3a3248', claro: '#a898c8', escuro: '#18141e', asa: '#8a6ac8', asa2: '#d0b8ff' }, ouro: { n: 'Ouro', pele: '#d8a840', claro: '#fff4d0', escuro: '#6a4a18', asa: '#f0d070', asa2: '#fff8e0' } }),
      caudas: { n: 'Caudas', o: [P_('nove', 'Nove'), P_('cinco', 'Cinco'), P_('tres', 'Três')] } },
    base: { cores: 'fogo', caudas: 'nove' },
    receita: c => ({ corpo: { L: 0.75, R: 0.13, H: 0.32, pesc: 0.14 }, cabeca: { tipo: 'canino', orelhas: 'grande', focinhoFino: true }, cauda: 'leque', nCaudas: { nove: 9, cinco: 5, tres: 3 }[c.caudas], pe: 'pata', pelagem: 'liso', patasEscuras: true }) },
  'touro-de-ventania': { num: 32, nome: 'Touro-de-ventania', grupo: 'Híbridos alados', fam: 'C', tam: 3.2, voa: true, desc: 'Asas de águia gigantes, chifres em espiral; galopa e voa.',
    cats: { cores: pal({ tempestade: { n: 'Tempestade', pele: '#5a6070', claro: '#a8b0c0', escuro: '#2a2e38', extra: '#e8e0c8', asa: '#6a6a78', asa2: '#e0e4ec' }, castanho: { n: 'Castanho', pele: '#6a4430', claro: '#b08a6a', escuro: '#2e1c12', extra: '#f0e8d0', asa: '#7a5a3a', asa2: '#f0e0c0' },
      branco: { n: 'Branco', pele: '#e8e4dc', claro: '#ffffff', escuro: '#9a948a', extra: '#c8a860', asa: '#e0dcd4', asa2: '#ffffff' } }),
      chifres: { n: 'Chifres', o: [P_('espiral', 'Espiral'), P_('curvos', 'Curvos'), P_('retos', 'Retos')] } },
    base: { cores: 'tempestade', chifres: 'espiral' },
    receita: c => ({ corpo: { L: 1.0, R: 0.22, H: 0.42, pesc: 0.1 }, cabeca: { tipo: 'bovino', chifres: c.chifres }, cauda: 'tufo', asas: 'ave', pe: 'casco', pesado: true, flap: 1.4 }) },
  'leao-cometa': { num: 33, nome: 'Leão-cometa', grupo: 'Híbridos alados', fam: 'C', tam: 2.0, voa: true, desc: 'Juba de fogo, asas de chama; voo rápido.',
    cats: { cores: pal({ solar: { n: 'Solar', pele: '#d8a050', claro: '#f8e0b0', escuro: '#8a5a20', brilho: '#ff8a20', asa: '#ffb040', asa2: '#ffe080' }, azul: { n: 'Cometa azul', pele: '#c8b890', claro: '#f0e8d8', escuro: '#6a5a40', brilho: '#40a8ff', asa: '#60c0ff', asa2: '#c0f0ff' },
      rubro: { n: 'Rubro', pele: '#b0603a', claro: '#e8b090', escuro: '#5a2a14', brilho: '#ff4020', asa: '#ff6030', asa2: '#ffc080' } }),
      juba: { n: 'Juba', o: [P_('fogo', 'De fogo'), P_('pelo', 'De pelo')] } },
    base: { cores: 'solar', juba: 'fogo' },
    receita: c => ({ corpo: { L: 0.95, R: 0.18, H: 0.42, pesc: 0.12 }, cabeca: { tipo: 'felino', orelhas: 'redonda' }, cauda: 'tufoFogo', asas: 'chama', pe: 'pata', extras: [c.juba === 'fogo' ? 'jubaFogo' : 'juba'], flap: 2 }) },
  'tartaruga-de-vento': { num: 34, nome: 'Tartaruga-de-vento', grupo: 'Híbridos alados', fam: 'C', tam: 1.1, voa: true, desc: 'Casco com 4 nadadeiras que batem como asas; "nada" no ar.',
    cats: { cores: pal({ mar: { n: 'Mar', pele: '#6a9a7a', claro: '#c8e0c8', escuro: '#3a5a4a', extra: '#6a5a3a', casco2: '#a88a5a' }, coral: { n: 'Coral', pele: '#c8806a', claro: '#f0d0c0', escuro: '#7a3a2a', extra: '#6a3a3a', casco2: '#e0a070' },
      ceu: { n: 'Céu', pele: '#7aa0c8', claro: '#d8e8f8', escuro: '#3a5a7a', extra: '#3a4a6a', casco2: '#a8c8e8' } }),
      casco: { n: 'Casco', o: [P_('placas', 'Placas'), P_('espinhos', 'Espinhos'), P_('musgo', 'Musgo')] } },
    base: { cores: 'mar', casco: 'placas' },
    receita: c => ({ corpo: { L: 0.8, R: 0.2, H: 0.22, pesc: 0.14 }, cabeca: { tipo: 'tartaruga' }, cauda: 'curta', pe: 'nadadeira', extras: ['casco-' + c.casco], nadaNoAr: true, flap: 1.2 }) },
  'cao-libelula': { num: 35, nome: 'Cão-libélula', grupo: 'Híbridos alados', fam: 'C', tam: 0.7, voa: true, desc: '4 asas de libélula, olhos compostos; paira como helicóptero.',
    cats: { cores: pal({ caramelo: { n: 'Caramelo', pele: '#c88a4a', claro: '#f0d8b0', escuro: '#6a4220', asa: '#c8f0e8', olho: '#40c8a0' }, malhado: { n: 'Malhado', pele: '#e8e0d4', claro: '#ffffff', escuro: '#3a3230', asa: '#d8e0ff', olho: '#5080f0' },
      preto: { n: 'Preto', pele: '#2e2a28', claro: '#7a706a', escuro: '#141210', asa: '#e8d8ff', olho: '#c050f0' } }),
      orelhas: { n: 'Orelhas', o: [P_('caida', 'Caídas'), P_('pontuda', 'Pontudas')] }, olhos: { n: 'Olhos', o: [P_('compostos', 'Compostos'), P_('normais', 'Normais')] } },
    base: { cores: 'caramelo', orelhas: 'caida', olhos: 'compostos' },
    receita: c => ({ corpo: { L: 0.7, R: 0.14, H: 0.3, pesc: 0.12 }, cabeca: { tipo: 'canino', orelhas: c.orelhas, olhosCompostos: c.olhos === 'compostos' }, cauda: 'curta', asas: 'libelula', pe: 'pata', pelagem: c.cores === 'malhado' ? 'pintas' : 'liso', flap: 7 }) },
  'cabra-abutre': { num: 38, nome: 'Cabra-abutre', grupo: 'Híbridos alados', fam: 'C', tam: 1.2, voa: true, desc: 'Cabeça de cabra, asas de abutre; escala paredões e plana.',
    cats: { cores: pal({ rocha: { n: 'Rocha', pele: '#8a7a6a', claro: '#d0c4b4', escuro: '#3a3028', extra: '#d8ccb0', asa: '#3a3430', asa2: '#8a8070' }, neve: { n: 'Neve', pele: '#e0dcd4', claro: '#ffffff', escuro: '#8a847a', extra: '#c8b890', asa: '#4a4440', asa2: '#c8c0b0' },
      negra: { n: 'Negra', pele: '#3a3432', claro: '#7a706a', escuro: '#1a1616', extra: '#e8dcc0', asa: '#22201e', asa2: '#5a5450' } }),
      chifres: { n: 'Chifres', o: [P_('curvos', 'Curvos'), P_('espiral', 'Espiral'), P_('retos', 'Retos')] } },
    base: { cores: 'rocha', chifres: 'curvos' },
    receita: c => ({ corpo: { L: 0.75, R: 0.15, H: 0.42, pesc: 0.14 }, cabeca: { tipo: 'caprino', chifres: c.chifres }, cauda: 'curta', asas: 'ave', pe: 'casco', extras: ['gola-penas'], flap: 2.2 }) },
  'musgoforte': { num: 39, nome: 'Musgoforte', grupo: 'Quadrúpedes', fam: 'C', tam: 3.5, voa: false, desc: 'Costas cobertas de floresta, patas de elefante; passo lento.',
    cats: { cores: pal({ pedra: { n: 'Pedra', pele: '#7a756e', claro: '#a8a29a', escuro: '#4a4640', extra: '#e8e0c8', musgo: '#5a8a3a' }, terra: { n: 'Terra', pele: '#7a5a42', claro: '#a88a6a', escuro: '#3a2a1e', extra: '#f0e8d0', musgo: '#6a9a3a' },
      cinza: { n: 'Cinza-azul', pele: '#6a7480', claro: '#a0aab4', escuro: '#3a424a', extra: '#e8e0d0', musgo: '#4a7a5a' } }),
      costas: { n: 'Costas', o: [P_('floresta', 'Floresta'), P_('flores', 'Flores'), P_('cogumelos', 'Cogumelos')] } },
    base: { cores: 'pedra', costas: 'floresta' },
    receita: c => ({ corpo: { L: 1.0, R: 0.28, H: 0.4, pesc: 0.04 }, cabeca: { tipo: 'paquiderme' }, cauda: 'fina', pe: 'grossa', extras: ['musgo-' + c.costas], pesado: true }) },
  'cavalo-de-nevoa': { num: 41, nome: 'Cavalo-de-névoa', grupo: 'Quadrúpedes', fam: 'C', tam: 1.8, voa: false, desc: 'Cascos que viram fumaça; galope silencioso.',
    cats: { cores: pal({ prata: { n: 'Prata', pele: '#b8bcc4', claro: '#e8ecf0', escuro: '#5a5e66', crina: '#e8f0ff' }, noite: { n: 'Noite', pele: '#3a3e4e', claro: '#6a7080', escuro: '#1a1c24', crina: '#a0b0ff' },
      aurora: { n: 'Aurora', pele: '#d8c8e0', claro: '#f8f0ff', escuro: '#7a6a8a', crina: '#b0ffe0' }, cinza: { n: 'Cinza', pele: '#8a8a8a', claro: '#c8c8c8', escuro: '#4a4a4a', crina: '#e0e0e0' } }),
      crina: { n: 'Crina', o: [P_('longa', 'Longa'), P_('curta', 'Curta')] } },
    base: { cores: 'prata', crina: 'longa' },
    receita: c => ({ corpo: { L: 0.95, R: 0.17, H: 0.55, pesc: 0.22 }, cabeca: { tipo: 'equino' }, cauda: 'fumaca', pe: 'fumaca', extras: ['crina-' + c.crina] }) },
  'pangolim-blindado': { num: 42, nome: 'Pangolim-blindado', grupo: 'Quadrúpedes', fam: 'C', tam: 0.7, voa: false, desc: 'Escamas em placas; anda e rola em bola.',
    cats: { cores: pal({ bronze: { n: 'Bronze', pele: '#a07a4a', claro: '#d8c0a0', escuro: '#5a3e22', escama: '#8a6038' }, oliva: { n: 'Oliva', pele: '#7a7a4a', claro: '#c8c8a0', escuro: '#3e3e22', escama: '#6a6a3a' },
      ferro: { n: 'Ferro', pele: '#6a6a70', claro: '#b0b0b4', escuro: '#34343a', escama: '#5a5a62' } }),
      escamas: { n: 'Escamas', o: [P_('lisas', 'Lisas'), P_('pontudas', 'Pontudas')] } },
    base: { cores: 'bronze', escamas: 'lisas' },
    receita: c => ({ corpo: { L: 0.9, R: 0.16, H: 0.2, pesc: 0.05 }, cabeca: { tipo: 'pangolim' }, cauda: 'escamas', pe: 'garra', extras: ['escamas-' + c.escamas] }) },
  'texugo-trovao': { num: 43, nome: 'Texugo-trovão', grupo: 'Quadrúpedes', fam: 'C', tam: 0.6, voa: false, desc: 'Listra que solta faíscas, garras de cavar; cava túneis.',
    cats: { cores: pal({ classico: { n: 'Clássico', pele: '#4a4644', claro: '#e8e4e0', escuro: '#1a1818', brilho: '#60c8ff' }, ocre: { n: 'Ocre', pele: '#7a6a4a', claro: '#f0e8d0', escuro: '#3a3020', brilho: '#ffe040' },
      ardosia: { n: 'Ardósia', pele: '#3a4250', claro: '#d0d8e4', escuro: '#181c24', brilho: '#c070ff' } }),
      faiscas: { n: 'Faíscas', o: [P_('listra', 'Listra'), P_('pontas', 'Pontas no pelo')] } },
    base: { cores: 'classico', faiscas: 'listra' },
    receita: c => ({ corpo: { L: 0.75, R: 0.17, H: 0.2, pesc: 0.05 }, cabeca: { tipo: 'texugo' }, cauda: 'curta', pe: 'garra', extras: [c.faiscas === 'listra' ? 'listra-brilho' : 'pontas-brilho'] }) },
  'alce-lanterna': { num: 44, nome: 'Alce-lanterna', grupo: 'Quadrúpedes', fam: 'C', tam: 2.4, voa: false, desc: 'Galhadas com lanternas penduradas; passo solene.',
    cats: { cores: pal({ castanho: { n: 'Castanho', pele: '#5a4030', claro: '#9a7a5a', escuro: '#2a1c12', extra: '#e8dcc0', brilho: '#ffc050' }, cinza: { n: 'Cinza', pele: '#6a6460', claro: '#a8a29c', escuro: '#34302c', extra: '#f0e8d8', brilho: '#a0e0ff' },
      musgo: { n: 'Musgo', pele: '#4a5038', claro: '#8a9070', escuro: '#22261a', extra: '#d8d0a8', brilho: '#b0ff80' } }),
      galhadas: { n: 'Galhadas', o: [P_('palmadas', 'Palmadas'), P_('ramos', 'Ramificadas')] }, lanternas: { n: 'Lanternas', o: [P_('quatro', 'Quatro'), P_('duas', 'Duas'), P_('seis', 'Seis')] } },
    base: { cores: 'castanho', galhadas: 'palmadas', lanternas: 'quatro' },
    receita: c => ({ corpo: { L: 1.0, R: 0.2, H: 0.55, pesc: 0.18 }, cabeca: { tipo: 'cervideo', galhadas: c.galhadas, lanternas: { duas: 2, quatro: 4, seis: 6 }[c.lanternas], grande: true }, cauda: 'curta', pe: 'casco', extras: ['barbela'] }) },
  'rinoceronte-cristal': { num: 45, nome: 'Rinoceronte-cristal', grupo: 'Quadrúpedes', fam: 'C', tam: 2.0, voa: false, desc: 'Chifre de cristal, pele de gema; investida.',
    cats: { cores: pal({ ametista: { n: 'Ametista', pele: '#7a7480', claro: '#b0aab8', escuro: '#3a3640', brilho: '#c080ff', cristal: '#d8b0ff' }, esmeralda: { n: 'Esmeralda', pele: '#6a7a70', claro: '#a8b8ac', escuro: '#323e36', brilho: '#50ff90', cristal: '#b0ffd0' },
      safira: { n: 'Safira', pele: '#6a7488', claro: '#a8b2c4', escuro: '#323a4a', brilho: '#50a0ff', cristal: '#b0d8ff' }, rubi: { n: 'Rubi', pele: '#806a6a', claro: '#c0a8a8', escuro: '#403232', brilho: '#ff5060', cristal: '#ffb0b8' } }),
      chifres: { n: 'Chifres', o: [P_('um', 'Um'), P_('dois', 'Dois')] } },
    base: { cores: 'ametista', chifres: 'dois' },
    receita: c => ({ corpo: { L: 1.0, R: 0.26, H: 0.36, pesc: 0.04 }, cabeca: { tipo: 'rinoceronte', chifres: c.chifres }, cauda: 'fina', pe: 'grossa', extras: ['cristais-costas'], pesado: true }) },
  'camelo-de-tres-corcovas': { num: 46, nome: 'Camelo-de-três-corcovas', grupo: 'Quadrúpedes', fam: 'C', tam: 2.4, voa: false, desc: 'Corcovas com água luminosa; passo ondulante.',
    cats: { cores: pal({ areia: { n: 'Areia', pele: '#c8a070', claro: '#f0d8b0', escuro: '#6a4a28', agua: '#60c8ff' }, ferrugem: { n: 'Ferrugem', pele: '#a8683a', claro: '#e0b080', escuro: '#5a3018', agua: '#50ffc0' },
      branco: { n: 'Branco', pele: '#e8e0d0', claro: '#ffffff', escuro: '#a09480', agua: '#a080ff' } }),
      corcovas: { n: 'Corcovas', o: [P_('tres', 'Três'), P_('duas', 'Duas')] } },
    base: { cores: 'areia', corcovas: 'tres' },
    receita: c => ({ corpo: { L: 1.0, R: 0.18, H: 0.6, pesc: 0.32 }, cabeca: { tipo: 'camelo' }, cauda: 'fina', pe: 'casco', extras: ['corcovas-' + c.corcovas] }) },
  'hiena-de-ossos': { num: 47, nome: 'Hiena-de-ossos', grupo: 'Quadrúpedes', fam: 'C', tam: 0.9, voa: false, desc: 'Costelas por fora; ri enquanto trota.',
    cats: { cores: pal({ savana: { n: 'Savana', pele: '#b0946a', claro: '#e0ccaa', escuro: '#4a3a24', extra: '#f0e8d4' }, cinza: { n: 'Cinza', pele: '#8a8680', claro: '#c8c4bc', escuro: '#3a3834', extra: '#ece4d4' },
      fuligem: { n: 'Fuligem', pele: '#4a4440', claro: '#8a8078', escuro: '#1a1816', extra: '#d8d0c0' } }),
      ossos: { n: 'Ossos', o: [P_('costelas', 'Costelas'), P_('espinha', 'Espinha e costelas')] } },
    base: { cores: 'savana', ossos: 'costelas' },
    receita: c => ({ corpo: { L: 0.75, R: 0.15, H: 0.38, pesc: 0.12 }, cabeca: { tipo: 'canino', orelhas: 'redonda', focinhoCurto: true }, cauda: 'curta', pe: 'pata', pelagem: 'pintas', extras: ['ossos-' + c.ossos, 'crina'], dianteiraAlta: true }) },
  'capivara-ancia': { num: 48, nome: 'Capivara-anciã', grupo: 'Quadrúpedes', fam: 'C', tam: 0.75, voa: false, desc: 'Pássaros e sapos morando nas costas.',
    cats: { cores: pal({ terra: { n: 'Terra', pele: '#8a6a4a', claro: '#b8987a', escuro: '#4a3424' }, cinza: { n: 'Cinza', pele: '#7a7068', claro: '#b0a69c', escuro: '#3e3832' }, dourada: { n: 'Dourada', pele: '#b08a50', claro: '#e0c090', escuro: '#5a4220' } }),
      passageiros: { n: 'Nas costas', o: [P_('passaros', 'Pássaros'), P_('sapos', 'Sapos'), P_('ambos', 'Os dois')] } },
    base: { cores: 'terra', passageiros: 'ambos' },
    receita: c => ({ corpo: { L: 0.85, R: 0.2, H: 0.22, pesc: 0.04 }, cabeca: { tipo: 'capivara' }, cauda: 'nenhuma', pe: 'pata', extras: ['passageiros-' + c.passageiros] }) },
  'tigre-de-papel': { num: 49, nome: 'Tigre-de-papel', grupo: 'Quadrúpedes', fam: 'C', tam: 1.4, voa: false, desc: 'Corpo de origami; movimento em dobras.',
    cats: { cores: pal({ branco: { n: 'Papel branco', pele: '#f0ece2', claro: '#ffffff', escuro: '#2a2626' }, vermelho: { n: 'Papel vermelho', pele: '#d84a3a', claro: '#f0c0a0', escuro: '#3a1a14' },
      dourado: { n: 'Papel dourado', pele: '#e0b84a', claro: '#fff0c0', escuro: '#4a3010' }, azul: { n: 'Papel azul', pele: '#4a7ac8', claro: '#c8d8f0', escuro: '#18243a' } }),
      listras: { n: 'Tinta', o: [P_('listras', 'Listras'), P_('liso', 'Sem tinta')] } },
    base: { cores: 'branco', listras: 'listras' },
    receita: c => ({ corpo: { L: 1.0, R: 0.16, H: 0.42, pesc: 0.1 }, cabeca: { tipo: 'felino', orelhas: 'felina' }, cauda: 'fina', pe: 'pata', pelagem: c.listras, origami: true }) },
  'bisonte-de-pedra': { num: 50, nome: 'Bisonte-de-pedra', grupo: 'Quadrúpedes', fam: 'C', tam: 2.4, voa: false, desc: 'Corcova de rocha, barba de líquen; anda em manada.',
    cats: { cores: pal({ basalto: { n: 'Basalto', pele: '#4a3a30', claro: '#7a6a5a', escuro: '#22180f', extra: '#e8e0c8', rocha: '#6a6662', liquen: '#7a9a5a' }, arenito: { n: 'Arenito', pele: '#7a5a3a', claro: '#a88a68', escuro: '#3a2818', extra: '#f0e8d0', rocha: '#b89a72', liquen: '#a8b860' },
      granito: { n: 'Granito', pele: '#5a5450', claro: '#8a847e', escuro: '#2a2624', extra: '#e0d8c8', rocha: '#9a9692', liquen: '#5a8a6a' } }),
      liquen: { n: 'Líquen', o: [P_('barba', 'Barba de líquen'), P_('pouco', 'Pouco')] } },
    base: { cores: 'basalto', liquen: 'barba' },
    receita: c => ({ corpo: { L: 1.0, R: 0.26, H: 0.38, pesc: 0.04 }, cabeca: { tipo: 'bovino', chifres: 'curtos', barba: c.liquen === 'barba' }, cauda: 'tufo', pe: 'casco', extras: ['corcova-pedra'], pesado: true, dianteiraAlta: true }) },
  'furao-de-fogo': { num: 51, nome: 'Furão-de-fogo', grupo: 'Quadrúpedes', fam: 'C', tam: 0.3, voa: false, desc: 'Corpo comprido, cauda em brasa; corre ondulando.',
    cats: { cores: pal({ brasa: { n: 'Brasa', pele: '#8a4a2a', claro: '#e8c0a0', escuro: '#3a1a0e', brilho: '#ff7a20' }, cinza: { n: 'Cinza', pele: '#6a6260', claro: '#d8d0cc', escuro: '#2a2422', brilho: '#ffb030' }, azul: { n: 'Fogo-azul', pele: '#3a3a4a', claro: '#c8c8d8', escuro: '#14141c', brilho: '#40a0ff' } }),
      mascara: { n: 'Rosto', o: [P_('mascara', 'Máscara'), P_('liso', 'Liso')] } },
    base: { cores: 'brasa', mascara: 'mascara' },
    receita: c => ({ corpo: { L: 1.1, R: 0.1, H: 0.14, pesc: 0.12 }, cabeca: { tipo: 'furao', mascara: c.mascara === 'mascara' }, cauda: 'fogo', pe: 'pata' }) },
  'ovelha-nuvem': { num: 52, nome: 'Ovelha-nuvem', grupo: 'Quadrúpedes', fam: 'C', tam: 0.9, voa: false, desc: 'Lã de nuvem; flutua um palmo acima do chão.',
    cats: { cores: pal({ branca: { n: 'Branca', pele: '#2a2624', claro: '#4a4440', la: '#f4f6fa' }, rosa: { n: 'Pôr do sol', pele: '#3a2a2a', claro: '#5a4444', la: '#f8d8d8' }, tempestade: { n: 'Tempestade', pele: '#1a1a20', claro: '#3a3a44', la: '#8a909a' } }),
      chifres: { n: 'Chifres', o: [P_('nenhum', 'Nenhum'), P_('enrolados', 'Enrolados')] } },
    base: { cores: 'branca', chifres: 'nenhum' },
    receita: c => ({ corpo: { L: 0.75, R: 0.18, H: 0.28, pesc: 0.08 }, cabeca: { tipo: 'ovino', chifres: c.chifres }, cauda: 'pompomLa', pe: 'casco', extras: ['la'], flutua: true }) },
  'cristalino': { num: 106, nome: 'Cristalino', grupo: 'Elementais', fam: 'C', tam: 0.9, voa: false, desc: 'Quadrúpede de cristal facetado; passo tilintante.',
    cats: { cores: pal({ quartzo: { n: 'Quartzo', pele: '#e0e4f0', claro: '#ffffff', escuro: '#a0a8c0', brilho: '#c0e8ff', cristal: '#e8f0ff' }, ametista: { n: 'Ametista', pele: '#b090d8', claro: '#e8d8ff', escuro: '#6a4a90', brilho: '#e0a0ff', cristal: '#d8b8ff' },
      citrino: { n: 'Citrino', pele: '#e8c060', claro: '#fff0c0', escuro: '#a07a20', brilho: '#ffe070', cristal: '#fff0b0' }, jade: { n: 'Jade', pele: '#6ac090', claro: '#c8f0d8', escuro: '#2a7050', brilho: '#80ffb0', cristal: '#b8ffd8' } }),
      pontas: { n: 'Pontas', o: [P_('muitas', 'Muitas'), P_('poucas', 'Poucas')] } },
    base: { cores: 'quartzo', pontas: 'muitas' },
    receita: c => ({ corpo: { L: 0.75, R: 0.15, H: 0.38, pesc: 0.12 }, cabeca: { tipo: 'cristal' }, cauda: 'cristal', pe: 'cristal', extras: ['cristais-' + c.pontas], corpoCristal: true }) },
  'gato-enfaixado': { num: 121, nome: 'Gato-enfaixado', grupo: 'Espectrais', fam: 'C', tam: 0.4, voa: false, desc: 'Faixas de múmia, olhos verdes; furtivo.',
    cats: { cores: pal({ areia: { n: 'Areia', pele: '#3a3028', claro: '#e8dcc0', escuro: '#1a1410', brilho: '#60ff70', faixa: '#e0d4b4' }, cinza: { n: 'Cinza', pele: '#2a2a2e', claro: '#d0ccc4', escuro: '#141416', brilho: '#60e0ff', faixa: '#c8c4bc' },
      ouro: { n: 'Real', pele: '#2a2018', claro: '#e8d8a8', escuro: '#120c08', brilho: '#ffd040', faixa: '#e8dcb8' } }),
      faixas: { n: 'Faixas', o: [P_('muitas', 'Muitas'), P_('soltas', 'Soltas')] } },
    base: { cores: 'areia', faixas: 'muitas' },
    receita: c => ({ corpo: { L: 0.7, R: 0.13, H: 0.3, pesc: 0.1 }, cabeca: { tipo: 'felino', orelhas: 'felina', olhosBrilho: true }, cauda: 'fina', pe: 'pata', extras: ['faixas-' + c.faixas] }) },
  'behemote-de-chifre': { num: 133, nome: 'Behemote-de-chifre', grupo: 'Gigantes', fam: 'C', tam: 10, voa: false, desc: 'Chifres em arco; trote que treme o chão.',
    cats: { cores: pal({ obsidiana: { n: 'Obsidiana', pele: '#3a3438', claro: '#6a6066', escuro: '#18141a', extra: '#e8dcc0', rocha: '#4a4448' }, ocre: { n: 'Ocre', pele: '#8a5a3a', claro: '#b8886a', escuro: '#3a2214', extra: '#f0e4cc', rocha: '#a07a5a' },
      musgo: { n: 'Musgo antigo', pele: '#4a5040', claro: '#7a8068', escuro: '#22261c', extra: '#d8d0b0', rocha: '#6a7058' } }),
      chifres: { n: 'Chifres', o: [P_('arco', 'Em arco'), P_('curvos', 'Curvos'), P_('espiral', 'Espiral')] } },
    base: { cores: 'obsidiana', chifres: 'arco' },
    receita: c => ({ corpo: { L: 1.05, R: 0.3, H: 0.4, pesc: 0.04 }, cabeca: { tipo: 'bovino', chifres: c.chifres, grande: true }, cauda: 'tufo', pe: 'grossa', extras: ['corcova-pedra', 'placas-costas'], pesado: true, dianteiraAlta: true }) },
  'cao-armadura': { num: 146, nome: 'Cão-armadura', grupo: 'Constructos', fam: 'C', tam: 0.8, voa: false, desc: 'Armadura de cão sem ninguém dentro; trote.',
    cats: { cores: pal({ ferro: { n: 'Ferro', pele: '#8a9098', claro: '#c0c6ce', escuro: '#3a3e44', brilho: '#60c8ff' }, bronze: { n: 'Bronze', pele: '#b07a40', claro: '#e0b070', escuro: '#5a3a18', brilho: '#ffb040' }, negro: { n: 'Aço negro', pele: '#3a3c42', claro: '#6a6e76', escuro: '#18191c', brilho: '#ff4040' } }),
      orelhas: { n: 'Orelhas', o: [P_('pontuda', 'Pontudas'), P_('caida', 'Caídas')] } },
    base: { cores: 'ferro', orelhas: 'pontuda' },
    receita: c => ({ corpo: { L: 0.75, R: 0.15, H: 0.38, pesc: 0.12 }, cabeca: { tipo: 'canino', orelhas: c.orelhas, armadura: true }, cauda: 'curta', pe: 'pata', armadura: true }) },
};
Object.assign(ESPECIES, ESP_C);

// ------------------------------------------------------------ 6 E 8 PATAS (família D)
const ESP_D = {
  'lagarto-carroca': { num: 40, nome: 'Lagarto-carroça', grupo: 'Quadrúpedes', fam: 'D', tam: 1.4, desc: '6 patas curtas, costas planas de carga; trote estável.',
    cats: { cores: pal({ musgo: { n: 'Musgo', pele: '#6a8a4a', claro: '#c8d8a0', escuro: '#3a4a2a', extra: '#8a6a42' }, deserto: { n: 'Deserto', pele: '#c8a060', claro: '#f0e0b0', escuro: '#7a5a28', extra: '#6a4a2a' },
      cinza: { n: 'Cinza', pele: '#7a8088', claro: '#c8ccd0', escuro: '#3a3e44', extra: '#7a5a3a' } }),
      carga: { n: 'Carga', o: [P_('caixas', 'Caixas'), P_('barris', 'Barris'), P_('sela', 'Sela dupla')] } },
    base: { cores: 'musgo', carga: 'caixas' },
    receita: c => ({ pares: 3, corpo: 'lagarto', cabeca: 'lagarto', cauda: 'lagarto', extras: ['carga-' + c.carga], perna: 0.6 }) },
  'besouro-armadura': { num: 65, nome: 'Besouro-armadura', grupo: 'Insetos', fam: 'D', tam: 1.0, voa: true, desc: 'Chifre de rinoceronte, élitros metálicos; anda e voa pesado.',
    cats: { cores: pal({ esmeralda: { n: 'Esmeralda', pele: '#1e5a3a', claro: '#3ac880', escuro: '#0e2a1a', extra: '#2a2622', asa: '#d8e8e0' }, bronze: { n: 'Bronze', pele: '#6a3a1a', claro: '#e0904a', escuro: '#2a160a', extra: '#2a2622', asa: '#f0e0d0' },
      safira: { n: 'Safira', pele: '#1a2a6a', claro: '#4a80f0', escuro: '#0a1230', extra: '#22242a', asa: '#d8e0f8' }, rubi: { n: 'Rubi', pele: '#6a1a24', claro: '#f04a60', escuro: '#2a0a10', extra: '#2a2224', asa: '#f8e0e4' } }),
      chifre: { n: 'Chifre', o: [P_('rinoceronte', 'Rinoceronte'), P_('pinca', 'Pinça de veado'), P_('tridente', 'Três pontas')] } },
    base: { cores: 'esmeralda', chifre: 'rinoceronte' },
    receita: c => ({ pares: 3, corpo: 'besouro', cabeca: 'besouro', chifre: c.chifre, asas: 'besouro', metal: true, perna: 0.55, flap: 9 }) },
  'aranha-tapeceira': { num: 66, nome: 'Aranha-tapeceira', grupo: 'Insetos', fam: 'D', tam: 0.9, desc: '8 patas, abdômen com desenho de tapete; sobe paredes.',
    cats: { cores: pal({ persa: { n: 'Persa', pele: '#5a2a24', claro: '#e0b060', escuro: '#2a1210', extra: '#2a4a8a' }, oasis: { n: 'Oásis', pele: '#1e4a4a', claro: '#e8d090', escuro: '#0e2424', extra: '#c84a3a' },
      noite: { n: 'Noite', pele: '#2a2438', claro: '#c8b0f0', escuro: '#121018', extra: '#e8c040' } }),
      desenho: { n: 'Desenho', o: [P_('losangos', 'Losangos'), P_('listras', 'Listras'), P_('medalhao', 'Medalhão')] }, pelos: { n: 'Pelos', o: [P_('sim', 'Peluda'), P_('nao', 'Lisa')] } },
    base: { cores: 'persa', desenho: 'losangos', pelos: 'sim' },
    receita: c => ({ pares: 4, corpo: 'aranha', cabeca: 'aranha', desenho: c.desenho, pelos: c.pelos === 'sim', perna: 1.25 }) },
  'louva-espadachim': { num: 67, nome: 'Louva-espadachim', grupo: 'Insetos', fam: 'D', tam: 1.8, desc: 'Braços de foice, postura ereta; luta de guarda alta.',
    cats: { cores: pal({ folha: { n: 'Folha', pele: '#6aa84a', claro: '#c8f0a0', escuro: '#2a5a1e', extra: '#e8f0c8' }, orquidea: { n: 'Orquídea', pele: '#e8a8c8', claro: '#fff0f8', escuro: '#a85a80', extra: '#f8e0ec' },
      seca: { n: 'Folha seca', pele: '#a8804a', claro: '#e8d0a0', escuro: '#5a3e1e', extra: '#f0e0c0' } }),
      foices: { n: 'Foices', o: [P_('longas', 'Longas'), P_('serrilhadas', 'Serrilhadas')] } },
    base: { cores: 'folha', foices: 'longas' },
    receita: c => ({ pares: 2, corpo: 'louva', cabeca: 'louva', frente: 'foices', serrilha: c.foices === 'serrilhadas', perna: 1.0, asas: 'louva' }) },
  'formiga-carregadora': { num: 68, nome: 'Formiga-carregadora', grupo: 'Insetos', fam: 'D', tam: 0.8, desc: 'Cesto nas costas; anda em fila.',
    cats: { cores: pal({ ruiva: { n: 'Ruiva', pele: '#a8401e', claro: '#e0805a', escuro: '#4a1a0a', extra: '#c8a060' }, negra: { n: 'Negra', pele: '#2a2422', claro: '#6a5e58', escuro: '#100c0a', extra: '#c8a060' }, dourada: { n: 'Dourada', pele: '#c8902a', claro: '#f0d080', escuro: '#5a3e0e', extra: '#8a6a3a' } }),
      carga: { n: 'No cesto', o: [P_('folhas', 'Folhas'), P_('frutas', 'Frutas'), P_('pedras', 'Cristais')] } },
    base: { cores: 'ruiva', carga: 'folhas' },
    receita: c => ({ pares: 3, corpo: 'formiga', cabeca: 'formiga', antenas: true, extras: ['cesto-' + c.carga], perna: 0.85 }) },
  'escorpiao-de-vidro': { num: 69, nome: 'Escorpião-de-vidro', grupo: 'Insetos', fam: 'D', tam: 0.9, desc: 'Corpo transparente, ferrão de luz; rasteja.',
    cats: { cores: pal({ gelo: { n: 'Gelo', pele: '#c8e8f8', claro: '#ffffff', escuro: '#5a8aa8', brilho: '#60d0ff' }, ambar: { n: 'Âmbar', pele: '#f0c870', claro: '#fff4d0', escuro: '#a07a20', brilho: '#ff9030' },
      veneno: { n: 'Veneno', pele: '#b0f0a0', claro: '#f0fff0', escuro: '#4a8a3a', brilho: '#80ff40' }, ametista: { n: 'Ametista', pele: '#d8b8f8', claro: '#fff0ff', escuro: '#7a5aa8', brilho: '#d060ff' } }),
      ferrao: { n: 'Ferrão', o: [P_('um', 'Um'), P_('dois', 'Duplo')] } },
    base: { cores: 'gelo', ferrao: 'um' },
    receita: c => ({ pares: 4, corpo: 'escorpiao', cabeca: 'escorpiao', frente: 'pincas', cauda: 'ferrao', ferraoDuplo: c.ferrao === 'dois', vidro: true, perna: 0.8 }) },
  'grilo-musico': { num: 73, nome: 'Grilo-músico', grupo: 'Insetos', fam: 'D', tam: 0.3, desc: 'Pernas de violino; salta e toca.',
    cats: { cores: pal({ campo: { n: 'Campo', pele: '#5a7a2a', claro: '#b0d070', escuro: '#2a3e14', extra: '#a8703a' }, noite: { n: 'Noturno', pele: '#3a2a1e', claro: '#8a6a4a', escuro: '#1a120c', extra: '#c89040' }, prata: { n: 'Prata', pele: '#9aa0a8', claro: '#e0e4e8', escuro: '#4a5058', extra: '#6a4a2a' } }),
      instrumento: { n: 'Instrumento', o: [P_('violino', 'Violino'), P_('flauta', 'Flauta'), P_('nada', 'Nada')] } },
    base: { cores: 'campo', instrumento: 'violino' },
    receita: c => ({ pares: 3, corpo: 'grilo', cabeca: 'grilo', antenas: true, saltador: true, instrumento: c.instrumento, perna: 0.8 }) },
  'abelha-ursa': { num: 75, nome: 'Abelha-ursa', grupo: 'Insetos', fam: 'D', tam: 0.45, voa: true, desc: 'Pelo de urso, potes de mel; voo zumbido.',
    cats: { cores: pal({ mel: { n: 'Mel', pele: '#7a5236', claro: '#e8b840', escuro: '#2e2018', extra: '#f0c040', asa: '#e8f0ff' }, polar: { n: 'Polar', pele: '#e8e4dc', claro: '#f0d060', escuro: '#7a7470', extra: '#f0d060', asa: '#f0f8ff' },
      noite: { n: 'Noite', pele: '#2e2a30', claro: '#c8a0f0', escuro: '#141216', extra: '#a080e0', asa: '#e8e0ff' } }),
      pote: { n: 'Pote', o: [P_('um', 'Um pote'), P_('dois', 'Dois potes'), P_('nada', 'Nada')] } },
    base: { cores: 'mel', pote: 'um' },
    receita: c => ({ pares: 3, corpo: 'abelha', cabeca: 'urso', antenas: true, asas: 'abelha', pote: c.pote, perna: 0.6, flap: 12 }) },
  'carrapato-colosso': { num: 76, nome: 'Carrapato-colosso', grupo: 'Insetos', fam: 'D', tam: 2.4, desc: '8 patas, costas em domo; lento e implacável.',
    cats: { cores: pal({ terra: { n: 'Terra', pele: '#6a4a3a', claro: '#a88a72', escuro: '#2e1e16', extra: '#c8a080' }, cinza: { n: 'Cinza-azul', pele: '#5a6070', claro: '#9aa0ae', escuro: '#262a32', extra: '#b0b8c8' }, sangue: { n: 'Sangue', pele: '#6a2a2a', claro: '#b06060', escuro: '#2a1010', extra: '#d08080' } }),
      domo: { n: 'Domo', o: [P_('liso', 'Liso'), P_('placas', 'Placas'), P_('espinhos', 'Espinhos')] } },
    base: { cores: 'terra', domo: 'placas' },
    receita: c => ({ pares: 4, corpo: 'carrapato', cabeca: 'carrapato', domo: c.domo, perna: 0.55, pesado: true }) },
  'caranguejo-castelo': { num: 80, nome: 'Caranguejo-castelo', grupo: 'Aquáticos', fam: 'D', tam: 4.5, desc: 'Concha de torre de pedra, 10 patas; anda de lado.',
    cats: { cores: pal({ coral: { n: 'Coral', pele: '#c8502a', claro: '#f0a070', escuro: '#5a1e0e', extra: '#a8a090' }, azul: { n: 'Azul', pele: '#2a5a9a', claro: '#80b0e8', escuro: '#0e2244', extra: '#9a9488' }, areia: { n: 'Areia', pele: '#c8a060', claro: '#f0d8a0', escuro: '#6a4a20', extra: '#b0a490' } }),
      torre: { n: 'Torre', o: [P_('redonda', 'Redonda'), P_('quadrada', 'Quadrada'), P_('ruina', 'Ruína com musgo')] } },
    base: { cores: 'coral', torre: 'redonda' },
    receita: c => ({ pares: 4, corpo: 'caranguejo', cabeca: 'caranguejo', frente: 'pincas', torre: c.torre, lado: true, perna: 0.9, pesado: true }) },
  'olho-aranha': { num: 138, nome: 'Olho-aranha', grupo: 'Estranhos', fam: 'D', tam: 1.0, desc: 'Olho gigante no centro de 8 patas; corre.',
    cats: { cores: pal({ verde: { n: 'Verde', pele: '#ece4d8', claro: '#5ab040', escuro: '#2a2422', extra: '#6a2a3a' }, ambar: { n: 'Âmbar', pele: '#ece0d4', claro: '#e8a030', escuro: '#2a2422', extra: '#5a2a2a' }, gelo: { n: 'Gelo', pele: '#e8eef4', claro: '#50b8f0', escuro: '#22262e', extra: '#3a4a6a' } }),
      patas: { n: 'Patas', o: [P_('finas', 'Finas'), P_('peludas', 'Peludas')] } },
    base: { cores: 'verde', patas: 'finas' },
    receita: c => ({ pares: 4, corpo: 'olho', cabeca: 'olho', pelos: c.patas === 'peludas', perna: 1.2 }) },
};
Object.assign(ESPECIES, ESP_D);

// ------------------------------------------------------------ SERPENTES E CORRENTES (família E) — tam = COMPRIMENTO
const ESP_E = {
  'serpente-plumada': { num: 53, nome: 'Serpente-plumada', grupo: 'Répteis', fam: 'E', tam: 5, medida: 'comprimento', voa: true, desc: 'Corpo de cobra com penas coloridas e crista; voa ondulando.',
    cats: { cores: pal({ jade: { n: 'Jade', pele: '#2a8a6a', claro: '#a8e8c8', escuro: '#145a40', pena: '#e8b030', pena2: '#d83a3a' }, sol: { n: 'Sol', pele: '#d8902a', claro: '#f8e0a0', escuro: '#8a4a10', pena: '#2a9ad8', pena2: '#f0f0f0' },
      noite: { n: 'Noite', pele: '#3a2a6a', claro: '#a898e8', escuro: '#1a1238', pena: '#40e0d0', pena2: '#e040a0' } }),
      crista: { n: 'Crista', o: [P_('leque', 'Leque'), P_('longa', 'Ao longo do corpo')] }, asas: { n: 'Asinhas', o: [P_('sim', 'Com asinhas'), P_('nao', 'Sem asas')] } },
    base: { cores: 'jade', crista: 'leque', asas: 'sim' },
    receita: c => ({ N: 14, r0: 0.045, tipo: 'plumada', cabeca: 'cobra', crista: c.crista, asinhas: c.asas === 'sim', onda: 'vertical' }) },
  'verme-das-dunas': { num: 56, nome: 'Verme-das-dunas', grupo: 'Répteis', fam: 'E', tam: 20, medida: 'comprimento', desc: 'Sem olhos, boca em pétalas, placas de areia; nada na areia.',
    cats: { cores: pal({ areia: { n: 'Areia', pele: '#c8a070', claro: '#f0d8a8', escuro: '#7a5a34', boca: '#c84a4a' }, rocha: { n: 'Rocha', pele: '#8a7a6a', claro: '#c8bca8', escuro: '#4a3e34', boca: '#e08a30' }, cinza: { n: 'Cinza', pele: '#6a6a72', claro: '#b0b0b8', escuro: '#34343a', boca: '#a040c0' } }),
      petalas: { n: 'Pétalas', o: [P_('cinco', 'Cinco'), P_('tres', 'Três'), P_('oito', 'Oito')] } },
    base: { cores: 'areia', petalas: 'cinco' },
    receita: c => ({ N: 14, r0: 0.07, taper: 0.7, tipo: 'verme', cabeca: 'petalas', petalas: { tres: 3, cinco: 5, oito: 8 }[c.petalas], onda: 'vertical', mergulha: true }) },
  'cobra-de-duas-pontas': { num: 58, nome: 'Cobra-de-duas-pontas', grupo: 'Répteis', fam: 'E', tam: 2, medida: 'comprimento', desc: 'Uma cabeça em cada ponta; rola como roda.',
    cats: { cores: pal({ coral: { n: 'Coral', pele: '#d84a3a', claro: '#f8e0c0', escuro: '#1a1414' }, oliva: { n: 'Oliva', pele: '#6a7a3a', claro: '#d8e0a0', escuro: '#2a3014' }, azul: { n: 'Azul', pele: '#3a6ab0', claro: '#c0d8f0', escuro: '#141a30' } }),
      aneis: { n: 'Anéis', o: [P_('sim', 'Com anéis'), P_('nao', 'Lisa')] } },
    base: { cores: 'coral', aneis: 'sim' },
    receita: c => ({ N: 12, r0: 0.035, taper: 0, tipo: 'duas', cabeca: 'cobra', duas: true, aneis: c.aneis === 'sim', onda: 'lateral' }) },
  'lagarta-onibus': { num: 71, nome: 'Lagarta-ônibus', grupo: 'Insetos', fam: 'E', tam: 6, medida: 'comprimento', desc: 'Janelinhas e passageiros dentro; rasteja ondulando.',
    cats: { cores: pal({ verde: { n: 'Verde', pele: '#7ab84a', claro: '#e0f0a0', escuro: '#3a6a20', janela: '#a8e0ff' }, amarela: { n: 'Escolar', pele: '#f0c030', claro: '#fff0b0', escuro: '#8a6a10', janela: '#c8f0ff' }, roxa: { n: 'Roxa', pele: '#8a5ac8', claro: '#e0c8ff', escuro: '#4a2a7a', janela: '#ffe8a8' } }),
      passageiros: { n: 'Passageiros', o: [P_('muitos', 'Lotada'), P_('poucos', 'Poucos'), P_('nenhum', 'Vazia')] } },
    base: { cores: 'verde', passageiros: 'muitos' },
    receita: c => ({ N: 9, r0: 0.07, taper: 0.15, tipo: 'lagarta', cabeca: 'lagarta', passageiros: c.passageiros, onda: 'vertical', antenas: true }) },
  'centopeia-trem': { num: 74, nome: 'Centopeia-trem', grupo: 'Insetos', fam: 'E', tam: 10, medida: 'comprimento', desc: 'Segmentos que se soltam e andam sozinhos; ondula.',
    cats: { cores: pal({ ferrugem: { n: 'Ferrugem', pele: '#8a3a1e', claro: '#e0905a', escuro: '#3a1408', extra: '#c8a050' }, preta: { n: 'Preta', pele: '#2a2628', claro: '#7a6a70', escuro: '#100c0e', extra: '#e0c040' }, jade: { n: 'Jade', pele: '#2a6a5a', claro: '#80d0b0', escuro: '#103028', extra: '#d0e0a0' } }),
      vagoes: { n: 'Vagões', o: [P_('sim', 'Com vagões'), P_('nao', 'Sem vagões')] } },
    base: { cores: 'ferrugem', vagoes: 'sim' },
    receita: c => ({ N: 12, r0: 0.035, taper: 0.2, tipo: 'centopeia', cabeca: 'centopeia', vagoes: c.vagoes === 'sim', onda: 'lateral', patas: true, antenas: true }) },
  'vinha-serpente': { num: 92, nome: 'Vinha-serpente', grupo: 'Plantas', fam: 'E', tam: 5, medida: 'comprimento', desc: 'Espinhos e flores; ondula.',
    cats: { cores: pal({ verde: { n: 'Verde', pele: '#4a7a2a', claro: '#a8d070', escuro: '#2a4a14', flor: '#e84a6a' }, outono: { n: 'Outono', pele: '#7a5a2a', claro: '#d8a050', escuro: '#4a3014', flor: '#f0a020' }, sombria: { n: 'Sombria', pele: '#2a3a2a', claro: '#6a8a6a', escuro: '#141e14', flor: '#a040e0' } }),
      flores: { n: 'Flores', o: [P_('muitas', 'Muitas'), P_('poucas', 'Poucas'), P_('frutos', 'Frutos')] } },
    base: { cores: 'verde', flores: 'muitas' },
    receita: c => ({ N: 14, r0: 0.03, taper: 0.6, tipo: 'vinha', cabeca: 'flor', flores: c.flores, onda: 'lateral' }) },
  'serpente-de-ossos': { num: 116, nome: 'Serpente-de-ossos', grupo: 'Espectrais', fam: 'E', tam: 8, medida: 'comprimento', desc: 'Costelas soltas; ondula.',
    cats: { cores: pal({ osso: { n: 'Osso', pele: '#e8e0cc', claro: '#fff8e8', escuro: '#6a6050', brilho: '#60e0ff' }, velho: { n: 'Velho', pele: '#c8b088', claro: '#e8d8b0', escuro: '#5a4a30', brilho: '#a0ff60' }, obsidiana: { n: 'Obsidiana', pele: '#3a3438', claro: '#6a6068', escuro: '#141014', brilho: '#ff5040' } }),
      costelas: { n: 'Costelas', o: [P_('longas', 'Longas'), P_('curtas', 'Curtas')] } },
    base: { cores: 'osso', costelas: 'longas' },
    receita: c => ({ N: 16, r0: 0.03, taper: 0.5, tipo: 'ossos', cabeca: 'cranio', costelas: c.costelas, onda: 'lateral' }) },
  'pipa-dragao': { num: 150, nome: 'Pipa-dragão', grupo: 'Constructos', fam: 'E', tam: 4, medida: 'comprimento', voa: true, desc: 'Serpente de papel; ondula no céu ao vento.',
    cats: { cores: pal({ rubro: { n: 'Rubro', pele: '#d83a2a', claro: '#f0d060', escuro: '#5a1410', fita: '#f0c030' }, jade: { n: 'Jade', pele: '#2a9a6a', claro: '#f0e8c0', escuro: '#104030', fita: '#e84a4a' }, anil: { n: 'Anil', pele: '#3a4ab8', claro: '#f0f0ff', escuro: '#141a50', fita: '#f0f0f0' } }),
      fitas: { n: 'Fitas', o: [P_('longas', 'Longas'), P_('curtas', 'Curtas')] } },
    base: { cores: 'rubro', fitas: 'longas' },
    receita: c => ({ N: 12, r0: 0.04, taper: 0.3, tipo: 'pipa', cabeca: 'pipa', fitas: c.fitas, onda: 'vertical' }) },
};
Object.assign(ESPECIES, ESP_E);

// ------------------------------------------------------------ TENTÁCULOS E RADIAIS (família F)
const ESP_F = {
  'agua-viva-do-ceu': { num: 77, nome: 'Água-viva-do-céu', grupo: 'Aquáticos', fam: 'F', tam: 1.5, voa: true, desc: 'Sino translúcido, tentáculos de luz; flutua no ar.',
    cats: { cores: pal({ lua: { n: 'Lua', pele: '#c8d8ff', claro: '#f0f4ff', brilho: '#80c0ff' }, rosa: { n: 'Rosa', pele: '#ffc0e0', claro: '#fff0f8', brilho: '#ff70c0' }, aurora: { n: 'Aurora', pele: '#b8ffe0', claro: '#f0fff8', brilho: '#50ffb0' }, ambar: { n: 'Âmbar', pele: '#ffe0a8', claro: '#fff8e8', brilho: '#ffb040' } }),
      tentaculos: { n: 'Tentáculos', o: [P_('longos', 'Longos'), P_('curtos', 'Curtos')] }, sino: { n: 'Sino', o: [P_('redondo', 'Redondo'), P_('alto', 'Alto')] } },
    base: { cores: 'lua', tentaculos: 'longos', sino: 'redondo' },
    receita: c => ({ tipo: 'medusa', n: 8, K: 4, longos: c.tentaculos === 'longos', alto: c.sino === 'alto' }) },
  'polvo-erudito': { num: 78, nome: 'Polvo-erudito', grupo: 'Aquáticos', fam: 'F', tam: 1.2, desc: 'Óculos, um livro em cada braço; anda nos tentáculos.',
    cats: { cores: pal({ coral: { n: 'Coral', pele: '#d8705a', claro: '#f8c8b0', escuro: '#8a3a2a' }, violeta: { n: 'Violeta', pele: '#8a5ac0', claro: '#d8c0f0', escuro: '#4a2a7a' }, oceano: { n: 'Oceano', pele: '#3a7ab0', claro: '#b0d8f0', escuro: '#1a3a5a' }, areia: { n: 'Areia', pele: '#c8a070', claro: '#f0e0c0', escuro: '#7a5a30' } }),
      oculos: { n: 'Óculos', o: [P_('redondos', 'Redondos'), P_('monoculo', 'Monóculo'), P_('nenhum', 'Nenhum')] }, livros: { n: 'Livros', o: [P_('dois', 'Dois'), P_('pilha', 'Pilha'), P_('pergaminho', 'Pergaminho')] } },
    base: { cores: 'coral', oculos: 'redondos', livros: 'dois' },
    receita: c => ({ tipo: 'polvo', n: 8, K: 4, oculos: c.oculos, livros: c.livros, anda: true }) },
  'lula-pintora': { num: 83, nome: 'Lula-pintora', grupo: 'Aquáticos', fam: 'F', tam: 2.6, voa: true, desc: '10 tentáculos, tinta que forma desenhos; jato.',
    cats: { cores: pal({ nanquim: { n: 'Nanquim', pele: '#e8d8d0', claro: '#ffffff', escuro: '#2a2028', tinta: '#2a2a3a' }, carmim: { n: 'Carmim', pele: '#d84a4a', claro: '#f8c0b0', escuro: '#6a1a1a', tinta: '#3a1a6a' }, turquesa: { n: 'Turquesa', pele: '#3ab0a8', claro: '#c0f0e8', escuro: '#145a54', tinta: '#e0a020' } }),
      pincel: { n: 'Na ponta', o: [P_('pincel', 'Pincel'), P_('paleta', 'Paleta'), P_('nada', 'Nada')] } },
    base: { cores: 'nanquim', pincel: 'pincel' },
    receita: c => ({ tipo: 'lula', n: 10, K: 4, pincel: c.pincel }) },
  'anemona-guardia': { num: 88, nome: 'Anêmona-guardiã', grupo: 'Aquáticos', fam: 'F', tam: 1.2, desc: 'Fixa no chão, tentáculos que agarram; balança no lugar.',
    cats: { cores: pal({ coral: { n: 'Coral', pele: '#e8704a', claro: '#ffd0b0', escuro: '#8a3020', brilho: '#ffe080' }, magenta: { n: 'Magenta', pele: '#d84aa8', claro: '#ffc0e8', escuro: '#7a1a5a', brilho: '#80ffe0' }, verde: { n: 'Verde', pele: '#6ac04a', claro: '#d0ffb0', escuro: '#2a6a1a', brilho: '#ffd0ff' } }),
      pontas: { n: 'Pontas', o: [P_('brilho', 'Que brilham'), P_('bolinhas', 'Bolinhas'), P_('finas', 'Finas')] } },
    base: { cores: 'coral', pontas: 'brilho' },
    receita: c => ({ tipo: 'anemona', n: 12, K: 3, pontas: c.pontas, fixo: true }) },
  'kraken-de-pedra': { num: 132, nome: 'Kraken-de-pedra', grupo: 'Gigantes', fam: 'F', tam: 25, desc: 'Tentáculos de rocha; arrasta-se.',
    cats: { cores: pal({ basalto: { n: 'Basalto', pele: '#4a4648', claro: '#7a7478', escuro: '#22201e', brilho: '#ff7030' }, coral: { n: 'Recife', pele: '#8a6a5a', claro: '#c0a090', escuro: '#3a2a22', brilho: '#50e0ff' }, musgo: { n: 'Musgo', pele: '#5a6450', claro: '#8a9478', escuro: '#262c20', brilho: '#c0ff60' } }),
      olhos: { n: 'Olhos', o: [P_('dois', 'Dois'), P_('um', 'Um enorme'), P_('muitos', 'Muitos')] } },
    base: { cores: 'basalto', olhos: 'dois' },
    receita: c => ({ tipo: 'kraken', n: 8, K: 4, olhos: c.olhos, anda: true, pedra: true }) },
  'cabeca-de-lula': { num: 139, nome: 'Cabeça-de-lula', grupo: 'Estranhos', fam: 'F', tam: 2.0, voa: true, desc: 'Cabeça de lula, corpo humanoide; flutua.',
    cats: { cores: pal({ abismo: { n: 'Abismo', pele: '#6a8a8a', claro: '#b0d0c8', escuro: '#2a3a3a', roupa: '#2a2240', brilho: '#a0ffe0' }, purpura: { n: 'Púrpura', pele: '#8a6aa0', claro: '#d0b8e0', escuro: '#3a2a4a', roupa: '#3a1a2a', brilho: '#ffb0ff' }, coral: { n: 'Coral', pele: '#c07060', claro: '#f0c0b0', escuro: '#5a2a22', roupa: '#1a2a3a', brilho: '#ffe070' } }),
      manto: { n: 'Manto', o: [P_('longo', 'Longo'), P_('capuz', 'Com capuz')] }, tentaculos: { n: 'Tentáculos', o: [P_('seis', 'Seis'), P_('quatro', 'Quatro')] } },
    base: { cores: 'abismo', manto: 'longo', tentaculos: 'seis' },
    receita: c => ({ tipo: 'cabecaLula', n: c.tentaculos === 'seis' ? 6 : 4, K: 3, capuz: c.manto === 'capuz' }) },
};
Object.assign(ESPECIES, ESP_F);

// ------------------------------------------------------------ AMORFOS, ROLANTES E MONOPÉS (família G)
const ESP_G = {
  'ourico-rolante': { num: 87, nome: 'Ouriço-rolante', grupo: 'Aquáticos', fam: 'G', tam: 0.4, desc: 'Esfera de espinhos; rola.',
    cats: { cores: pal({ roxo: { n: 'Roxo', pele: '#5a3a6a', claro: '#c8a0e0', escuro: '#2a1a34', espinho: '#e8c8f0' }, preto: { n: 'Preto', pele: '#2a2628', claro: '#7a7078', escuro: '#100e10', espinho: '#d0c8c8' }, coral: { n: 'Coral', pele: '#c8603a', claro: '#f0b090', escuro: '#5a2414', espinho: '#ffe0c0' } }),
      espinhos: { n: 'Espinhos', o: [P_('longos', 'Longos'), P_('curtos', 'Curtos')] } },
    base: { cores: 'roxo', espinhos: 'longos' }, receita: c => ({ tipo: 'ourico', longos: c.espinhos === 'longos' }) },
  'cogumelo-saltitante': { num: 90, nome: 'Cogumelo-saltitante', grupo: 'Plantas', fam: 'G', tam: 0.4, desc: 'Um pé só, chapéu grande; pula.',
    cats: { cores: pal({ rubro: { n: 'Rubro', pele: '#f0e4d0', chapeu: '#d03a2a', pinta: '#f8f0e0' }, dourado: { n: 'Dourado', pele: '#f0e4d0', chapeu: '#e0a030', pinta: '#fff4d0' }, azul: { n: 'Azul brilhante', pele: '#e8f0f8', chapeu: '#3a7ae0', pinta: '#a0f0ff' }, roxo: { n: 'Roxo', pele: '#f0e8f0', chapeu: '#8a3ac8', pinta: '#f0d0ff' } }),
      chapeu: { n: 'Chapéu', o: [P_('redondo', 'Redondo'), P_('pontudo', 'Pontudo'), P_('largo', 'Largo')] } },
    base: { cores: 'rubro', chapeu: 'redondo' }, receita: c => ({ tipo: 'cogumelo', chapeu: c.chapeu }) },
  'pedra-que-rola': { num: 110, nome: 'Pedra-que-rola', grupo: 'Elementais', fam: 'G', tam: 1.0, desc: 'Esfera de pedra com olho único e musgo; rola.',
    cats: { cores: pal({ granito: { n: 'Granito', pele: '#8a8682', claro: '#b0aca8', musgo: '#5a8a3a', iris: '#40a0e0' }, arenito: { n: 'Arenito', pele: '#b89a72', claro: '#d8c0a0', musgo: '#7a9a3a', iris: '#e08030' }, basalto: { n: 'Basalto', pele: '#4a4646', claro: '#6a6464', musgo: '#4a7a5a', iris: '#e03040' } }),
      musgo: { n: 'Musgo', o: [P_('muito', 'Muito'), P_('pouco', 'Pouco')] } },
    base: { cores: 'granito', musgo: 'muito' }, receita: c => ({ tipo: 'pedra', musgo: c.musgo }) },
  'gosma-cubo': { num: 135, nome: 'Gosma-cubo', grupo: 'Estranhos', fam: 'G', tam: 1.5, desc: 'Cubo de gelatina com objetos dentro; desliza.',
    cats: { cores: pal({ verde: { n: 'Verde', pele: '#80e080', claro: '#d0ffd0' }, azul: { n: 'Azul', pele: '#80c0f0', claro: '#d0f0ff' }, ambar: { n: 'Âmbar', pele: '#f0c060', claro: '#fff0c0' }, rosa: { n: 'Rosa', pele: '#f090c0', claro: '#ffd8f0' } }),
      dentro: { n: 'Dentro', o: [P_('tesouro', 'Tesouro'), P_('ossos', 'Ossos'), P_('aventureiro', 'Elmo e espada')] } },
    base: { cores: 'verde', dentro: 'tesouro' }, receita: c => ({ tipo: 'cubo', dentro: c.dentro }) },
  'gosma-saltadora': { num: 136, nome: 'Gosma-saltadora', grupo: 'Estranhos', fam: 'G', tam: 0.4, desc: 'Gota com olhinhos; pula.',
    cats: { cores: pal({ azul: { n: 'Azul', pele: '#60b0f0', claro: '#c8e8ff' }, verde: { n: 'Verde', pele: '#70d070', claro: '#d0ffd0' }, magma: { n: 'Magma', pele: '#f07030', claro: '#ffd080' }, roxa: { n: 'Roxa', pele: '#a070e0', claro: '#e8d8ff' } }),
      chapeu: { n: 'Enfeite', o: [P_('nada', 'Nada'), P_('coroa', 'Coroinha'), P_('folha', 'Folha')] } },
    base: { cores: 'azul', chapeu: 'nada' }, receita: c => ({ tipo: 'gota', chapeu: c.chapeu }) },
  'bocarra': { num: 140, nome: 'Bocarra', grupo: 'Estranhos', fam: 'G', tam: 2.2, desc: 'Só boca e dentes, com pernas; salta.',
    cats: { cores: pal({ carne: { n: 'Carne', pele: '#c8606a', claro: '#f0a0a8', escuro: '#5a1a22', lingua: '#e84a6a' }, pantano: { n: 'Pântano', pele: '#6a8a4a', claro: '#b0d080', escuro: '#2a3a1a', lingua: '#d84a8a' }, sombra: { n: 'Sombra', pele: '#4a3a5a', claro: '#8a7a9a', escuro: '#1a1222', lingua: '#ff6040' } }),
      dentes: { n: 'Dentes', o: [P_('muitos', 'Muitos'), P_('poucos', 'Poucos e grandes')] }, olhos: { n: 'Olhos', o: [P_('dois', 'Dois'), P_('um', 'Um'), P_('nenhum', 'Nenhum')] } },
    base: { cores: 'carne', dentes: 'muitos', olhos: 'dois' }, receita: c => ({ tipo: 'bocarra', dentes: c.dentes, olhos: c.olhos }) },
  'mao-errante': { num: 141, nome: 'Mão-errante', grupo: 'Estranhos', fam: 'G', tam: 0.18, desc: 'Mão sem corpo; corre nos dedos.',
    cats: { cores: pal({ palida: { n: 'Pálida', pele: '#e8dcd0', unha: '#c8b8a8' }, verde: { n: 'Esverdeada', pele: '#a8c098', unha: '#5a6a4a' }, ossos: { n: 'Cinzenta', pele: '#9a9aa4', unha: '#3a3a44' } }),
      anel: { n: 'Anel', o: [P_('ouro', 'De ouro'), P_('rubi', 'Rubi'), P_('nenhum', 'Nenhum')] }, punho: { n: 'Punho', o: [P_('manga', 'Manga rendada'), P_('nada', 'Nu')] } },
    base: { cores: 'palida', anel: 'ouro', punho: 'manga' }, receita: c => ({ tipo: 'mao', anel: c.anel, punho: c.punho }) },
  'vassoura-viva': { num: 145, nome: 'Vassoura-viva', grupo: 'Constructos', fam: 'G', tam: 1.5, desc: 'Um pé só, braços de palha; varre e pula.',
    cats: { cores: pal({ palha: { n: 'Palha', pele: '#8a5a2e', palha: '#e0c070', fita: '#c83a3a' }, escura: { n: 'Escura', pele: '#3a2a22', palha: '#a88a50', fita: '#6a3ab8' }, clara: { n: 'Clara', pele: '#c8a070', palha: '#f0e0a0', fita: '#3a8ac8' } }),
      chapeu: { n: 'Chapéu', o: [P_('bruxa', 'De bruxa'), P_('nada', 'Nada')] } },
    base: { cores: 'palha', chapeu: 'bruxa' }, receita: c => ({ tipo: 'vassoura', chapeu: c.chapeu }) },
};
Object.assign(ESPECIES, ESP_G);

// ------------------------------------------------------------ BÍPEDES GRANDES E GIGANTES (família H: esqueleto e poses dos povos)
const ARMA_H = { n: 'Arma', o: [P_('clava', 'Clava'), P_('machado', 'Machado'), P_('martelo', 'Martelo'), P_('nada', 'Punhos')] };
const ESP_H = {
  'broto-andante': { num: 89, nome: 'Broto-andante', grupo: 'Plantas', fam: 'H', tam: 1.4, desc: 'Tronco jovem, galhos como braços, folhas; passo rígido.',
    cats: { cores: pal({ primavera: { n: 'Primavera', pele: '#7a5a3a', claro: '#a8885a', folha: '#6ab04a', flor: '#f088b0' }, outono: { n: 'Outono', pele: '#6a4a2e', claro: '#9a7a52', folha: '#d8802a', flor: '#f0d040' }, cerejeira: { n: 'Cerejeira', pele: '#5a3a2e', claro: '#8a6a52', folha: '#f0a8c8', flor: '#ffffff' } }),
      copa: { n: 'Copa', o: [P_('redonda', 'Redonda'), P_('pontuda', 'Pontuda'), P_('flores', 'Com flores')] } },
    base: { cores: 'primavera', copa: 'redonda' }, receita: c => ({ mat: 'madeira', cabeca: 'arvore', copa: c.copa, arma: 'nada', k: 0.9, armK: 1.1 }) },
  'cacto-guerreiro': { num: 95, nome: 'Cacto-guerreiro', grupo: 'Plantas', fam: 'H', tam: 1.6, desc: 'Braços de cacto, flor na cabeça; passo duro.',
    cats: { cores: pal({ verde: { n: 'Verde', pele: '#4a8a4a', claro: '#80c070', flor: '#f04a6a' }, azul: { n: 'Azulado', pele: '#4a7a8a', claro: '#80b0c0', flor: '#f0c030' }, roxo: { n: 'Roxo', pele: '#6a5a8a', claro: '#a090c0', flor: '#ffffff' } }),
      arma: { n: 'Arma', o: [P_('espada', 'Espada de espinho'), P_('nada', 'Punhos'), P_('cajado', 'Cajado')] }, chapeu: { n: 'Chapéu', o: [P_('flor', 'Flor'), P_('sombrero', 'Chapelão')] } },
    base: { cores: 'verde', arma: 'espada', chapeu: 'flor' }, receita: c => ({ mat: 'cacto', cabeca: 'cacto', chapeu: c.chapeu, arma: c.arma, k: 0.95 }) },
  'elemental-de-cascalho': { num: 101, nome: 'Elemental-de-cascalho', grupo: 'Elementais', fam: 'H', tam: 2.5, desc: 'Pedras soltas orbitando o corpo; anda e se remonta.',
    cats: { cores: pal({ granito: { n: 'Granito', pele: '#8a8682', claro: '#b0aca8', brilho: '#ffb040' }, ardosia: { n: 'Ardósia', pele: '#5a6068', claro: '#8a929a', brilho: '#60d0ff' }, arenito: { n: 'Arenito', pele: '#b89a72', claro: '#d8c0a0', brilho: '#ff6040' } }),
      nucleo: { n: 'Núcleo', o: [P_('brilho', 'Que brilha'), P_('pedra', 'Só pedra')] } },
    base: { cores: 'granito', nucleo: 'brilho' }, receita: c => ({ mat: 'cascalho', cabeca: 'pedra', nucleo: c.nucleo === 'brilho', arma: 'nada', k: 1.25, armK: 1.15 }) },
  'golenzinho-de-argila': { num: 102, nome: 'Golenzinho-de-argila', grupo: 'Elementais', fam: 'H', tam: 0.6, desc: 'Marcas de dedos, olhos de botão; anda trôpego.',
    cats: { cores: pal({ terracota: { n: 'Terracota', pele: '#c8704a', claro: '#e8a07a', botao: '#2a2422' }, cinza: { n: 'Argila cinza', pele: '#9a9490', claro: '#c0bab4', botao: '#3a5a8a' }, branca: { n: 'Porcelana', pele: '#e8e4dc', claro: '#ffffff', botao: '#8a2a3a' } }),
      runa: { n: 'Runa', o: [P_('peito', 'No peito'), P_('testa', 'Na testa')] } },
    base: { cores: 'terracota', runa: 'peito' }, receita: c => ({ mat: 'argila', cabeca: 'argila', runa: c.runa, arma: 'nada', k: 1.1, belly: 1.15 }) },
  'magmoide': { num: 107, nome: 'Magmoide', grupo: 'Elementais', fam: 'H', tam: 2.2, desc: 'Crosta preta, lava nas juntas; passo pesado.',
    cats: { cores: pal({ lava: { n: 'Lava', pele: '#2a2422', claro: '#4a4240', brilho: '#ff7020' }, azul: { n: 'Fogo azul', pele: '#22242a', claro: '#40444a', brilho: '#40a0ff' }, verde: { n: 'Enxofre', pele: '#2a2a22', claro: '#4a4a40', brilho: '#a0ff40' } }),
      chifres: { n: 'Chifres', o: [P_('nenhum', 'Nenhum'), P_('curvos', 'Curvos')] } },
    base: { cores: 'lava', chifres: 'nenhum' }, receita: c => ({ mat: 'magma', cabeca: 'magma', chifres: c.chifres, arma: 'nada', k: 1.2 }) },
  'esqueleto-de-gelo': { num: 109, nome: 'Esqueleto-de-gelo', grupo: 'Elementais', fam: 'H', tam: 2.4, desc: 'Ossos de gelo; anda rangendo.',
    cats: { cores: pal({ geleira: { n: 'Geleira', pele: '#c8e8f8', claro: '#ffffff', brilho: '#60c8ff' }, aurora: { n: 'Aurora', pele: '#c8f8e8', claro: '#ffffff', brilho: '#60ffb0' }, noite: { n: 'Noite polar', pele: '#a8b8f0', claro: '#e0e8ff', brilho: '#a070ff' } }),
      arma: { n: 'Arma', o: [P_('espada', 'Espada de gelo'), P_('machado', 'Machado'), P_('nada', 'Garras')] } },
    base: { cores: 'geleira', arma: 'espada' }, receita: c => ({ mat: 'gelo', cabeca: 'caveira', arma: c.arma, k: 0.85, armK: 1.1 }) },
  'cavaleiro-oco': { num: 115, nome: 'Cavaleiro-oco', grupo: 'Espectrais', fam: 'H', tam: 1.8, desc: 'Armadura vazia, olhos de luz; passo metálico.',
    cats: { cores: pal({ prata: { n: 'Prata', pele: '#b0b8c0', claro: '#e0e4e8', brilho: '#60e0ff', capa: '#3a3a5a' }, negro: { n: 'Negro', pele: '#3a3c42', claro: '#6a6c74', brilho: '#ff4040', capa: '#4a1a1a' }, ouro: { n: 'Dourado', pele: '#c8a050', claro: '#f0d890', brilho: '#a0ff80', capa: '#1a3a2a' } }),
      arma: { n: 'Arma', o: [P_('espada', 'Espada'), P_('machado', 'Machado'), P_('martelo', 'Martelo')] }, escudo: { n: 'Escudo', o: [P_('sim', 'Escudo'), P_('nao', 'Sem escudo')] } },
    base: { cores: 'prata', arma: 'espada', escudo: 'sim' }, receita: c => ({ mat: 'metal', cabeca: 'oco', arma: c.arma, escudo: c.escudo === 'sim', k: 1.0 }) },
  'gigante-da-colina': { num: 125, nome: 'Gigante-da-colina', grupo: 'Gigantes', fam: 'H', tam: 6, desc: 'Barriga enorme, clava de árvore; passo lento.',
    cats: { cores: pal({ rosado: { n: 'Rosado', pele: '#d89a7a', claro: '#f0c0a8', roupa: '#7a5a3a', pelo: '#6a4a2a' }, moreno: { n: 'Moreno', pele: '#a8704a', claro: '#d0a07a', roupa: '#5a6a3a', pelo: '#2e2622' }, cinza: { n: 'Cinzento', pele: '#9a9890', claro: '#c0beb4', roupa: '#6a4a3a', pelo: '#5a5650' } }),
      arma: ARMA_H, barba: { n: 'Barba', o: [P_('cheia', 'Cheia'), P_('nenhuma', 'Sem barba')] } },
    base: { cores: 'rosado', arma: 'clava', barba: 'cheia' }, receita: c => ({ mat: 'pele', cabeca: 'gigante', barba: c.barba, arma: c.arma, roupa: 'tanga', k: 1.25, belly: 1.45, legK: 0.85, pesado: true }) },
  'ciclope-pastor': { num: 126, nome: 'Ciclope-pastor', grupo: 'Gigantes', fam: 'H', tam: 5, desc: 'Um olho, cajado; passo pesado.',
    cats: { cores: pal({ oliva: { n: 'Oliva', pele: '#a8a070', claro: '#d0c8a0', roupa: '#e8e0d0', pelo: '#5a4a2a' }, azul: { n: 'Azulado', pele: '#7a8aa8', claro: '#b0bcd0', roupa: '#d8c8a8', pelo: '#3a3a4a' }, terra: { n: 'Terra', pele: '#b07a5a', claro: '#d8a888', roupa: '#c8d0b8', pelo: '#3a2a1e' } }),
      arma: { n: 'Arma', o: [P_('cajado', 'Cajado'), P_('clava', 'Clava')] }, cabelo: { n: 'Cabelo', o: [P_('careca', 'Careca'), P_('topete', 'Topete')] } },
    base: { cores: 'oliva', arma: 'cajado', cabelo: 'careca' }, receita: c => ({ mat: 'pele', cabeca: 'ciclope', cabelo: c.cabelo, arma: c.arma, roupa: 'toga', k: 1.1, belly: 1.1, pesado: true }) },
  'gigante-de-gelo': { num: 128, nome: 'Gigante-de-gelo', grupo: 'Gigantes', fam: 'H', tam: 7, desc: 'Barba de estalactites; passo firme.',
    cats: { cores: pal({ geleira: { n: 'Geleira', pele: '#9ab8d8', claro: '#d0e4f4', roupa: '#e8e4dc', pelo: '#e8f4ff' }, tundra: { n: 'Tundra', pele: '#a8b0b8', claro: '#d8dce0', roupa: '#8a6a4a', pelo: '#f0f0f0' }, noite: { n: 'Noite', pele: '#6a78a8', claro: '#a0acd0', roupa: '#3a3a5a', pelo: '#c8d8ff' } }),
      arma: ARMA_H, elmo: { n: 'Elmo', o: [P_('chifres', 'Chifres de gelo'), P_('nada', 'Nada')] } },
    base: { cores: 'geleira', arma: 'machado', elmo: 'chifres' }, receita: c => ({ mat: 'pele', cabeca: 'gigante', barba: 'gelo', elmo: c.elmo, arma: c.arma, roupa: 'peles', k: 1.15, belly: 1.15, pesado: true }) },
  'ogro-de-duas-bocas': { num: 129, nome: 'Ogro-de-duas-bocas', grupo: 'Gigantes', fam: 'H', tam: 3, desc: 'Segunda boca na barriga; gingado.',
    cats: { cores: pal({ verde: { n: 'Verde', pele: '#7a9a5a', claro: '#a8c088', roupa: '#6a4a2e', pelo: '#2a2a1a' }, cinza: { n: 'Cinza', pele: '#8a8a88', claro: '#b8b8b4', roupa: '#5a3a2a', pelo: '#2a2626' }, ocre: { n: 'Ocre', pele: '#b08a50', claro: '#d8b880', roupa: '#4a3a5a', pelo: '#3a2a1a' } }),
      arma: ARMA_H },
    base: { cores: 'verde', arma: 'clava' }, receita: c => ({ mat: 'pele', cabeca: 'ogro', bocaBarriga: true, arma: c.arma, roupa: 'tanga', k: 1.3, belly: 1.5, legK: 0.8, pesado: true }) },
  'troll-da-ponte': { num: 130, nome: 'Troll-da-ponte', grupo: 'Gigantes', fam: 'H', tam: 3, desc: 'Curvado, braços até o chão; anda apoiado nos nós dos dedos.',
    cats: { cores: pal({ musgo: { n: 'Musgo', pele: '#6a7a5a', claro: '#9aa888', roupa: '#5a4a3a', pelo: '#3a4a2a' }, pedra: { n: 'Pedra', pele: '#7a7672', claro: '#a8a4a0', roupa: '#4a3a2a', pelo: '#3a3632' }, pantano: { n: 'Pântano', pele: '#5a6a6a', claro: '#8a9a9a', roupa: '#3a4a3a', pelo: '#2a3a3a' } }),
      arma: ARMA_H, nariz: { n: 'Nariz', o: [P_('enorme', 'Enorme'), P_('verruga', 'Com verrugas')] } },
    base: { cores: 'musgo', arma: 'nada', nariz: 'enorme' }, receita: c => ({ mat: 'pele', cabeca: 'troll', nariz: c.nariz, arma: c.arma, roupa: 'tanga', k: 1.15, armK: 1.6, legK: 0.75, curvado: true, pesado: true }) },
  'colosso-de-bronze': { num: 131, nome: 'Colosso-de-bronze', grupo: 'Gigantes', fam: 'H', tam: 12, desc: 'Engrenagens à mostra; passo mecânico.',
    cats: { cores: pal({ bronze: { n: 'Bronze', pele: '#b07a40', claro: '#e0b070', brilho: '#60e0ff' }, verdete: { n: 'Verdete', pele: '#5a9a80', claro: '#90d0b0', brilho: '#ffb040' }, ferro: { n: 'Ferro', pele: '#6a6e76', claro: '#9aa0a8', brilho: '#ff5040' } }),
      arma: { n: 'Arma', o: [P_('martelo', 'Martelo'), P_('espada', 'Espada'), P_('nada', 'Punhos')] } },
    base: { cores: 'bronze', arma: 'martelo' }, receita: c => ({ mat: 'metal', cabeca: 'automato', engrenagens: true, arma: c.arma, k: 1.15, pesado: true }) },
  'gigante-de-quatro-bracos': { num: 134, nome: 'Gigante-de-quatro-braços', grupo: 'Gigantes', fam: 'H', tam: 5, desc: 'Quatro braços; luta com dois escudos e duas armas.',
    cats: { cores: pal({ rubro: { n: 'Rubro', pele: '#b0604a', claro: '#d8907a', roupa: '#3a3a5a', pelo: '#1a1414' }, azul: { n: 'Azul', pele: '#4a6a9a', claro: '#80a0c8', roupa: '#6a3a2a', pelo: '#141420' }, dourado: { n: 'Dourado', pele: '#c89a50', claro: '#e8c888', roupa: '#2a4a3a', pelo: '#2a1e14' } }),
      arma: ARMA_H },
    base: { cores: 'rubro', arma: 'machado' }, receita: c => ({ mat: 'pele', cabeca: 'gigante', barba: 'nenhuma', arma: c.arma, escudo: true, quatroBracos: true, roupa: 'peles', k: 1.2, belly: 1.05, pesado: true }) },
  'automato-de-corda': { num: 143, nome: 'Autômato-de-corda', grupo: 'Constructos', fam: 'H', tam: 1.4, desc: 'Chave de corda nas costas; passos que perdem força.',
    cats: { cores: pal({ latao: { n: 'Latão', pele: '#c8a050', claro: '#f0d890', brilho: '#60e0ff' }, cobre: { n: 'Cobre', pele: '#b0603a', claro: '#e09070', brilho: '#a0ff80' }, prata: { n: 'Prata', pele: '#a8b0b8', claro: '#e0e4e8', brilho: '#ffd040' } }),
      cabeca: { n: 'Cabeça', o: [P_('caixa', 'Caixa'), P_('cupula', 'Cúpula de vidro')] } },
    base: { cores: 'latao', cabeca: 'caixa' }, receita: c => ({ mat: 'metal', cabeca: 'automato', cupula: c.cabeca === 'cupula', chave: true, arma: 'nada', k: 1.05, belly: 1.2 }) },
  'espantalho-guardiao': { num: 147, nome: 'Espantalho-guardião', grupo: 'Constructos', fam: 'H', tam: 1.8, desc: 'Cabeça de abóbora, corpo de palha; anda desengonçado.',
    cats: { cores: pal({ outono: { n: 'Outono', pele: '#e0c070', claro: '#f0d890', roupa: '#8a3a2a', abobora: '#e0702a' }, noite: { n: 'Noite', pele: '#c8b080', claro: '#e0d0a0', roupa: '#3a3a5a', abobora: '#c84a2a' }, campo: { n: 'Campo', pele: '#d8c080', claro: '#f0e0a0', roupa: '#3a6a8a', abobora: '#e8902a' } }),
      arma: { n: 'Na mão', o: [P_('foice', 'Foice'), P_('lanterna', 'Lanterna'), P_('nada', 'Nada')] }, chapeu: { n: 'Chapéu', o: [P_('palha', 'De palha'), P_('bruxa', 'De bruxa')] } },
    base: { cores: 'outono', arma: 'foice', chapeu: 'palha' }, receita: c => ({ mat: 'palha', cabeca: 'abobora', chapeu: c.chapeu, arma: c.arma, roupa: 'camisa', k: 0.85, armK: 1.15 }) },
  'bule-andante': { num: 148, nome: 'Bule-andante', grupo: 'Constructos', fam: 'H', tam: 0.4, desc: 'Bule com pernas, bico de nariz; gingado.',
    cats: { cores: pal({ porcelana: { n: 'Porcelana', pele: '#f0ece4', claro: '#ffffff', desenho: '#3a6ac8' }, ferro: { n: 'Ferro fundido', pele: '#3a3a40', claro: '#6a6a72', desenho: '#c8a040' }, esmalte: { n: 'Esmalte', pele: '#d84a3a', claro: '#f0a090', desenho: '#ffffff' } }),
      tampa: { n: 'Tampa', o: [P_('bolinha', 'Com bolinha'), P_('chapeu', 'Chapéu-coco')] } },
    base: { cores: 'porcelana', tampa: 'bolinha' }, receita: c => ({ mat: 'pele', cabeca: 'bule', tampa: c.tampa, corpoBule: true, arma: 'nada', k: 1.2, belly: 1.6, legK: 0.7, armK: 0.7 }) },
  'golem-de-moedas': { num: 149, nome: 'Golem-de-moedas', grupo: 'Constructos', fam: 'H', tam: 2.2, desc: 'Feito de moedas que tilintam; passo pesado.',
    cats: { cores: pal({ ouro: { n: 'Ouro', pele: '#e0b040', claro: '#fff0a0', brilho: '#e02040' }, prata: { n: 'Prata', pele: '#c8ccd2', claro: '#ffffff', brilho: '#4060e0' }, cobre: { n: 'Cobre', pele: '#c8703a', claro: '#f0b080', brilho: '#30d080' } }),
      arma: ARMA_H },
    base: { cores: 'ouro', arma: 'nada' }, receita: c => ({ mat: 'moedas', cabeca: 'moedas', arma: c.arma, k: 1.15, belly: 1.15, pesado: true }) },
  'tita-de-musgo': { num: 127, nome: 'Titã-de-musgo', grupo: 'Gigantes', fam: 'H', tam: 15, desc: 'Montanha que anda; muito lento.',
    cats: { cores: pal({ musgo: { n: 'Musgo', pele: '#6a6a5a', claro: '#8a8a78', folha: '#5a8a3a', flor: '#f0d040' }, outono: { n: 'Outono', pele: '#6a5a4a', claro: '#8a7a6a', folha: '#c8802a', flor: '#e04040' }, neve: { n: 'Neve', pele: '#7a7a80', claro: '#a0a0a8', folha: '#e8f0f8', flor: '#80c0ff' } }),
      costas: { n: 'Costas', o: [P_('floresta', 'Floresta'), P_('cachoeira', 'Cachoeira'), P_('ruinas', 'Ruínas')] } },
    base: { cores: 'musgo', costas: 'floresta' }, receita: c => ({ mat: 'cascalho', cabeca: 'pedra', costas: c.costas, monte: true, arma: 'nada', k: 1.4, belly: 1.3, legK: 0.8, pesado: true }) },
};
Object.assign(ESPECIES, ESP_H);

// ------------------------------------------------------------ ESPECIAIS 8a (répteis/dragões → C; insetos voadores → D)
const ESP_8A = {
  'morsa-alada': { num: 37, nome: 'Morsa-alada', grupo: 'Híbridos alados', fam: 'C', tam: 2.0, voa: true, desc: 'Presas, asas de pinguim que funcionam no ar; voo pesado.',
    cats: { cores: pal({ parda: { n: 'Parda', pele: '#8a6a52', claro: '#c8a888', escuro: '#4a3424', extra: '#f0e8d0', asa: '#5a4434', asa2: '#2a2018' }, cinza: { n: 'Cinza', pele: '#7a7a80', claro: '#b8b8c0', escuro: '#3a3a40', extra: '#f0ead8', asa: '#4a4a52', asa2: '#1e1e22' }, rosa: { n: 'Rosada', pele: '#c8907a', claro: '#f0c8b0', escuro: '#6a4434', extra: '#fff4e0', asa: '#8a5a4a', asa2: '#3a2018' } }),
      presas: { n: 'Presas', o: [P_('longas', 'Longas'), P_('curtas', 'Curtas')] } },
    base: { cores: 'parda', presas: 'longas' },
    receita: c => ({ corpo: { L: 1.0, R: 0.28, H: 0.14, pesc: 0.04 }, cabeca: { tipo: 'morsa', presas: c.presas }, cauda: 'curta', asas: 'ave', pe: 'nadadeira', pesado: true, flap: 1.8 }) },
  'dragaozinho-de-cha': { num: 55, nome: 'Dragãozinho-de-chá', grupo: 'Répteis', fam: 'C', tam: 0.18, voa: true, desc: 'Cabe numa xícara, solta vapor; voo curto.',
    cats: { cores: pal({ jade: { n: 'Jade', pele: '#5ab08a', claro: '#c8f0d8', escuro: '#2a6a4a', extra: '#f0e0b0', asa: '#3a8a6a' }, porcelana: { n: 'Porcelana', pele: '#e8ecf4', claro: '#ffffff', escuro: '#3a5ab0', extra: '#3a5ab0', asa: '#a8b8e0' }, chai: { n: 'Chai', pele: '#c8884a', claro: '#f0d0a0', escuro: '#6a3a1a', extra: '#fff0d0', asa: '#a8603a' } }),
      vapor: { n: 'Vapor', o: [P_('sim', 'Soltando vapor'), P_('nao', 'Sem vapor')] } },
    base: { cores: 'jade', vapor: 'sim' },
    receita: c => ({ corpo: { L: 0.75, R: 0.13, H: 0.22, pesc: 0.12 }, cabeca: { tipo: 'dragao', vapor: c.vapor === 'sim' }, cauda: 'lagarto', asas: 'morcego', pe: 'garra', esparramado: true, flap: 7 }) },
  'lagarto-espelho': { num: 57, nome: 'Lagarto-espelho', grupo: 'Répteis', fam: 'C', tam: 0.45, desc: 'Escamas espelhadas que somem no ambiente; rasteja.',
    cats: { cores: pal({ prata: { n: 'Prata', pele: '#c8d0d8', claro: '#ffffff', escuro: '#6a7480' }, ouro: { n: 'Ouro', pele: '#e0c070', claro: '#fff0c0', escuro: '#8a6a20' }, arco: { n: 'Furta-cor', pele: '#a8c8e8', claro: '#f0d8ff', escuro: '#5a6aa0' } }),
      cauda: { n: 'Cauda', o: [P_('lagarto', 'Longa'), P_('enrolada', 'Enrolada')] } },
    base: { cores: 'prata', cauda: 'lagarto' },
    receita: c => ({ corpo: { L: 0.9, R: 0.14, H: 0.14, pesc: 0.06 }, cabeca: { tipo: 'lagarto' }, cauda: c.cauda, pe: 'garra', esparramado: true, espelho: true }) },
  'crocodilo-musgoso': { num: 59, nome: 'Crocodilo-musgoso', grupo: 'Répteis', fam: 'C', tam: 1.2, desc: 'Árvores nas costas, olhos de lanterna; espreita na água.',
    cats: { cores: pal({ pantano: { n: 'Pântano', pele: '#4a5a3a', claro: '#a0a878', escuro: '#22281a', musgo: '#5a8a3a', brilho: '#f0e060' }, lodo: { n: 'Lodo', pele: '#5a5040', claro: '#a89878', escuro: '#2a241a', musgo: '#7a8a3a', brilho: '#ff9040' }, noite: { n: 'Noite', pele: '#2e3a3a', claro: '#7a8a8a', escuro: '#141a1a', musgo: '#3a6a5a', brilho: '#80e0ff' } }),
      costas: { n: 'Costas', o: [P_('floresta', 'Árvores'), P_('flores', 'Flores'), P_('cogumelos', 'Cogumelos')] } },
    base: { cores: 'pantano', costas: 'floresta' },
    receita: c => ({ corpo: { L: 1.1, R: 0.17, H: 0.12, pesc: 0.04 }, cabeca: { tipo: 'crocodilo' }, cauda: 'lagarto', pe: 'garra', esparramado: true, extras: ['musgo-' + c.costas], pesado: true }) },
  'dragao-de-cobre': { num: 60, nome: 'Dragão-de-cobre', grupo: 'Répteis', fam: 'C', tam: 4.5, voa: true, desc: 'Dois pares de chifres, barba de tentáculos; anda e voa.',
    cats: { cores: pal({ cobre: { n: 'Cobre', pele: '#b0603a', claro: '#e8a070', escuro: '#5a2a14', extra: '#e8dcc0', asa: '#8a3a22', brilho: '#ff8030' }, verdete: { n: 'Verdete', pele: '#4a8a70', claro: '#90d0b0', escuro: '#1e4a3a', extra: '#e0d8b0', asa: '#2a6a50', brilho: '#60ffc0' }, ouro: { n: 'Ouro', pele: '#d0a040', claro: '#f8e090', escuro: '#6a4a10', extra: '#fff8e0', asa: '#a87a20', brilho: '#ffe060' }, negro: { n: 'Negro', pele: '#2e2a30', claro: '#6a6070', escuro: '#100e12', extra: '#d8d0c0', asa: '#3a2a3a', brilho: '#c050ff' } }),
      chifres: { n: 'Chifres', o: [P_('dois', 'Dois pares'), P_('coroa', 'Coroa'), P_('um', 'Um par')] } },
    base: { cores: 'cobre', chifres: 'dois' },
    receita: c => ({ corpo: { L: 1.0, R: 0.18, H: 0.34, pesc: 0.22 }, cabeca: { tipo: 'dragao', chifresD: c.chifres, barbaTent: true, grande: true }, cauda: 'lagarto', asas: 'morcego', pe: 'garra', extras: ['espinhos-dorso'], pesado: true, flap: 1.5 }) },
  'iguana-trovao': { num: 61, nome: 'Iguana-trovão', grupo: 'Répteis', fam: 'C', tam: 0.9, desc: 'Crista que acende com raios; corre.',
    cats: { cores: pal({ verde: { n: 'Verde', pele: '#5a8a4a', claro: '#b0d090', escuro: '#2a4a20', brilho: '#80e0ff' }, laranja: { n: 'Laranja', pele: '#c8703a', claro: '#f0c090', escuro: '#5a2a10', brilho: '#ffe040' }, azul: { n: 'Azul', pele: '#3a6a9a', claro: '#90b8e0', escuro: '#18304a', brilho: '#c080ff' } }),
      crista: { n: 'Crista', o: [P_('alta', 'Alta'), P_('baixa', 'Baixa')] } },
    base: { cores: 'verde', crista: 'alta' },
    receita: c => ({ corpo: { L: 0.9, R: 0.14, H: 0.18, pesc: 0.1 }, cabeca: { tipo: 'lagarto', papo: true }, cauda: 'lagarto', pe: 'garra', esparramado: true, extras: ['crista-' + c.crista] }) },
  'hidra-de-bolso': { num: 62, nome: 'Hidra-de-bolso', grupo: 'Répteis', fam: 'C', tam: 0.5, desc: 'Três cabecinhas que brigam entre si; anda torto.',
    cats: { cores: pal({ verde: { n: 'Verde', pele: '#5a9a5a', claro: '#c0e8b0', escuro: '#2a4a2a', extra: '#f0e8c0' }, rubra: { n: 'Rubra', pele: '#b04a3a', claro: '#f0b0a0', escuro: '#5a1a14', extra: '#f8e8d0' }, roxa: { n: 'Roxa', pele: '#6a4a9a', claro: '#c8b0f0', escuro: '#2e1a4a', extra: '#f0e0ff' } }),
      cabecas: { n: 'Cabeças', o: [P_('tres', 'Três'), P_('duas', 'Duas')] } },
    base: { cores: 'verde', cabecas: 'tres' },
    receita: c => ({ corpo: { L: 0.75, R: 0.17, H: 0.2, pesc: 0.16 }, cabeca: { tipo: 'dragao' }, extraCabecas: c.cabecas === 'tres' ? 2 : 1, cauda: 'lagarto', pe: 'garra', esparramado: true }) },
  'tartaruga-ilha': { num: 63, nome: 'Tartaruga-ilha', grupo: 'Colossais', fam: 'C', tam: 30, desc: 'Uma vila inteira nas costas; nada devagar.',
    cats: { cores: pal({ mar: { n: 'Mar', pele: '#5a8a6a', claro: '#b0d0b8', escuro: '#2a4a3a', extra: '#7a6a4a', casco2: '#a08a5a', musgo: '#5a8a3a' }, rocha: { n: 'Rocha', pele: '#6a6a6a', claro: '#a8a8a8', escuro: '#2e2e2e', extra: '#5a5048', casco2: '#8a7a68', musgo: '#4a7a4a' } }),
      vila: { n: 'Nas costas', o: [P_('vila', 'Vila'), P_('templo', 'Templo'), P_('floresta', 'Floresta')] } },
    base: { cores: 'mar', vila: 'vila' },
    receita: c => ({ corpo: { L: 0.85, R: 0.22, H: 0.16, pesc: 0.12 }, cabeca: { tipo: 'tartaruga' }, cauda: 'curta', pe: 'nadadeira', extras: ['casco-placas', 'costas-' + c.vila], pesado: true }) },
  'camaleao-tecelao': { num: 64, nome: 'Camaleão-tecelão', grupo: 'Répteis', fam: 'C', tam: 0.6, desc: 'Língua que tece, cauda preênsil; escala.',
    cats: { cores: pal({ folha: { n: 'Folha', pele: '#6ab04a', claro: '#d0f0a0', escuro: '#2a5a1a', extra: '#f0c040' }, rubi: { n: 'Rubi', pele: '#c8504a', claro: '#f8c0a0', escuro: '#5a1a14', extra: '#40c0f0' }, turquesa: { n: 'Turquesa', pele: '#3ab0a0', claro: '#b0f0e0', escuro: '#145a50', extra: '#f080c0' } }),
      fio: { n: 'Fio', o: [P_('sim', 'Novelo de fio'), P_('nao', 'Nada')] } },
    base: { cores: 'folha', fio: 'sim' },
    receita: c => ({ corpo: { L: 0.75, R: 0.16, H: 0.26, pesc: 0.04 }, cabeca: { tipo: 'camaleao' }, cauda: 'enrolada', pe: 'garra', extras: c.fio === 'sim' ? ['novelo', 'crista-baixa'] : ['crista-baixa'] }) },
  'abobora-cocheira': { num: 93, nome: 'Abóbora-cocheira', grupo: 'Plantas', fam: 'C', tam: 1.6, desc: 'Corpo de abóbora, patas de raiz; trote pesado.',
    cats: { cores: pal({ laranja: { n: 'Laranja', pele: '#e0702a', claro: '#f0a060', escuro: '#5a3a1a', brilho: '#ffd040' }, branca: { n: 'Fantasma', pele: '#e8e4d8', claro: '#ffffff', escuro: '#5a4a3a', brilho: '#80e0ff' }, verde: { n: 'Moranga', pele: '#5a7a3a', claro: '#90b060', escuro: '#3a2a1a', brilho: '#ff8040' } }),
      rosto: { n: 'Rosto', o: [P_('sorriso', 'Sorriso'), P_('bravo', 'Bravo'), P_('nenhum', 'Sem rosto')] } },
    base: { cores: 'laranja', rosto: 'sorriso' },
    receita: c => ({ corpo: { L: 0.85, R: 0.3, H: 0.32, pesc: 0.02 }, cabeca: { tipo: 'nenhuma' }, cauda: 'nenhuma', pe: 'raiz', corpoAbobora: c.rosto, pesado: true }) },
  'libelula-montaria': { num: 70, nome: 'Libélula-montaria', grupo: 'Insetos', fam: 'D', tam: 0.8, voa: true, desc: '4 asas, sela no tórax; montaria voadora.',
    cats: { cores: pal({ esmeralda: { n: 'Esmeralda', pele: '#2a9a6a', claro: '#80e0b0', escuro: '#104a30', extra: '#7a3a2a', asa: '#d0f0ff' }, rubi: { n: 'Rubi', pele: '#c83a3a', claro: '#f0a0a0', escuro: '#5a1414', extra: '#3a2a1a', asa: '#ffe0e0' }, safira: { n: 'Safira', pele: '#3a5ac8', claro: '#a0b8f0', escuro: '#14245a', extra: '#c8a040', asa: '#e0e8ff' } }),
      sela: { n: 'Sela', o: [P_('simples', 'Simples'), P_('dupla', 'Dupla'), P_('nenhuma', 'Selvagem')] } },
    base: { cores: 'esmeralda', sela: 'simples' },
    receita: c => ({ pares: 3, corpo: 'libelula', cabeca: 'libelula', asas: 'libelula', sela: c.sela, perna: 0.5, flap: 6 }) },
  'mariposa-lua': { num: 72, nome: 'Mariposa-lua', grupo: 'Insetos', fam: 'D', tam: 0.9, voa: true, desc: 'Asas com olhos falsos, pó prateado; voo noturno lento.',
    cats: { cores: pal({ lua: { n: 'Lua', pele: '#d8e8d0', claro: '#ffffff', escuro: '#6a7a6a', extra: '#3a6ac8', asa: '#c8e8c0' }, ambar: { n: 'Âmbar', pele: '#e8c890', claro: '#fff4d8', escuro: '#7a5a2a', extra: '#c83a3a', asa: '#f0d090' }, noite: { n: 'Noite', pele: '#5a5a7a', claro: '#c8c8f0', escuro: '#22223a', extra: '#f0d040', asa: '#7a7aa8' } }),
      olhos: { n: 'Olhos nas asas', o: [P_('grandes', 'Grandes'), P_('pequenos', 'Pequenos')] } },
    base: { cores: 'lua', olhos: 'grandes' },
    receita: c => ({ pares: 3, corpo: 'mariposa', cabeca: 'mariposa', asas: 'mariposa', olhosAsa: c.olhos, antenas: true, perna: 0.5, flap: 2.5 }) },
};
Object.assign(ESPECIES, ESP_8A);

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
  const TRACKED = bones.filter(b => !endNames.has(b.name)), clips = [], SB = (extra.scaleBones || []).map(n => B[n]);   // esticar/achatar
  for (const cd of clipdefs) {
    const N = Math.max(2, Math.round(cd.dur * cd.fps)), times = [], qa = TRACKED.map(() => []), pos = [], sa = SB.map(() => []);
    for (let i = 0; i <= N; i++) {
      const t = i / N * cd.dur; for (const b of SB) b.scale.set(1, 1, 1); applyPose(cd.fn(Math.min(t, cd.dur - 1e-6)));
      times.push(t); TRACKED.forEach((b, j) => qa[j].push(...b.quaternion.toArray())); pos.push(...bones[0].position.toArray()); SB.forEach((b, j) => sa[j].push(...b.scale.toArray()));
    }
    const tracks = TRACKED.map((b, j) => new THREE.QuaternionKeyframeTrack(b.name + '.quaternion', times, qa[j]));
    SB.forEach((b, j) => tracks.push(new THREE.VectorKeyframeTrack(b.name + '.scale', times, sa[j])));
    tracks.push(new THREE.VectorKeyframeTrack(bones[0].name + '.position', times, pos));
    clips.push(new THREE.AnimationClip(cd.name, cd.dur, tracks));
  }
  const restPose = () => { for (const b of bones) { b.quaternion.identity(); b.scale.set(1, 1, 1); const p = PARENT[b.name]; b.position.copy(REST[b.name]).sub(p ? REST[p] : V3(0, 0, 0)); } root.updateMatrixWorld(true); };
  restPose();
  const springs = [];
  for (const ch of chains) ch.names.forEach((nm, i) => springs.push({ b: B[nm], c: B[i < ch.names.length - 1 ? ch.names[i + 1] : ch.end], ...ch.spring[i], max: ch.spring[i].max * D2R }));
  const box = new THREE.Box3().setFromBufferAttribute(geo.attributes.position);
  return { root, mesh, geo, bones, B, REST, PARENT, clips, springs, restPose, tris: geo.attributes.position.count / 3, nominalH: box.max.y - Math.min(0, box.min.y), nominalL: box.max.z - box.min.z,
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

// ======================================================================= FAMÍLIA C — quadrúpede (asas opcionais)
function ikQ(b1, b2, b3, target, pole, l1, l2, leg, qEnd) {
  const P = new THREE.Vector3().setFromMatrixPosition(b1.matrixWorld);
  const v = target.clone().sub(P); const d0 = v.length(); const vh = v.divideScalar(d0 || 1);
  const d = clamp(d0, Math.abs(l1 - l2) + 1e-3, (l1 + l2) * 0.9995);
  const a = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const bend = Math.PI - Math.acos(clamp((l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2), -1, 1));
  const p = pole.clone().addScaledVector(vh, -pole.dot(vh)); if (p.lengthSq() < 1e-8) p.set(0, 0, leg ? 1 : -1); p.normalize();
  const dir1 = vh.clone().multiplyScalar(Math.cos(a)).addScaledVector(p, Math.sin(a));
  const n = new THREE.Vector3().crossVectors(vh, p).normalize();
  const xA = leg ? n.clone().negate() : n, yA = dir1.clone().negate(), zA = new THREE.Vector3().crossVectors(xA, yA);
  const qW = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xA, yA, zA));
  b1.quaternion.copy(b1.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(qW));
  const qB = new THREE.Quaternion().setFromAxisAngle(_X, leg ? bend : -bend);
  b2.quaternion.copy(qB);
  b3.quaternion.copy(qW.clone().multiply(qB).invert().multiply(qEnd));
}
function forgeC(id, S, cfg) {
  const R = { corpo: { L: 0.8, R: 0.16, H: 0.4, pesc: 0.14 }, cabeca: { tipo: 'canino', orelhas: 'pontuda' }, cauda: 'fina', asas: null, pe: 'pata', pelagem: 'liso', extras: [], flap: 3, ...S.receita(cfg) };
  const COL = S.cats.cores.cor[cfg.cores];
  const pele0 = COL.pele || '#8a7a6a';
  const C = { pele: pele0, claro: hex(pele0, 1.3), escuro: hex(pele0, 0.55), extra: '#e8dcc0', brilho: '#ffd060', asa: pele0, asa2: hex(pele0, 1.3), olho: '#1b1712', ...COL };
  const { L, R: Rb, H, pesc } = R.corpo;
  const kit = makeKit(v => v.clone()), { add, G } = kit;
  const metal = !!R.armadura || !!R.espelho, crist = !!R.corpoCristal, ori = !!R.origami, spr = R.esparramado ? 1 : 0;
  const bodyMat = crist ? 3 : 0, J = ori ? 0 : crist ? 0.006 : 0.004, VAR = ori ? 0.16 : 0.07;
  const yb = H + Rb * 0.75, zr = -L * 0.38, zc = L * 0.32, yj = yb - Rb * 0.25, fy = 0.05, frontUp = R.dianteiraAlta ? Rb * 0.25 : 0;
  const xf = Rb * (0.6 + 0.35 * spr), xb = Rb * (0.62 + 0.35 * spr), zf = L * 0.33, zbk = -L * 0.36;
  const nb = [0, yb + Rb * 0.35 + frontUp, L * 0.4], hp = [0, yb + Rb * 0.35 + frontUp + pesc * 0.75, L * 0.42 + pesc * 0.7];
  const HB = (x, y, z) => [x, hp[1] + y, hp[2] + z];

  // ---------- correntes
  const chains = [];
  const tl = L / 0.8, t0 = [0, yb + Rb * 0.25, zr - Rb * 0.95];
  const T = (dy, dz) => [0, t0[1] + dy * tl, t0[2] + dz * tl];
  const tailPts = { peluda: [t0, T(0.05, -0.15), T(0.02, -0.3), T(-0.05, -0.43)], fina: [t0, T(0.02, -0.14), T(-0.02, -0.28), T(-0.08, -0.42)], tufo: [t0, T(0, -0.14), T(-0.06, -0.27), T(-0.14, -0.36)],
    tufoFogo: [t0, T(0.03, -0.15), T(0.04, -0.3), T(0.02, -0.44)], fogo: [t0, T(0.02, -0.12), T(0.03, -0.24), T(0.06, -0.36)], fumaca: [t0, T(-0.02, -0.15), T(-0.08, -0.28), T(-0.16, -0.38)],
    escamas: [t0, T(-0.04, -0.15), T(-0.1, -0.29), T(-0.16, -0.42)], cristal: [t0, T(0.03, -0.12), T(0.03, -0.24), T(0.0, -0.34)], leque: [t0, T(0.06, -0.12), T(0.12, -0.24), T(0.16, -0.36)], lagarto: [t0, T(-0.04, -0.2), T(-0.1, -0.4), T(-0.14, -0.6)], enrolada: [t0, T(0.02, -0.16), T(0.12, -0.26), T(0.2, -0.18)] }[R.cauda];
  if (tailPts) chains.push({ name: 'Tail', label: 'cauda', parent: 'Hips', pts: tailPts, names: ['Tail1', 'Tail2', 'Tail3'], end: 'TailEnd',
    spring: [{ k: 55, d: 6, g: 0.3, max: 25 }, { k: 42, d: 5, g: 0.3, max: 35 }, { k: 32, d: 4, g: 0.3, max: 45 }] });
  if (R.extras.includes('crina-longa') || R.extras.includes('crina-curta')) chains.push({ name: 'Mane', label: 'crina', parent: 'Neck', pts: [[0, nb[1] + 0.05, nb[2] + 0.01], [0, (nb[1] + hp[1]) / 2 + 0.05, (nb[2] + hp[2]) / 2 - 0.04], [0, hp[1] + 0.06, hp[2] - 0.08]],
    names: ['Mane1', 'Mane2'], end: 'ManeEnd', spring: [{ k: 50, d: 5, g: 0.3, max: 25 }, { k: 40, d: 4, g: 0.3, max: 35 }] });

  // ---------- esqueleto
  const bdef = [['Hips', null, [0, yb, zr]], ['Spine', 'Hips', [0, yb + 0.01, 0]], ['Chest', 'Spine', [0, yb + 0.02 + frontUp * 0.5, zc]], ['Neck', 'Chest', nb], ['Head', 'Neck', hp]];
  const extraH = []; for (let k = 0; k < (R.extraCabecas || 0); k++) { const sd = k === 0 ? 1 : -1, nb2 = [sd * Rb * 0.55, nb[1], nb[2] - 0.02], hp2 = [sd * (Rb * 0.55 + pesc * 0.55), hp[1] - 0.03, hp[2] - 0.04];
    bdef.push(['Neck' + (k + 2), 'Chest', nb2], ['Head' + (k + 2), 'Neck' + (k + 2), hp2]); extraH.push({ bone: 'Head' + (k + 2), neck: 'Neck' + (k + 2), nb: nb2, hp: hp2, sd }); }
  for (const [s, L2] of [[1, '_L'], [-1, '_R']]) {
    const fyj = yj + frontUp;
    bdef.push(['FrontUpLeg' + L2, 'Chest', [s * xf, fyj, zf]], ['FrontLeg' + L2, 'FrontUpLeg' + L2, [s * xf, (fyj + fy) / 2, zf]], ['FrontFoot' + L2, 'FrontLeg' + L2, [s * xf, fy, zf]],
      ['BackUpLeg' + L2, 'Hips', [s * xb, yj, zbk]], ['BackLeg' + L2, 'BackUpLeg' + L2, [s * xb, (yj + fy) / 2, zbk]], ['BackFoot' + L2, 'BackLeg' + L2, [s * xb, fy, zbk]]);
    if (R.asas) { const wr = [s * Rb * 0.42, yb + Rb * 0.8 + frontUp * 0.5, zc * 0.55], bird = ['ave', 'morcego', 'chama'].includes(R.asas), span = L * (R.pesado ? 0.75 : 0.65);
      bdef.push(['WingA' + L2, 'Chest', wr], bird ? ['WingB' + L2, 'WingA' + L2, [s * (Rb * 0.42 + span * 0.45), wr[1] + span * 0.2, wr[2] - 0.03]] : ['WingB' + L2, 'Chest', [wr[0], wr[1] - 0.02, wr[2] - 0.04]]); }
  }
  const skel = buildSkeleton(bdef, chains, v => v);
  kit.setBI(skel.BI);
  const { B, REST } = skel;
  const bodyW = p => { const t = ramp(p.z, zr * 0.55, zc * 0.55); return t <= 0 ? [['Hips', 1]] : t >= 1 ? [['Chest', 1]] : t < 0.5 ? [['Hips', 1 - t * 2], ['Spine', t * 2]] : [['Spine', 2 - t * 2], ['Chest', t * 2 - 1]]; };
  const neckW = p => { const a = V3(...nb), b = V3(...hp), ab = b.clone().sub(a), t = clamp(p.clone().sub(a).dot(ab) / ab.lengthSq(), 0, 1); return t > 0.85 ? [['Neck', 1 - (t - 0.85) / 0.3], ['Head', (t - 0.85) / 0.3]] : [['Chest', Math.max(0, 1 - t * 2.5)], ['Neck', Math.min(1, t * 2.5)]]; };
  const M = { metal, mat: metal ? 1 : bodyMat };

  // ---------- corpo
  if (R.corpoAbobora) { const zc0 = (zr + zc) / 2;
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; add(G.sph(Rb * 1.15, 9, 7), { c: i % 2 ? C.pele : hex(C.pele, 0.9), b: bodyW, pos: [Math.sin(a) * Rb * 0.45, yb + Rb * 0.25, zc0 + Math.cos(a) * Rb * 0.6], scl: [0.75, 0.9, 0.85], jit: 0.003 }); }
    add(G.tube([0, yb + Rb * 1.2, zc0], [0.03, yb + Rb * 1.55, zc0 - 0.02], 0.05, 0.035, 6), { c: '#4a6a2a', b: 'Spine', jit: 0.002 });
    if (R.corpoAbobora !== 'nenhum') { const fz = zc0 + Rb * 1.42, br = R.corpoAbobora === 'bravo';
      for (const s of [1, -1]) add(G.cone(Rb * 0.18, Rb * 0.26, 3), { c: C.brilho, glow: true, b: bodyW, pos: [s * Rb * 0.32, yb + Rb * 0.45, fz], rot: [90, 0, br ? s * 25 : 0], jit: 0 });
      add(G.box(Rb * 0.8, Rb * 0.14, Rb * 0.1), { c: C.brilho, glow: true, b: bodyW, pos: [0, yb + Rb * 0.05, fz], jit: 0, deform: g => { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) pa.setY(i, pa.getY(i) + (br ? -2 : 2) * pa.getX(i) * pa.getX(i)); } }); } }
  if (!R.corpoAbobora) {
  add(G.sph(Rb, 10, 8), { c: C.pele, b: 'Hips', pos: [0, yb, zr], scl: [1, 0.95, 1.1], jit: J, vary: VAR, ...M });
  const bzs = Math.max(1.35, (zc - zr) * 0.62 / (Rb * 0.97));
  add(G.sph(Rb * 0.97, 10, 8), { c: C.pele, b: bodyW, pos: [0, yb - 0.01 + frontUp * 0.4, (zr + zc) / 2], scl: [1, 0.93, bzs], jit: J, vary: VAR, ...M });
  add(G.sph(Rb * 1.05, 10, 8), { c: C.pele, b: 'Chest', pos: [0, yb + 0.02 + frontUp * 0.8, zc], scl: [1, 1 + frontUp * 2, 1.1], jit: J, vary: VAR, ...M });
  if (!metal && !crist) add(G.sph(Rb * 0.8, 8, 6), { c: C.claro, b: bodyW, pos: [0, yb - Rb * 0.42, 0], scl: [0.75, 0.45, 1.55], jit: J, vary: VAR });
  add(G.tube([nb[0], nb[1] - Rb * 0.3, nb[2] - 0.03], hp, Rb * 0.5, Rb * 0.42, 8), { c: C.pele, b: neckW, jit: J, vary: VAR, ...M });
  }
  for (const eh of extraH) add(G.tube([eh.nb[0], eh.nb[1] - Rb * 0.3, eh.nb[2] - 0.03], eh.hp, Rb * 0.4, Rb * 0.32, 8), { c: C.pele, b: p => p.y > eh.nb[1] ? [[eh.neck, 1]] : [['Chest', 1]], jit: J });
  // pernas
  for (const [s, L2] of [[1, '_L'], [-1, '_R']]) for (const fr of [true, false]) {
    const x = s * (fr ? xf : xb), z = fr ? zf : zbk, y0 = fr ? yj + frontUp : yj, ym = (y0 + fy) / 2, P = fr ? 'Front' : 'Back';
    const gross = R.pe === 'grossa', r1 = Rb * (gross ? 0.42 : 0.3), r2 = Rb * (gross ? 0.36 : 0.19);
    add(G.sph(Rb * (fr ? 0.38 : 0.46), 8, 6), { c: C.pele, b: P + 'UpLeg' + L2, pos: [x * 0.92, y0 + 0.01, z + (fr ? 0.02 : -0.01)], scl: [0.8, 1.2, 1], jit: J, vary: VAR, ...M });
    add(G.tube([x, y0, z], [x, ym, z], r1, r1 * 0.78, 7), { c: C.pele, b: P + 'UpLeg' + L2, jit: J, vary: VAR, ...M });
    const legC = R.patasEscuras ? C.escuro : C.pele;
    add(G.tube([x, ym, z], [x, fy + 0.01, z], r2, r2 * 0.85, 7), { c: legC, b: P + 'Leg' + L2, jit: J, vary: VAR, ...M });
    const F = P + 'Foot' + L2, pe = R.pe;
    if (pe === 'pata') add(G.sph(r2 * 1.35, 7, 5), { c: legC, b: F, pos: [x, fy * 0.6, z + r2 * 0.4], scl: [1, 0.55, 1.3], jit: J, ...M });
    if (pe === 'garra') { add(G.sph(r2 * 1.35, 7, 5), { c: legC, b: F, pos: [x, fy * 0.6, z + r2 * 0.4], scl: [1, 0.55, 1.3], jit: J });
      for (const dx of [-1, 0, 1]) add(G.cone(r2 * 0.3, r2 * 1.1, 4), { c: '#e8e0c8', b: F, pos: [x + dx * r2 * 0.55, fy * 0.35, z + r2 * 1.55], rot: [80, 0, 0], jit: 0 }); }
    if (pe === 'casco') { add(G.cyl(r2 * 1.05, r2 * 1.2, fy * 1.1, 7), { c: C.escuro, b: F, pos: [x, fy * 0.55, z + 0.005], jit: J }); }
    if (pe === 'grossa') { add(G.cyl(r2 * 1.15, r2 * 1.25, fy * 1.3, 9), { c: C.pele, b: F, pos: [x, fy * 0.65, z], jit: J, ...M });
      for (const a of [-0.6, 0, 0.6]) add(G.sph(r2 * 0.28, 5, 3), { c: C.extra, b: F, pos: [x + Math.sin(a) * r2 * 1.1, fy * 0.3, z + Math.cos(a) * r2 * 1.15], jit: 0 }); }
    if (pe === 'nadadeira') add(G.sph(1, 7, 4), { c: C.pele, b: F, pos: [x + s * Rb * 0.25, fy * 0.6, z + (fr ? 0.04 : -0.02)], scl: [Rb * (fr ? 1.1 : 0.7), Rb * 0.12, Rb * 0.45], rot: [0, s * (fr ? -25 : 25), 0], jit: J });
    if (pe === 'fumaca') add(G.cone(r2 * 1.6, fy * 2.2, 7), { c: C.crina || C.claro, mat: 3, b: F, pos: [x, fy * 0.8, z], rot: [180, 0, 0], jit: 0.004 });
    if (pe === 'raiz') for (const a of [-0.6, 0, 0.6, 2.8]) add(G.tube([x, fy, z], [x + Math.sin(a) * r2 * 2.4, 0.0, z + Math.cos(a) * r2 * 2.4], r2 * 0.6, r2 * 0.2, 5), { c: '#6a4a2a', b: F, jit: 0.003 });
    if (pe === 'cristal') add(G.octa(r2 * 1.4), { c: C.cristal || C.claro, mat: 3, b: F, pos: [x, fy * 0.7, z], scl: [1, 0.8, 1.2], jit: 0 });
  }
  // pelagem
  if (R.pelagem === 'listras') for (let i = 0; i < 7; i++) { const z = zr + (zc - zr) * (i / 6) - Rb * 0.2, w = ramp(i, 0, 6);
    for (const a of [-0.9, 0, 0.9]) { const g = G.box(Rb * 0.18, Rb * 0.55, Rb * 0.08); g.rotateZ(a); g.translate(Math.sin(a) * Rb * 0.98, yb + Math.cos(a) * Rb * 0.92 + frontUp * w * 0.6, z);
      add(g, { c: C.escuro, b: bodyW, jit: 0, vary: 0.05, mat: crist ? 3 : 0 }); } }
  if (R.pelagem === 'pintas') for (let i = 0; i < 16; i++) { const a = (i * 2.4) % 6.28, z = zr + (zc - zr) * ((i * 0.37) % 1), dy = Math.cos(a), dx = Math.sin(a);
    if (dy < -0.3) continue; add(G.sph(Rb * 0.16, 5, 3), { c: C.escuro, b: bodyW, pos: [dx * Rb * 0.98, yb + dy * Rb * 0.93, z], scl: [1, 1, 0.4], rot: [0, 0, -a / D2R], jit: 0 }); }

  // ---------- cabeça
  const HC = R.cabeca, HK = { b: 'Head' }, hx = HC.tipo;
  const eyes = (x, y, z, r = 0.022, col = '#1b1712', glow = false) => { for (const s of [1, -1]) {
    add(G.sph(r, 6, 4), { c: col, glow, b: 'Head', pos: HB(s * x, y, z), scl: [0.8, 1, 0.6], jit: 0, vary: 0 });
    if (!glow) add(G.box(r * 0.5, r * 0.5, r * 0.4), { c: '#fff6e0', b: 'Head', pos: HB(s * x - s * r * 0.2, y + r * 0.35, z + r * 0.45), jit: 0, vary: 0 }); } };
  const ears = (tipo, x, y, z, col = C.pele) => { for (const s of [1, -1]) {
    if (tipo === 'pontuda' || tipo === 'felina') add(G.cone(0.035, 0.085, tipo === 'felina' ? 3 : 4), { c: col, b: 'Head', pos: HB(s * x, y, z), rot: [-10, 0, -s * 18], jit: 0.002 });
    if (tipo === 'grande') add(G.cone(0.05, 0.13, 4), { c: col, b: 'Head', pos: HB(s * x, y + 0.02, z), rot: [-10, 0, -s * 20], jit: 0.002 });
    if (tipo === 'enorme') add(G.cone(0.07, 0.17, 3), { c: col, b: 'Head', pos: HB(s * (x + 0.02), y + 0.04, z), rot: [-5, 0, -s * 28], jit: 0.002 });
    if (tipo === 'redonda') add(G.sph(0.04, 6, 4), { c: col, b: 'Head', pos: HB(s * x, y, z), scl: [1, 1, 0.5], jit: 0.002 });
    if (tipo === 'caida') add(G.sph(1, 6, 4), { c: C.escuro, b: 'Head', pos: HB(s * (x + 0.02), y - 0.06, z), scl: [0.02, 0.07, 0.045], rot: [0, 0, s * 15], jit: 0.002 });
    if (tipo === 'lado') add(G.sph(1, 6, 4), { c: col, b: 'Head', pos: HB(s * (x + 0.04), y, z), scl: [0.06, 0.022, 0.035], rot: [0, 0, s * 20], jit: 0.002 }); } };
  const horns = (tipo, x, y, z, col = C.extra, big = 1) => { for (const s of [1, -1]) {
    let pts, rr;
    if (tipo === 'espiral') { pts = []; for (let i = 0; i <= 6; i++) { const a = i / 6 * Math.PI * 1.6, r = 0.06 * big * (1 - i / 9); pts.push([s * (x + i * 0.022 * big), y + Math.sin(a) * r + i * 0.012 * big, z + Math.cos(a) * r - 0.04 * big]); } rr = pts.map((_, i) => 0.03 * big * (1 - i / 7) + 0.004); }
    else if (tipo === 'curvos') { pts = [[x, y, z], [x + 0.08 * big, y + 0.02 * big, z], [x + 0.14 * big, y + 0.08 * big, z + 0.02 * big], [x + 0.15 * big, y + 0.15 * big, z + 0.05 * big]].map(p => [s * p[0], p[1], p[2]]); rr = [0.03, 0.025, 0.017, 0.004].map(v => v * big); }
    else if (tipo === 'arco') { pts = [[x, y, z], [x + 0.12 * big, y + 0.06 * big, z + 0.03 * big], [x + 0.16 * big, y + 0.16 * big, z + 0.12 * big], [x + 0.12 * big, y + 0.22 * big, z + 0.24 * big], [x + 0.06 * big, y + 0.2 * big, z + 0.32 * big]].map(p => [s * p[0], p[1], p[2]]); rr = [0.04, 0.034, 0.026, 0.017, 0.005].map(v => v * big); }
    else if (tipo === 'retos') { pts = [[s * x, y, z], [s * (x + 0.03), y + 0.06, z + 0.07]].map(p => p); rr = [0.028, 0.004]; }
    else if (tipo === 'curtos') { pts = [[s * x, y, z], [s * (x + 0.06), y + 0.02, z], [s * (x + 0.08), y + 0.07, z + 0.01]]; rr = [0.03, 0.022, 0.004]; }
    else if (tipo === 'trasCurvos') { pts = [[x, y, z], [x + 0.02, y + 0.08, z - 0.04], [x + 0.04, y + 0.12, z - 0.12], [x + 0.06, y + 0.08, z - 0.2]].map(p => [s * p[0], p[1], p[2]]); rr = [0.025, 0.02, 0.014, 0.004]; }
    else if (tipo === 'enrolados') { pts = [[x, y, z], [x + 0.05, y + 0.04, z - 0.04], [x + 0.08, y - 0.01, z - 0.06], [x + 0.07, y - 0.05, z - 0.01], [x + 0.05, y - 0.03, z + 0.02]].map(p => [s * p[0], p[1], p[2]]); rr = [0.024, 0.02, 0.016, 0.012, 0.006]; }
    if (pts) for (let i = 0; i < pts.length - 1; i++) add(G.tube(HB(...pts[i]), HB(...pts[i + 1]), rr[i], rr[i + 1], 6), { c: col, b: 'Head', jit: 0.002 }); } };
  if (hx === 'canino') {
    const fino = HC.focinhoFino ? 0.82 : 1, curto = HC.focinhoCurto ? 0.75 : 1, hm = HC.armadura ? { metal: true, mat: 1 } : {};
    add(G.sph(0.11, 9, 7), { c: C.pele, b: 'Head', pos: HB(0, 0.03, 0), scl: [1, 0.9, 1.05], jit: J, ...hm });
    add(G.tube(HB(0, 0.0, 0.07), HB(0, -0.02, 0.07 + 0.15 * curto), 0.058 * fino, 0.034 * fino, 8), { c: HC.armadura ? C.pele : C.claro, b: 'Head', jit: J, ...hm });
    add(G.ico(0.022), { c: '#1b1712', b: 'Head', pos: HB(0, -0.005, 0.075 + 0.15 * curto), jit: 0 });
    add(G.box(0.05 * fino, 0.008, 0.01), { c: '#1b1712', b: 'Head', pos: HB(0, -0.045, 0.07 + 0.12 * curto), jit: 0, vary: 0 });
    if (HC.armadura) { add(G.box(0.15, 0.025, 0.04), { c: C.brilho, glow: true, b: 'Head', pos: HB(0, 0.05, 0.085), jit: 0 }); for (const s of [1, -1]) add(G.ico(0.014), { c: C.escuro, metal: true, mat: 1, b: 'Head', pos: HB(s * 0.08, 0.0, 0.05), jit: 0 }); }
    else if (HC.olhosCompostos) eyes(0.06, 0.06, 0.07, 0.04, C.olho); else eyes(0.05, 0.055, 0.085);
    ears(HC.orelhas, 0.06, 0.13, -0.01, HC.armadura ? C.pele : C.pele);
  }
  if (hx === 'felino') {
    add(G.sph(0.12, 9, 7), { c: C.pele, b: 'Head', pos: HB(0, 0.02, 0), scl: [1.05, 0.95, 1], jit: J, vary: VAR, mat: bodyMat });
    add(G.sph(0.06, 7, 5), { c: C.claro, b: 'Head', pos: HB(0, -0.025, 0.095), scl: [1.25, 0.8, 0.8], jit: J, vary: VAR });
    add(G.cone(0.018, 0.02, 3), { c: '#d88090', b: 'Head', pos: HB(0, 0.0, 0.14), rot: [180, 0, 0], jit: 0 });
    if (HC.olhosBrilho) eyes(0.05, 0.04, 0.1, 0.022, C.brilho, true);
    else { eyes(0.05, 0.04, 0.1, 0.024, C.olho === '#1b1712' ? '#e8c040' : C.olho); for (const s of [1, -1]) add(G.box(0.007, 0.03, 0.01), { c: '#1b1712', b: 'Head', pos: HB(s * 0.05, 0.04, 0.117), jit: 0, vary: 0 }); }
    for (const s of [1, -1]) for (const dy of [0, 0.012]) add(G.box(0.07, 0.003, 0.003), { c: '#e8e0d0', b: 'Head', pos: HB(s * 0.08, -0.03 + dy, 0.11), rot: [0, 0, s * (dy ? -10 : 10)], jit: 0 });
    ears(HC.orelhas === 'redonda' ? 'redonda' : HC.orelhas, 0.075, 0.12, -0.01);
  }
  if (hx === 'suino') {
    add(G.sph(0.12, 9, 7), { c: C.pele, b: 'Head', pos: HB(0, 0.02, 0), scl: [1, 0.95, 1.25], jit: J, vary: VAR });
    add(G.cyl(0.06, 0.065, 0.06, 9), { c: C.claro, b: 'Head', pos: HB(0, -0.015, 0.15), rot: [90, 0, 0], jit: J });
    for (const s of [1, -1]) add(G.sph(0.012, 5, 3), { c: '#2a1a1a', b: 'Head', pos: HB(s * 0.022, -0.012, 0.182), jit: 0 });
    eyes(0.06, 0.06, 0.09, 0.016);
    const pr = HC.presas, tusk = (x, len) => { for (const s of [1, -1]) add(G.tube(HB(s * x, -0.05, 0.12), HB(s * (x + 0.03), -0.05 + len, 0.12 + len * 0.6), 0.016, 0.003, 5), { c: C.extra, b: 'Head', jit: 0 }); };
    tusk(0.05, pr === 'longas' ? 0.13 : 0.08); if (pr === 'quatro') tusk(0.035, 0.05);
    ears('pontuda', 0.07, 0.11, -0.04);
  }
  if (hx === 'cervideo' || hx === 'lebre') {
    const big = HC.grande ? 1.25 : 1;
    add(G.sph(0.09 * big, 9, 7), { c: C.pele, b: 'Head', pos: HB(0, 0.02, 0), scl: [0.9, 0.9, 1.1], jit: J });
    add(G.tube(HB(0, 0.0, 0.05 * big), HB(0, -0.035 * big, 0.19 * big), 0.05 * big, 0.034 * big, 8), { c: C.pele, b: 'Head', jit: J });
    add(G.ico(0.022 * big), { c: '#1b1712', b: 'Head', pos: HB(0, -0.025 * big, 0.195 * big), jit: 0 });
    eyes(0.055 * big, 0.04 * big, 0.06 * big, 0.02 * big);
    if (hx === 'lebre') for (const s of [1, -1]) add(G.sph(1, 6, 4), { c: C.pele, b: 'Head', pos: HB(s * 0.04, 0.14, -0.04), scl: [0.025, 0.11, 0.04], rot: [-15, 0, -s * 12], jit: 0.002 });
    else ears('lado', 0.07 * big, 0.06 * big, -0.03);
    if (HC.galhadas) { const gs = HC.galhadas === 'grandes' ? 1.3 : HC.galhadas === 'pequenas' ? 0.7 : 1, ac = C.extra, sc = big * gs;
      for (const s of [1, -1]) {
        const a0 = HB(s * 0.04 * big, 0.09 * big, -0.01), a1 = HB(s * 0.1 * sc, 0.2 * sc, -0.04 * sc), a2 = HB(s * 0.2 * sc, 0.3 * sc, -0.06 * sc);
        add(G.tube(a0, a1, 0.018 * big, 0.014 * big, 5), { c: ac, b: 'Head', jit: 0.002 }); add(G.tube(a1, a2, 0.014 * big, 0.008 * big, 5), { c: ac, b: 'Head', jit: 0.002 });
        if (HC.galhadas === 'palmadas') { const g = G.slab([[0, 0], [0.14, 0.04], [0.2, 0.12], [0.16, 0.2], [0.1, 0.14], [0.06, 0.22], [0.0, 0.12]].map(([u, v]) => [u * sc * 1.3, v * sc * 1.3]), 0.016);
          if (s < 0) g.scale(-1, 1, 1); g.rotateY(s * -0.2); g.translate(a1[0], a1[1], a1[2] - 0.02); add(g, { c: ac, b: 'Head', jit: 0.002 }); }
        else for (const [u, h] of [[0.4, 0.1], [0.75, 0.12]]) { const q = V3(...a1).lerp(V3(...a2), u); add(G.tube(q.toArray(), [q.x + s * 0.01, q.y + h * sc, q.z + 0.04 * sc], 0.009 * big, 0.003, 4), { c: ac, b: 'Head', jit: 0.001 }); }
        if (HC.lanternas) { const n = HC.lanternas / 2; for (let i = 0; i < n; i++) { const tip = V3(...a1).lerp(V3(...a2), 0.3 + i * 0.5 / Math.max(1, n - 1)).add(V3(s * 0.04 * sc, -0.02, 0.02));
          add(G.tube(tip.toArray(), [tip.x, tip.y - 0.05, tip.z], 0.003, 0.003, 3), { c: '#3a3a3a', b: 'Head', jit: 0 });
          add(G.box(0.03 * big, 0.04 * big, 0.03 * big), { c: '#3a3a3a', metal: true, b: 'Head', pos: [tip.x, tip.y - 0.075, tip.z], jit: 0 });
          add(G.box(0.022 * big, 0.03 * big, 0.022 * big), { c: C.brilho, glow: true, b: 'Head', pos: [tip.x, tip.y - 0.075, tip.z], jit: 0 }); } }
      } }
  }
  if (hx === 'bovino') {
    const big = HC.grande ? 1.15 : 1;
    add(G.sph(0.13 * big, 9, 7), { c: C.pele, b: 'Head', pos: HB(0, 0.02, 0), scl: [1.15, 0.9, 1], jit: J, vary: VAR });
    add(G.sph(1, 8, 5), { c: C.claro, b: 'Head', pos: HB(0, -0.045, 0.12 * big), scl: [0.095 * big, 0.065 * big, 0.07 * big], jit: J });
    for (const s of [1, -1]) add(G.sph(0.012, 5, 3), { c: '#2a1a1a', b: 'Head', pos: HB(s * 0.03, -0.035, 0.185 * big), jit: 0 });
    eyes(0.08 * big, 0.04, 0.09 * big, 0.018);
    ears('lado', 0.11 * big, 0.04, -0.03);
    horns(HC.chifres, 0.1 * big, 0.08, 0.0, C.extra, HC.grande ? 1.4 : 1);
    if (HC.barba) for (let i = 0; i < 6; i++) add(G.ico(0.03, 0), { c: C.liquen || C.escuro, b: 'Head', pos: HB(((i % 3) - 1) * 0.03, -0.1 - Math.floor(i / 3) * 0.04, 0.06), jit: 0.004, vary: 0.15 });
  }
  if (hx === 'equino') {
    add(G.sph(0.075, 8, 6), { c: C.pele, b: 'Head', pos: HB(0, 0.05, 0), jit: J });
    add(G.tube(HB(0, 0.05, 0.0), HB(0, -0.04, 0.2), 0.07, 0.046, 8), { c: C.pele, b: 'Head', jit: J });
    add(G.sph(0.05, 7, 5), { c: C.claro, b: 'Head', pos: HB(0, -0.045, 0.2), scl: [1, 0.8, 0.9], jit: J });
    for (const s of [1, -1]) add(G.sph(0.01, 4, 3), { c: '#2a1a1a', b: 'Head', pos: HB(s * 0.022, -0.04, 0.245), jit: 0 });
    eyes(0.065, 0.06, 0.05, 0.018);
    ears('pontuda', 0.035, 0.14, -0.02);
  }
  if (hx === 'caprino') {
    add(G.sph(0.085, 9, 7), { c: C.pele, b: 'Head', pos: HB(0, 0.03, 0), scl: [0.9, 0.95, 1.05], jit: J });
    add(G.tube(HB(0, 0.01, 0.05), HB(0, -0.04, 0.17), 0.045, 0.03, 8), { c: C.pele, b: 'Head', jit: J });
    add(G.ico(0.02), { c: '#1b1712', b: 'Head', pos: HB(0, -0.035, 0.175), jit: 0 });
    add(G.cone(0.03, 0.09, 5), { c: C.claro, b: 'Head', pos: HB(0, -0.1, 0.11), rot: [190, 0, 0], jit: 0.002 });
    eyes(0.055, 0.05, 0.05, 0.018); ears('lado', 0.07, 0.04, -0.03);
    horns(HC.chifres === 'curvos' ? 'trasCurvos' : HC.chifres, 0.035, 0.1, 0.0);
  }
  if (hx === 'tartaruga') {
    add(G.sph(0.08, 8, 6), { c: C.pele, b: 'Head', pos: HB(0, 0.02, 0.02), scl: [1, 0.85, 1.25], jit: J });
    add(G.cone(0.03, 0.05, 4), { c: C.escuro, b: 'Head', pos: HB(0, -0.0, 0.12), rot: [90, 0, 0], jit: 0 });
    eyes(0.05, 0.04, 0.06, 0.016);
  }
  if (hx === 'rinoceronte') {
    add(G.sph(0.14, 9, 7), { c: C.pele, b: 'Head', pos: HB(0, 0.0, 0.02), scl: [0.95, 0.85, 1.4], jit: J, vary: VAR });
    add(G.cone(0.05, 0.16, 6), { c: C.cristal || C.extra, mat: 3, b: 'Head', pos: HB(0, 0.1, 0.17), rot: [-20, 0, 0], jit: 0 });
    add(G.octa(0.03), { c: C.brilho, glow: true, b: 'Head', pos: HB(0, 0.07, 0.165), jit: 0 });
    if (HC.chifres === 'dois') add(G.cone(0.035, 0.09, 6), { c: C.cristal || C.extra, mat: 3, b: 'Head', pos: HB(0, 0.1, 0.06), rot: [-10, 0, 0], jit: 0 });
    eyes(0.1, 0.03, 0.08, 0.014); ears('pontuda', 0.07, 0.11, -0.06);
  }
  if (hx === 'camelo') {
    add(G.sph(0.075, 8, 6), { c: C.pele, b: 'Head', pos: HB(0, 0.04, 0), jit: J });
    add(G.tube(HB(0, 0.03, 0.03), HB(0, -0.01, 0.17), 0.055, 0.042, 8), { c: C.pele, b: 'Head', jit: J });
    add(G.sph(0.04, 6, 4), { c: C.claro, b: 'Head', pos: HB(0, -0.04, 0.17), scl: [1.1, 0.7, 0.9], jit: J });
    eyes(0.06, 0.06, 0.04, 0.016); ears('redonda', 0.06, 0.1, -0.03);
  }
  if (hx === 'capivara' || hx === 'texugo' || hx === 'furao' || hx === 'pangolim') {
    if (hx === 'capivara') { add(G.sph(0.1, 9, 7), { c: C.pele, b: 'Head', pos: HB(0, 0.02, 0.04), scl: [0.95, 1, 1.45], jit: J });
      add(G.box(0.12, 0.08, 0.06), { c: C.escuro, b: 'Head', pos: HB(0, 0.0, 0.17), jit: J }); eyes(0.065, 0.07, 0.06, 0.015); ears('redonda', 0.07, 0.11, -0.04); }
    if (hx === 'texugo') { add(G.sph(0.09, 9, 7), { c: C.claro, b: 'Head', pos: HB(0, 0.02, 0.02), scl: [1, 0.9, 1.3], jit: J });
      for (const s of [1, -1]) add(G.box(0.03, 0.03, 0.18), { c: C.escuro, b: 'Head', pos: HB(s * 0.045, 0.06, 0.02), rot: [-12, 0, 0], jit: 0.002 });
      add(G.ico(0.02), { c: '#1b1712', b: 'Head', pos: HB(0, 0.0, 0.14), jit: 0 }); eyes(0.045, 0.045, 0.085, 0.013); ears('redonda', 0.07, 0.07, -0.05, C.escuro); }
    if (hx === 'furao') { add(G.sph(0.08, 8, 6), { c: C.pele, b: 'Head', pos: HB(0, 0.02, 0.02), scl: [0.95, 0.85, 1.35], jit: J });
      if (HC.mascara) add(G.box(0.13, 0.035, 0.05), { c: C.escuro, b: 'Head', pos: HB(0, 0.04, 0.08), jit: 0.002 });
      add(G.sph(0.03, 6, 4), { c: C.claro, b: 'Head', pos: HB(0, -0.02, 0.1), scl: [1.2, 0.8, 1], jit: J }); add(G.ico(0.014), { c: '#1b1712', b: 'Head', pos: HB(0, 0.0, 0.125), jit: 0 });
      eyes(0.04, 0.045, 0.09, 0.014); ears('redonda', 0.055, 0.08, -0.03); }
    if (hx === 'pangolim') { add(G.tube(HB(0, 0.02, -0.04), HB(0, -0.02, 0.16), 0.08, 0.025, 8), { c: C.claro, b: 'Head', jit: J }); eyes(0.05, 0.03, 0.03, 0.012); }
  }
  if (hx === 'paquiderme') {
    add(G.sph(0.16, 9, 7), { c: C.pele, b: 'Head', pos: HB(0, 0.03, 0.02), scl: [1.05, 1, 1.05], jit: J, vary: VAR });
    add(G.tube(HB(0, -0.02, 0.15), HB(0, -0.12, 0.22), 0.06, 0.045, 8), { c: C.pele, b: 'Head', jit: J }); add(G.tube(HB(0, -0.12, 0.22), HB(0, -0.22, 0.24), 0.045, 0.035, 8), { c: C.pele, b: 'Head', jit: J });
    for (const s of [1, -1]) { add(G.cyl(0.11, 0.11, 0.02, 9), { c: C.claro, b: 'Head', pos: HB(s * 0.15, 0.02, -0.02), rot: [0, 0, 90], scl: [1, 1, 1.2], jit: J });
      add(G.tube(HB(s * 0.06, -0.06, 0.13), HB(s * 0.09, -0.07, 0.24), 0.018, 0.004, 5), { c: C.extra, b: 'Head', jit: 0 }); }
    eyes(0.09, 0.06, 0.11, 0.016);
  }
  if (hx === 'ovino') {
    add(G.sph(0.075, 8, 6), { c: C.pele, b: 'Head', pos: HB(0, 0.0, 0.06), scl: [0.9, 1, 1.3], jit: J });
    eyes(0.045, 0.02, 0.1, 0.014, '#e8e0d0'); ears('lado', 0.06, 0.01, 0.02);
    for (const [x, y, z, r] of [[0, 0.07, 0.0, 0.07], [0.05, 0.06, -0.03, 0.05], [-0.05, 0.06, -0.03, 0.05]]) add(G.ico(r, 1), { c: C.la, b: 'Head', pos: HB(x, y, z), jit: 0.006 });
    if (HC.chifres === 'enrolados') horns('enrolados', 0.06, 0.04, -0.02);
  }
  if (hx === 'cristal') {
    add(G.octa(0.1), { c: C.cristal, mat: 3, b: 'Head', pos: HB(0, 0.02, 0.04), scl: [0.9, 0.8, 1.5], jit: 0 });
    add(G.octa(0.05), { c: C.brilho, glow: true, b: 'Head', pos: HB(0, 0.02, 0.04), scl: [0.9, 0.8, 1.5], jit: 0 });
    for (const s of [1, -1]) add(G.octa(0.04), { c: C.cristal, mat: 3, b: 'Head', pos: HB(s * 0.05, 0.1, -0.03), scl: [0.6, 1.8, 0.6], rot: [-20, 0, -s * 15], jit: 0 });
  }
  const dragonHead = (bone, O, big = 1) => { const Hb = (x, y, z) => [O[0] + x * big, O[1] + y * big, O[2] + z * big];
    add(G.sph(0.1, 9, 7), { c: C.pele, b: bone, pos: Hb(0, 0.02, 0), scl: [big, 0.85 * big, 1.15 * big], jit: J });
    add(G.tube(Hb(0, 0.0, 0.06), Hb(0, -0.01, 0.21), 0.058 * big, 0.04 * big, 8), { c: C.pele, b: bone, jit: J });
    add(G.sph(1, 7, 4), { c: C.claro, b: bone, pos: Hb(0, -0.05, 0.13), scl: [0.05 * big, 0.022 * big, 0.08 * big], jit: J });
    for (const s of [1, -1]) { add(G.sph(0.012 * big, 5, 3), { c: '#2a1a1a', b: bone, pos: Hb(s * 0.022, 0.02, 0.215), jit: 0 });
      add(G.sph(0.022 * big, 6, 4), { c: '#f0c030', b: bone, pos: Hb(s * 0.06, 0.055, 0.06), jit: 0, vary: 0 }); add(G.box(0.006 * big, 0.022 * big, 0.006 * big), { c: '#14110c', b: bone, pos: Hb(s * 0.075, 0.055, 0.068), jit: 0, vary: 0 }); }
    const hc = HC.chifresD || 'um';
    for (const s of [1, -1]) { add(G.tube(Hb(s * 0.05, 0.08, -0.04), Hb(s * 0.09, 0.16, -0.16), 0.018 * big, 0.003, 5), { c: C.extra, b: bone, jit: 0.001 });
      if (hc === 'dois') add(G.tube(Hb(s * 0.07, 0.04, -0.06), Hb(s * 0.15, 0.06, -0.15), 0.014 * big, 0.003, 5), { c: C.extra, b: bone, jit: 0.001 }); }
    if (hc === 'coroa') for (let i = 0; i < 5; i++) add(G.cone(0.012 * big, 0.06 * big, 4), { c: C.extra, b: bone, pos: Hb(Math.cos(i * 0.785 + 0.4) * 0.07, 0.1, -0.03 + Math.sin(i * 0.785 + 0.4) * -0.05), rot: [-30, 0, 0], jit: 0 });
    if (HC.barbaTent) for (let i = 0; i < 4; i++) add(G.tube(Hb((i - 1.5) * 0.025, -0.06, 0.1), Hb((i - 1.5) * 0.04, -0.16, 0.08), 0.01 * big, 0.003, 4), { c: C.claro, b: bone, jit: 0 });
    if (HC.vapor) for (const [x, y, z, r] of [[0.02, 0.03, 0.27, 0.025], [-0.02, 0.05, 0.3, 0.02], [0, 0.09, 0.32, 0.03]]) add(G.ico(r * big, 0), { c: '#ffffff', mat: 3, b: bone, pos: Hb(x, y, z), jit: 0 }); };
  if (hx === 'dragao') { dragonHead('Head', hp, HC.grande ? 1.15 : 1); for (const eh of extraH) dragonHead(eh.bone, eh.hp, 0.85); }
  if (hx === 'lagarto') { add(G.sph(1, 9, 6), { c: C.pele, b: 'Head', pos: HB(0, 0.0, 0.06), scl: [0.085, 0.055, 0.15], jit: J, ...M }); add(G.box(0.13, 0.006, 0.02), { c: hex(C.pele, 0.5), b: 'Head', pos: HB(0, -0.02, 0.16), jit: 0 });
    for (const s of [1, -1]) { add(G.sph(0.026, 6, 4), { c: '#f0c030', b: 'Head', pos: HB(s * 0.055, 0.035, 0.07), jit: 0, vary: 0 }); add(G.box(0.006, 0.024, 0.006), { c: '#14110c', b: 'Head', pos: HB(s * 0.075, 0.035, 0.08), jit: 0, vary: 0 }); }
    if (HC.papo) add(G.sph(1, 6, 4), { c: C.claro, b: 'Head', pos: HB(0, -0.07, 0.04), scl: [0.012, 0.06, 0.07], jit: 0 }); }
  if (hx === 'crocodilo') { add(G.sph(1, 9, 6), { c: C.pele, b: 'Head', pos: HB(0, 0.0, 0.02), scl: [0.1, 0.06, 0.1], jit: J });
    add(G.box(0.1, 0.05, 0.3, 2), { c: C.pele, b: 'Head', pos: HB(0, -0.015, 0.2), jit: J, deform: g => { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) { const k = 1 - Math.max(0, pa.getZ(i) - (hp[2] + 0.1)) * 1.6; pa.setX(i, pa.getX(i) * k); } } });
    for (let i = 0; i < 6; i++) for (const s of [1, -1]) add(G.cone(0.008, 0.025, 3), { c: '#f0e8d0', b: 'Head', pos: HB(s * (0.045 - i * 0.004), -0.045, 0.1 + i * 0.045), rot: [180, 0, 0], jit: 0 });
    for (const s of [1, -1]) add(G.sph(0.022, 6, 4), { c: C.brilho, glow: true, b: 'Head', pos: HB(s * 0.05, 0.05, 0.04), jit: 0 }); }
  if (hx === 'camaleao') { add(G.sph(0.09, 9, 7), { c: C.pele, b: 'Head', pos: HB(0, 0.02, 0.04), scl: [0.9, 1, 1.25], jit: J }); add(G.cone(0.06, 0.12, 5), { c: C.escuro, b: 'Head', pos: HB(0, 0.1, -0.03), rot: [-50, 0, 0], jit: 0.002 });
    for (const s of [1, -1]) { add(G.sph(0.035, 7, 5), { c: C.pele, b: 'Head', pos: HB(s * 0.075, 0.04, 0.07), jit: 0 }); add(G.sph(0.012, 5, 4), { c: '#14110c', b: 'Head', pos: HB(s * 0.1, 0.045, 0.09), jit: 0 }); }
    add(G.box(0.07, 0.006, 0.02), { c: '#2a1418', b: 'Head', pos: HB(0, -0.03, 0.14), jit: 0 }); }
  if (hx === 'morsa') { add(G.sph(0.15, 10, 8), { c: C.pele, b: 'Head', pos: HB(0, 0.0, 0.03), scl: [1.05, 0.9, 1], jit: J, vary: VAR });
    for (const s of [1, -1]) { add(G.sph(0.055, 7, 5), { c: C.claro, b: 'Head', pos: HB(s * 0.04, -0.04, 0.14), jit: J }); add(G.sph(0.016, 5, 4), { c: '#14110c', b: 'Head', pos: HB(s * 0.07, 0.06, 0.12), jit: 0 });
      const ln = HC.presas === 'longas' ? 0.22 : 0.12; add(G.tube(HB(s * 0.035, -0.07, 0.15), HB(s * 0.045, -0.07 - ln, 0.12), 0.018, 0.006, 5), { c: C.extra, b: 'Head', jit: 0 });
      for (let i = 0; i < 3; i++) add(G.box(0.07, 0.003, 0.003), { c: '#e8e0d0', b: 'Head', pos: HB(s * 0.09, -0.04 + i * 0.012, 0.15), rot: [0, s * 20, s * (i - 1) * 12], jit: 0 }); } }
  // ---------- cauda
  const tail = chains.find(c => c.name === 'Tail');
  if (tail) { const W = { b: chainW(tail) }, ct = R.cauda, p = tail.pts;
    const rr = { peluda: [0.05, 0.075, 0.07, 0.03], fina: [0.025, 0.02, 0.015, 0.008], tufo: [0.025, 0.02, 0.016, 0.012], tufoFogo: [0.025, 0.02, 0.016, 0.012], fogo: [0.03, 0.03, 0.025, 0.01],
      fumaca: [0.05, 0.06, 0.05, 0.015], escamas: [0.09, 0.07, 0.05, 0.015], cristal: [0.04, 0.035, 0.025, 0.006], leque: [0.03, 0.03, 0.03, 0.02], lagarto: [0.075, 0.058, 0.036, 0.01], enrolada: [0.045, 0.035, 0.026, 0.012] }[ct].map(v => v * Rb / 0.16);
    const tc = ct === 'fumaca' ? (C.crina || C.claro) : ct === 'cristal' ? C.cristal : C.pele, tm = ct === 'fumaca' || ct === 'cristal' ? 3 : metal ? 1 : 0;
    if (ct !== 'leque') for (let i = 0; i < 3; i++) add(G.tube(p[i], p[i + 1], rr[i], rr[i + 1], 7), { c: tc, mat: tm, metal, vary: VAR, jit: J, ...W });
    if (ct === 'peluda') add(G.sph(rr[2] * 1.1, 6, 4), { c: C.claro, pos: p[3], scl: [1, 1, 1.5], ...W });
    if (ct === 'tufo') add(G.ico(0.045 * Rb / 0.16, 0), { c: C.escuro, pos: p[3], jit: 0.004, ...W });
    if (ct === 'tufoFogo' || ct === 'fogo') { add(G.cone(rr[1] * 1.8, 0.14 * Rb / 0.16, 6), { c: C.brilho, glow: true, pos: [p[3][0], p[3][1] + 0.03, p[3][2] - 0.02], rot: [-60, 0, 0], jit: 0, ...W });
      add(G.cone(rr[1], 0.09 * Rb / 0.16, 5), { c: '#fff0a0', glow: true, pos: [p[3][0], p[3][1] + 0.02, p[3][2] - 0.01], rot: [-60, 0, 0], jit: 0, ...W }); }
    if (ct === 'escamas') for (let i = 0; i < 6; i++) { const q = V3(...p[0]).lerp(V3(...p[3]), i / 6); add(G.sph(1, 5, 3), { c: C.escama || C.escuro, pos: [q.x, q.y + rr[Math.min(3, i >> 1)] * 0.7, q.z], scl: [rr[Math.min(3, i >> 1)] * 1.1, 0.012, rr[Math.min(3, i >> 1)] * 0.9], rot: [15, 0, 0], ...W }); }
    if (ct === 'leque') { const n = R.nCaudas || 9;
      for (let i = 0; i < n; i++) { const a = (i / Math.max(1, n - 1) - 0.5) * 2.0, d = V3(Math.sin(a) * 0.9, 0.5 + Math.cos(a) * 0.25, -1).normalize(), len = 0.42 * tl;
        const base = V3(...p[0]), tip = base.clone().addScaledVector(d, len), mid = base.clone().addScaledVector(d, len * 0.5).add(V3(0, 0.03, 0));
        add(G.tube(base.toArray(), mid.toArray(), 0.035 * tl, 0.05 * tl, 6), { c: C.pele, jit: 0.003, b: p2 => chainW(tail)(p2) });
        add(G.tube(mid.toArray(), tip.toArray(), 0.05 * tl, 0.012, 6), { c: i % 2 ? C.asa : C.pele, jit: 0.003, b: p2 => chainW(tail)(p2) });
        add(G.cone(0.03 * tl, 0.08 * tl, 5), { c: C.asa2, pos: tip.toArray(), pre: g => g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(_Y, d)), jit: 0, b: p2 => chainW(tail)(p2) }); } }
  }
  if (R.cauda === 'curta') add(G.cone(0.035 * Rb / 0.16, 0.1 * Rb / 0.16, 6), { c: C.pele, b: 'Hips', pos: [0, yb + Rb * 0.3, zr - Rb * 1.05], rot: [-120, 0, 0], jit: J, metal, mat: metal ? 1 : 0 });
  if (R.cauda === 'pompom' || R.cauda === 'pompomLa') add(G.ico(0.05 * Rb / 0.14, 1), { c: R.cauda === 'pompomLa' ? C.la : C.claro, b: 'Hips', pos: [0, yb + Rb * 0.25, zr - Rb * 1.0], jit: 0.004 });

  // ---------- coberturas e extras
  for (const ex of R.extras) {
    if (ex === 'juba' || ex === 'jubaFogo') { const fire = ex === 'jubaFogo';
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = 0.13, d = V3(Math.cos(a), Math.sin(a), -0.6).normalize();
        add(fire ? G.cone(0.05, 0.16, 5) : G.ico(0.06, 0), { c: fire ? (i % 2 ? C.brilho : '#ffe080') : (i % 2 ? C.escuro : hex(C.escuro, 1.2)), glow: fire, b: 'Head',
          pos: HB(Math.cos(a) * r, 0.02 + Math.sin(a) * r, -0.06), pre: fire ? g => g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(_Y, d)) : null, jit: fire ? 0 : 0.006 }); }
      for (let i = 0; i < 6; i++) add(fire ? G.cone(0.05, 0.14, 5) : G.ico(0.06, 0), { c: fire ? C.brilho : C.escuro, glow: fire, b: neckW, pos: [0, nb[1] + 0.06 + i * 0.02, nb[2] + i * 0.025], rot: fire ? [-40, 0, 0] : [0, 0, 0], jit: 0.004 }); }
    if (ex === 'crina') for (let i = 0; i < 7; i++) { const q = V3(...nb).lerp(V3(...hp), i / 6).add(V3(0, Rb * 0.45, -0.02)); add(G.cone(0.025, 0.07, 4), { c: C.escuro, b: neckW, pos: q.toArray(), rot: [-25, 0, 0], jit: 0.002 }); }
    if (ex.startsWith('crina-')) { const ch = chains.find(c => c.name === 'Mane'), W = { b: chainW(ch) }, n = ex.endsWith('longa') ? 9 : 5;
      for (let i = 0; i < n; i++) { const q = V3(...ch.pts[0]).lerp(V3(...ch.pts[2]), i / (n - 1)); add(G.box(0.02, ex.endsWith('longa') ? 0.16 : 0.08, 0.05), { c: C.crina, mat: 3, pos: [q.x + (i % 2 ? 0.02 : -0.02), q.y - 0.03, q.z - 0.02], rot: [-30, 0, (i % 2 ? 1 : -1) * 18], jit: 0.003, ...W }); } }
    if (ex.startsWith('casco-')) { const tipo = ex.slice(6), zcen = (zr + zc) / 2;
      add(G.sph(Rb * 1.4, 12, 6, 0, Math.PI / 2), { c: C.extra, b: 'Spine', pos: [0, yb - Rb * 0.15, zcen], scl: [1.05, 0.75, 1.45], vary: 0.1 });
      add(G.cyl(Rb * 1.45, Rb * 1.45, Rb * 0.12, 12), { c: C.casco2, b: 'Spine', pos: [0, yb - Rb * 0.15, zcen], scl: [1.05, 1, 1.45] });
      for (let i = 0; i < 7; i++) { const a = i / 6 * Math.PI * 2, r = i ? Rb * 0.75 : 0; const y = yb - Rb * 0.15 + Rb * 1.05 * Math.sqrt(Math.max(0.05, 1 - (r / (Rb * 1.4)) ** 2)) * 0.75;
        add(G.cyl(Rb * 0.3, Rb * 0.3, 0.012, 6), { c: tipo === 'musgo' ? '#5a8a3a' : C.casco2, b: 'Spine', pos: [Math.cos(a) * r, y, zcen + Math.sin(a) * r * 1.3], rot: [i ? (Math.sin(a) * 25) : 0, 0, i ? -Math.cos(a) * 25 : 0], jit: 0.002 });
        if (tipo === 'espinhos') add(G.cone(Rb * 0.08, Rb * 0.35, 5), { c: C.escuro, b: 'Spine', pos: [Math.cos(a) * r, y + Rb * 0.12, zcen + Math.sin(a) * r * 1.3], jit: 0 }); } }
    if (ex.startsWith('escamas-')) { const pont = ex.endsWith('pontudas');
      for (let row = 0; row < 8; row++) for (let k = -3; k <= 3; k++) { const z = zr - Rb * 0.6 + (zc - zr + Rb * 1.2) * row / 7, a = k * 0.42, y = yb + Math.cos(a) * Rb * 0.95, x = Math.sin(a) * Rb * 1.0;
        add(pont ? G.cone(Rb * 0.2, Rb * 0.3, 4) : G.sph(1, 5, 3), { c: row % 2 ? C.escama : hex(C.escama, 1.12), b: bodyW, pos: [x, y, z], scl: pont ? [1, 1, 1] : [Rb * 0.28, Rb * 0.06, Rb * 0.3], rot: [pont ? -40 : 12, 0, -a / D2R], jit: 0.003 }); } }
    if (ex === 'la') for (let i = 0; i < 18; i++) { const a = (i * 2.4) % 6.28, z = zr - Rb * 0.4 + (zc - zr + Rb * 0.8) * ((i * 0.37) % 1), dy = Math.cos(a);
      if (dy < -0.5) continue; add(G.ico(Rb * (0.42 + 0.15 * ((i * 0.53) % 1)), 1), { c: C.la, b: bodyW, pos: [Math.sin(a) * Rb * 0.85, yb + dy * Rb * 0.8, z], jit: 0.008, vary: 0.05 }); }
    if (ex === 'corcova-pedra') { add(new THREE.DodecahedronGeometry(Rb * 0.75, 0), { c: C.rocha, b: 'Chest', pos: [0, yb + Rb * 0.95 + frontUp, zc * 0.75], scl: [1, 0.8, 1.2], jit: 0.012 });
      add(new THREE.DodecahedronGeometry(Rb * 0.45, 0), { c: hex(C.rocha, 0.85), b: 'Spine', pos: [0.05, yb + Rb * 0.85, zc * 0.1], jit: 0.01 }); }
    if (ex === 'placas-costas') for (let i = 0; i < 6; i++) add(G.cone(Rb * 0.18, Rb * 0.4, 4), { c: C.rocha, b: bodyW, pos: [0, yb + Rb * 1.05 - i * 0.01, zr + (zc - zr) * i / 5 - 0.05], jit: 0.004 });
    if (ex.startsWith('musgo-')) { const tipo = ex.slice(6);
      add(G.sph(Rb * 1.05, 10, 4, 0, Math.PI / 2.5), { c: C.musgo, b: bodyW, pos: [0, yb + 0.02, (zr + zc) / 2], scl: [1.05, 0.95, 1.8], vary: 0.15 });
      for (let i = 0; i < 7; i++) { const z = zr + (zc - zr) * (i / 6) - 0.05, x = ((i * 0.61) % 1 - 0.5) * Rb * 0.9, y = yb + Rb * 0.95 - Math.abs(x) * 0.4;
        if (tipo === 'floresta') { add(G.tube([x, y, z], [x, y + 0.06, z], 0.012, 0.01, 4), { c: '#6a4a2e', b: bodyW, jit: 0 }); add(G.cone(0.05, 0.14, 6), { c: i % 2 ? '#2f6b3f' : '#3f7b4a', b: bodyW, pos: [x, y + 0.12, z], jit: 0.003 }); }
        if (tipo === 'flores') add(G.ico(0.03, 0), { c: ['#f088b0', '#f0d040', '#ffffff', '#a080f0'][i % 4], b: bodyW, pos: [x, y + 0.02, z], jit: 0 });
        if (tipo === 'cogumelos') { add(G.cyl(0.01, 0.012, 0.04, 5), { c: '#f0e8d8', b: bodyW, pos: [x, y + 0.02, z], jit: 0 }); add(G.sph(0.035, 6, 3, 0, Math.PI / 2), { c: '#d03a2a', b: bodyW, pos: [x, y + 0.04, z], jit: 0 }); } } }
    if (ex.startsWith('cristais-')) { const n = ex === 'cristais-poucas' ? 4 : ex === 'cristais-muitas' ? 9 : 6;
      for (let i = 0; i < n; i++) { const z = zr + (zc - zr) * (i / Math.max(1, n - 1)), a = ((i * 0.77) % 1 - 0.5) * 1.2;
        add(G.octa(Rb * (0.18 + 0.1 * ((i * 0.31) % 1))), { c: C.cristal || C.brilho, mat: 3, b: bodyW, pos: [Math.sin(a) * Rb * 0.6, yb + Rb * 0.95, z], scl: [0.6, 2.2, 0.6], rot: [0, 0, -a / D2R * 0.8], jit: 0 }); } }
    if (ex.startsWith('corcovas-')) { const n = ex.endsWith('tres') ? 3 : 2;
      for (let i = 0; i < n; i++) { const z = zr * 0.6 + (zc * 0.7 - zr * 0.6) * (n === 1 ? 0.5 : i / (n - 1));
        add(G.sph(Rb * 0.6, 9, 6, 0, Math.PI / 2), { c: C.pele, b: bodyW, pos: [0, yb + Rb * 0.75, z], scl: [0.9, 1.1, 1], jit: J });
        add(G.ico(Rb * 0.3, 1), { c: C.agua, glow: true, b: bodyW, pos: [0, yb + Rb * 1.05, z], jit: 0 }); add(G.ico(Rb * 0.42, 1), { c: C.agua, mat: 3, b: bodyW, pos: [0, yb + Rb * 1.0, z], jit: 0 }); } }
    if (ex.startsWith('ossos-')) { for (let i = 0; i < 5; i++) { const z = zc * 0.9 - i * Rb * 0.42;
        for (const s of [1, -1]) { const g = new THREE.TorusGeometry(Rb * 1.0, Rb * 0.06, 4, 10, Math.PI * 0.55); g.rotateY(Math.PI / 2); g.rotateX(-Math.PI * 0.05); if (s < 0) g.scale(-1, 1, 1);
          g.rotateZ(s * 0.25); g.translate(0, yb, z); add(g, { c: C.extra, b: bodyW, jit: 0.002 }); } }
      if (ex.endsWith('espinha')) for (let i = 0; i < 8; i++) add(G.box(Rb * 0.18, Rb * 0.14, Rb * 0.18), { c: C.extra, b: bodyW, pos: [0, yb + Rb * 1.0, zr + (zc - zr) * i / 7], jit: 0.002 }); }
    if (ex.startsWith('passageiros-')) { const t = ex.slice(12);
      const bird = (x, z, col) => { add(G.sph(0.03, 6, 4), { c: col, b: bodyW, pos: [x, yb + Rb * 1.0, z], scl: [1, 1, 1.3], jit: 0 }); add(G.sph(0.02, 5, 3), { c: col, b: bodyW, pos: [x, yb + Rb * 1.0 + 0.035, z + 0.02], jit: 0 });
        add(G.cone(0.007, 0.02, 3), { c: '#f0a030', b: bodyW, pos: [x, yb + Rb * 1.0 + 0.035, z + 0.045], rot: [90, 0, 0], jit: 0 }); };
      const frog = (x, z) => { add(G.sph(0.035, 6, 4), { c: '#5aa040', b: bodyW, pos: [x, yb + Rb * 0.98, z], scl: [1.2, 0.7, 1.1], jit: 0 }); for (const s of [1, -1]) add(G.sph(0.012, 4, 3), { c: '#f0e040', b: bodyW, pos: [x + s * 0.02, yb + Rb * 0.98 + 0.025, z + 0.02], jit: 0 }); };
      if (t !== 'sapos') { bird(0.04, zc * 0.6, '#d84a3a'); bird(-0.05, zr * 0.3, '#3a7ad8'); }
      if (t !== 'passaros') { frog(-0.03, zc * 0.1); frog(0.05, zr * 0.6); } }
    if (ex === 'listra-brilho') for (let i = 0; i < 7; i++) add(G.box(Rb * 0.25, Rb * 0.06, Rb * 0.5), { c: C.brilho, glow: true, b: bodyW, pos: [0, yb + Rb * 0.98, zr + (zc - zr) * i / 6], rot: [0, (i % 2 ? 1 : -1) * 25, 0], jit: 0 });
    if (ex === 'pontas-brilho') for (let i = 0; i < 12; i++) { const a = (i * 2.4) % 6.28, z = zr + (zc - zr) * ((i * 0.37) % 1); if (Math.cos(a) < 0) continue;
      add(G.cone(Rb * 0.06, Rb * 0.25, 4), { c: C.brilho, glow: true, b: bodyW, pos: [Math.sin(a) * Rb, yb + Math.cos(a) * Rb * 0.95, z], rot: [0, 0, -a / D2R], jit: 0 }); }
    if (ex.startsWith('faixas-')) { const n = ex.endsWith('soltas') ? 5 : 9;
      for (let i = 0; i < n; i++) { const z = zr - Rb * 0.5 + (zc - zr + Rb) * i / (n - 1); add(G.cyl(Rb * 1.03, Rb * 1.03, Rb * 0.18, 9, true), { c: C.faixa, b: bodyW, pos: [0, yb, z], rot: [90, 0, (i % 2 ? 1 : -1) * 12], scl: [1, 1, 0.95], jit: 0.003 }); }
      for (const [s, L2] of [[1, '_L'], [-1, '_R']]) for (const fr of [true, false]) { const x = s * (fr ? xf : xb), z = fr ? zf : zbk;
        add(G.cyl(Rb * 0.24, Rb * 0.24, Rb * 0.14, 7, true), { c: C.faixa, b: (fr ? 'Front' : 'Back') + 'Leg' + L2, pos: [x, yj * 0.35, z], rot: [0, 0, s * 10], jit: 0.002 }); }
      add(G.cyl(0.125, 0.125, 0.04, 9, true), { c: C.faixa, b: 'Head', pos: HB(0, 0.06, 0), rot: [10, 0, 8], jit: 0.002 }); }
    if (ex === 'espinhos-dorso') for (let i = 0; i < 9; i++) add(G.cone(Rb * 0.14, Rb * 0.4, 4), { c: C.escuro, b: bodyW, pos: [0, yb + Rb * 0.95, zr - Rb * 0.5 + (zc - zr + Rb) * i / 8], rot: [-20, 0, 0], jit: 0 });
    if (ex === 'crista-alta' || ex === 'crista-baixa') { const h = ex.endsWith('alta') ? Rb * 0.8 : Rb * 0.35, n = 8;
      for (let i = 0; i < n; i++) { const z = zr - Rb * 0.6 + (zc + Rb * 0.3 - zr) * i / (n - 1), hh = h * (0.5 + 0.5 * Math.sin(Math.PI * i / (n - 1)));
        add(G.slab([[0, 0], [Rb * 0.25, hh], [Rb * 0.5, 0]], 0.008), { c: C.escuro, b: bodyW, pos: [0.004, yb + Rb * 0.9, z], rot: [0, 90, 0], jit: 0 });
        if (ex.endsWith('alta')) add(G.box(0.008, 0.012, Rb * 0.18), { c: C.brilho, glow: true, b: bodyW, pos: [0, yb + Rb * 0.9 + hh, z - Rb * 0.22], jit: 0 }); } }
    if (ex === 'novelo') { add(G.ico(0.07, 1), { c: C.extra, b: 'Head', pos: HB(0, -0.14, 0.18), jit: 0.003 }); for (let i = 0; i < 3; i++) add(new THREE.TorusGeometry(0.071, 0.006, 3, 10), { c: hex(C.extra, 0.8), b: 'Head', pos: HB(0, -0.14, 0.18), rot: [i * 60, i * 40, 0], jit: 0 });
      add(G.tube(HB(0, -0.03, 0.15), HB(0, -0.09, 0.18), 0.004, 0.004, 3), { c: C.extra, b: 'Head', jit: 0 }); }
    if (ex.startsWith('costas-')) { const tipo = ex.slice(7), zc0 = (zr + zc) / 2, topY = yb + Rb * 0.9;
      if (tipo === 'vila') for (let i = 0; i < 7; i++) { const a = i * 0.9, r = Rb * (0.15 + (i % 3) * 0.3), x = Math.cos(a) * r, z = zc0 + Math.sin(a) * r * 1.3, h = Rb * (0.18 + (i % 2) * 0.1);
        add(G.box(Rb * 0.25, h, Rb * 0.25), { c: ['#e8dcc0', '#d8c8a8', '#f0e8d8'][i % 3], b: 'Spine', pos: [x, topY + h / 2, z], jit: 0.002 }); add(G.cone(Rb * 0.22, Rb * 0.18, 4), { c: ['#a83a2a', '#3a5a8a', '#6a4a2a'][i % 3], b: 'Spine', pos: [x, topY + h + Rb * 0.09, z], rot: [0, 45, 0], jit: 0 }); }
      if (tipo === 'templo') { for (let i = 0; i < 3; i++) add(G.box(Rb * (0.9 - i * 0.25), Rb * 0.12, Rb * (0.9 - i * 0.25)), { c: '#e0d8c8', b: 'Spine', pos: [0, topY + Rb * (0.06 + i * 0.12), zc0], jit: 0.002 });
        add(G.cone(Rb * 0.3, Rb * 0.35, 4), { c: '#c8a040', metal: true, mat: 1, b: 'Spine', pos: [0, topY + Rb * 0.52, zc0], rot: [0, 45, 0], jit: 0 }); }
      if (tipo !== 'templo') for (let i = 0; i < (tipo === 'floresta' ? 9 : 4); i++) { const a = i * 2.2 + 0.5, r = Rb * (0.4 + (i % 2) * 0.3), x = Math.cos(a) * r, z = zc0 + Math.sin(a) * r * 1.3;
        add(G.cone(Rb * 0.12, Rb * 0.35, 6), { c: '#2f6b3f', b: 'Spine', pos: [x, topY + Rb * 0.2, z], jit: 0.002 }); } }
    if (ex === 'barbela') add(G.sph(1, 6, 4), { c: C.escuro, b: 'Head', pos: HB(0, -0.12, 0.02), scl: [0.03, 0.08, 0.05], jit: 0.003 });
    if (ex === 'gola-penas') for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; add(G.sph(1, 5, 3), { c: C.asa2, b: neckW, pos: [Math.cos(a) * Rb * 0.55, nb[1] + 0.02 + Math.sin(a) * Rb * 0.4, nb[2] + 0.02], scl: [0.04, 0.06, 0.02], rot: [0, 0, -a / D2R + 90], jit: 0 }); }
  }

  // ---------- asas
  if (R.asas) for (const [s, L2] of [[1, '_L'], [-1, '_R']]) {
    const A = REST['WingA' + L2].toArray(), Bw = REST['WingB' + L2].toArray(), span = L * (R.pesado ? 0.75 : 0.65), type = R.asas;
    const mirrorBox = (g, ang) => { g.rotateZ(ang * D2R); if (s < 0) g.scale(-1, 1, 1); return g; };
    if (type === 'ave' || type === 'chama') { const col = type === 'chama' ? C.brilho : C.asa, col2 = type === 'chama' ? (C.asa2 || '#ffe080') : C.asa2, gl = type === 'chama';
      const mem = G.flat([[A[0], A[1]], [Bw[0], Bw[1]], [Bw[0] + s * 0.02, Bw[1] - span * 0.45], [A[0] + s * 0.04, A[1] - span * 0.3]]); mem.translate(0, 0, A[2] - 0.005);
      add(mem, { c: hex(col, 0.85), glow: gl, b: 'WingA' + L2, jit: 0.001 });
      for (let i = 0; i < 8; i++) { const u = i / 7, p0 = V3(...A).lerp(V3(...Bw), u); const fb = G.box(span * 0.16, span * (0.5 - u * 0.12), 0.012);
        fb.translate(0, -span * (0.24 - u * 0.05), 0); fb.rotateZ(-s * (8 + u * 12) * D2R); fb.translate(p0.x, p0.y, p0.z - 0.008 * i); add(fb, { c: i % 2 ? col : hex(col, 1.1), glow: gl, b: 'WingA' + L2, jit: 0.002 }); }
      for (let i = 0; i < 6; i++) { const ang = 20 - i * 18, len = span * (0.75 - i * 0.05); const fb = mirrorBox((() => { const g = G.box(len, span * 0.15, 0.012); g.translate(len / 2, 0, 0); return g; })(), ang);
        fb.translate(Bw[0], Bw[1], Bw[2] - 0.01 * i); add(fb, { c: i % 2 ? col2 : hex(col2, 1.12), glow: gl, b: 'WingB' + L2, jit: 0.002 }); }
      add(G.tube(A, Bw, span * 0.05, span * 0.04, 5), { c: col, glow: gl, b: 'WingA' + L2 }); }
    if (type === 'morcego') { const col = C.asa;
      add(G.tube(A, Bw, span * 0.03, span * 0.025, 5), { c: hex(col, 0.75), b: 'WingA' + L2 });
      const inner = G.flat([[A[0], A[1] - 0.01], [Bw[0], Bw[1]], [Bw[0] - s * span * 0.05, Bw[1] - span * 0.55], [A[0] + s * 0.03, A[1] - span * 0.35]]); inner.translate(0, 0, A[2] - 0.01); add(inner, { c: col, b: 'WingA' + L2, jit: 0.001 });
      const angs = [15, -20, -55], fl = [0.75, 0.68, 0.55].map(v => v * span); let prev = [Bw[0] + s * 0.02, Bw[1] + 0.02];
      angs.forEach((ang, i) => { const tip = [Bw[0] + s * Math.cos(ang * D2R) * fl[i], Bw[1] + Math.sin(ang * D2R) * fl[i]];
        add(G.tube(Bw, [tip[0], tip[1], Bw[2] - 0.02], span * 0.018, 0.003, 4), { c: hex(col, 0.7), b: 'WingB' + L2 });
        const m = G.flat([[Bw[0], Bw[1]], prev, tip]); m.translate(0, 0, Bw[2] - 0.015); add(m, { c: col, b: 'WingB' + L2, jit: 0.001 }); prev = tip; });
      const m = G.flat([[Bw[0], Bw[1]], prev, [Bw[0] - s * span * 0.05, Bw[1] - span * 0.55]]); m.translate(0, 0, Bw[2] - 0.012); add(m, { c: col, b: 'WingB' + L2, jit: 0.001 }); }
    if (type === 'abelhao' || type === 'libelula') { const lib = type === 'libelula', len = span * (lib ? 0.9 : 0.5), wid = span * (lib ? 0.16 : 0.24);
      const ell = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI * 2; ell.push([len / 2 + Math.cos(a) * len / 2, Math.sin(a) * wid / 2]); }
      for (const [bone, ry, dz] of [['WingA', 14, 0], ['WingB', -18, -0.02]]) { const g = G.flat(ell); if (s < 0) { g.scale(-1, 1, 1); const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i]; ix[i] = ix[i + 2]; ix[i + 2] = t; } }
        g.rotateX(-20 * D2R); g.rotateZ(s * ry * D2R); g.translate(A[0], A[1], A[2] + dz); add(g, { c: C.asa, mat: 3, b: bone + L2, jit: 0.001 }); } }
  }

  // ---------- poses
  const legLen = yj - fy, lF = [(yj + frontUp - fy) / 2, (yj + frontUp - fy) / 2], lB = [legLen / 2, legLen / 2];
  const ex = 1 + 0.9 * spr, REST_F = { FL: [xf * ex, 0, zf], FR: [-xf * ex, 0, zf], BL: [xb * ex, 0, zbk], BR: [-xb * ex, 0, zbk] };
  const hasW = !!R.asas, pesado = !!R.pesado, flut = !!R.flutua;
  const setE = (b, a, o = 'YXZ') => b.quaternion.copy(E(a, o));
  function applyPose(P) {
    B.Hips.position.set(REST.Hips.x + P.hp[0], REST.Hips.y + P.hp[1], REST.Hips.z + P.hp[2]); setE(B.Hips, P.hr);
    setE(B.Spine, P.sp); setE(B.Chest, P.ch); setE(B.Neck, P.nk); setE(B.Head, P.hd);
    for (const eh of extraH) { setE(B[eh.neck], [P.nk[0] * 0.8 - 6, -P.nk[1] * 1.3 + eh.sd * 22, eh.sd * 8]); setE(B[eh.bone], [-P.hd[0] * 0.6 + 8, -P.hd[1] + eh.sd * 15, 0]); }
    for (const ch of chains) for (const nm of ch.names) B[nm].quaternion.identity();
    if (B.Tail1) setE(B.Tail1, P.tl || [0, 0, 0]);
    for (const [s, L2] of [[1, '_L'], [-1, '_R']]) if (B['WingA' + L2]) { const bird = ['ave', 'morcego', 'chama'].includes(R.asas);
      B['WingA' + L2].quaternion.copy(E([0, s * P.w[1], s * P.w[0]], 'XYZ')); B['WingB' + L2].quaternion.copy(bird ? E([0, s * P.w[1] * 1.5, s * P.w[2]], 'XYZ') : E([0, s * P.w[1], s * P.w[2]], 'XYZ')); }
    B.Hips.updateMatrixWorld(true);
    if (P.fk) { for (const [s, L2] of [[1, '_L'], [-1, '_R']]) { const f = P.fk;
        setE(B['FrontUpLeg' + L2], [f[0], 0, s * (f[4] || 0)], 'XYZ'); B['FrontLeg' + L2].quaternion.setFromAxisAngle(_X, f[1] * D2R); B['FrontFoot' + L2].quaternion.identity();
        setE(B['BackUpLeg' + L2], [f[2], 0, s * (f[5] || 0)], 'XYZ'); B['BackLeg' + L2].quaternion.setFromAxisAngle(_X, f[3] * D2R); B['BackFoot' + L2].quaternion.identity(); } }
    else for (const k of ['FL', 'FR', 'BL', 'BR']) {
      const r0 = REST_F[k], o = P.f[k], fr = k[0] === 'F', L2 = k[1] === 'L' ? '_L' : '_R', s = L2 === '_L' ? 1 : -1, Pn = fr ? 'Front' : 'Back';
      const tgt = V3(r0[0] + o[0], fy + o[1] + (flut ? legLen * 0.25 : 0), r0[2] + o[2]);
      ikQ(B[Pn + 'UpLeg' + L2], B[Pn + 'Leg' + L2], B[Pn + 'Foot' + L2], tgt, fr ? V3(s * spr * 0.9, spr * 0.6, -1) : V3(s * (0.1 + spr * 0.9), spr * 0.6, 1), fr ? lF[0] : lB[0], fr ? lF[1] : lB[1], !fr, E([o[3] || 0, 0, 0]));
    }
    B.Hips.updateMatrixWorld(true);
  }
  const still = () => ({ FL: [0, 0, 0, 0], FR: [0, 0, 0, 0], BL: [0, 0, 0, 0], BR: [0, 0, 0, 0] });
  const crouch = -legLen * 0.06;
  const WF = ['ave', 'morcego', 'chama'].includes(R.asas) ? [-20, 84, -40] : [-5, 70, -5];      // asas recolhidas sobre o dorso
  const base = () => ({ hp: [0, crouch, 0], hr: [0, 0, 0], sp: [0, 0, 0], ch: [0, 0, 0], nk: [0, 0, 0], hd: [0, 0, 0], tl: [0, 0, 0], w: [...WF], f: still() });
  const gaitFoot = (u, D, Sx, h) => { if (u < D) return [0, 0, Sx / 2 - Sx * u / D, 0]; const w = (u - D) / (1 - D); return [0, h * Math.sin(Math.PI * w), -Sx / 2 + Sx * EASE.io(w), -25 * Math.sin(Math.PI * w)]; };
  const sz = Math.sqrt(legLen / 0.35);
  const gait = (name, T, D, Sx, h, ph, extra) => ({ name, dur: T, fps: 60, loop: true, v: Sx / (D * T), fn: t => { const P = base(), u = t / T;
    for (const k of ['FL', 'FR', 'BL', 'BR']) P.f[k] = gaitFoot(((u + ph[k]) % 1 + 1) % 1, D, Sx, h);
    extra(P, u); return P; } });
  const clipdefs = [
    { name: 'Parado', dur: 3, fps: 30, loop: true, fn: t => { const P = base(), a = 2 * Math.PI * t / 3;
      P.hp[1] += 0.004 * Math.sin(a); P.ch = [-1.5 * Math.sin(a), 0, 0]; P.nk = [2 * Math.sin(a), 6 * Math.sin(a + 1), 0]; P.hd = [3 * Math.sin(2 * a), 14 * Math.sin(a + 0.7), 0]; P.tl = [0, 18 * Math.sin(2 * a), 0];
      if (hasW) P.w = [WF[0] + 3 * Math.sin(a), WF[1], WF[2]]; return P; } },
    gait('Andar', 1.0 * sz * (pesado ? 1.3 : 1), 0.72, legLen * 0.62, legLen * 0.14, { BL: 0, FL: 0.25, BR: 0.5, FR: 0.75 },
      (P, u) => { const c = Math.cos(2 * Math.PI * u); P.hp[1] += -0.012 * legLen * Math.cos(4 * Math.PI * u); P.hr = [0, 3 * c, 2 * Math.sin(2 * Math.PI * u)]; P.ch = [0, -4 * c, 0]; P.nk = [3 * Math.cos(4 * Math.PI * u), 0, 0]; P.hd = [0, 4 * c, 0]; P.tl = [0, 15 * Math.sin(2 * Math.PI * u), 0]; }),
    pesado ? gait('Correr', 0.75 * sz, 0.5, legLen * 0.8, legLen * 0.2, { FL: 0, BR: 0, FR: 0.5, BL: 0.5 }, (P, u) => { P.hp[1] += 0.03 * legLen * Math.abs(Math.sin(2 * Math.PI * u)); P.nk = [4 * Math.sin(4 * Math.PI * u), 0, 0]; P.tl = [-10, 10 * Math.sin(2 * Math.PI * u), 0]; })
      : gait('Correr', 0.5 * sz, 0.36, legLen * 1.1, legLen * 0.32, { BL: 0, BR: 0.1, FL: 0.45, FR: 0.55 }, (P, u) => { const a = 2 * Math.PI * u;
        P.hp[1] += 0.06 * legLen * Math.sin(a - 0.6); P.hr = [6 * Math.sin(a), 0, 0]; P.sp = [-6 * Math.sin(a), 0, 0]; P.ch = [-6 * Math.sin(a + 0.6), 0, 0]; P.nk = [8 * Math.sin(a + 1.2), 0, 0]; P.hd = [-6 * Math.sin(a + 1.2), 0, 0]; P.tl = [-15 + 15 * Math.sin(a), 0, 0]; }),
    { name: 'Atacar', dur: 1.0, fps: 60, fn: t => { const P = base(), u = t, w = u < 0.35 ? EASE.io(u / 0.35) : u < 0.5 ? 1 - EASE.in((u - 0.35) / 0.15) * 2 : -1 + EASE.io((u - 0.5) / 0.5);
      const back = Math.max(0, w), fwd = Math.max(0, -w), horned = !!(HC.chifres || HC.galhadas);
      P.hp = [0, crouch - legLen * 0.08 * back, -L * 0.06 * back + L * 0.12 * fwd]; P.hr = [5 * back - 6 * fwd, 0, 0]; P.ch = [6 * back, 0, 0];
      P.nk = [horned ? 28 * fwd - 8 * back : 14 * fwd - 10 * back, 0, 0]; P.hd = [horned ? 18 * fwd : 22 * fwd, 0, 0]; P.tl = [-20 * back, 0, 0]; if (hasW) P.w = [WF[0] + 50 * back, WF[1] * (1 - back * 0.6), WF[2] + 60 * back]; return P; } },
    { name: 'Rugir', dur: 1.8, fps: 30, fn: t => { const P = base(), u = t / 1.8, k = Math.sin(Math.PI * clamp(u / 0.85, 0, 1)), sh = k > 0.5 ? Math.sin(u * 60) * 2 : 0;
      P.hp[1] += legLen * 0.03 * k; P.hr = [-6 * k, 0, 0]; P.ch = [-8 * k, 0, 0]; P.nk = [-30 * k + sh, 0, 0]; P.hd = [-22 * k, sh, 0]; P.tl = [-25 * k, 0, 0];
      P.f.FL = [0, 0, 0.02 * k, 0]; P.f.FR = [0, 0, 0.02 * k, 0]; if (hasW) P.w = [WF[0] + 50 * k, WF[1] * (1 - k), WF[2] + 65 * k]; return P; } },
  ];
  if (hasW || R.nadaNoAr) { const f = R.flap, DV = Math.max(1, Math.round(1.2 * f)) / f, hov = legLen * 0.9;
    clipdefs.push({ name: 'Voar', dur: DV, fps: Math.max(30, Math.min(120, f * 10)), loop: true, v: (pesado ? 3.2 : 2.6) * L, fn: t => { const P = base(), ph = 2 * Math.PI * f * t, sl = 2 * Math.PI * t / DV;
      P.hp = [0, hov + legLen * 0.15 * Math.cos(ph) * (pesado ? 1 : 0.6), 0]; P.hr = [6, 0, 3 * Math.sin(sl)]; P.nk = [-10, 0, 0]; P.hd = [-6, 0, 0]; P.tl = [-10, 8 * Math.sin(sl), 0];
      if (R.nadaNoAr) { P.fk = [10, 0, 10, 0, 35 * Math.sin(ph) + 30, 25 * Math.sin(ph - 0.8) + 15]; P.w = [0, 0, 0]; }
      else { P.fk = [55, -95, 50, 40]; P.w = [42 * Math.sin(ph) + 8, 6, 42 * Math.sin(ph - 0.6) + 2]; }
      return P; } }); }
  const P0 = finish(kit, skel, chains, S.nome, clipdefs, applyPose, {});
  P0.vel = Object.fromEntries(clipdefs.filter(c => c.v).map(c => [c.name, c.v]));
  return P0;
}

// ======================================================================= FAMÍLIA D — 6 e 8 patas (insetos, aracnídeos, caranguejo)
function forgeD(id, S, cfg) {
  const R = { pares: 3, corpo: 'besouro', cabeca: 'besouro', frente: null, cauda: null, asas: null, antenas: false, extras: [], perna: 0.7, flap: 8, ...S.receita(cfg) };
  const COL = S.cats.cores.cor[cfg.cores];
  const C = { pele: '#6a5a4a', claro: '#c0a890', escuro: '#2a2018', extra: '#e8dcc0', brilho: '#ffd060', asa: '#e0e8f0', olho: '#1b1712', ...COL };
  const kit = makeKit(v => v.clone()), { add, G } = kit;
  const vidro = !!R.vidro, MAT = vidro ? 3 : 0, metal = !!R.metal, J = 0.004;
  const bc = R.corpo;
  // ---------- layout por tipo de corpo
  const LAY = {
    besouro: { yb: 0.3, hz: 0.24, az: -0.12, xr: 0.12, zs: [0.12, 0.0, -0.12], sp: [0.32, 0.38, 0.34], zf: [0.36, 0.02, -0.38] },
    formiga: { yb: 0.26, hz: 0.2, az: -0.12, xr: 0.07, zs: [0.08, 0.0, -0.08], sp: [0.3, 0.34, 0.32], zf: [0.32, 0.0, -0.34] },
    grilo: { yb: 0.22, hz: 0.2, az: -0.12, xr: 0.08, zs: [0.08, 0.0, -0.1], sp: [0.22, 0.24, 0.26], zf: [0.26, 0.04, -0.3] },
    abelha: { yb: 0.32, hz: 0.22, az: -0.14, xr: 0.1, zs: [0.08, 0.0, -0.08], sp: [0.22, 0.25, 0.24], zf: [0.26, 0.0, -0.26] },
    aranha: { yb: 0.32, hz: 0.24, az: -0.12, xr: 0.12, zs: [0.18, 0.08, -0.02, -0.1], sp: [0.5, 0.6, 0.58, 0.5], zf: [0.62, 0.25, -0.15, -0.5] },
    escorpiao: { yb: 0.2, hz: 0.26, az: -0.15, xr: 0.12, zs: [0.08, -0.02, -0.12, -0.22], sp: [0.3, 0.34, 0.34, 0.3], zf: [0.3, 0.06, -0.18, -0.42] },
    caranguejo: { yb: 0.32, hz: 0.28, az: 0, xr: 0.3, zs: [0.14, 0.04, -0.06, -0.16], sp: [0.38, 0.44, 0.44, 0.38], zf: [0.36, 0.1, -0.12, -0.36] },
    carrapato: { yb: 0.36, hz: 0.36, az: -0.1, xr: 0.22, zs: [0.26, 0.2, 0.14, 0.08], sp: [0.32, 0.38, 0.38, 0.32], zf: [0.6, 0.32, 0.02, -0.28] },
    olho: { yb: 0.5, hz: 0.0, az: 0, xr: 0.2, zs: [0.14, 0.05, -0.05, -0.14], sp: [0.5, 0.58, 0.58, 0.5], zf: [0.55, 0.2, -0.2, -0.55] },
    lagarto: { yb: 0.26, hz: 0.46, az: -0.2, xr: 0.13, zs: [0.28, 0.0, -0.28], sp: [0.22, 0.24, 0.22], zf: [0.36, 0.0, -0.36] },
    louva: { yb: 0.3, hz: 0.0, az: -0.15, xr: 0.07, zs: [0.02, -0.08], sp: [0.32, 0.34], zf: [0.18, -0.3] },
    libelula: { yb: 0.26, hz: 0.14, az: -0.08, xr: 0.05, zs: [0.06, 0.0, -0.06], sp: [0.14, 0.16, 0.15], zf: [0.16, 0.0, -0.18] },
    mariposa: { yb: 0.3, hz: 0.16, az: -0.1, xr: 0.07, zs: [0.06, 0.0, -0.06], sp: [0.18, 0.2, 0.19], zf: [0.2, 0.0, -0.2] },
  }[bc];
  const { yb, hz, az, xr } = LAY, NP = R.pares;
  // ---------- correntes
  const chains = [];
  if (R.antenas) for (const [s, L] of [[1, '_L'], [-1, '_R']]) chains.push({ name: 'Ant' + L, label: 'antenas', parent: 'Head', pts: [[s * 0.03, yb + 0.1, hz + 0.08], [s * 0.1, yb + 0.22, hz + 0.18], [s * 0.18, yb + 0.28, hz + 0.3]],
    names: ['Ant1' + L, 'Ant2' + L], end: 'AntEnd' + L, spring: [{ k: 90, d: 6, g: 0.2, max: 30 }, { k: 70, d: 5, g: 0.2, max: 40 }] });
  if (R.cauda === 'lagarto') chains.push({ name: 'Tail', label: 'cauda', parent: 'Abdomen', pts: [[0, yb, -0.42], [0, yb - 0.02, -0.62], [0, yb - 0.06, -0.8], [0, yb - 0.1, -0.96]], names: ['Tail1', 'Tail2', 'Tail3'], end: 'TailEnd',
    spring: [{ k: 55, d: 6, g: 0.3, max: 25 }, { k: 42, d: 5, g: 0.3, max: 35 }, { k: 32, d: 4, g: 0.3, max: 45 }] });

  // ---------- esqueleto
  const bdef = [['Hips', null, [0, yb, 0]], ['Abdomen', 'Hips', [0, yb, az]], ['Head', 'Hips', [0, yb + 0.02, hz]]];
  if (bc === 'louva') { bdef[2] = ['Chest', 'Hips', [0, yb + 0.04, 0.03]]; bdef.push(['Head', 'Chest', [0, 0.92, 0.2]]); }
  if (bc === 'lagarto') { bdef[2] = ['Neck', 'Hips', [0, yb + 0.04, 0.34]]; bdef.push(['Head', 'Neck', [0, yb + 0.08, hz]]); }
  const legs = [];
  for (let i = 0; i < NP; i++) for (const [s, L] of [[1, '_L'], [-1, '_R']]) {
    const root = [s * xr, yb - 0.02, LAY.zs[i]], foot = [s * (xr + LAY.sp[i]), 0.0, LAY.zf[i]];
    if (bc === 'olho') { const a = (LAY.zf[i] / 0.6); root[0] = s * xr * Math.sqrt(Math.max(0.2, 1 - a * a)); }
    const dist = V3(...root).distanceTo(V3(...foot)), l1 = dist * 0.62 * R.perna / 0.75 * 0.75 + dist * 0.12, l2 = dist * 0.62;
    const nm = 'Leg' + (i + 1);
    legs.push({ i, s, L, nm, root, foot, l1, l2 });
    const parent = bc === 'louva' ? 'Hips' : 'Hips';
    bdef.push([nm + 'A' + L, parent, root], [nm + 'B' + L, nm + 'A' + L, [root[0], root[1] - l1, root[2]]], [nm + 'C' + L, nm + 'B' + L, [root[0], root[1] - l1 - l2, root[2]]]);
  }
  const front = R.frente;
  const armBase = bc === 'louva' ? [0.06, 0.78, 0.16] : bc === 'caranguejo' ? [0.22, yb + 0.02, 0.24] : [0.1, yb, hz + 0.02];
  if (front) for (const [s, L] of [[1, '_L'], [-1, '_R']]) {
    const parent = bc === 'louva' ? 'Chest' : 'Hips', b0 = [s * armBase[0], armBase[1], armBase[2]];
    const a1 = bc === 'louva' ? [s * 0.08, 0.6, 0.3] : [s * (armBase[0] + 0.12), armBase[1] + 0.02, armBase[2] + 0.12];
    const a2 = bc === 'louva' ? [s * 0.08, 0.78, 0.42] : [s * (armBase[0] + 0.1), armBase[1] + 0.03, armBase[2] + 0.3];
    bdef.push(['ArmA' + L, parent, b0], ['ArmB' + L, 'ArmA' + L, a1], ['ArmC' + L, 'ArmB' + L, a2]);
  }
  const tailN = R.cauda === 'ferrao' ? 5 : 0, tailPts = [];
  if (tailN) { let p = V3(0, yb + 0.04, -0.3); tailPts.push(p.toArray());
    for (let i = 1; i <= tailN; i++) { const a = (i / tailN) * Math.PI * 0.95; p = V3(0, yb + 0.04 + Math.sin(a) * 0.38, -0.3 - Math.sin(a * 0.5) * 0.22 + (1 - Math.cos(a)) * 0.16); tailPts.push(p.toArray()); }
    tailPts.forEach((p, i) => bdef.push(['Sting' + (i + 1), i ? 'Sting' + i : 'Abdomen', p])); }
  if (R.asas) for (const [s, L] of [[1, '_L'], [-1, '_R']]) { const wr = [s * 0.06, yb + 0.12, 0.02]; bdef.push(['WingA' + L, 'Hips', wr], ['WingB' + L, 'Hips', [wr[0], wr[1] - 0.01, wr[2] - 0.02]]); }
  const skel = buildSkeleton(bdef, chains, v => v);
  kit.setBI(skel.BI);
  const { B, REST } = skel;
  const HB = (x, y, z) => { const h = REST.Head; return [h.x + x, h.y + y, h.z + z]; };

  // ---------- corpo
  const sk = { mat: metal ? 1 : MAT, metal };
  const abdW = p => p.z < az + 0.05 ? [['Abdomen', 1]] : [['Hips', 1]];
  if (['besouro', 'formiga', 'grilo', 'abelha'].includes(bc)) {
    const ab = { besouro: [0.2, 0.15, 0.3], formiga: [0.16, 0.14, 0.2], grilo: [0.12, 0.11, 0.26], abelha: [0.17, 0.16, 0.22] }[bc];
    const th = { besouro: [0.15, 0.12, 0.14], formiga: [0.08, 0.08, 0.13], grilo: [0.1, 0.09, 0.12], abelha: [0.14, 0.13, 0.13] }[bc];
    add(G.sph(1, 10, 8), { c: C.pele, b: 'Abdomen', pos: [0, yb + (bc === 'formiga' ? 0.04 : 0.01), az - ab[2] * 0.8], scl: ab, jit: J, ...sk });
    add(G.sph(1, 9, 7), { c: bc === 'besouro' ? C.escuro : C.pele, b: 'Hips', pos: [0, yb + 0.02, 0.02], scl: th, jit: J, ...sk });
    if (bc === 'formiga') add(G.tube([0, yb + 0.02, -0.06], [0, yb + 0.03, az - 0.06], 0.035, 0.035, 6), { c: C.escuro, b: abdW, jit: J });
    if (bc === 'abelha') { for (let i = 0; i < 3; i++) add(G.cyl(ab[0] * 1.02, ab[0] * 1.02, 0.035, 10, true), { c: C.claro, b: 'Abdomen', pos: [0, yb + 0.01, az - ab[2] * (0.35 + i * 0.4)], rot: [90, 0, 0], scl: [1, 1, ab[1] / ab[0]], jit: 0.003, vary: 0.1 });
      add(G.cone(0.03, 0.08, 5), { c: C.escuro, b: 'Abdomen', pos: [0, yb, az - ab[2] * 1.75], rot: [-90, 0, 0], jit: 0 });
      for (let i = 0; i < 10; i++) { const a = i * 0.63; add(G.ico(0.04, 0), { c: C.pele, b: 'Hips', pos: [Math.cos(a) * 0.12, yb + 0.08 + Math.sin(a * 2) * 0.03, 0.02 + Math.sin(a) * 0.1], jit: 0.006, vary: 0.12 }); } }
    if (bc === 'grilo') for (let i = 0; i < 4; i++) add(G.cyl(ab[0] * 1.01, ab[0] * 1.01, 0.012, 9, true), { c: C.escuro, b: 'Abdomen', pos: [0, yb + 0.01, az - 0.08 - i * 0.08], rot: [90, 0, 0], scl: [1, 1, ab[1] / ab[0]], jit: 0 });
  }
  if (bc === 'aranha') {
    add(G.sph(1, 10, 8), { c: C.pele, b: 'Abdomen', pos: [0, yb + 0.06, az - 0.26], scl: [0.27, 0.23, 0.33], jit: J });
    add(G.sph(1, 9, 7), { c: C.pele, b: 'Hips', pos: [0, yb + 0.02, 0.08], scl: [0.17, 0.12, 0.2], jit: J });
    const d = R.desenho;
    if (d === 'losangos') for (let i = 0; i < 4; i++) add(G.octa(0.06), { c: i % 2 ? C.claro : C.extra, b: 'Abdomen', pos: [0, yb + 0.06 + 0.21 * Math.cos((i - 1.5) * 0.35), az - 0.26 + (i - 1.5) * 0.11], scl: [1.2, 0.25, 0.8], rot: [(i - 1.5) * 20, 0, 0], jit: 0 });
    if (d === 'listras') for (let i = 0; i < 4; i++) add(G.cyl(0.27, 0.27, 0.025, 12, true), { c: i % 2 ? C.claro : C.extra, b: 'Abdomen', pos: [0, yb + 0.06, az - 0.26 + (i - 1.5) * 0.12], rot: [90, 0, 0], scl: [1.01 * Math.cos((i - 1.5) * 0.32), 1, 0.86 * Math.cos((i - 1.5) * 0.32)], jit: 0 });
    if (d === 'medalhao') { add(G.cyl(0.1, 0.1, 0.02, 12), { c: C.claro, b: 'Abdomen', pos: [0, yb + 0.28, az - 0.26], jit: 0 }); add(G.cyl(0.06, 0.06, 0.025, 8), { c: C.extra, b: 'Abdomen', pos: [0, yb + 0.29, az - 0.26], jit: 0 }); }
  }
  if (bc === 'escorpiao') {
    for (let i = 0; i < 5; i++) add(G.sph(1, 8, 5), { c: C.pele, b: i < 2 ? 'Hips' : 'Abdomen', pos: [0, yb + 0.02, 0.2 - i * 0.11], scl: [0.15 - i * 0.008, 0.07, 0.075], jit: J, ...sk });
    add(G.sph(1, 8, 5), { c: C.claro, b: 'Hips', pos: [0, yb + 0.04, 0.24], scl: [0.13, 0.06, 0.08], jit: J, ...sk });
  }
  if (bc === 'caranguejo') {
    add(G.sph(1, 12, 7), { c: C.pele, b: 'Hips', pos: [0, yb + 0.02, 0], scl: [0.42, 0.14, 0.3], jit: J });
    add(G.sph(1, 10, 5), { c: C.claro, b: 'Hips', pos: [0, yb - 0.04, 0.02], scl: [0.36, 0.08, 0.26], jit: J });
    const tw = R.torre, ruina = tw === 'ruina';
    if (tw === 'quadrada') add(G.box(0.34, 0.34, 0.3, 2), { c: C.extra, b: 'Hips', pos: [0, yb + 0.3, -0.02], jit: 0.012, vary: 0.12 });
    else add(G.cyl(0.18, 0.22, ruina ? 0.28 : 0.38, 10), { c: C.extra, b: 'Hips', pos: [0, yb + (ruina ? 0.26 : 0.31), -0.02], jit: 0.012, vary: 0.12 });
    const ty = yb + (tw === 'quadrada' ? 0.47 : ruina ? 0.4 : 0.5), n = tw === 'quadrada' ? 8 : 10;
    for (let i = 0; i < n; i++) { if (ruina && i % 3 === 0) continue; const a = i / n * Math.PI * 2, r = tw === 'quadrada' ? 0.17 : 0.19;
      add(G.box(0.06, 0.07, 0.06), { c: hex(C.extra, 0.9), b: 'Hips', pos: [Math.cos(a) * r, ty + 0.03, -0.02 + Math.sin(a) * r], rot: [0, -a / D2R, 0], jit: 0.006 }); }
    add(G.box(0.07, 0.11, 0.02), { c: '#2a2018', b: 'Hips', pos: [0, yb + 0.26, 0.19], jit: 0 });
    for (const a of [1.2, -1.2, 2.6]) add(G.box(0.04, 0.05, 0.02), { c: '#ffd070', glow: true, b: 'Hips', pos: [Math.sin(a) * 0.2, yb + 0.38, -0.02 + Math.cos(a) * 0.2], rot: [0, a / D2R, 0], jit: 0 });
    if (ruina) for (let i = 0; i < 6; i++) add(G.ico(0.05, 0), { c: '#5a8a3a', b: 'Hips', pos: [Math.cos(i) * 0.18, yb + 0.2 + (i % 3) * 0.08, -0.02 + Math.sin(i) * 0.18], scl: [1, 0.5, 1], jit: 0.006, vary: 0.15 });
  }
  if (bc === 'carrapato') {
    add(G.sph(1, 12, 8), { c: C.pele, b: p => p.z < -0.05 ? [['Abdomen', 1]] : [['Hips', 1]], pos: [0, yb + 0.06, -0.08], scl: [0.42, 0.32, 0.5], jit: J, vary: 0.1 });
    if (R.domo === 'placas') for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, r = i ? 0.22 : 0;
      add(G.cyl(0.11, 0.11, 0.015, 6), { c: C.claro, b: 'Abdomen', pos: [Math.cos(a) * r, yb + 0.06 + 0.32 * Math.sqrt(Math.max(0.1, 1 - (r / 0.42) ** 2)), -0.08 + Math.sin(a) * r * 1.2], rot: [i ? Math.sin(a) * 30 : 0, 0, i ? -Math.cos(a) * 30 : 0], jit: 0.002 }); }
    if (R.domo === 'espinhos') for (let i = 0; i < 12; i++) { const a = i * 2.4, r = 0.1 + (i % 4) * 0.07, d = V3(Math.cos(a) * r / 0.42, 0.8, Math.sin(a) * r / 0.5).normalize();
      add(G.cone(0.03, 0.12, 4), { c: C.escuro, b: 'Abdomen', pos: [Math.cos(a) * r, yb + 0.06 + 0.3 * Math.sqrt(Math.max(0.1, 1 - (r / 0.42) ** 2)), -0.08 + Math.sin(a) * r * 1.2], pre: g => g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(_Y, d)), jit: 0 }); }
  }
  if (bc === 'olho') {
    add(G.sph(0.32, 14, 10), { c: C.pele, b: 'Hips', pos: [0, yb + 0.06, 0], vary: 0.03 });
    add(G.sph(0.16, 12, 6, 0, 0.9), { c: C.claro, b: 'Hips', pos: [0, yb + 0.06, 0.17], rot: [90, 0, 0], jit: 0 });
    add(G.sph(0.08, 10, 6), { c: '#14110c', b: 'Hips', pos: [0, yb + 0.06, 0.3], scl: [1, 1, 0.4], jit: 0, vary: 0 });
    add(G.box(0.04, 0.04, 0.01), { c: '#ffffff', b: 'Hips', pos: [0.05, yb + 0.12, 0.315], jit: 0, vary: 0 });
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; add(G.tube([Math.cos(a) * 0.22, yb + 0.06 + Math.sin(a) * 0.22, -0.2], [Math.cos(a) * 0.28, yb + 0.06 + Math.sin(a) * 0.28, -0.24], 0.01, 0.004, 4), { c: C.extra, b: 'Hips', jit: 0 }); }
  }
  if (bc === 'lagarto') {
    add(G.sph(1, 10, 8), { c: C.pele, b: p => p.z > 0.12 ? [['Hips', 1]] : p.z < -0.12 ? [['Abdomen', 1]] : [['Hips', 0.5], ['Abdomen', 0.5]], pos: [0, yb + 0.02, -0.02], scl: [0.18, 0.12, 0.48], jit: J, vary: 0.08 });
    add(G.sph(1, 8, 6), { c: C.claro, b: 'Hips', pos: [0, yb - 0.06, 0], scl: [0.13, 0.05, 0.4], jit: J });
    add(G.tube([0, yb + 0.02, 0.38], [0, yb + 0.07, hz - 0.04], 0.09, 0.075, 8), { c: C.pele, b: p => p.z > 0.42 ? [['Neck', 1]] : [['Hips', 1]], jit: J });
    for (let i = 0; i < 8; i++) add(G.cone(0.025, 0.06, 4), { c: C.escuro, b: i < 4 ? 'Hips' : 'Abdomen', pos: [0, yb + 0.13 - Math.abs(i - 3.5) * 0.003, 0.3 - i * 0.09], jit: 0 });
  }
  if (bc === 'louva') {
    add(G.sph(1, 9, 7), { c: C.pele, b: 'Abdomen', pos: [0, yb + 0.06, az - 0.18], scl: [0.11, 0.1, 0.3], rot: [-12, 0, 0], jit: J });
    add(G.tube([0, yb + 0.04, 0.03], [0, 0.88, 0.18], 0.06, 0.045, 7), { c: C.pele, b: p => p.y > 0.55 ? [['Chest', 1]] : [['Hips', 1]], jit: J });
    add(G.sph(0.07, 7, 5), { c: C.pele, b: 'Hips', pos: [0, yb + 0.04, 0.0], jit: J });
    for (const s of [1, -1]) add(G.sph(1, 6, 3), { c: C.claro, mat: 3, b: 'Abdomen', pos: [s * 0.06, yb + 0.13, az - 0.14], scl: [0.06, 0.012, 0.28], rot: [-8, s * 8, 0], jit: 0 });
  }
  if (bc === 'libelula') { add(G.sph(0.07, 8, 6), { c: C.pele, b: 'Hips', pos: [0, yb + 0.02, 0.02], scl: [1, 0.9, 1.3], jit: J });
    for (let i = 0; i < 6; i++) add(G.cyl(0.03 - i * 0.002, 0.03 - i * 0.002, 0.14, 7), { c: i % 2 ? C.pele : C.claro, b: 'Abdomen', pos: [0, yb + 0.02, az - 0.06 - i * 0.13], rot: [90, 0, 0], jit: 0.002 });
    if (R.sela !== 'nenhuma') for (const z of (R.sela === 'dupla' ? [0.04, -0.28] : [0.04])) { add(G.box(0.12, 0.04, 0.14), { c: C.extra, b: z > 0 ? 'Hips' : 'Abdomen', pos: [0, yb + 0.1, z], jit: 0.002 }); add(G.box(0.1, 0.06, 0.02), { c: hex(C.extra, 0.7), b: z > 0 ? 'Hips' : 'Abdomen', pos: [0, yb + 0.14, z - 0.07], jit: 0 }); for (const s of [1, -1]) add(G.box(0.008, 0.1, 0.03), { c: '#3a2a1a', b: z > 0 ? 'Hips' : 'Abdomen', pos: [s * 0.065, yb + 0.06, z], jit: 0 }); } }
  if (bc === 'mariposa') { for (let i = 0; i < 9; i++) add(G.ico(0.045, 0), { c: i % 2 ? C.pele : C.claro, b: 'Hips', pos: [Math.cos(i) * 0.05, yb + 0.03 + Math.sin(i * 2) * 0.03, 0.02 + Math.sin(i) * 0.05], jit: 0.006 });
    add(G.sph(1, 8, 6), { c: C.pele, b: 'Abdomen', pos: [0, yb + 0.02, az - 0.16], scl: [0.08, 0.075, 0.2], jit: J }); }
  if (bc === 'abelha' && R.pote !== 'nada') for (const s of (R.pote === 'dois' ? [1, -1] : [1])) {
    add(G.sph(0.06, 8, 6), { c: '#c8763a', b: 'Hips', pos: [s * 0.17, yb - 0.04, 0.06], scl: [1, 1.1, 1], jit: 0.003 }); add(G.cyl(0.035, 0.04, 0.025, 8), { c: '#a85a2a', b: 'Hips', pos: [s * 0.17, yb + 0.03, 0.06], jit: 0 });
    add(G.sph(0.04, 6, 3, 0, Math.PI / 2), { c: C.extra, glow: true, b: 'Hips', pos: [s * 0.17, yb + 0.04, 0.06], jit: 0 }); }

  // ---------- cabeça
  const hd = R.cabeca;
  const eyesOn = (x, y, z, r, col = '#14110c', b = 'Head') => { for (const s of [1, -1]) add(G.sph(r, 6, 4), { c: col, b, pos: HB(s * x, y, z), jit: 0, vary: 0 }); };
  if (hd === 'besouro') {
    add(G.sph(0.09, 8, 6), { c: C.escuro, b: 'Head', pos: HB(0, 0, 0.02), scl: [1.1, 0.8, 1], jit: J, ...sk }); eyesOn(0.07, 0.02, 0.05, 0.02);
    const ch = R.chifre, hc = C.escuro;
    if (ch === 'rinoceronte') { add(G.tube(HB(0, 0.02, 0.06), HB(0, 0.14, 0.2), 0.035, 0.025, 6), { c: hc, b: 'Head', ...sk }); add(G.tube(HB(0, 0.14, 0.2), HB(0, 0.28, 0.2), 0.025, 0.004, 6), { c: hc, b: 'Head', ...sk });
      add(G.tube([0, yb + 0.12, 0.06], [0, yb + 0.22, 0.16], 0.03, 0.004, 6), { c: hc, b: 'Hips', ...sk }); }
    if (ch === 'pinca') for (const s of [1, -1]) { add(G.tube(HB(s * 0.05, 0, 0.06), HB(s * 0.1, 0.04, 0.2), 0.022, 0.016, 5), { c: hc, b: 'Head', ...sk }); add(G.tube(HB(s * 0.1, 0.04, 0.2), HB(s * 0.03, 0.06, 0.3), 0.016, 0.004, 5), { c: hc, b: 'Head', ...sk }); }
    if (ch === 'tridente') for (const x of [-0.06, 0, 0.06]) add(G.tube(HB(x * 0.5, 0.02, 0.06), HB(x, x ? 0.14 : 0.2, 0.18), 0.022, 0.004, 5), { c: hc, b: 'Head', ...sk });
  }
  if (hd === 'formiga' || hd === 'grilo') {
    const big = hd === 'grilo' ? 1 : 1.1;
    add(G.sph(0.09 * big, 8, 6), { c: C.pele, b: 'Head', pos: HB(0, 0.02, 0.02), scl: [1, 0.9, hd === 'grilo' ? 1.3 : 1], jit: J }); eyesOn(0.07, 0.04, 0.05, 0.028, hd === 'grilo' ? C.escuro : '#14110c');
    if (hd === 'formiga') for (const s of [1, -1]) add(G.tube(HB(s * 0.04, -0.03, 0.08), HB(-s * 0.02, -0.04, 0.16), 0.016, 0.006, 4), { c: C.escuro, b: 'Head', jit: 0 });
  }
  if (hd === 'urso') {
    add(G.sph(0.12, 9, 7), { c: C.pele, b: 'Head', pos: HB(0, 0.04, 0.04), vary: 0.1 }); add(G.sph(1, 7, 5), { c: C.claro, b: 'Head', pos: HB(0, 0.0, 0.14), scl: [0.06, 0.045, 0.05] });
    add(G.ico(0.022), { c: '#1b1712', b: 'Head', pos: HB(0, 0.015, 0.19), jit: 0 }); eyesOn(0.05, 0.07, 0.12, 0.016);
    for (const s of [1, -1]) add(G.sph(0.04, 6, 4), { c: C.pele, b: 'Head', pos: HB(s * 0.09, 0.14, 0.0), scl: [1, 1, 0.6] });
  }
  if (hd === 'aranha') {
    for (const [x, y, z, r] of [[0.04, 0.06, 0.25, 0.026], [-0.04, 0.06, 0.25, 0.026], [0.09, 0.05, 0.22, 0.018], [-0.09, 0.05, 0.22, 0.018], [0.03, 0.09, 0.22, 0.014], [-0.03, 0.09, 0.22, 0.014], [0.07, 0.08, 0.2, 0.012], [-0.07, 0.08, 0.2, 0.012]])
      add(G.sph(r, 6, 4), { c: '#14110c', b: 'Head', pos: [x, yb + y, z], jit: 0, vary: 0 });
    for (const s of [1, -1]) add(G.cone(0.025, 0.09, 4), { c: C.escuro, b: 'Head', pos: [s * 0.04, yb - 0.04, 0.27], rot: [160, 0, 0], jit: 0 });
  }
  if (hd === 'libelula' || hd === 'mariposa') { add(G.sph(0.06, 8, 6), { c: C.pele, b: 'Head', pos: HB(0, 0.0, 0.03), jit: J }); for (const s of [1, -1]) add(G.sph(hd === 'libelula' ? 0.045 : 0.03, 8, 6), { c: hd === 'libelula' ? C.claro : '#14110c', b: 'Head', pos: HB(s * 0.045, 0.02, 0.05), jit: 0, vary: 0 }); }
  if (hd === 'escorpiao') { eyesOn(0.03, 0.05, 0.0, 0.015, '#14110c', 'Head'); }
  if (hd === 'caranguejo') for (const s of [1, -1]) { add(G.tube(HB(s * 0.08, 0.0, -0.04), HB(s * 0.1, 0.12, 0.0), 0.014, 0.012, 5), { c: C.pele, b: 'Head' }); add(G.sph(0.03, 6, 4), { c: '#14110c', b: 'Head', pos: HB(s * 0.1, 0.13, 0.0), jit: 0 }); }
  if (hd === 'carrapato') { add(G.sph(0.08, 8, 6), { c: C.escuro, b: 'Head', pos: HB(0, -0.04, 0.04), scl: [1, 0.7, 1.2], jit: J }); for (const s of [1, -1]) add(G.cone(0.02, 0.07, 4), { c: C.escuro, b: 'Head', pos: HB(s * 0.03, -0.06, 0.12), rot: [100, 0, 0], jit: 0 }); }
  if (hd === 'lagarto') {
    add(G.sph(1, 9, 6), { c: C.pele, b: 'Head', pos: HB(0, 0.0, 0.06), scl: [0.09, 0.07, 0.15], jit: J });
    add(G.box(0.14, 0.008, 0.02), { c: hex(C.pele, 0.5), b: 'Head', pos: HB(0, -0.025, 0.15), jit: 0 });
    for (const s of [1, -1]) { add(G.ico(0.024, 1), { c: '#f0c030', b: 'Head', pos: HB(s * 0.065, 0.035, 0.07), jit: 0, vary: 0 }); add(G.box(0.006, 0.026, 0.006), { c: '#14110c', b: 'Head', pos: HB(s * 0.08, 0.035, 0.09), jit: 0, vary: 0 }); }
  }
  if (hd === 'louva') {
    add(G.cone(0.08, 0.1, 3), { c: C.pele, b: 'Head', pos: HB(0, 0.0, 0.03), rot: [180, 0, 0], scl: [1.3, 1, 0.6], jit: J });
    for (const s of [1, -1]) add(G.sph(0.035, 7, 5), { c: C.claro, b: 'Head', pos: HB(s * 0.075, 0.035, 0.03), jit: 0 });
    for (const s of [1, -1]) add(G.tube(HB(s * 0.02, 0.05, 0.03), HB(s * 0.12, 0.2, 0.12), 0.006, 0.003, 3), { c: C.escuro, b: 'Head', jit: 0 });
  }
  // antenas
  for (const ch of chains.filter(c => c.name.startsWith('Ant'))) { const W = { b: chainW(ch) }; add(G.tube(ch.pts[0], ch.pts[1], 0.008, 0.006, 4), { c: C.escuro, ...W }); add(G.tube(ch.pts[1], ch.pts[2], 0.006, 0.003, 4), { c: C.escuro, ...W }); }
  // ---------- patas
  for (const lg of legs) {
    const { root: r0, l1, l2, s, nm, L } = lg, gross = bc === 'carrapato' || bc === 'caranguejo' || bc === 'lagarto', pel = R.pelos;
    const ra = gross ? 0.045 : bc === 'aranha' || bc === 'olho' ? 0.025 : 0.02, rb = ra * 0.75;
    const k = [r0[0], r0[1] - l1, r0[2]], t = [r0[0], r0[1] - l1 - l2, r0[2]];
    const jump = R.saltador && lg.i === NP - 1, kk = jump ? 1.6 : 1;
    add(G.tube(r0, k, ra * kk, rb * kk, 6), { c: bc === 'olho' ? C.escuro : C.pele, b: nm + 'A' + L, jit: J, ...sk });
    add(G.tube(k, t, rb, rb * 0.5, 6), { c: bc === 'olho' ? C.escuro : bc === 'lagarto' ? C.pele : C.escuro, b: nm + 'B' + L, jit: J, ...sk });
    add(G.sph(rb * 1.15, 5, 4), { c: C.escuro, b: nm + 'B' + L, pos: k, jit: 0 });
    if (bc === 'lagarto') for (const dx of [-1, 0, 1]) add(G.cone(0.012, 0.05, 4), { c: C.extra, b: nm + 'C' + L, pos: [t[0] + dx * 0.025, t[1] + 0.01, t[2] + 0.04], rot: [80, 0, 0], jit: 0 });
    if (pel) for (let i = 0; i < 4; i++) { const q = V3(...r0).lerp(V3(...k), (i + 0.5) / 4); add(G.cone(0.006, 0.04, 3), { c: C.escuro, b: nm + 'A' + L, pos: [q.x + s * 0.01, q.y, q.z], rot: [0, 0, -s * 70], jit: 0 }); }
  }
  // ---------- garras / foices
  if (front) for (const [s, L] of [[1, '_L'], [-1, '_R']]) {
    const A = REST['ArmA' + L].toArray(), Bp = REST['ArmB' + L].toArray(), Cp = REST['ArmC' + L].toArray();
    const r = bc === 'caranguejo' ? 0.06 : bc === 'escorpiao' ? 0.035 : 0.025;
    add(G.tube(A, Bp, r, r * 0.9, 6), { c: C.pele, b: 'ArmA' + L, jit: J, ...sk });
    add(G.tube(Bp, Cp, r * 0.9, r * 1.1, 6), { c: C.pele, b: 'ArmB' + L, jit: J, ...sk });
    if (front === 'pincas') { const big = bc === 'caranguejo' ? 2.2 : 1.2, c0 = V3(...Cp), d = c0.clone().sub(V3(...Bp)).normalize();
      add(G.sph(0.06 * big, 8, 6), { c: C.claro, b: 'ArmC' + L, pos: c0.toArray(), scl: [0.8, 0.7, 1.1], jit: J, ...sk });
      for (const off of [0.025, -0.025]) { const tip = c0.clone().addScaledVector(d, 0.14 * big).add(V3(s * off * big, off * 0.6 * big, 0));
        add(G.tube(c0.clone().add(V3(0, off * big, 0)).toArray(), tip.toArray(), 0.03 * big, 0.006, 5), { c: C.escuro, b: 'ArmC' + L, jit: 0.002, ...sk }); } }
    if (front === 'foices') { const c0 = V3(...Cp), ser = R.serrilha;
      const blade = G.slab([[0, 0], [0.04, 0.02], [0.26, -0.02], [0.32, -0.08], [0.24, -0.04], [0.04, -0.02]], 0.012); blade.rotateY(-Math.PI / 2); blade.rotateX(Math.PI * 0.9);
      blade.translate(c0.x, c0.y, c0.z); add(blade, { c: C.extra, b: 'ArmC' + L, jit: 0.001 });
      if (ser) for (let i = 0; i < 5; i++) add(G.cone(0.008, 0.025, 3), { c: C.escuro, b: 'ArmC' + L, pos: [c0.x, c0.y - 0.03 - i * 0.045, c0.z + 0.0 + i * 0.01], rot: [-90, 0, 0], jit: 0 }); }
  }
  // ---------- ferrão
  if (tailN) { for (let i = 0; i < tailN; i++) { add(G.tube(tailPts[i], tailPts[i + 1], 0.05 - i * 0.005, 0.045 - i * 0.005, 7), { c: C.pele, b: 'Sting' + (i + 1), jit: J, ...sk }); add(G.sph(0.05 - i * 0.005, 6, 4), { c: C.claro, b: 'Sting' + (i + 1), pos: tailPts[i + 1], jit: J, ...sk }); }
    const tp = V3(...tailPts[tailN]); add(G.sph(0.05, 7, 5), { c: C.claro, b: 'Sting' + tailN, pos: tp.toArray(), jit: J, ...sk });
    for (const off of R.ferraoDuplo ? [0.03, -0.03] : [0]) add(G.cone(0.02, 0.09, 5), { c: C.brilho, glow: true, b: 'Sting' + tailN, pos: [tp.x + off, tp.y - 0.02, tp.z + 0.06], rot: [120, 0, 0], jit: 0 }); }
  // cauda de lagarto
  const tail = chains.find(c => c.name === 'Tail');
  if (tail) { const W = { b: chainW(tail) }, rr = [0.09, 0.065, 0.04, 0.01]; for (let i = 0; i < 3; i++) add(G.tube(tail.pts[i], tail.pts[i + 1], rr[i], rr[i + 1], 7), { c: C.pele, jit: J, ...W }); }
  // ---------- carga / extras
  for (const ex of R.extras) {
    if (ex.startsWith('carga-')) { const t = ex.slice(6);
      add(G.box(0.3, 0.025, 0.56), { c: C.extra, b: p => p.z > 0 ? [['Hips', 1]] : [['Abdomen', 1]], pos: [0, yb + 0.13, -0.02] });
      for (const s of [1, -1]) add(G.box(0.018, 0.06, 0.56), { c: hex(C.extra, 0.75), b: p => p.z > 0 ? [['Hips', 1]] : [['Abdomen', 1]], pos: [s * 0.15, yb + 0.16, -0.02] });
      if (t === 'caixas') for (const [x, z, h] of [[0.06, 0.12, 0.1], [-0.07, 0.1, 0.12], [0, -0.12, 0.14]]) add(G.box(0.12, h, 0.12), { c: '#a87a4a', b: z > 0 ? 'Hips' : 'Abdomen', pos: [x, yb + 0.14 + h / 2, z] });
      if (t === 'barris') for (const z of [0.12, -0.1]) add(G.cyl(0.07, 0.07, 0.24, 9), { c: '#8a5a2e', b: z > 0 ? 'Hips' : 'Abdomen', pos: [0, yb + 0.21, z], rot: [0, 0, 90] });
      if (t === 'sela') for (const z of [0.12, -0.14]) { add(G.box(0.2, 0.05, 0.16), { c: '#7a3a2a', b: z > 0 ? 'Hips' : 'Abdomen', pos: [0, yb + 0.17, z] }); add(G.box(0.18, 0.08, 0.03), { c: '#5a2a1a', b: z > 0 ? 'Hips' : 'Abdomen', pos: [0, yb + 0.22, z - 0.07] }); } }
    if (ex.startsWith('cesto-')) { const t = ex.slice(6);
      add(G.cyl(0.13, 0.1, 0.13, 10, true), { c: C.extra, b: 'Hips', pos: [0, yb + 0.17, -0.02], vary: 0.12 }); add(G.cyl(0.1, 0.1, 0.01, 10), { c: hex(C.extra, 0.7), b: 'Hips', pos: [0, yb + 0.11, -0.02] });
      for (let i = 0; i < 5; i++) { const a = i * 1.3, x = Math.cos(a) * 0.05, z = -0.02 + Math.sin(a) * 0.05;
        if (t === 'folhas') add(G.sph(1, 5, 3), { c: i % 2 ? '#4a8a3a' : '#6aa64a', b: 'Hips', pos: [x, yb + 0.25, z], scl: [0.03, 0.08, 0.012], rot: [20, a / D2R, 15], jit: 0 });
        if (t === 'frutas') add(G.ico(0.035, 1), { c: ['#d83a3a', '#f0a030', '#8a3ab8'][i % 3], b: 'Hips', pos: [x, yb + 0.23, z], jit: 0 });
        if (t === 'pedras') add(G.octa(0.035), { c: '#80d8ff', mat: 3, b: 'Hips', pos: [x, yb + 0.24, z], scl: [0.7, 1.5, 0.7], jit: 0 }); } }
  }
  if (R.instrumento === 'violino') { add(G.sph(1, 7, 5), { c: '#a8582a', b: 'Leg1A_R', pos: [-0.16, yb - 0.02, 0.18], scl: [0.04, 0.012, 0.07], jit: 0 }); add(G.box(0.006, 0.006, 0.12), { c: '#3a2010', b: 'Leg1A_R', pos: [-0.16, yb, 0.27], jit: 0 }); }
  if (R.instrumento === 'flauta') add(G.tube([-0.1, yb, 0.22], [-0.02, yb + 0.02, 0.36], 0.01, 0.01, 6), { c: '#c8a060', b: 'Head', jit: 0 });
  // ---------- asas
  if (R.asas) for (const [s, L] of [[1, '_L'], [-1, '_R']]) { const A = REST['WingA' + L].toArray();
    if (R.asas === 'besouro') {
      add(G.sph(1, 8, 5, 0, Math.PI / 2), { c: C.claro, metal: true, mat: 1, b: 'WingA' + L, pos: [s * 0.1, yb + 0.07, az - 0.2], scl: [0.11, 0.15, 0.34], jit: J });
      add(G.box(0.008, 0.01, 0.6), { c: C.escuro, b: 'WingA' + L, pos: [s * 0.005, yb + 0.22, az - 0.2], jit: 0 });
      const ell = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI * 2; ell.push([0.2 + Math.cos(a) * 0.2, Math.sin(a) * 0.06]); }
      const g = G.flat(ell); if (s < 0) { g.scale(-1, 1, 1); const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i]; ix[i] = ix[i + 2]; ix[i + 2] = t; } }
      g.rotateY(s * 1.3); g.translate(A[0], A[1] + 0.02, A[2] - 0.04); add(g, { c: C.asa, mat: 3, b: 'WingB' + L, jit: 0.001 }); }
    if (R.asas === 'libelula' || R.asas === 'mariposa') { const lib = R.asas === 'libelula';
      for (const [bone, rz, len, wid] of lib ? [['WingA', 8, 0.5, 0.09], ['WingB', -12, 0.46, 0.08]] : [['WingA', 20, 0.42, 0.34], ['WingB', -30, 0.32, 0.24]]) { const pts = []; for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI * 2; pts.push([len / 2 + Math.cos(a) * len / 2, Math.sin(a) * wid / 2 + (lib ? 0 : wid * 0.15 * Math.cos(a))]); }
        const g = G.flat(pts); if (s < 0) { g.scale(-1, 1, 1); const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const tq = ix[i]; ix[i] = ix[i + 2]; ix[i + 2] = tq; } }
        g.rotateX(-0.4); g.rotateZ(s * rz * D2R); g.translate(A[0], A[1], A[2]); add(g, { c: C.asa, mat: lib ? 3 : 0, b: bone + L, jit: 0.001 });
        if (!lib) { const er = R.olhosAsa === 'grandes' ? 0.06 : 0.035, e = G.cyl(er, er, 0.004, 10); e.rotateX(Math.PI / 2 - 0.4); e.translate(A[0] + s * len * 0.6, A[1] + (bone === 'WingA' ? 0.08 : -0.06), A[2] - 0.01); add(e, { c: C.extra, b: bone + L, jit: 0 });
          const e2 = G.cyl(er * 0.45, er * 0.45, 0.005, 8); e2.rotateX(Math.PI / 2 - 0.4); e2.translate(A[0] + s * len * 0.6, A[1] + (bone === 'WingA' ? 0.08 : -0.06), A[2] - 0.012); add(e2, { c: '#14110c', b: bone + L, jit: 0 }); } } }
    if (R.asas === 'abelha') { for (const [bone, rz, len] of [['WingA', 20, 0.24], ['WingB', -10, 0.18]]) { const ell = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI * 2; ell.push([len / 2 + Math.cos(a) * len / 2, Math.sin(a) * len * 0.2]); }
      const g = G.flat(ell); if (s < 0) { g.scale(-1, 1, 1); const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i]; ix[i] = ix[i + 2]; ix[i + 2] = t; } }
      g.rotateX(-0.5); g.rotateZ(s * rz * D2R); g.translate(A[0], A[1], A[2]); add(g, { c: C.asa, mat: 3, b: bone + L, jit: 0.001 }); } }
  }
  // ---------- poses
  const isLado = !!R.lado, hasW = !!R.asas && R.asas !== 'louva', pesado = !!R.pesado;
  const reach = Math.max(...legs.map(l => l.l1 + l.l2)), sz = Math.sqrt(reach / 0.5);
  const setE = (b, a, o = 'YXZ') => b.quaternion.copy(E(a, o));
  function applyPose(P) {
    B.Hips.position.set(REST.Hips.x + P.hp[0], REST.Hips.y + P.hp[1], REST.Hips.z + P.hp[2]); setE(B.Hips, P.hr);
    setE(B.Abdomen, P.ab); setE(B.Head, P.hd); if (B.Chest) setE(B.Chest, P.ch || [0, 0, 0]); if (B.Neck) setE(B.Neck, P.nk || [0, 0, 0]);
    for (const ch of chains) for (const nm of ch.names) B[nm].quaternion.identity();
    if (front) for (const [s, L] of [[1, '_L'], [-1, '_R']]) { const a = P.arm; setE(B['ArmA' + L], [a[0], s * a[1], s * a[2]], 'XYZ'); setE(B['ArmB' + L], [a[3], 0, 0], 'XYZ'); setE(B['ArmC' + L], [a[4], 0, s * (a[5] || 0)], 'XYZ'); }
    if (tailN) for (let i = 1; i <= tailN; i++) setE(B['Sting' + i], [P.tail[i - 1] || 0, P.tailY ? P.tailY / tailN : 0, 0]);
    if (R.asas) for (const [s, L] of [[1, '_L'], [-1, '_R']]) { setE(B['WingA' + L], [P.w[2] || 0, s * P.w[1], s * P.w[0]], 'XYZ'); setE(B['WingB' + L], [0, s * P.w[1] * (R.asas === 'besouro' ? 0.4 : 1), s * P.w[3]], 'XYZ'); }
    B.Hips.updateMatrixWorld(true);
    for (const lg of legs) { const o = P.f[lg.nm + lg.L] || [0, 0, 0];
      const tgt = V3(lg.foot[0] + o[0], lg.foot[1] + o[1], lg.foot[2] + o[2]);
      ikQ(B[lg.nm + 'A' + lg.L], B[lg.nm + 'B' + lg.L], B[lg.nm + 'C' + lg.L], tgt, V3(lg.s * 0.4, 1, 0), lg.l1, lg.l2, true, E([0, 0, 0])); }
    B.Hips.updateMatrixWorld(true);
  }
  const groupA = lg => (lg.i % 2 === 0) === (lg.s > 0);           // tripé / tetrápode alternado
  const wRest = ['libelula', 'mariposa'].includes(R.asas) ? [6, 12, 0, 2] : [-5, 75, 0, -5];
  const base = () => ({ hp: [0, 0, 0], hr: [0, 0, 0], ab: [0, 0, 0], hd: [0, 0, 0], ch: [0, 0, 0], nk: [0, 0, 0], arm: bc === 'louva' ? [-20, 0, 0, -120, 150, 0] : [10, 10, 0, -30, 20, 10], tail: [0, 0, 0, 0, 0], w: [...wRest], f: {} });
  const gait = (name, T, D, Sx, h) => ({ name, dur: T, fps: 60, loop: true, v: Sx / (D * T), fn: t => { const P = base(), u = t / T;
    for (const lg of legs) { const ph = ((u + (groupA(lg) ? 0 : 0.5) + lg.i * 0.04) % 1 + 1) % 1; let d, lift = 0;
      if (ph < D) d = Sx / 2 - Sx * ph / D; else { const w = (ph - D) / (1 - D); d = -Sx / 2 + Sx * EASE.io(w); lift = h * Math.sin(Math.PI * w); }
      P.f[lg.nm + lg.L] = isLado ? [d, lift, 0] : [0, lift, d]; }
    P.hp[1] = 0.01 * reach * Math.cos(4 * Math.PI * u); P.hr = [0, isLado ? 0 : 3 * Math.sin(2 * Math.PI * u), isLado ? 3 * Math.sin(2 * Math.PI * u) : 0]; P.ab = [2 * Math.sin(4 * Math.PI * u), 4 * Math.sin(2 * Math.PI * u), 0];
    if (tailN) P.tail = [6 * Math.sin(2 * Math.PI * u), 0, 0, 0, 0]; return P; } });
  const clipdefs = [
    { name: 'Parado', dur: 3, fps: 30, loop: true, fn: t => { const P = base(), a = 2 * Math.PI * t / 3; P.hp[1] = 0.006 * reach * Math.sin(a); P.ab = [3 * Math.sin(a), 5 * Math.sin(a + 1), 0]; P.hd = [3 * Math.sin(2 * a), 10 * Math.sin(a), 0];
      if (front) P.arm = bc === 'louva' ? [-20 + 4 * Math.sin(a), 0, 0, -120, 150 + 6 * Math.sin(2 * a), 0] : [10 + 5 * Math.sin(a), 10, 0, -30, 20 + 15 * Math.max(0, Math.sin(3 * a)), 10];
      if (tailN) P.tail = [8 * Math.sin(a), 4 * Math.sin(a + 0.5), 0, 0, -4 * Math.sin(a)]; if (bc === 'louva') P.ch = [3 * Math.sin(a), 6 * Math.sin(a * 0.5), 0]; return P; } },
    gait('Andar', 0.8 * sz * (pesado ? 1.4 : 1), 0.6, reach * 0.38, reach * 0.18),
    gait('Correr', 0.42 * sz * (pesado ? 1.3 : 1), 0.5, reach * 0.62, reach * 0.26),
    { name: 'Atacar', dur: 1.0, fps: 60, fn: t => { const P = base(), w = t < 0.35 ? EASE.io(t / 0.35) : t < 0.5 ? 1 - EASE.in((t - 0.35) / 0.15) * 2 : -1 + EASE.io((t - 0.5) / 0.5), back = Math.max(0, w), fwd = Math.max(0, -w);
      P.hp = [0, -0.04 * reach * back, (isLado ? 0 : -0.06 * back + 0.1 * fwd) * reach]; P.hr = [6 * back - 6 * fwd, 0, 0];
      if (front === 'foices') P.arm = [-20 - 60 * back + 50 * fwd, 0, 0, -120 + 40 * back + 80 * fwd, 150 - 30 * back - 100 * fwd, 0];
      else if (front) P.arm = [10 - 40 * back + 20 * fwd, 10 + 20 * back - 10 * fwd, 0, -30 - 20 * back + 25 * fwd, 20 + 40 * back - 20 * fwd, 10 + 25 * back];
      if (tailN) P.tail = [-10 * back + 25 * fwd, -8 * back + 20 * fwd, 0, 10 * fwd, 20 * fwd];
      if (!front && !tailN) { for (const lg of legs.filter(l => l.i === 0)) P.f[lg.nm + lg.L] = [0, 0.18 * reach * back, 0.12 * reach * fwd]; P.hd = [20 * fwd, 0, 0]; }
      if (R.chifre) P.hd = [25 * back - 30 * fwd, 0, 0]; return P; } },
    { name: 'Ameaçar', dur: 1.6, fps: 30, fn: t => { const P = base(), k = Math.sin(Math.PI * clamp(t / 1.35, 0, 1)), sh = k > 0.6 ? Math.sin(t * 50) * 3 : 0;
      P.hr = [-16 * k, 0, 0]; P.hp = [0, 0.05 * reach * k, 0]; P.hd = [-10 * k, sh, 0];
      for (const lg of legs.filter(l => l.i === 0)) P.f[lg.nm + lg.L] = [lg.s * 0.04 * reach * k, 0.22 * reach * k, 0.04 * reach * k];
      if (front) P.arm = bc === 'louva' ? [-20 - 50 * k, 0, 15 * k, -120 + 60 * k, 150 - 60 * k, 0] : [10 - 45 * k, 10 + 35 * k, 0, -30 - 20 * k, 20 + 50 * k, 10 + 30 * k];
      if (tailN) P.tail = [-15 * k, -10 * k, 5 * k, 10 * k, 15 * k + sh]; if (hasW) P.w = [-5 + 40 * k, 75 * (1 - k), 0, -5 + 40 * k]; return P; } },
  ];
  if (hasW) { const f = R.flap, DV = Math.max(1, Math.round(1.2 * f)) / f, hov = reach * 0.9;
    clipdefs.push({ name: 'Voar', dur: DV, fps: Math.max(30, Math.min(120, f * 10)), loop: true, v: 2.2 * reach, fn: t => { const P = base(), ph = 2 * Math.PI * f * t;
      P.hp = [0, hov + 0.03 * reach * Math.cos(ph), 0]; P.hr = [-10, 0, 0]; P.ab = [12, 0, 0];
      for (const lg of legs) P.f[lg.nm + lg.L] = [-lg.s * 0.1 * reach, hov - reach * 0.35, -0.05 * reach];
      P.w = R.asas === 'besouro' ? [55, 10, -30, 40 * Math.sin(ph)] : [40 * Math.sin(ph) + 10, 10, 0, 40 * Math.sin(ph - 0.5)]; return P; } }); }
  if (R.saltador) clipdefs.push({ name: 'Saltar', dur: 1.2, fps: 60, fn: t => { const P = base(), u = t / 1.2, cr = Math.sin(Math.PI * clamp(u / 0.25, 0, 1)) * (u < 0.25 ? 1 : 0), air = Math.sin(Math.PI * clamp((u - 0.25) / 0.5, 0, 1));
    P.hp = [0, -0.06 * reach * cr + 0.9 * reach * air, 0.5 * reach * air]; P.hr = [-15 * air + 8 * cr, 0, 0];
    for (const lg of legs) P.f[lg.nm + lg.L] = [0, 0.9 * reach * air * (lg.i === NP - 1 ? 0.7 : 0.85), 0.5 * reach * air - (lg.i === NP - 1 ? 0.15 * reach * air : 0)]; return P; } });
  const P0 = finish(kit, skel, chains, S.nome, clipdefs, applyPose, {});
  P0.vel = Object.fromEntries(clipdefs.filter(c => c.v).map(c => [c.name, c.v]));
  if (isLado) P0.direcao = '+X (anda de lado)';
  return P0;
}

// ======================================================================= FAMÍLIA E — serpentes, vermes e corpos em corrente
function forgeE(id, S, cfg) {
  const R = { N: 12, r0: 0.04, taper: 0.5, tipo: 'cobra', cabeca: 'cobra', onda: 'lateral', ...S.receita(cfg) };
  const COL = S.cats.cores.cor[cfg.cores];
  const C = { pele: '#6a7a3a', claro: '#d8e0a0', escuro: '#2a3014', extra: '#e8dcc0', brilho: '#ffd060', ...COL };
  const kit = makeKit(v => v.clone()), { add, G } = kit;
  const N = R.N, SL = 1 / N, r0 = R.r0, yb = r0, J = 0.003;
  const rad = i => r0 * (1 - R.taper * Math.pow(i / N, 1.3));
  // ---------- esqueleto: Root no chão; Seg1 (pescoço) .. SegN (ponta); Head à frente de Seg1
  const bdef = [['Root', null, [0, 0, 0]]];
  for (let i = 1; i <= N; i++) bdef.push(['Seg' + i, i === 1 ? 'Root' : 'Seg' + (i - 1), [0, yb, -(i - 1) * SL]]);
  bdef.push(['SegEnd', 'Seg' + N, [0, yb, -N * SL]], ['Head', 'Seg1', [0, yb, 0.02]], ['Jaw', 'Head', [0, yb - r0 * 0.4, 0.03]]);
  if (R.duas) bdef.push(['Head2', 'Seg' + N, [0, yb, -N * SL - 0.02]]);
  if (R.cabeca === 'petalas') for (let i = 0; i < R.petalas; i++) bdef.push(['Petal' + (i + 1), 'Head', [Math.cos(i / R.petalas * Math.PI * 2) * r0 * 0.9, yb + Math.sin(i / R.petalas * Math.PI * 2) * r0 * 0.9, 0.04]]);
  if (R.patas) for (let i = 2; i <= N; i++) for (const [s, L] of [[1, '_L'], [-1, '_R']]) bdef.push(['Pata' + i + L, 'Seg' + i, [s * rad(i) * 0.8, yb - rad(i) * 0.3, -(i - 0.5) * SL]]);
  const chains = [];
  if (R.antenas) for (const [s, L] of [[1, '_L'], [-1, '_R']]) chains.push({ name: 'Ant' + L, label: 'antenas', parent: 'Head', pts: [[s * r0 * 0.5, yb + r0 * 0.9, 0.06], [s * r0 * 1.0, yb + r0 * 2.2, 0.1], [s * r0 * 1.4, yb + r0 * 3.2, 0.12]],
    names: ['Ant1' + L, 'Ant2' + L], end: 'AntEnd' + L, spring: [{ k: 80, d: 6, g: 0.2, max: 30 }, { k: 60, d: 5, g: 0.2, max: 40 }] });
  if (R.tipo === 'pipa') for (const [s, L] of [[1, '_L'], [-1, '_R']]) { const n = R.fitas === 'longas' ? 0.35 : 0.18, b = [s * rad(N) * 0.5, yb, -N * SL];
    chains.push({ name: 'Fita' + L, label: 'fitas', parent: 'Seg' + N, pts: [b, [b[0] + s * 0.02, yb - 0.01, b[2] - n * 0.5], [b[0] + s * 0.04, yb - 0.02, b[2] - n]], names: ['Fita1' + L, 'Fita2' + L], end: 'FitaEnd' + L,
      spring: [{ k: 25, d: 3, g: 0.3, max: 50 }, { k: 18, d: 2.5, g: 0.3, max: 60 }] }); }
  const skel = buildSkeleton(bdef, chains, v => v);
  kit.setBI(skel.BI);
  const { B, REST } = skel;
  const spine = { pts: [[0, yb, 0.0]].concat(Array.from({ length: N }, (_, i) => [0, yb, -(i + 1) * SL])), names: Array.from({ length: N }, (_, i) => 'Seg' + (i + 1)), parent: 'Root' };
  const SW = chainW(spine);
  const zAt = i => -(i - 0.5) * SL;
  // ---------- corpo
  const t = R.tipo, bodyMat = 0;
  for (let i = 1; i <= N; i++) {
    const z0 = -(i - 1) * SL, z1 = -i * SL, r = rad(i - 1), r2 = rad(i);
    if (t === 'ossos') {
      add(G.cyl(r * 0.55, r2 * 0.55, SL * 0.7, 6), { c: C.pele, b: 'Seg' + i, pos: [0, yb, (z0 + z1) / 2], rot: [90, 0, 0], jit: J });
      add(G.box(r * 0.5, r * 1.2, SL * 0.3), { c: C.claro, b: 'Seg' + i, pos: [0, yb + r * 0.8, (z0 + z1) / 2], jit: J });
      const rl = R.costelas === 'longas' ? 1.9 : 1.3;
      if (i > 1 && i < N - 1) for (const s of [1, -1]) { const g = new THREE.TorusGeometry(r * rl, r * 0.12, 4, 8, Math.PI * 0.7); g.rotateY(Math.PI / 2); g.rotateX(Math.PI * 0.15); if (s < 0) g.scale(-1, 1, 1); g.translate(0, yb + r * 0.2, (z0 + z1) / 2);
        add(g, { c: C.pele, b: 'Seg' + i, jit: 0.002 }); }
      continue;
    }
    if (t === 'pipa') { const w = r * 3.2; add(G.slab([[0, w], [w * 0.7, 0], [0, -w * 0.6], [-w * 0.7, 0]], 0.006), { c: i % 2 ? C.pele : C.claro, b: 'Seg' + i, pos: [0, yb, (z0 + z1) / 2], rot: [-90, 0, 0], jit: 0.001 });
      add(G.box(0.004, 0.004, SL), { c: C.escuro, b: 'Seg' + i, pos: [0, yb + 0.004, (z0 + z1) / 2], jit: 0 }); continue; }
    add(G.tube([0, yb, z0], [0, yb, z1], r, r2, t === 'verme' ? 10 : 8), { c: C.pele, b: SW, jit: J, vary: 0.08, mat: bodyMat });
    add(G.sph(r * 1.02, 8, 6), { c: C.pele, b: 'Seg' + i, pos: [0, yb, z0], jit: J });
    if (t !== 'verme' && t !== 'lagarta') add(G.sph(1, 7, 4), { c: C.claro, b: 'Seg' + i, pos: [0, yb - r * 0.55, (z0 + z1) / 2], scl: [r * 0.8, r * 0.4, SL * 0.55], jit: J });
    if (t === 'verme') { add(G.cyl(r * 1.06, r2 * 1.06, SL * 0.25, 10, true), { c: C.escuro, b: 'Seg' + i, pos: [0, yb, z0 - SL * 0.15], rot: [90, 0, 0], jit: 0.002 });
      for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + i; add(G.box(r * 0.45, r * 0.12, SL * 0.5), { c: C.claro, b: 'Seg' + i, pos: [Math.cos(a) * r * 0.97, yb + Math.sin(a) * r * 0.97, (z0 + z1) / 2], rot: [0, 0, a / D2R + 90], jit: 0.002 }); } }
    if (t === 'duas' && R.aneis && i % 2) add(G.cyl(r * 1.04, r * 1.04, SL * 0.35, 8, true), { c: C.escuro, b: 'Seg' + i, pos: [0, yb, (z0 + z1) / 2], rot: [90, 0, 0], jit: 0.001 });
    if (t === 'duas' && R.aneis && !(i % 2)) add(G.cyl(r * 1.03, r * 1.03, SL * 0.2, 8, true), { c: C.claro, b: 'Seg' + i, pos: [0, yb, (z0 + z1) / 2], rot: [90, 0, 0], jit: 0.001 });
    if (t === 'plumada') { if (R.crista === 'longa' || i < 4) { const h = R.crista === 'leque' ? r * (3.2 - i * 0.6) : r * 1.6;
        add(G.slab([[0, 0], [SL * 0.5, h], [SL, 0]], 0.006), { c: i % 2 ? C.pena : C.pena2, b: 'Seg' + i, pos: [0.003, yb + r * 0.85, z0], rot: [0, 90, 0], jit: 0 }); }
      for (const s of [1, -1]) add(G.sph(1, 5, 3), { c: C.pena, b: 'Seg' + i, pos: [s * r * 0.9, yb, (z0 + z1) / 2], scl: [r * 0.5, r * 0.12, SL * 0.4], rot: [0, 0, s * 30], jit: 0 }); }
    if (t === 'lagarta') { add(G.cyl(r * 1.02, r * 1.02, SL * 0.18, 9, true), { c: C.escuro, b: 'Seg' + i, pos: [0, yb, z0 - SL * 0.05], rot: [90, 0, 0], jit: 0 });
      for (const s of [1, -1]) { add(G.box(r * 0.3, r * 0.45, SL * 0.45), { c: C.janela, mat: 3, b: 'Seg' + i, pos: [s * r * 0.93, yb + r * 0.25, (z0 + z1) / 2], jit: 0 });
        const q = R.passageiros, show = q === 'muitos' ? true : q === 'poucos' ? i % 3 === 0 : false;
        if (show && i > 1) add(G.sph(r * 0.18, 6, 4), { c: ['#e3a782', '#5f9a3e', '#8fa9b8', '#d9cce8'][i % 4], b: 'Seg' + i, pos: [s * r * 0.6, yb + r * 0.3, (z0 + z1) / 2], jit: 0 }); }
      for (const s of [1, -1]) add(G.cyl(r * 0.18, r * 0.12, r * 0.4, 6), { c: C.escuro, b: 'Seg' + i, pos: [s * r * 0.6, yb - r * 0.85, (z0 + z1) / 2], jit: 0 });
      add(G.box(r * 1.3, r * 0.08, SL * 0.9), { c: C.claro, b: 'Seg' + i, pos: [0, yb + r * 1.0, (z0 + z1) / 2], jit: 0 }); }
    if (t === 'centopeia') { add(G.sph(1, 7, 4), { c: C.escuro, b: 'Seg' + i, pos: [0, yb + r * 0.4, (z0 + z1) / 2], scl: [r * 1.1, r * 0.55, SL * 0.45], jit: 0.002 });
      if (R.vagoes && i > 2 && i % 3 === 0) { add(G.box(r * 1.6, r * 1.2, SL * 0.8), { c: C.extra, b: 'Seg' + i, pos: [0, yb + r * 1.4, (z0 + z1) / 2], jit: 0.002 });
        for (const s of [1, -1]) add(G.box(r * 0.05, r * 0.5, SL * 0.4), { c: '#ffe080', glow: true, b: 'Seg' + i, pos: [s * r * 0.81, yb + r * 1.45, (z0 + z1) / 2], jit: 0 }); } }
    if (t === 'vinha') { if (i % 2) for (const s of [1, -1]) add(G.cone(r * 0.25, r * 0.9, 4), { c: C.escuro, b: 'Seg' + i, pos: [s * r * 1.0, yb + r * 0.3, (z0 + z1) / 2], rot: [0, 0, -s * 70], jit: 0 });
      if (i % 2 === 0) add(G.sph(1, 5, 3), { c: C.claro, b: 'Seg' + i, pos: [(i % 4 ? 1 : -1) * r * 1.4, yb + r * 0.4, (z0 + z1) / 2], scl: [r * 1.2, r * 0.2, r * 0.7], rot: [0, 0, (i % 4 ? -1 : 1) * 30], jit: 0 });
      const f = R.flores, put = f === 'muitas' ? i % 3 === 1 : i % 5 === 2;
      if (put && i > 1) { if (f === 'frutos') add(G.ico(r * 0.6, 1), { c: C.flor, b: 'Seg' + i, pos: [0, yb + r * 1.2, (z0 + z1) / 2], jit: 0 });
        else for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; add(G.sph(1, 5, 3), { c: C.flor, b: 'Seg' + i, pos: [Math.cos(a) * r * 0.7, yb + r * 1.3, (z0 + z1) / 2 + Math.sin(a) * r * 0.7], scl: [r * 0.5, r * 0.12, r * 0.5], jit: 0 }); } } }
  }
  // patas (centopeia) e penas-asas
  if (R.patas) for (let i = 2; i <= N; i++) for (const [s, L] of [[1, '_L'], [-1, '_R']]) { const p0 = REST['Pata' + i + L].toArray(), r = rad(i);
    add(G.tube(p0, [p0[0] + s * r * 1.6, p0[1] - r * 0.2, p0[2]], r * 0.22, r * 0.18, 4), { c: C.extra, b: 'Pata' + i + L, jit: 0 });
    add(G.tube([p0[0] + s * r * 1.6, p0[1] - r * 0.2, p0[2]], [p0[0] + s * r * 2.0, 0.0, p0[2] + r * 0.2], r * 0.18, r * 0.06, 4), { c: C.extra, b: 'Pata' + i + L, jit: 0 }); }
  if (R.asinhas) for (const s of [1, -1]) { const z = -SL * 2.5, r = rad(2);
    for (let k = 0; k < 4; k++) add(G.box(r * (4.5 - k * 0.8), r * 0.5, 0.004), { c: k % 2 ? C.pena : C.pena2, b: 'Seg3', pos: [s * r * (2.4 - k * 0.3), yb + r * 0.6, z - k * r * 0.4], rot: [-15, s * 15, s * (25 - k * 10)], jit: 0 }); }
  // fitas da pipa
  for (const ch of chains.filter(c => c.name.startsWith('Fita'))) { const W = { b: chainW(ch) }; for (let i = 0; i < 2; i++) add(G.tube(ch.pts[i], ch.pts[i + 1], 0.012, 0.012, 3), { c: C.fita, ...W, pre: g => g.scale(1.8, 1, 0.3) }); }
  // ---------- cabeça
  const HB = (x, y, z) => [x, yb + y, 0.02 + z], hc = R.cabeca;
  const snake = (bone, sgn = 1, zoff = 0) => { const P2 = (x, y, z) => [x, yb + y, zoff + sgn * z], r = r0;
    add(G.sph(1, 9, 6), { c: C.pele, b: bone, pos: P2(0, r * 0.15, r * 1.4), scl: [r * 1.25, r * 0.85, r * 1.9], jit: J });
    add(G.sph(1, 7, 4), { c: C.claro, b: bone === 'Head' ? 'Jaw' : bone, pos: P2(0, -r * 0.4, r * 1.5), scl: [r * 1.05, r * 0.35, r * 1.6], jit: J });
    for (const s of [1, -1]) { add(G.sph(r * 0.28, 6, 4), { c: '#f0c030', b: bone, pos: P2(s * r * 0.8, r * 0.55, r * 1.9), jit: 0, vary: 0 });
      add(G.box(r * 0.08, r * 0.38, r * 0.08), { c: '#14110c', b: bone, pos: P2(s * r * 0.98, r * 0.55, r * 2.0), jit: 0, vary: 0 }); }
    add(G.tube(P2(0, -r * 0.2, r * 3.1), P2(0, -r * 0.25, r * 3.9), r * 0.08, r * 0.05, 3), { c: '#d83a5a', b: bone === 'Head' ? 'Jaw' : bone, jit: 0 }); };
  if (hc === 'cobra') { snake('Head'); if (R.duas) snake('Head2', -1, -N * SL - 0.04); }
  if (hc === 'petalas') { const r = r0, n = R.petalas;
    add(G.sph(r * 1.05, 10, 6), { c: C.pele, b: 'Head', pos: HB(0, 0, r * 0.2), jit: J });
    add(G.cyl(r * 0.55, r * 0.55, r * 0.2, 10), { c: C.boca, b: 'Head', pos: HB(0, 0, r * 1.0), rot: [90, 0, 0], jit: 0 });
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, p0 = REST['Petal' + (i + 1)];
      add(G.slab([[-r * 0.45, 0], [r * 0.45, 0], [r * 0.2, r * 1.2], [0, r * 1.5], [-r * 0.2, r * 1.2]], r * 0.12), { c: i % 2 ? C.claro : C.pele, b: 'Petal' + (i + 1), pos: [p0.x, p0.y, p0.z], rot: [0, 0, a / D2R - 90], pre: g => g.rotateX(-0.5), jit: 0.002 });
      for (let k = 0; k < 3; k++) add(G.cone(r * 0.06, r * 0.22, 3), { c: '#f0e8d0', b: 'Petal' + (i + 1), pos: [p0.x * (0.7 + k * 0.25), p0.y - yb * 0 + (p0.y - yb) * (k * 0.25 - 0.3), p0.z + r * 0.12], rot: [90, 0, 0], jit: 0 }); } }
  if (hc === 'lagarta') { const r = r0; add(G.sph(r * 1.1, 9, 7), { c: C.pele, b: 'Head', pos: HB(0, r * 0.1, r * 0.6), jit: J });
    for (const s of [1, -1]) { add(G.sph(r * 0.32, 7, 5), { c: '#fff8e0', glow: true, b: 'Head', pos: HB(s * r * 0.5, 0, r * 1.5), jit: 0 }); add(G.sph(r * 0.15, 5, 4), { c: '#14110c', b: 'Head', pos: HB(s * r * 0.4, r * 0.55, r * 1.45), jit: 0 }); }
    add(G.box(r * 0.8, r * 0.08, r * 0.1), { c: '#14110c', b: 'Head', pos: HB(0, -r * 0.4, r * 1.6), jit: 0 }); }
  if (hc === 'centopeia') { const r = r0; add(G.sph(r * 1.1, 8, 6), { c: C.escuro, b: 'Head', pos: HB(0, 0, r * 0.7), scl: [1.1, 0.8, 1], jit: J });
    for (const s of [1, -1]) { add(G.tube(HB(s * r * 0.6, -r * 0.3, r * 1.4), HB(-s * r * 0.2, -r * 0.4, r * 2.3), r * 0.18, r * 0.05, 4), { c: C.extra, b: 'Jaw', jit: 0 }); add(G.sph(r * 0.18, 5, 4), { c: '#ffd040', glow: true, b: 'Head', pos: HB(s * r * 0.55, r * 0.4, r * 1.4), jit: 0 }); } }
  if (hc === 'flor') { const r = r0 * 1.6; add(G.sph(r * 0.7, 8, 6), { c: C.pele, b: 'Head', pos: HB(0, 0, r * 0.4), jit: J });
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; add(G.sph(1, 6, 4), { c: C.flor, b: i % 2 ? 'Head' : 'Jaw', pos: HB(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85, r * 0.7), scl: [r * 0.6, r * 0.6, r * 0.15], jit: 0 }); }
    add(G.cyl(r * 0.35, r * 0.35, r * 0.2, 8), { c: '#2a1418', b: 'Head', pos: HB(0, 0, r * 0.95), rot: [90, 0, 0], jit: 0 });
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; add(G.cone(r * 0.06, r * 0.22, 3), { c: '#f0e8d0', b: 'Head', pos: HB(Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3, r * 1.05), rot: [90, 0, 0], jit: 0 }); } }
  if (hc === 'cranio') { const r = r0 * 1.3;
    add(G.sph(r * 1.0, 9, 7), { c: C.pele, b: 'Head', pos: HB(0, r * 0.2, r * 0.8), scl: [1, 0.85, 1.4], jit: J });
    add(G.box(r * 1.4, r * 0.4, r * 1.8), { c: C.pele, b: 'Jaw', pos: HB(0, -r * 0.45, r * 1.2), jit: J });
    for (const s of [1, -1]) add(G.sph(r * 0.3, 6, 4), { c: C.brilho, glow: true, b: 'Head', pos: HB(s * r * 0.45, r * 0.45, r * 1.6), jit: 0 });
    for (let i = 0; i < 6; i++) add(G.cone(r * 0.08, r * 0.3, 3), { c: C.claro, b: 'Head', pos: HB(((i % 3) - 1) * r * 0.3 * (i < 3 ? 1 : 0.8), -r * 0.15, r * (1.6 + (i < 3 ? 0.6 : 0.2))), rot: [180, 0, 0], jit: 0 }); }
  if (hc === 'pipa') { const r = r0 * 3;
    add(G.slab([[-r, -r * 0.6], [r, -r * 0.6], [r * 1.1, r * 0.4], [r * 0.6, r], [-r * 0.6, r], [-r * 1.1, r * 0.4]], 0.01), { c: C.pele, b: 'Head', pos: HB(0, r * 0.3, r * 0.4), jit: 0 });
    for (const s of [1, -1]) { add(G.cyl(r * 0.25, r * 0.25, 0.012, 8), { c: '#ffffff', b: 'Head', pos: HB(s * r * 0.45, r * 0.55, r * 0.42), rot: [90, 0, 0], jit: 0 }); add(G.cyl(r * 0.12, r * 0.12, 0.014, 8), { c: '#14110c', b: 'Head', pos: HB(s * r * 0.45, r * 0.55, r * 0.43), rot: [90, 0, 0], jit: 0 });
      add(G.cone(r * 0.15, r * 0.7, 4), { c: C.claro, b: 'Head', pos: HB(s * r * 0.7, r * 1.3, r * 0.3), rot: [-20, 0, -s * 25], jit: 0 }); }
    add(G.slab([[-r * 0.8, 0], [r * 0.8, 0], [0, -r * 0.6]], 0.01), { c: C.claro, b: 'Jaw', pos: HB(0, -r * 0.1, r * 0.45), jit: 0 }); }
  for (const ch of chains.filter(c => c.name.startsWith('Ant'))) { const W = { b: chainW(ch) }; add(G.tube(ch.pts[0], ch.pts[1], r0 * 0.12, r0 * 0.1, 4), { c: C.escuro, ...W }); add(G.tube(ch.pts[1], ch.pts[2], r0 * 0.1, r0 * 0.06, 4), { c: C.escuro, ...W }); add(G.sph(r0 * 0.2, 5, 4), { c: C.claro, pos: ch.pts[2], ...W }); }

  // ---------- poses
  const vert = R.onda === 'vertical', voa = !!S.voa;
  const setE = (b, a, o = 'YXZ') => b.quaternion.copy(E(a, o));
  function applyPose(P) {
    B.Root.position.set(P.p[0], P.p[1], P.p[2]); setE(B.Root, P.r || [0, 0, 0]);
    let prevYaw = 0, prevPitch = 0;
    for (let i = 1; i <= N; i++) { const yw = P.yaw[i - 1] || 0, pt = P.pitch[i - 1] || 0; setE(B['Seg' + i], [pt - prevPitch, yw - prevYaw, 0]); prevYaw = yw; prevPitch = pt; }
    setE(B.Head, [P.hd ? P.hd[0] : 0, (P.hd ? P.hd[1] : 0) - (P.yaw[0] || 0) * 0.6, 0]); B.Jaw.quaternion.setFromAxisAngle(_X, (P.jaw || 0) * D2R);
    if (B.Head2) setE(B.Head2, [0, 180 + (P.yaw[N - 1] || 0) * -0.3, 0]);
    if (R.cabeca === 'petalas') for (let i = 1; i <= R.petalas; i++) { const a = (i - 1) / R.petalas * Math.PI * 2; B['Petal' + i].quaternion.copy(E([-Math.sin(a) * (P.jaw || 0), Math.cos(a) * (P.jaw || 0), 0], 'XYZ')); }
    if (R.patas) for (let i = 2; i <= N; i++) for (const [s, L] of [[1, '_L'], [-1, '_R']]) setE(B['Pata' + i + L], [0, (P.legs ? P.legs[i] : 0) * s, 0]);
    for (const ch of chains) for (const nm of ch.names) B[nm].quaternion.identity();
    B.Root.updateMatrixWorld(true);
  }
  const L = N * SL, waves = vert ? 1.2 : 1.5, lam = L / waves;
  const wave = (t, T, A, axis, ampHead = 0.35) => { const out = []; for (let i = 0; i < N; i++) { const u = i / (N - 1), amp = A * (ampHead + (1 - ampHead) * Math.min(1, u * 1.6)); out.push(amp * Math.sin(2 * Math.PI * (t / T - i / (N / waves)))); } return out; };
  const zeros = () => new Array(N).fill(0);
  const base = () => ({ p: [0, 0, 0], r: [0, 0, 0], yaw: zeros(), pitch: zeros(), hd: [0, 0], jaw: 0 });
  const hover = voa ? 0.35 : 0;
  const ground = P => { if (voa || R.mergulha || P.r && P.r[0]) return P; let y = 0, mn = 0;     // apoia o corpo no chão: a cabeça sobe, o resto não afunda
    for (let i = 0; i < N; i++) { y += SL * Math.sin((P.pitch[i] || 0) * D2R); mn = Math.min(mn, y); } P.p[1] += -mn; return P; };
  const clipdefs = [
    { name: 'Parado', dur: 3, fps: 30, loop: true, fn: t => { const P = base(), a = 2 * Math.PI * t / 3;
      if (voa) { P.p[1] = hover + 0.03 * Math.sin(a); P.pitch = wave(t, 3, 8, 'p', 0.5); P.yaw = wave(t, 6, 6, 'y', 0.2); }
      else if (R.mergulha) { P.p[1] = -r0 * 0.4; P.pitch = zeros().map((_, i) => i < 4 ? -14 + i * 4 + 3 * Math.sin(a + i) : 0); P.yaw = wave(t, 3, 5, 'y', 0.6); }
      else { const coil = zeros().map((_, i) => 38 * Math.sin(i / (N - 1) * Math.PI * 2.2)); P.yaw = coil.map((v, i) => v + 3 * Math.sin(a + i * 0.4)); P.pitch = zeros().map((_, i) => i < 3 ? -12 + i * 4 : 0); P.hd = [4 * Math.sin(2 * a), 15 * Math.sin(a)]; }
      P.jaw = R.cabeca === 'petalas' ? 8 + 6 * Math.sin(a) : 0; return ground(P); } },
    { name: 'Mover', dur: 1.4, fps: 30, loop: true, v: 0.6 * lam / 1.4, fn: t => { const P = base();
      if (vert && !R.mergulha) { P.p[1] = hover; P.pitch = wave(t, 1.4, voa ? 14 : 10, 'p', voa ? 0.3 : 0.1); if (!voa) P.pitch = P.pitch.map(v => Math.min(0, v) * 0.8); }
      else if (R.mergulha) { P.p[1] = -r0 * 1.2; P.pitch = wave(t, 1.4, 22, 'p', 0.8); }
      else { P.yaw = wave(t, 1.4, R.tipo === 'centopeia' ? 10 : 30, 'y'); }
      if (R.patas) P.legs = zeros().concat([0]).map((_, i) => 35 * Math.sin(2 * Math.PI * (t / 0.35 - i * 0.18))); return ground(P); } },
    { name: 'Atacar', dur: 1.0, fps: 60, fn: t => { const P = base(), w = t < 0.4 ? EASE.io(t / 0.4) : t < 0.55 ? 1 - EASE.in((t - 0.4) / 0.15) * 2 : -1 + EASE.io((t - 0.55) / 0.45), back = Math.max(0, w), fwd = Math.max(0, -w);
      P.p = [0, hover + (R.mergulha ? -r0 * 0.4 : 0), 0.08 * L * fwd - 0.04 * L * back];
      P.pitch = zeros().map((_, i) => i < 4 ? -(30 * back + 5 * fwd) * (1 - i / 4) * 2 : 0);
      P.yaw = zeros().map((_, i) => 20 * Math.sin(i / (N - 1) * Math.PI * 2) * (1 - fwd)); P.hd = [25 * fwd - 10 * back, 0]; P.jaw = 40 * Math.max(back, fwd) * (R.cabeca === 'petalas' ? 1.2 : 1); return ground(P); } },
    { name: 'Ameaçar', dur: 1.8, fps: 30, fn: t => { const P = base(), k = Math.sin(Math.PI * clamp(t / 1.5, 0, 1));
      P.p[1] = hover + (R.mergulha ? -r0 * 0.4 : 0); P.pitch = zeros().map((_, i) => i < 5 ? -38 * k * (1 - i / 5) * 1.6 : 0); P.yaw = zeros().map((_, i) => i < 5 ? 12 * Math.sin(t * 6 + i) * k : 25 * Math.sin(i / (N - 1) * Math.PI * 2));
      P.hd = [20 * k, 0]; P.jaw = 35 * k; return ground(P); } },
  ];
  if (R.duas) { const circ = L, rr = circ / (2 * Math.PI);
    clipdefs.push({ name: 'Rolar', dur: 1.2, fps: 60, loop: true, v: circ / 1.2, fn: t => { const P = base(); P.pitch = zeros().map((_, i) => -(i + 1) * 360 / N + 360 / N * 0.5); P.p = [0, rr + r0, 0]; P.r = [-360 * t / 1.2, 0, 0]; return P; } }); }
  if (voa) clipdefs.push({ name: 'Voar', dur: 1.6, fps: 30, loop: true, v: 1.2 * L, fn: t => { const P = base(); P.p[1] = hover * 1.6; P.pitch = wave(t, 1.6, 16, 'p', 0.25); P.yaw = wave(t, 3.2, 8, 'y', 0.2); return P; } });
  const P0 = finish(kit, skel, chains, S.nome, clipdefs, applyPose, {});
  P0.vel = Object.fromEntries(clipdefs.filter(c => c.v).map(c => [c.name, c.v]));
  return P0;
}

// ======================================================================= FAMÍLIA F — tentáculos e corpos radiais
function forgeF(id, S, cfg) {
  const R = { tipo: 'polvo', n: 8, K: 4, ...S.receita(cfg) };
  const COL = S.cats.cores.cor[cfg.cores];
  const C = { pele: '#8a6a5a', claro: '#e0c8b8', escuro: '#3a2a22', brilho: '#ffd060', ...COL };
  const kit = makeKit(v => v.clone()), { add, G } = kit;
  const t = R.tipo, n = R.n, K = R.K, J = t === 'kraken' ? 0.01 : 0.004;
  // ---------- geometria-base por tipo
  const L = { medusa: { by: 0.75, rb: 0.2, len: R.longos ? 0.7 : 0.4, droop: 85, spread: 0.02 }, polvo: { by: 0.42, rb: 0.13, len: 0.55, droop: 38, spread: 0.12 },
    lula: { by: 0.45, rb: 0.1, len: 0.5, droop: 70, spread: 0.04 }, anemona: { by: 0.38, rb: 0.16, len: 0.42, droop: -70, spread: 0.06 },
    kraken: { by: 0.4, rb: 0.16, len: 0.75, droop: 30, spread: 0.16 }, cabecaLula: { by: 0.92, rb: 0.07, len: 0.36, droop: 80, spread: 0.0 } }[t];
  const bdef = [['Root', null, [0, 0, 0]], ['Body', 'Root', [0, L.by, 0]]];
  if (t === 'medusa') for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; bdef.push(['Rim' + i, 'Body', [Math.sin(a) * L.rb * 1.3, L.by + 0.02, Math.cos(a) * L.rb * 1.3]]); }
  if (t === 'cabecaLula') { bdef.push(['Head', 'Body', [0, 1.02, 0.02]]); for (const [s, Lr] of [[1, '_L'], [-1, '_R']]) bdef.push(['UpperArm' + Lr, 'Body', [s * 0.18, 0.85, 0]], ['ForeArm' + Lr, 'UpperArm' + Lr, [s * 0.2, 0.62, 0.04]], ['Hand' + Lr, 'ForeArm' + Lr, [s * 0.21, 0.42, 0.08]]); }
  const tents = [];
  for (let i = 0; i < n; i++) {
    let a = i / n * Math.PI * 2 + (t === 'polvo' || t === 'kraken' ? Math.PI / n : 0), lenK = L.len, droop = L.droop * D2R, rb = L.rb, by = L.by - (t === 'anemona' ? -0.02 : 0.04);
    if (t === 'lula') { a = i / n * Math.PI * 2; if (i >= 8) { lenK = L.len * 1.6; } }
    if (t === 'cabecaLula') { a = (i / (n - 1) - 0.5) * 1.6; rb = 0.06; by = 0.95; }
    const dir = V3(Math.sin(a), 0, Math.cos(a)), base = V3(0, by, 0).addScaledVector(dir, rb), pts = [base.toArray()];
    const seg = lenK / K;
    for (let k = 1; k <= K; k++) { const d = droop * (t === 'medusa' || t === 'cabecaLula' ? 1 : 1 - k / (K * 1.8)); const p = V3(...pts[k - 1]).addScaledVector(dir, seg * Math.cos(d) + (t === 'polvo' || t === 'kraken' ? L.spread * 0.15 : 0)).add(V3(0, -seg * Math.sin(d), 0)); pts.push(p.toArray()); }
    if (t === 'polvo' || t === 'kraken') pts.forEach((p, k) => { if (k === K) p[1] = 0.02; });
    const names = Array.from({ length: K }, (_, k) => `Tent${i}_${k + 1}`), parent = t === 'cabecaLula' ? 'Head' : 'Body';
    names.forEach((nm, k) => bdef.push([nm, k ? names[k - 1] : parent, pts[k]])); bdef.push([`Tent${i}_End`, names[K - 1], pts[K]]);
    tents.push({ i, a, dir, axis: new THREE.Vector3().crossVectors(_Y, dir).normalize(), pts, names, long: t === 'lula' && i >= 8, front: Math.cos(a) > 0.5 });
  }
  const skel = buildSkeleton(bdef, [], v => v);
  kit.setBI(skel.BI);
  const { B, REST } = skel;
  const tw = tt => chainW({ pts: tt.pts, names: tt.names, parent: t === 'cabecaLula' ? 'Head' : 'Body' });
  const stone = !!R.pedra;
  // ---------- tentáculos
  for (const tt of tents) {
    const r0 = { medusa: 0.018, polvo: 0.06, lula: tt.long ? 0.022 : 0.04, anemona: 0.035, kraken: 0.085, cabecaLula: 0.03 }[t];
    for (let k = 0; k < K; k++) { const ra = r0 * (1 - k / (K + 0.6)), rb2 = r0 * (1 - (k + 1) / (K + 0.6));
      add(G.tube(tt.pts[k], tt.pts[k + 1], ra, Math.max(0.004, rb2), stone ? 6 : 7), { c: t === 'medusa' ? C.brilho : C.pele, glow: t === 'medusa', mat: t === 'medusa' ? 2 : 0, b: tw(tt), jit: J, vary: stone ? 0.14 : 0.07 });
      if ((t === 'polvo' || t === 'kraken' || t === 'lula') && k < K - 1) for (let j = 0; j < 2; j++) { const q = V3(...tt.pts[k]).lerp(V3(...tt.pts[k + 1]), 0.3 + j * 0.4).add(V3(0, -ra * 0.75, 0));
        add(G.cyl(ra * 0.35, ra * 0.35, ra * 0.25, 6), { c: stone ? C.brilho : C.claro, glow: stone, b: tw(tt), pos: q.toArray(), jit: 0 }); } }
    const tip = tt.pts[K];
    if (t === 'anemona') { const pt = R.pontas; add(pt === 'finas' ? G.cone(0.012, 0.05, 4) : G.ico(pt === 'bolinhas' ? 0.03 : 0.025, 1), { c: pt === 'brilho' ? C.brilho : C.claro, glow: pt === 'brilho', b: tw(tt), pos: tip, jit: 0 }); }
    if (t === 'lula' && tt.long) add(G.sph(1, 6, 4), { c: C.pele, b: tw(tt), pos: tip, scl: [0.04, 0.02, 0.06], jit: 0 });
  }
  // ---------- corpo por tipo
  if (t === 'medusa') { const h = R.alto ? 1.4 : 1;
    add(G.sph(L.rb * 1.35, 12, 6, 0, Math.PI / 2), { c: C.pele, mat: 3, b: p => { const a = Math.atan2(p.x, p.z), i = ((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8; return p.y < L.by + 0.06 ? [['Rim' + i, 0.8], ['Body', 0.2]] : [['Body', 1]]; }, pos: [0, L.by, 0], scl: [1, h, 1], jit: 0 });
    add(G.sph(L.rb * 0.7, 9, 5, 0, Math.PI / 2), { c: C.brilho, glow: true, b: 'Body', pos: [0, L.by + 0.02, 0], scl: [1, h * 0.9, 1], jit: 0 });
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; add(G.ico(0.015, 0), { c: C.claro, glow: true, b: 'Rim' + i, pos: [Math.sin(a) * L.rb * 1.33, L.by + 0.005, Math.cos(a) * L.rb * 1.33], jit: 0 }); }
    for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 0.4; add(G.tube([Math.sin(a) * 0.04, L.by, Math.cos(a) * 0.04], [Math.sin(a) * 0.07, L.by - 0.28, Math.cos(a) * 0.07], 0.035, 0.008, 6), { c: C.claro, mat: 3, b: 'Body', jit: 0.004 }); } }
  if (t === 'polvo' || t === 'kraken') { const big = t === 'kraken' ? 1.25 : 1;
    add(G.sph(0.2 * big, 12, 9), { c: C.pele, b: 'Body', pos: [0, L.by + 0.2 * big, -0.06], scl: [1, 1.15, 1.15], jit: J, vary: stone ? 0.14 : 0.07 });
    add(G.sph(0.16 * big, 10, 7), { c: C.pele, b: 'Body', pos: [0, L.by + 0.02, 0.04], jit: J, vary: stone ? 0.14 : 0.07 });
    const eo = R.olhos || 'dois', es = eo === 'um' ? [[0, 0.1, 0.16, 0.06]] : eo === 'muitos' ? [[0.08, 0.08, 0.14, 0.025], [-0.08, 0.08, 0.14, 0.025], [0.04, 0.13, 0.15, 0.02], [-0.04, 0.13, 0.15, 0.02], [0.12, 0.13, 0.1, 0.02], [-0.12, 0.13, 0.1, 0.02]] : [[0.09, 0.09, 0.14, 0.035], [-0.09, 0.09, 0.14, 0.035]];
    for (const [x, y, z, r] of es) { add(G.sph(r * big, 7, 5), { c: stone ? C.brilho : '#f8f0e0', glow: stone, b: 'Body', pos: [x * big, L.by + y * big, z * big], jit: 0, vary: 0 });
      if (!stone) add(G.box(r * 1.2, r * 0.4, r * 0.3), { c: '#14110c', b: 'Body', pos: [x, L.by + y, z + r * 0.85], jit: 0, vary: 0 }); }
    if (stone) for (let i = 0; i < 6; i++) add(new THREE.DodecahedronGeometry(0.06, 0), { c: C.escuro, b: 'Body', pos: [Math.cos(i) * 0.15, L.by + 0.3 + (i % 2) * 0.08, -0.06 + Math.sin(i) * 0.15], jit: 0.01 });
    if (t === 'polvo') { const oc = R.oculos;
      if (oc === 'redondos') { for (const s of [1, -1]) add(new THREE.TorusGeometry(0.045, 0.007, 4, 12), { c: '#c8a040', metal: true, mat: 1, b: 'Body', pos: [s * 0.09, L.by + 0.09, 0.18], jit: 0 }); add(G.box(0.05, 0.008, 0.008), { c: '#c8a040', metal: true, mat: 1, b: 'Body', pos: [0, L.by + 0.1, 0.19], jit: 0 }); }
      if (oc === 'monoculo') { add(new THREE.TorusGeometry(0.05, 0.007, 4, 12), { c: '#c8a040', metal: true, mat: 1, b: 'Body', pos: [0.09, L.by + 0.09, 0.18], jit: 0 }); add(G.tube([0.13, L.by + 0.06, 0.18], [0.16, L.by - 0.1, 0.12], 0.003, 0.003, 3), { c: '#c8a040', b: 'Body', jit: 0 }); }
      add(G.cyl(0.13, 0.12, 0.06, 10), { c: '#3a2a3a', b: 'Body', pos: [0, L.by + 0.43, -0.07], jit: 0.002 }); add(G.cyl(0.18, 0.18, 0.012, 10), { c: '#3a2a3a', b: 'Body', pos: [0, L.by + 0.4, -0.07], jit: 0 });
      const holders = tents.filter(tt => tt.front).slice(0, 2), lv = R.livros;
      holders.forEach((tt, j) => { const tip = V3(...tt.pts[2]).add(V3(0, 0.05, 0));
        if (lv === 'pergaminho' && j === 0) add(G.cyl(0.03, 0.03, 0.16, 8), { c: '#f0e6c8', b: tt.names[1], pos: tip.toArray(), rot: [0, 0, 90], jit: 0 });
        else if (lv !== 'pergaminho') for (let k = 0; k < (lv === 'pilha' && j === 0 ? 3 : 1); k++) { add(G.box(0.12, 0.03, 0.09), { c: ['#8a2a2a', '#2a4a8a', '#2a6a3a'][(j + k) % 3], b: tt.names[1], pos: [tip.x, tip.y + k * 0.032, tip.z], rot: [0, 20 * k, 0], jit: 0 });
          add(G.box(0.11, 0.024, 0.085), { c: '#f0e6c8', b: tt.names[1], pos: [tip.x + 0.006, tip.y + k * 0.032, tip.z], rot: [0, 20 * k, 0], jit: 0 }); } }); } }
  if (t === 'lula') {
    add(G.tube([0, L.by, 0], [0, L.by + 0.6, -0.08], 0.13, 0.03, 10), { c: C.pele, b: 'Body', jit: J });
    for (const s of [1, -1]) add(G.slab([[0, 0], [0.14, 0.04], [0.1, 0.16], [0, 0.2]], 0.01), { c: C.claro, b: 'Body', pos: [s * 0.04, L.by + 0.42, -0.06], rot: [0, s > 0 ? 0 : 180, 0], jit: 0 });
    for (const s of [1, -1]) { add(G.sph(0.045, 7, 5), { c: '#f8f0e0', b: 'Body', pos: [s * 0.1, L.by + 0.04, 0.05], jit: 0 }); add(G.sph(0.022, 5, 4), { c: '#14110c', b: 'Body', pos: [s * 0.13, L.by + 0.04, 0.07], jit: 0 }); }
    for (let i = 0; i < 6; i++) add(G.sph(0.02, 5, 3), { c: C.tinta, b: 'Body', pos: [Math.sin(i * 2) * 0.12, L.by + 0.12 + i * 0.07, Math.cos(i * 2) * 0.1 - 0.02], scl: [1, 0.4, 1], jit: 0 });
    const pc = R.pincel, ht = tents.find(tt => tt.long); if (ht && pc !== 'nada') { const tip = ht.pts[K];
      if (pc === 'pincel') { add(G.tube(tip, [tip[0], tip[1] - 0.18, tip[2] + 0.04], 0.008, 0.008, 4), { c: '#c8a060', b: ht.names[K - 1], jit: 0 }); add(G.cone(0.016, 0.05, 5), { c: C.tinta, b: ht.names[K - 1], pos: [tip[0], tip[1] - 0.2, tip[2] + 0.045], rot: [180, 0, 0], jit: 0 }); }
      else { add(G.cyl(0.08, 0.08, 0.01, 10), { c: '#d8b880', b: ht.names[K - 1], pos: tip, jit: 0 }); for (let k = 0; k < 4; k++) add(G.cyl(0.015, 0.015, 0.012, 6), { c: ['#d83a3a', '#3a6ad8', '#f0c030', '#3ab050'][k], b: ht.names[K - 1], pos: [tip[0] + Math.cos(k * 1.5) * 0.05, tip[1] + 0.006, tip[2] + Math.sin(k * 1.5) * 0.05], jit: 0 }); } } }
  if (t === 'anemona') {
    add(G.cyl(0.17, 0.22, L.by, 12), { c: C.escuro, b: 'Body', pos: [0, L.by / 2, 0], jit: 0.006, vary: 0.1 });
    add(G.cyl(0.24, 0.26, 0.05, 12), { c: C.escuro, b: 'Root', pos: [0, 0.025, 0], jit: 0.006 });
    add(G.cyl(0.18, 0.17, 0.04, 12), { c: C.claro, b: 'Body', pos: [0, L.by + 0.01, 0], jit: 0 }); add(G.cyl(0.05, 0.05, 0.05, 8), { c: '#5a1a2a', b: 'Body', pos: [0, L.by + 0.025, 0], jit: 0 });
    for (let i = 0; i < 6; i++) add(G.ico(0.03, 0), { c: C.claro, b: 'Body', pos: [Math.cos(i) * 0.2, 0.1 + (i % 3) * 0.08, Math.sin(i) * 0.2], jit: 0.003 }); }
  if (t === 'cabecaLula') {
    const robeW = p => p.y > 0.7 ? [['Body', 1]] : [['Body', 1]];
    add(G.cone(0.32, 0.95, 12, true), { c: C.roupa, b: robeW, pos: [0, 0.5, 0], vary: 0.06, deform: g => { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) if (pa.getY(i) < 0.08) { const a = Math.atan2(pa.getZ(i), pa.getX(i)); pa.setY(i, pa.getY(i) + 0.03 * Math.sin(a * 6)); } } });
    add(G.cyl(0.2, 0.24, 0.12, 10), { c: hex(C.roupa, 1.3), b: 'Body', pos: [0, 0.86, 0], jit: 0.003 });
    add(G.tube([0, 1.0, 0.0], [0, 1.42, -0.12], 0.13, 0.03, 10), { c: C.pele, b: 'Head', jit: J });
    add(G.sph(0.12, 9, 7), { c: C.pele, b: 'Head', pos: [0, 1.0, 0.03], jit: J });
    for (const s of [1, -1]) { add(G.sph(0.03, 6, 4), { c: C.brilho, glow: true, b: 'Head', pos: [s * 0.07, 1.04, 0.12], jit: 0 }); add(G.slab([[0, 0], [0.1, 0.06], [0.06, 0.16], [0, 0.18]], 0.01), { c: C.claro, b: 'Head', pos: [s * 0.04, 1.24, -0.08], rot: [0, s > 0 ? 0 : 180, 0], jit: 0 }); }
    if (R.capuz) add(G.sph(0.17, 9, 6, 0, 1.7, Math.PI / 2 + 0.9, Math.PI * 2 - 1.8), { c: C.roupa, b: 'Head', pos: [0, 1.06, -0.02], scl: [1, 1.3, 1], jit: 0.002 });
    for (const [s, Lr] of [[1, '_L'], [-1, '_R']]) { const A = REST['UpperArm' + Lr].toArray(), Bp = REST['ForeArm' + Lr].toArray(), Hp = REST['Hand' + Lr].toArray();
      add(G.tube(A, Bp, 0.055, 0.05, 7), { c: C.roupa, b: 'UpperArm' + Lr, jit: 0.003 }); add(G.tube(Bp, Hp, 0.05, 0.06, 7), { c: C.roupa, b: 'ForeArm' + Lr, jit: 0.003 });
      add(G.sph(0.035, 6, 5), { c: C.pele, b: 'Hand' + Lr, pos: [Hp[0], Hp[1] - 0.04, Hp[2]], jit: 0 }); } }
  // ---------- poses
  const curlQ = (tt, ang, sw) => new THREE.Quaternion().setFromAxisAngle(tt.axis, ang * D2R).multiply(new THREE.Quaternion().setFromAxisAngle(_Y, sw * D2R));
  function applyPose(P) {
    B.Root.position.set(P.p[0], P.p[1], P.p[2]); B.Root.quaternion.copy(E(P.r || [0, 0, 0]));
    B.Body.quaternion.copy(E(P.b || [0, 0, 0]));
    if (B.Head) B.Head.quaternion.copy(E(P.hd || [0, 0, 0]));
    for (const tt of tents) { const c = P.c[tt.i] || [0, 0, 0, 0], sw = P.s ? P.s[tt.i] || 0 : 0; tt.names.forEach((nm, k) => B[nm].quaternion.copy(curlQ(tt, c[k] || 0, sw / K))); }
    if (t === 'medusa') for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, ax = V3(Math.cos(a), 0, -Math.sin(a)); B['Rim' + i].quaternion.setFromAxisAngle(ax, (P.pulse || 0) * D2R); }
    if (t === 'cabecaLula') for (const [s, Lr] of [[1, '_L'], [-1, '_R']]) { const a = P.arm || [0, 0, 0]; B['UpperArm' + Lr].quaternion.copy(E([a[0], 0, s * a[1]], 'XYZ')); B['ForeArm' + Lr].quaternion.setFromAxisAngle(_X, -a[2] * D2R); }
    B.Root.updateMatrixWorld(true);
  }
  const zc = () => tents.map(() => [0, 0, 0, 0]);
  const base = () => ({ p: [0, 0, 0], r: [0, 0, 0], b: [0, 0, 0], c: zc(), s: tents.map(() => 0), pulse: 0, arm: [-10, 12, 30] });
  const flo = !!S.voa, hov = t === 'medusa' ? 0.35 : t === 'lula' ? 0.6 : t === 'cabecaLula' ? 0.15 : 0;
  const waveC = (tt, ph, A) => Array.from({ length: K }, (_, k) => A * Math.sin(ph - k * 0.9));
  const clipdefs = [
    { name: 'Parado', dur: 3, fps: 30, loop: true, fn: t2 => { const P = base(), a = 2 * Math.PI * t2 / 3;
      P.p[1] = hov + (flo ? 0.04 * Math.sin(a) : 0.008 * Math.sin(a)); P.b = [2 * Math.sin(a), 6 * Math.sin(a * 0.5), 0];
      tents.forEach(tt => { P.c[tt.i] = waveC(tt, a * 2 + tt.i, t === 'anemona' ? 14 : t === 'medusa' ? 10 : t === 'cabecaLula' ? 9 : 6); P.s[tt.i] = (t === 'anemona' ? 25 : 10) * Math.sin(a + tt.i * 0.7); });
      P.pulse = t === 'medusa' ? 18 * Math.max(0, Math.sin(a * 2)) : 0; P.arm = [-10 + 4 * Math.sin(a), 12, 30]; return P; } },
    { name: 'Atacar', dur: 1.0, fps: 60, fn: t2 => { const P = base(), w = t2 < 0.4 ? EASE.io(t2 / 0.4) : t2 < 0.55 ? 1 - EASE.in((t2 - 0.4) / 0.15) * 2 : -1 + EASE.io((t2 - 0.55) / 0.45), back = Math.max(0, w), fwd = Math.max(0, -w);
      P.p = [0, hov, 0.1 * fwd]; P.b = [-10 * back + 12 * fwd, 0, 0];
      tents.forEach(tt => { const f = tt.front || t === 'anemona' || t === 'medusa'; P.c[tt.i] = Array.from({ length: K }, (_, k) => f ? (-25 * back + 30 * fwd) * (t === 'anemona' ? 1.4 : 1) : 6 * back); });
      P.pulse = t === 'medusa' ? 30 * fwd : 0; P.arm = [-10 - 70 * back + 60 * fwd, 12 + 20 * back, 30 + 40 * back - 25 * fwd]; return P; } },
    { name: 'Ameaçar', dur: 1.6, fps: 30, fn: t2 => { const P = base(), k2 = Math.sin(Math.PI * clamp(t2 / 1.35, 0, 1));
      P.p = [0, hov + (t === 'polvo' || t === 'kraken' ? 0.12 * k2 : 0.04 * k2), 0]; P.b = [-8 * k2, 0, 0];
      tents.forEach(tt => { P.c[tt.i] = Array.from({ length: K }, (_, k) => -(tt.front ? 30 : 12) * k2 + 8 * Math.sin(t2 * 8 + k + tt.i) * k2); P.s[tt.i] = 20 * Math.sin(t2 * 5 + tt.i) * k2; });
      P.pulse = t === 'medusa' ? -15 * k2 : 0; P.arm = [-10 - 100 * k2, 12 + 40 * k2, 30 - 20 * k2]; return P; } },
  ];
  if (!R.fixo) { const T = t === 'kraken' ? 2.4 : t === 'polvo' ? 1.4 : 1.2;
    clipdefs.splice(1, 0, { name: 'Mover', dur: T, fps: 30, loop: true, v: (t === 'medusa' ? 0.25 : t === 'lula' ? 1.1 : t === 'cabecaLula' ? 0.6 : 0.3) * (t === 'kraken' ? 0.6 : 1), fn: t2 => { const P = base(), ph = 2 * Math.PI * t2 / T;
      if (R.anda) { P.p[1] = 0.02 * Math.abs(Math.sin(ph)); P.b = [4, 0, 3 * Math.sin(ph)]; tents.forEach(tt => { const g = tt.i % 2 ? 0 : Math.PI; P.c[tt.i] = Array.from({ length: K }, (_, k) => 20 * Math.max(0, Math.sin(ph + g)) * (k < 2 ? -1 : 1) + 4 * Math.sin(ph - k)); P.s[tt.i] = 15 * Math.sin(ph + g); }); }
      else if (t === 'lula') { P.p[1] = hov; P.r = [80, 0, 0]; const pulse = Math.max(0, Math.sin(ph)); tents.forEach(tt => { P.c[tt.i] = Array.from({ length: K }, (_, k) => -35 * pulse + 10 * (1 - pulse) + 6 * Math.sin(ph - k)); }); }
      else if (t === 'medusa') { P.p[1] = hov + 0.05 * Math.sin(ph); P.r = [12, 0, 0]; P.pulse = 25 * Math.max(0, Math.sin(ph)); tents.forEach(tt => { P.c[tt.i] = waveC(tt, ph * 2 + tt.i, 14); }); }
      else { P.p[1] = hov + 0.03 * Math.sin(ph); P.r = [10, 0, 0]; tents.forEach(tt => { P.c[tt.i] = waveC(tt, ph * 2 + tt.i, 14); }); P.arm = [-10 + 15 * Math.sin(ph), 12, 30]; }
      return P; } }); }
  const P0 = finish(kit, skel, [], S.nome, clipdefs, applyPose, {});
  P0.vel = Object.fromEntries(clipdefs.filter(c => c.v).map(c => [c.name, c.v]));
  return P0;
}

// ======================================================================= FAMÍLIA G — amorfos, rolantes e monopés (esticar e achatar)
function forgeG(id, S, cfg) {
  const R = { tipo: 'gota', ...S.receita(cfg) };
  const COL = S.cats.cores.cor[cfg.cores];
  const C = { pele: '#8a8a8a', claro: '#d0d0d0', escuro: '#3a3a3a', brilho: '#ffd060', ...COL };
  const kit = makeKit(v => v.clone()), { add, G } = kit;
  const t = R.tipo, eyesF = (x, y, z, r, b, col = '#14110c') => { for (const s of [1, -1]) { add(G.sph(r, 6, 5), { c: '#f8f4ec', b, pos: [s * x, y, z], jit: 0, vary: 0 }); add(G.sph(r * 0.55, 5, 4), { c: col, b, pos: [s * x, y, z + r * 0.6], jit: 0, vary: 0 }); } };
  const bdef = [['Root', null, [0, 0, 0]]], scaleBones = [];
  let rad = 0.3;
  if (t === 'ourico' || t === 'pedra') { rad = t === 'ourico' ? 0.3 : 0.45; bdef.push(['Body', 'Root', [0, rad, 0]]); scaleBones.push('Body'); }
  if (t === 'cogumelo') { bdef.push(['Stem1', 'Root', [0, 0.04, 0]], ['Stem2', 'Stem1', [0, 0.2, 0]], ['Cap', 'Stem2', [0, 0.36, 0]]); scaleBones.push('Stem1', 'Cap'); }
  if (t === 'cubo' || t === 'gota') { bdef.push(['Body', 'Root', [0, 0, 0]], ['Top', 'Body', [0, t === 'cubo' ? 0.6 : 0.4, 0]]); scaleBones.push('Body'); }
  if (t === 'bocarra') { bdef.push(['Hips', 'Root', [0, 0.55, 0]], ['Jaw', 'Hips', [0, 0.62, -0.28]]); for (const [s, L] of [[1, '_L'], [-1, '_R']]) bdef.push(['UpLeg' + L, 'Hips', [s * 0.18, 0.5, 0]], ['Leg' + L, 'UpLeg' + L, [s * 0.18, 0.28, 0]], ['Foot' + L, 'Leg' + L, [s * 0.18, 0.06, 0]]); }
  if (t === 'mao') { bdef.push(['Body', 'Root', [0, 0.2, 0]]); [[0.09, 0.1], [0.03, 0.12], [-0.03, 0.115], [-0.09, 0.1]].forEach(([x, l], i) => { bdef.push(['F' + i + 'a', 'Body', [x, 0.2, 0.1]], ['F' + i + 'b', 'F' + i + 'a', [x, 0.2 - 0.0, 0.1 + l * 0.55]], ['F' + i + 'c', 'F' + i + 'b', [x, 0.2, 0.1 + l]]); });
    bdef.push(['Th1', 'Body', [0.12, 0.2, -0.02]], ['Th2', 'Th1', [0.18, 0.2, 0.04]], ['ThEnd', 'Th2', [0.21, 0.2, 0.09]]); }
  if (t === 'vassoura') { bdef.push(['Base', 'Root', [0, 0.0, 0]], ['Body', 'Base', [0, 0.32, 0]]); for (const [s, L] of [[1, '_L'], [-1, '_R']]) bdef.push(['ArmA' + L, 'Body', [s * 0.03, 0.9, 0]], ['ArmB' + L, 'ArmA' + L, [s * 0.2, 0.78, 0.02]], ['ArmEnd' + L, 'ArmB' + L, [s * 0.34, 0.66, 0.06]]); scaleBones.push('Base'); }
  const skel = buildSkeleton(bdef, [], v => v);
  kit.setBI(skel.BI);
  const { B, REST } = skel;
  // ---------- modelos
  if (t === 'ourico') { add(G.ico(rad * 0.75, 1), { c: C.pele, b: 'Body', pos: [0, rad, 0], jit: 0.006 });
    for (let i = 0; i < 46; i++) { const yy = 1 - 2 * (i + 0.5) / 46, rr = Math.sqrt(1 - yy * yy), ph = i * 2.4, d = V3(Math.cos(ph) * rr, yy, Math.sin(ph) * rr); if (d.z > 0.75) continue;
      add(G.cone(rad * 0.08, rad * (R.longos ? 0.7 : 0.4), 4), { c: i % 3 ? C.espinho : C.claro, b: 'Body', pos: V3(0, rad, 0).addScaledVector(d, rad * 0.72).toArray(), pre: g => { g.translate(0, rad * (R.longos ? 0.35 : 0.2), 0); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(_Y, d)); }, jit: 0 }); }
    eyesF(rad * 0.25, rad * 1.1, rad * 0.68, rad * 0.12, 'Body'); add(G.box(rad * 0.25, rad * 0.04, rad * 0.04), { c: '#2a1418', b: 'Body', pos: [0, rad * 0.88, rad * 0.72], jit: 0 }); }
  if (t === 'pedra') { add(G.ico(rad, 1), { c: C.pele, b: 'Body', pos: [0, rad, 0], jit: 0.02, vary: 0.12 });
    add(G.sph(rad * 0.32, 10, 8), { c: '#f8f4ec', b: 'Body', pos: [0, rad * 1.1, rad * 0.8], jit: 0, vary: 0 }); add(G.sph(rad * 0.16, 8, 6), { c: C.iris, b: 'Body', pos: [0, rad * 1.1, rad * 1.04], jit: 0, vary: 0 });
    add(G.sph(rad * 0.08, 6, 4), { c: '#14110c', b: 'Body', pos: [0, rad * 1.1, rad * 1.11], jit: 0, vary: 0 }); add(G.box(rad * 0.6, rad * 0.1, rad * 0.2), { c: hex(C.pele, 0.7), b: 'Body', pos: [0, rad * 1.48, rad * 0.78], rot: [-20, 0, 0], jit: 0.006 });
    for (let i = 0; i < (R.musgo === 'muito' ? 9 : 4); i++) { const a = i * 2.1, y = 0.4 + (i % 3) * 0.25, d = V3(Math.cos(a) * Math.sqrt(1 - y * y), y, Math.sin(a) * Math.sqrt(1 - y * y) - 0.3).normalize();
      add(G.ico(rad * 0.25, 0), { c: C.musgo, b: 'Body', pos: V3(0, rad, 0).addScaledVector(d, rad * 0.95).toArray(), scl: [1, 0.4, 1], pre: g => g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(_Y, d)), jit: 0.006, vary: 0.15 }); } }
  if (t === 'cogumelo') { const sw = p => p.y > 0.36 ? [['Cap', 1]] : p.y > 0.2 ? [['Stem2', 1]] : [['Stem1', 1]];
    add(G.cyl(0.09, 0.12, 0.38, 9), { c: C.pele, b: sw, pos: [0, 0.2, 0], jit: 0.004 }); add(G.sph(0.13, 9, 5, Math.PI / 2, Math.PI / 2), { c: C.pele, b: 'Stem1', pos: [0, 0.04, 0], jit: 0.004 });
    eyesF(0.035, 0.3, 0.085, 0.025, 'Stem2'); add(G.box(0.04, 0.006, 0.01), { c: '#2a1418', b: 'Stem2', pos: [0, 0.255, 0.1], jit: 0 });
    const sh = R.chapeu, sc = sh === 'pontudo' ? [0.85, 1.15, 0.85] : sh === 'largo' ? [1.3, 0.45, 1.3] : [1, 0.65, 1];
    add(G.sph(0.26, 11, 5, 0, Math.PI / 2), { c: C.chapeu, b: 'Cap', pos: [0, 0.36, 0], scl: sc, jit: 0.003, deform: sh === 'pontudo' ? g => { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) { const y = pa.getY(i) - 0.36; pa.setX(i, pa.getX(i) * (1 - y * 2.2)); pa.setZ(i, pa.getZ(i) * (1 - y * 2.2)); } } : null });
    add(G.cyl(0.25 * sc[0], 0.2 * sc[0], 0.02, 11), { c: hex(C.pinta, 0.85), b: 'Cap', pos: [0, 0.35, 0], jit: 0 });
    for (let i = 0; i < 8; i++) { const a = i * 2.4, rr = 0.07 + (i % 3) * 0.05; add(G.cyl(0.028, 0.028, 0.01, 6), { c: C.pinta, glow: cfg.cores === 'azul', b: 'Cap', pos: [Math.cos(a) * rr * sc[0], 0.36 + 0.26 * sc[1] * Math.sqrt(Math.max(0, 1 - (rr / 0.26) ** 2)), Math.sin(a) * rr * sc[0]], jit: 0 }); } }
  if (t === 'cubo') { add(G.box(0.62, 0.6, 0.62, 3), { c: C.pele, mat: 3, b: p => p.y > 0.4 ? [['Top', 0.6], ['Body', 0.4]] : [['Body', 1]], pos: [0, 0.3, 0], jit: 0.004, vary: 0.04 });
    add(G.box(0.5, 0.48, 0.5), { c: C.claro, mat: 3, b: 'Body', pos: [0, 0.3, 0], jit: 0 });
    const d = R.dentro;
    if (d === 'tesouro') { for (let i = 0; i < 8; i++) add(G.cyl(0.03, 0.03, 0.008, 8), { c: '#f0c030', metal: true, mat: 1, b: 'Body', pos: [Math.sin(i * 2) * 0.15, 0.1 + (i % 4) * 0.08, Math.cos(i * 3) * 0.15], rot: [i * 30, i * 20, 0], jit: 0 }); add(G.octa(0.05), { c: '#e04060', b: 'Body', pos: [0.05, 0.32, -0.05], jit: 0 }); }
    if (d === 'ossos') { for (let i = 0; i < 4; i++) add(G.cyl(0.015, 0.015, 0.22, 5), { c: '#f0e8d0', b: 'Body', pos: [Math.sin(i) * 0.1, 0.15 + i * 0.07, Math.cos(i) * 0.1], rot: [i * 40, i * 30, 70], jit: 0 }); add(G.sph(0.07, 7, 5), { c: '#f0e8d0', b: 'Body', pos: [0, 0.34, 0.05], jit: 0 }); }
    if (d === 'aventureiro') { add(G.sph(0.09, 8, 4, 0, Math.PI / 2), { c: '#a0a8b0', metal: true, mat: 1, b: 'Body', pos: [0.08, 0.3, 0.02], rot: [20, 0, 30], jit: 0 }); add(G.box(0.03, 0.4, 0.008), { c: '#c0c8d0', metal: true, mat: 1, b: 'Body', pos: [-0.1, 0.28, -0.05], rot: [10, 0, 25], jit: 0 }); }
    eyesF(0.08, 0.45, 0.2, 0.035, 'Top'); }
  if (t === 'gota') { add(G.sph(0.2, 11, 9), { c: C.pele, mat: 3, b: p => p.y > 0.25 ? [['Top', 0.7], ['Body', 0.3]] : [['Body', 1]], pos: [0, 0.18, 0], scl: [1, 0.9, 1], jit: 0.003, vary: 0.04,
      deform: g => { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) { const y = pa.getY(i) - 0.18; if (y > 0) { const k = 1 - y / 0.22 * 0.6; pa.setX(i, pa.getX(i) * k); pa.setZ(i, pa.getZ(i) * k); pa.setY(i, pa.getY(i) + y * 0.5); } } } });
    add(G.sph(0.12, 8, 6), { c: C.claro, mat: 3, b: 'Body', pos: [0, 0.16, 0], jit: 0 }); add(G.sph(0.03, 5, 3), { c: '#ffffff', glow: true, b: 'Top', pos: [0.08, 0.3, 0.1], jit: 0 });
    eyesF(0.06, 0.22, 0.16, 0.03, 'Body'); add(G.box(0.05, 0.008, 0.01), { c: '#14110c', b: 'Body', pos: [0, 0.16, 0.19], jit: 0 });
    if (R.chapeu === 'coroa') { add(G.cyl(0.05, 0.055, 0.03, 8, true), { c: '#f0c030', metal: true, mat: 1, b: 'Top', pos: [0, 0.43, 0], jit: 0 }); for (let i = 0; i < 5; i++) add(G.cone(0.012, 0.03, 4), { c: '#f0c030', metal: true, mat: 1, b: 'Top', pos: [Math.cos(i * 1.256) * 0.05, 0.46, Math.sin(i * 1.256) * 0.05], jit: 0 }); }
    if (R.chapeu === 'folha') add(G.sph(1, 6, 3), { c: '#5aa040', b: 'Top', pos: [0.02, 0.44, 0], scl: [0.05, 0.012, 0.1], rot: [0, 30, 20], jit: 0 }); }
  if (t === 'bocarra') {
    add(G.sph(0.42, 12, 6, Math.PI / 2, Math.PI / 2), { c: C.pele, b: 'Hips', pos: [0, 0.62, 0.0], scl: [1, 0.75, 1], jit: 0.005 });
    add(G.cyl(0.4, 0.4, 0.04, 12), { c: C.escuro, b: 'Hips', pos: [0, 0.6, 0], jit: 0 });
    add(G.sph(0.3, 9, 5), { c: C.lingua, b: 'Hips', pos: [0, 0.6, 0.05], scl: [0.8, 0.25, 1], jit: 0.004 });
    add(G.sph(0.44, 12, 6, 0, Math.PI / 2), { c: C.pele, b: 'Jaw', pos: [0, 0.63, 0], scl: [1, 0.85, 1], jit: 0.005 });
    const nT = R.dentes === 'muitos' ? 14 : 6, th = R.dentes === 'muitos' ? 0.08 : 0.16;
    for (let i = 0; i < nT; i++) { const a = (i / (nT - 1) - 0.5) * Math.PI * 1.25; for (const [b, y, flip] of [['Jaw', 0.61, 180], ['Hips', 0.63, 0]])
      add(G.cone(th * 0.35, th, 4), { c: '#f8f4e8', b, pos: [Math.sin(a) * 0.37, y + (flip ? -th / 2 : th / 2), Math.cos(a) * 0.37], rot: [flip, 0, 0], jit: 0 }); }
    if (R.olhos !== 'nenhum') { const xs = R.olhos === 'um' ? [0] : [-0.14, 0.14]; for (const x of xs) { add(G.sph(R.olhos === 'um' ? 0.11 : 0.08, 8, 6), { c: '#f8f4ec', b: 'Jaw', pos: [x, 1.0, 0.18], jit: 0, vary: 0 }); add(G.sph(R.olhos === 'um' ? 0.05 : 0.04, 6, 4), { c: '#14110c', b: 'Jaw', pos: [x, 1.0, 0.26], jit: 0, vary: 0 }); } }
    for (const [s, L] of [[1, '_L'], [-1, '_R']]) { add(G.tube([s * 0.18, 0.5, 0], [s * 0.18, 0.28, 0], 0.07, 0.06, 7), { c: C.pele, b: 'UpLeg' + L, jit: 0.004 }); add(G.tube([s * 0.18, 0.28, 0], [s * 0.18, 0.07, 0], 0.06, 0.05, 7), { c: C.pele, b: 'Leg' + L, jit: 0.004 });
      add(G.sph(0.08, 7, 5), { c: C.escuro, b: 'Foot' + L, pos: [s * 0.18, 0.04, 0.04], scl: [1, 0.6, 1.4], jit: 0 }); } }
  if (t === 'mao') { add(G.box(0.24, 0.07, 0.2), { c: C.pele, b: 'Body', pos: [0, 0.2, 0.0], jit: 0.003 });
    [[0.09, 0.1], [0.03, 0.12], [-0.03, 0.115], [-0.09, 0.1]].forEach(([x, l], i) => { add(G.tube([x, 0.2, 0.1], [x, 0.2, 0.1 + l * 0.55], 0.024, 0.022, 6), { c: C.pele, b: 'F' + i + 'a', jit: 0.002 });
      add(G.tube([x, 0.2, 0.1 + l * 0.55], [x, 0.2, 0.1 + l], 0.022, 0.018, 6), { c: C.pele, b: 'F' + i + 'b', jit: 0.002 }); add(G.box(0.03, 0.008, 0.03), { c: C.unha, b: 'F' + i + 'b', pos: [x, 0.218, 0.1 + l - 0.012], jit: 0 });
      if (i === 2 && R.anel !== 'nenhum') { add(G.cyl(0.028, 0.028, 0.014, 8, true), { c: '#f0c030', metal: true, mat: 1, b: 'F2a', pos: [x, 0.2, 0.13], rot: [90, 0, 0], jit: 0 }); if (R.anel === 'rubi') add(G.octa(0.014), { c: '#e02040', b: 'F2a', pos: [x, 0.23, 0.13], jit: 0 }); } });
    add(G.tube([0.12, 0.2, -0.02], [0.18, 0.2, 0.04], 0.026, 0.024, 6), { c: C.pele, b: 'Th1', jit: 0.002 }); add(G.tube([0.18, 0.2, 0.04], [0.21, 0.2, 0.09], 0.024, 0.02, 6), { c: C.pele, b: 'Th2', jit: 0.002 });
    add(G.cyl(0.07, 0.06, 0.08, 9), { c: C.pele, b: 'Body', pos: [0, 0.2, -0.13], rot: [90, 0, 0], jit: 0.003 });
    if (R.punho === 'manga') { add(G.cyl(0.09, 0.08, 0.06, 10), { c: '#f0ece0', b: 'Body', pos: [0, 0.2, -0.17], rot: [90, 0, 0], jit: 0.003 }); for (let i = 0; i < 10; i++) add(G.sph(0.018, 4, 3), { c: '#ffffff', b: 'Body', pos: [Math.cos(i * 0.628) * 0.09, 0.2 + Math.sin(i * 0.628) * 0.09, -0.14], jit: 0 }); } }
  if (t === 'vassoura') { add(G.tube([0, 0.2, 0], [0, 1.45, 0], 0.025, 0.022, 7), { c: C.pele, b: 'Body', jit: 0.002 });
    for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2, r = 0.03 + (i % 3) * 0.04; add(G.box(0.012, 0.32, 0.012), { c: i % 2 ? C.palha : hex(C.palha, 0.85), b: 'Base', pos: [Math.cos(a) * r * 1.6, 0.16, Math.sin(a) * r], rot: [Math.sin(a) * 14, 0, -Math.cos(a) * 14], jit: 0 }); }
    add(G.cyl(0.07, 0.07, 0.04, 9), { c: C.fita, b: 'Base', pos: [0, 0.3, 0], scl: [1.5, 1, 1], jit: 0 });
    for (const s of [1, -1]) add(G.sph(0.012, 5, 4), { c: '#14110c', b: 'Body', pos: [s * 0.012, 1.25, 0.022], jit: 0 });
    for (const [s, L] of [[1, '_L'], [-1, '_R']]) { const A = REST['ArmA' + L].toArray(), Bp = REST['ArmB' + L].toArray(), Ep = REST['ArmEnd' + L].toArray();
      add(G.tube(A, Bp, 0.012, 0.01, 4), { c: C.palha, b: 'ArmA' + L, jit: 0 }); add(G.tube(Bp, Ep, 0.01, 0.008, 4), { c: C.palha, b: 'ArmB' + L, jit: 0 });
      for (const d of [-1, 0, 1]) add(G.box(0.006, 0.06, 0.006), { c: C.palha, b: 'ArmB' + L, pos: [Ep[0] + d * 0.012, Ep[1] - 0.02, Ep[2]], rot: [0, 0, d * 25], jit: 0 }); }
    if (R.chapeu === 'bruxa') { add(G.cyl(0.14, 0.14, 0.012, 10), { c: '#2a2238', b: 'Body', pos: [0, 1.42, 0], jit: 0 }); add(G.cone(0.07, 0.24, 8), { c: '#2a2238', b: 'Body', pos: [0, 1.54, -0.01], rot: [-12, 0, 0], jit: 0 }); } }

  // ---------- poses
  const setE = (b, a, o = 'YXZ') => b.quaternion.copy(E(a, o));
  const L_LEG = B.UpLeg_L ? [REST.UpLeg_L.distanceTo(REST.Leg_L), REST.Leg_L.distanceTo(REST.Foot_L)] : null;
  function applyPose(P) {
    B.Root.position.set(P.p[0], P.p[1], P.p[2]); setE(B.Root, P.r || [0, 0, 0]);
    if (B.Body) { setE(B.Body, P.b || [0, 0, 0]); if (P.bs) B.Body.scale.set(...P.bs); }
    if (B.Top) setE(B.Top, P.tp || [0, 0, 0]);
    if (B.Stem1) { setE(B.Stem1, P.s1 || [0, 0, 0]); setE(B.Stem2, P.s2 || [0, 0, 0]); setE(B.Cap, P.cp || [0, 0, 0]); if (P.ss) B.Stem1.scale.set(...P.ss); if (P.cs) B.Cap.scale.set(...P.cs); }
    if (B.Base) { setE(B.Base, P.bb || [0, 0, 0]); if (P.bsc) B.Base.scale.set(...P.bsc); for (const [s, L] of [[1, '_L'], [-1, '_R']]) { const a = P.arm || [0, 0]; setE(B['ArmA' + L], [a[0], 0, s * a[1]], 'XYZ'); setE(B['ArmB' + L], [a[2] || 0, 0, s * (a[3] || 0)], 'XYZ'); } }
    if (B.F0a) { for (let i = 0; i < 4; i++) { const f = P.f ? P.f[i] : [0, 0]; setE(B['F' + i + 'a'], [f[0], 0, 0], 'XYZ'); setE(B['F' + i + 'b'], [f[1], 0, 0], 'XYZ'); } setE(B.Th1, [0, P.th || 0, 0]); setE(B.Th2, [0, 0, 0]); }
    if (B.Hips) { B.Hips.position.set(REST.Hips.x + P.hp[0], REST.Hips.y + P.hp[1], REST.Hips.z + P.hp[2]); setE(B.Hips, P.hr || [0, 0, 0]); B.Jaw.quaternion.setFromAxisAngle(_X, -(P.jaw || 0) * D2R); }
    B.Root.updateMatrixWorld(true);
    if (B.Hips) for (const [f, L, s] of [[P.fL, '_L', 1], [P.fR, '_R', -1]]) ikQ(B['UpLeg' + L], B['Leg' + L], B['Foot' + L], V3(s * 0.18 + f[0], 0.06 + f[1], f[2]), V3(0, 0, 1), L_LEG[0], L_LEG[1], true, E([0, 0, 0]));
    B.Root.updateMatrixWorld(true);
  }
  const base = () => ({ p: [0, 0, 0], r: [0, 0, 0], b: [0, 0, 0], tp: [0, 0, 0], hp: [0, 0, 0], fL: [0, 0, 0], fR: [0, 0, 0], arm: [10, 25, -20, 10], f: [[0, 0], [0, 0], [0, 0], [0, 0]] });
  const hopFn = (T, H, D2, fn) => t2 => { const P = base(), u = (t2 / T) % 1, sq = u < 0.18 ? Math.sin(Math.PI * u / 0.18) : u > 0.88 ? Math.sin(Math.PI * (u - 0.88) / 0.12) * 0.6 : 0, air = u >= 0.18 && u <= 0.88 ? Math.sin(Math.PI * (u - 0.18) / 0.7) : 0;
    fn(P, sq, air, u); return P; };
  const clipdefs = [];
  if (t === 'ourico' || t === 'pedra') { const T = 1.2, circ = 2 * Math.PI * rad;
    clipdefs.push({ name: 'Parado', dur: 3, fps: 30, loop: true, fn: t2 => { const P = base(), a = 2 * Math.PI * t2 / 3; P.b = [3 * Math.sin(a), 10 * Math.sin(a * 0.5), 0]; P.bs = [1 + 0.02 * Math.sin(a * 2), 1 - 0.02 * Math.sin(a * 2), 1 + 0.02 * Math.sin(a * 2)]; return P; } },
      { name: 'Mover', dur: T, fps: 30, loop: true, v: circ / T, fn: t2 => { const P = base(); P.b = [360 * t2 / T, 0, 0]; P.p[1] = 0.01 * Math.abs(Math.sin(4 * Math.PI * t2 / T)); return P; } },
      { name: 'Atacar', dur: 1.0, fps: 60, fn: t2 => { const P = base(), k = Math.sin(Math.PI * clamp(t2 / 0.6, 0, 1)); P.p = [0, rad * 0.6 * Math.sin(Math.PI * clamp((t2 - 0.2) / 0.5, 0, 1)), rad * 1.4 * k]; P.b = [200 * clamp((t2 - 0.1) / 0.6, 0, 1), 0, 0];
        P.bs = t === 'ourico' ? [1 + 0.25 * k, 1 + 0.25 * k, 1 + 0.25 * k] : [1, 1, 1]; return P; } },
      { name: 'Pular', dur: 1.0, fps: 60, fn: hopFn(1.0, 1, 0, (P, sq, air) => { P.p[1] = rad * 1.2 * air; P.bs = [1 + 0.18 * sq, 1 - 0.22 * sq, 1 + 0.18 * sq]; }) }); }
  if (t === 'cogumelo' || t === 'gota' || t === 'cubo' || t === 'vassoura') {
    const hopH = t === 'cubo' ? 0.25 : t === 'vassoura' ? 0.3 : 0.35, T = t === 'cubo' ? 1.2 : 0.8, step = t === 'cubo' ? 0.25 : 0.3;
    const squash = (P, sq, air) => { const k1 = 1 - 0.3 * sq + 0.15 * air, k2 = 1 + 0.2 * sq - 0.06 * air;
      if (t === 'cogumelo') { P.ss = [k2, k1, k2]; P.cs = [1 + 0.1 * sq, 1 - 0.1 * sq, 1 + 0.1 * sq]; } else if (t === 'vassoura') { P.bsc = [k2, k1, k2]; } else P.bs = [k2, k1, k2]; };
    clipdefs.push({ name: 'Parado', dur: 2.4, fps: 30, loop: true, fn: t2 => { const P = base(), a = 2 * Math.PI * t2 / 2.4; squash(P, 0.15 + 0.15 * Math.sin(a), 0);
      if (t === 'cogumelo') { P.s1 = [0, 0, 4 * Math.sin(a)]; P.cp = [3 * Math.sin(a * 2), 0, -4 * Math.sin(a)]; } if (t === 'vassoura') { P.b = [0, 0, 4 * Math.sin(a)]; P.arm = [10 + 6 * Math.sin(a), 25, -20, 10]; } if (t === 'cubo' || t === 'gota') P.tp = [3 * Math.sin(a), 0, 4 * Math.sin(a * 0.5)]; return P; } });
    clipdefs.push({ name: 'Mover', dur: T, fps: 60, loop: true, v: step / T * (t === 'cubo' ? 2.4 : 1), fn: t === 'cubo' ? (t2 => { const P = base(), a = 2 * Math.PI * t2 / T; P.bs = [1 + 0.08 * Math.sin(2 * a), 1 - 0.1 * Math.sin(2 * a), 1 - 0.06 * Math.sin(2 * a)]; P.b = [6 * Math.sin(a), 0, 4 * Math.sin(2 * a)]; P.tp = [-8 * Math.sin(a - 0.6), 0, 0]; return P; })
      : hopFn(T, 1, 0, (P, sq, air, u) => { P.p[1] = hopH * air; squash(P, sq, air); if (t === 'cogumelo') { P.s1 = [-8 * air, 0, 0]; P.cp = [10 * sq - 6 * air, 0, 0]; } if (t === 'vassoura') { P.b = [-10 * air + 6 * sq, 0, 0]; P.arm = [-40 * air + 10, 25 + 30 * air, -20, 10]; } if (t === 'gota') P.tp = [10 * sq - 10 * air, 0, 0]; }) });
    clipdefs.push({ name: 'Atacar', dur: 1.0, fps: 60, fn: t2 => { const P = base(), w = t2 < 0.4 ? EASE.io(t2 / 0.4) : t2 < 0.55 ? 1 - EASE.in((t2 - 0.4) / 0.15) * 2 : -1 + EASE.io((t2 - 0.55) / 0.45), back = Math.max(0, w), fwd = Math.max(0, -w);
      squash(P, back * 0.8, fwd * 0.6); P.p = [0, 0, (t === 'cubo' ? 0.3 : 0.15) * fwd];
      if (t === 'cubo') P.bs = [1 - 0.1 * fwd, 1 - 0.15 * back, 1 + 0.35 * fwd];
      if (t === 'cogumelo') { P.s1 = [-15 * back + 25 * fwd, 0, 0]; P.cp = [-10 * back + 30 * fwd, 0, 0]; } if (t === 'vassoura') { P.b = [-25 * back + 45 * fwd, 0, 0]; P.arm = [-80 * back + 30 * fwd, 40, -40, 10]; }
      if (t === 'gota') P.tp = [-15 * back + 25 * fwd, 0, 0]; return P; } });
    clipdefs.push({ name: 'Pular', dur: 1.2, fps: 60, fn: hopFn(1.2, 1, 0, (P, sq, air) => { P.p[1] = hopH * 2.4 * air; squash(P, sq * 1.3, air); if (t === 'vassoura') P.arm = [-150 * air + 10, 40, -20, 10]; if (t === 'cogumelo') P.cp = [0, 360 * air, 0]; }) }); }
  if (t === 'bocarra') { const T = 0.9, Sx = 0.32, Dd = 0.6;
    const foot = (u, s) => { let z, lift = 0; if (u < Dd) z = Sx / 2 - Sx * u / Dd; else { const w = (u - Dd) / (1 - Dd); z = -Sx / 2 + Sx * EASE.io(w); lift = 0.12 * Math.sin(Math.PI * w); } return [0, lift, z]; };
    clipdefs.push({ name: 'Parado', dur: 2.4, fps: 30, loop: true, fn: t2 => { const P = base(), a = 2 * Math.PI * t2 / 2.4; P.hp = [0, -0.03 + 0.01 * Math.sin(a), 0]; P.jaw = 8 + 8 * Math.max(0, Math.sin(a)); P.hr = [0, 6 * Math.sin(a * 0.5), 0]; return P; } },
      { name: 'Mover', dur: T, fps: 60, loop: true, v: Sx / (Dd * T), fn: t2 => { const P = base(), u = t2 / T; P.fL = foot(u % 1, 1); P.fR = foot((u + 0.5) % 1, -1); P.hp = [0, -0.05 + 0.02 * Math.cos(4 * Math.PI * u), 0]; P.hr = [0, 0, 6 * Math.sin(2 * Math.PI * u)]; P.jaw = 12 + 10 * Math.sin(4 * Math.PI * u); return P; } },
      { name: 'Atacar', dur: 1.0, fps: 60, fn: t2 => { const P = base(), w = t2 < 0.4 ? EASE.io(t2 / 0.4) : t2 < 0.55 ? 1 - EASE.in((t2 - 0.4) / 0.15) * 2 : -1 + EASE.io((t2 - 0.55) / 0.45), back = Math.max(0, w), fwd = Math.max(0, -w);
        P.hp = [0, -0.1 * back, 0.25 * fwd]; P.hr = [-15 * back + 20 * fwd, 0, 0]; P.jaw = 55 * back; P.fL = [0, 0, 0.1 * fwd]; P.fR = [0, 0, 0.1 * fwd]; return P; } },
      { name: 'Pular', dur: 1.2, fps: 60, fn: hopFn(1.2, 1, 0, (P, sq, air) => { P.hp = [0, -0.15 * sq + 0.6 * air, 0]; P.fL = [0, 0.55 * air, 0]; P.fR = [0, 0.55 * air, 0]; P.jaw = 30 * air; }) }); }
  if (t === 'mao') { const T = 0.5;
    clipdefs.push({ name: 'Parado', dur: 2.4, fps: 30, loop: true, fn: t2 => { const P = base(), a = 2 * Math.PI * t2 / 2.4; P.p[1] = -0.1; P.f = [0, 1, 2, 3].map(i => [40 + 10 * Math.sin(a * 2 + i * 1.3), 30]); P.th = 10 * Math.sin(a); return P; } },
      { name: 'Mover', dur: T, fps: 60, loop: true, v: 0.4, fn: t2 => { const P = base(), ph = 2 * Math.PI * t2 / T; P.p[1] = -0.1 + 0.01 * Math.abs(Math.sin(2 * ph)); P.f = [0, 1, 2, 3].map(i => [45 + 22 * Math.sin(ph + (i % 2) * Math.PI), 30 + 15 * Math.cos(ph + (i % 2) * Math.PI)]); P.b = [0, 0, 4 * Math.sin(ph)]; P.th = 20 * Math.sin(ph); return P; } },
      { name: 'Atacar', dur: 0.9, fps: 60, fn: t2 => { const P = base(), k = Math.sin(Math.PI * clamp(t2 / 0.8, 0, 1)); P.p = [0, -0.1 + 0.04 * k, 0.06 * k]; P.b = [-18 * k, 0, 0]; P.f = [0, 1, 2, 3].map(i => i < 2 ? [40 - 30 * k, 30 - 25 * k] : [40 + 10 * k, 30]); P.th = 25 * k; return P; } },
      { name: 'Pular', dur: 0.8, fps: 60, fn: hopFn(0.8, 1, 0, (P, sq, air) => { P.p[1] = -0.1 + 0.15 * air; P.f = [0, 1, 2, 3].map(() => [40 + 25 * sq - 20 * air, 30]); }) }); }
  const P0 = finish(kit, skel, [], S.nome, clipdefs, applyPose, { scaleBones });
  P0.vel = Object.fromEntries(clipdefs.filter(c => c.v).map(c => [c.name, c.v]));
  return P0;
}

// ======================================================================= FAMÍLIA H — bípedes grandes e gigantes (poses e IK dos povos)
function forgeH(id, S, cfg) {
  const R = { mat: 'pele', cabeca: 'gigante', arma: 'nada', k: 1, armK: 1, legK: 1, belly: 1, ...S.receita(cfg) };
  const COL = S.cats.cores.cor[cfg.cores];
  const pele0 = COL.pele || '#a08070';
  const C = { pele: pele0, claro: hex(pele0, 1.25), escuro: hex(pele0, 0.6), roupa: '#6a4a2e', pelo: '#3a2a1e', brilho: '#ffb040', ...COL };
  const kit = makeKit(v => v.clone()), { add, G } = kit;
  const kx = R.k, legK = R.legK, armK = R.armK, bel = R.belly, m = R.mat;
  const hipY = 0.115 + 0.405 * legK, dy = hipY - 0.52, SX = 0.285 * kx, LX = 0.11 * kx;
  const sh = 0.92 + dy, el = sh - 0.2 * armK, wr = el - 0.165 * armK, kn = 0.115 + 0.2 * legK;
  const bdef = [['Hips', null, [0, hipY, 0]], ['Spine', 'Hips', [0, 0.62 + dy, 0]], ['Chest', 'Spine', [0, 0.76 + dy, 0]], ['Neck', 'Chest', [0, 0.95 + dy, 0]], ['Head', 'Neck', [0, 1.0 + dy, 0]]];
  for (const [s, L] of [[1, '_L'], [-1, '_R']]) {
    bdef.push(['UpperArm' + L, 'Chest', [s * SX, sh, 0]], ['ForeArm' + L, 'UpperArm' + L, [s * SX, el, 0]], ['Hand' + L, 'ForeArm' + L, [s * SX, wr, 0]],
      ['UpLeg' + L, 'Hips', [s * LX, hipY - 0.02, 0]], ['Leg' + L, 'UpLeg' + L, [s * LX, kn, 0]], ['Foot' + L, 'Leg' + L, [s * LX, 0.115, 0]]);
    if (R.quatroBracos) bdef.push(['UpperArm2' + L, 'Chest', [s * SX * 0.95, sh - 0.14, 0.03]], ['ForeArm2' + L, 'UpperArm2' + L, [s * SX * 0.95, sh - 0.14 - 0.2 * armK, 0.03]], ['Hand2' + L, 'ForeArm2' + L, [s * SX * 0.95, sh - 0.14 - 0.365 * armK, 0.03]]);
  }
  if (R.chave) bdef.push(['Key', 'Chest', [0, 0.82 + dy, -0.24 * kx]]);
  const skel = buildSkeleton(bdef, [], v => v);
  kit.setBI(skel.BI);
  const { B, REST } = skel;
  const glowJ = m === 'magma', J = ['cascalho', 'magma'].includes(m) ? 0.012 : m === 'madeira' ? 0.006 : 0.004;
  // ---------- membros conforme o material
  function limb(a, b, r1, r2, bone) {
    a = a.toArray ? a.toArray() : a; b = b.toArray ? b.toArray() : b;
    if (m === 'cascalho') { const n = 3; for (let i = 0; i < n; i++) { const q = V3(...a).lerp(V3(...b), (i + 0.5) / n); add(new THREE.DodecahedronGeometry((r1 + r2) * 0.55, 0), { c: i % 2 ? C.pele : C.claro, b: bone, pos: q.toArray(), jit: J, vary: 0.12 }); } return; }
    if (m === 'moedas') { const n = 7; for (let i = 0; i < n; i++) { const q = V3(...a).lerp(V3(...b), (i + 0.5) / n), d = V3(...b).sub(V3(...a)).normalize(); add(G.cyl((r1 + r2) * 0.55, (r1 + r2) * 0.55, 0.018, 10), { c: i % 2 ? C.pele : C.claro, metal: true, mat: 1, b: bone, pos: q.toArray(), pre: g => g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(_Y, d)).rotateX(0), jit: 0.002 }); } return; }
    const mt = m === 'gelo' ? { mat: 3 } : m === 'metal' ? { metal: true, mat: 1 } : {};
    const rr = m === 'gelo' ? 0.4 : 1;
    add(G.tube(a, b, r1 * rr, r2 * rr, m === 'cacto' ? 8 : 7), { c: m === 'palha' ? C.pele : C.pele, b: bone, jit: J, vary: m === 'madeira' ? 0.12 : 0.07, ...mt });
    if (m === 'cacto') for (let i = 0; i < 3; i++) { const q = V3(...a).lerp(V3(...b), (i + 0.5) / 3); for (const ang of [0, 2.1, 4.2]) add(G.cone(0.008, 0.04, 3), { c: '#f0e8c0', b: bone, pos: [q.x + Math.cos(ang) * r1, q.y, q.z + Math.sin(ang) * r1], rot: [0, 0, 90 + ang / D2R], jit: 0 }); }
    if (m === 'madeira') { const q = V3(...a).lerp(V3(...b), 0.6); add(G.tube(q.toArray(), [q.x + (q.x > 0 ? 0.06 : -0.06), q.y + 0.05, q.z + 0.03], r2 * 0.35, 0.004, 4), { c: C.pele, b: bone, jit: 0 }); }
    if (m === 'palha') { add(G.cyl(r2 * 1.4, r2 * 0.6, 0.06, 7), { c: '#e8d080', b: bone, pos: b, jit: 0.004 }); }
  }
  const joint = (p, r, bone) => { if (m === 'cascalho' || m === 'moedas') return; add(G.sph(r, 7, 5), glowJ ? { c: C.brilho, glow: true, b: bone, pos: p, jit: 0 } : { c: m === 'metal' ? C.claro : C.pele, metal: m === 'metal', mat: m === 'gelo' ? 3 : m === 'metal' ? 1 : 0, b: bone, pos: p, jit: J }); };
  const RA = 0.07 * kx * (m === 'pele' ? 1.15 : 1), RL = 0.085 * kx * (m === 'pele' ? 1.1 : 1);
  const armSets = [['', sh]].concat(R.quatroBracos ? [['2', sh - 0.14]] : []);
  for (const [s, L] of [[1, '_L'], [-1, '_R']]) {
    for (const [suf] of armSets) { const A = REST['UpperArm' + suf + L], Bp = REST['ForeArm' + suf + L], Hh = REST['Hand' + suf + L];
      limb(A, Bp, RA, RA * 0.85, 'UpperArm' + suf + L); limb(Bp, Hh, RA * 0.85, RA * 0.8, 'ForeArm' + suf + L); joint(Bp.toArray(), RA * 0.9, 'ForeArm' + suf + L); joint(A.toArray(), RA * 1.25, 'UpperArm' + suf + L);
      const fist = Hh.clone().add(V3(0, -0.045 * kx, 0));
      if (m === 'cascalho' || m === 'magma') add(new THREE.DodecahedronGeometry(RA * 1.25, 0), { c: C.pele, b: 'Hand' + suf + L, pos: fist.toArray(), jit: J });
      else if (m === 'gelo') { for (const dz of [-0.025, 0, 0.025]) add(G.tube(fist.toArray(), [fist.x, fist.y - 0.08, fist.z + dz], 0.01, 0.004, 4), { c: C.pele, mat: 3, b: 'Hand' + suf + L, jit: 0 }); }
      else add(G.sph(RA * 1.15, 7, 5), { c: m === 'palha' ? '#e8d080' : m === 'metal' ? C.claro : m === 'moedas' ? C.pele : C.pele, metal: m === 'metal' || m === 'moedas', mat: m === 'metal' || m === 'moedas' ? 1 : 0, b: 'Hand' + suf + L, pos: fist.toArray(), scl: [0.9, 1, 1.05], jit: J });
    }
    const UL = REST['UpLeg' + L], LG = REST['Leg' + L], FT = REST['Foot' + L];
    limb(UL, LG, RL, RL * 0.85, 'UpLeg' + L); limb(LG, FT, RL * 0.85, RL * 0.75, 'Leg' + L); joint(LG.toArray(), RL * 0.85, 'Leg' + L);
    const fx = FT.x;
    if (m === 'madeira') for (const a of [-0.5, 0, 0.5, 2.8]) add(G.tube([fx, 0.1, 0], [fx + Math.sin(a) * 0.09, 0.0, Math.cos(a) * 0.1], 0.025, 0.008, 4), { c: C.pele, b: 'Foot' + L, jit: 0.003 });
    else if (m === 'gelo') add(G.box(0.06, 0.03, 0.14), { c: C.pele, mat: 3, b: 'Foot' + L, pos: [fx, 0.02, 0.03], jit: 0 });
    else add(m === 'cascalho' || m === 'magma' ? new THREE.DodecahedronGeometry(RL * 1.1, 0) : G.box(RL * 1.6, 0.08, RL * 2.6), { c: m === 'metal' ? C.claro : m === 'palha' ? '#5a3a22' : C.escuro, metal: m === 'metal' || m === 'moedas', mat: m === 'metal' || m === 'moedas' ? 1 : 0, b: 'Foot' + L, pos: [fx, 0.045, 0.04], jit: J });
  }
  // ---------- tronco
  const torsoW = p => p.y > 0.7 + dy ? [['Chest', 1]] : p.y > 0.58 + dy ? [['Spine', 1]] : [['Hips', 1]];
  const ch = [0, 0.84 + dy, 0], bl = [0, 0.66 + dy, 0.02 * bel], pv = [0, 0.53 + dy, 0];
  if (m === 'cascalho') { for (const [c0, r, b] of [[ch, 0.24, 'Chest'], [bl, 0.21 * bel, 'Spine'], [pv, 0.19, 'Hips']]) add(new THREE.DodecahedronGeometry(r * kx, 0), { c: C.pele, b, pos: c0, scl: [1, 0.85, 0.85], jit: J, vary: 0.12 });
    if (R.nucleo) add(G.ico(0.07 * kx, 1), { c: C.brilho, glow: true, b: 'Chest', pos: [0, ch[1], 0.17 * kx], jit: 0 }); }
  else if (m === 'gelo') { for (let i = 0; i < 4; i++) add(new THREE.TorusGeometry(0.15 - i * 0.012, 0.012, 4, 10, Math.PI * 1.6), { c: C.pele, mat: 3, b: 'Chest', pos: [0, ch[1] + 0.06 - i * 0.055, 0], rot: [90, 0, 90 + 18], jit: 0 });
    add(G.tube([0, pv[1], -0.02], [0, ch[1] + 0.1, -0.03], 0.025, 0.025, 6), { c: C.pele, mat: 3, b: torsoW, jit: 0 }); add(G.sph(0.11, 8, 5), { c: C.pele, mat: 3, b: 'Hips', pos: pv, scl: [1.2, 0.6, 0.8], jit: 0 }); }
  else if (m === 'moedas') { for (let i = 0; i < 12; i++) add(G.cyl(0.21 * kx * (i > 4 && i < 9 ? bel : 1), 0.21 * kx * (i > 4 && i < 9 ? bel : 1), 0.03, 12), { c: i % 2 ? C.pele : C.claro, metal: true, mat: 1, b: torsoW, pos: [0, pv[1] + i * 0.035, 0], scl: [1, 1, 0.8], jit: 0.003 });
    add(G.octa(0.05), { c: C.brilho, b: 'Chest', pos: [0, ch[1], 0.17 * kx], jit: 0 }); }
  else if (R.corpoBule) { add(G.sph(0.26 * kx, 12, 9), { c: C.pele, b: torsoW, pos: [0, 0.72 + dy, 0], scl: [1, 0.85, 1], jit: 0.003 });
    add(G.tube([0, 0.7 + dy, 0.2 * kx], [0, 0.82 + dy, 0.38 * kx], 0.05, 0.025, 7), { c: C.pele, b: 'Spine', jit: 0.003 });
    add(new THREE.TorusGeometry(0.1, 0.022, 5, 10, Math.PI * 1.2), { c: C.pele, b: 'Spine', pos: [0, 0.72 + dy, -0.26 * kx], rot: [0, 90, 120], jit: 0 });
    for (let i = 0; i < 6; i++) add(G.ico(0.025, 0), { c: C.desenho, b: torsoW, pos: [Math.sin(i * 1.05) * 0.27 * kx, 0.72 + dy + Math.cos(i * 2) * 0.05, Math.cos(i * 1.05) * 0.27 * kx], scl: [1, 1, 0.3], jit: 0 });
    for (const s of [1, -1]) { add(G.sph(0.035, 6, 4), { c: '#f8f4ec', b: 'Spine', pos: [s * 0.08, 0.78 + dy, 0.23 * kx], jit: 0 }); add(G.sph(0.018, 5, 4), { c: '#14110c', b: 'Spine', pos: [s * 0.08, 0.78 + dy, 0.26 * kx], jit: 0 }); } }
  else { const mt = m === 'metal' ? { metal: true, mat: 1 } : {}, tc = m === 'palha' ? (C.roupa || '#8a3a2a') : C.pele;
    add(G.sph(0.24 * kx, 10, 8), { c: tc, b: 'Chest', pos: ch, scl: [1, 0.9, 0.82], jit: J, ...mt });
    add(G.sph(0.21 * kx, 10, 8), { c: tc, b: torsoW, pos: bl, scl: [bel, 0.95, 0.85 * bel], jit: J, ...mt });
    add(G.sph(0.19 * kx, 9, 7), { c: m === 'palha' ? '#5a4a3a' : tc, b: 'Hips', pos: pv, scl: [1, 0.75, 0.85], jit: J, ...mt });
    add(G.tube([0, 0.9 + dy, 0], [0, 1.02 + dy, 0], 0.08 * kx, 0.07 * kx, 7), { c: C.pele, b: 'Neck', jit: J, ...mt });
    if (m === 'pele' && !R.corpoBule) add(G.sph(0.17 * kx, 9, 6), { c: C.claro, b: torsoW, pos: [0, bl[1], bl[2] + 0.06 * bel], scl: [bel * 0.9, 0.9, 0.6 * bel], jit: J });
    if (m === 'metal') { add(G.cyl(0.25 * kx, 0.25 * kx, 0.03, 10), { c: C.claro, metal: true, mat: 1, b: 'Chest', pos: [0, ch[1] + 0.12, 0], scl: [1, 1, 0.82], jit: 0 });
      for (const s of [1, -1]) add(G.sph(0.11 * kx, 8, 5), { c: C.claro, metal: true, mat: 1, b: 'UpperArm' + (s > 0 ? '_L' : '_R'), pos: [s * SX, sh + 0.02, 0], scl: [1.1, 0.8, 1], jit: 0 });
      if (R.engrenagens) for (const [x, y, r] of [[0.08, 0.86, 0.07], [-0.06, 0.72, 0.06], [0.05, 0.62, 0.045]]) { add(G.cyl(r * kx, r * kx, 0.02, 12), { c: C.claro, metal: true, mat: 1, b: torsoW, pos: [x * kx, y + dy, 0.2 * kx], rot: [90, 0, 0], jit: 0 });
        for (let i = 0; i < 8; i++) add(G.box(0.02, 0.02, 0.022), { c: C.claro, metal: true, mat: 1, b: torsoW, pos: [x * kx + Math.cos(i * 0.785) * r * kx * 1.1, y + dy + Math.sin(i * 0.785) * r * kx * 1.1, 0.2 * kx], jit: 0 }); add(G.ico(0.015), { c: C.brilho, glow: true, b: torsoW, pos: [x * kx, y + dy, 0.215 * kx], jit: 0 }); }
      if (S.num === 115) for (let i = 0; i < 3; i++) add(G.box(0.36 * kx, 0.5, 0.02, 3), { c: C.capa, b: p => p.y > 0.7 + dy ? [['Chest', 1]] : p.y > 0.4 ? [['Spine', 0.5], ['Hips', 0.5]] : [['Hips', 0.6], ['UpLeg_L', 0.2], ['UpLeg_R', 0.2]], pos: [0, 0.6 + dy, -0.2 * kx], rot: [8, 0, 0], jit: 0.002 }); }
    if (m === 'argila') { for (let i = 0; i < 6; i++) add(G.sph(0.02, 5, 3), { c: C.escuro, b: torsoW, pos: [Math.sin(i * 2.3) * 0.18 * kx, 0.6 + dy + (i % 3) * 0.1, Math.cos(i * 2.3) * 0.16 * kx], scl: [1, 1, 0.4], jit: 0 });
      if (R.runa === 'peito') add(G.octa(0.045), { c: '#60c8ff', glow: true, b: 'Chest', pos: [0, ch[1], 0.2 * kx], scl: [1, 1.2, 0.3], jit: 0 }); }
    if (m === 'magma') for (const [x, y, z, r] of [[0.08, 0.86, 0.19, 25], [-0.06, 0.74, 0.2, -30], [0.04, 0.62, 0.2, 15], [0, 0.82, -0.2, 40]]) add(G.box(0.1, 0.014, 0.014), { c: C.brilho, glow: true, b: torsoW, pos: [x * kx, y + dy, z * kx], rot: [0, 0, r], jit: 0 });
    if (m === 'madeira') { for (let i = 0; i < 4; i++) add(G.box(0.012, 0.18, 0.012), { c: C.escuro, b: torsoW, pos: [Math.sin(i * 1.6) * 0.2 * kx, 0.72 + dy, Math.cos(i * 1.6) * 0.17 * kx], rot: [0, i * 90, 0], jit: 0 }); }
    if (m === 'palha') { for (const s of [1, -1]) add(G.box(0.06, 0.06, 0.01), { c: '#c8a060', b: 'Chest', pos: [s * 0.08, ch[1] - 0.03, 0.2 * kx], rot: [0, 0, s * 20], jit: 0 }); add(G.cyl(0.21 * kx, 0.21 * kx, 0.04, 10), { c: '#5a3a22', b: 'Hips', pos: [0, 0.6 + dy, 0], jit: 0 }); }
  }
  // roupas
  if (R.roupa === 'tanga' || R.roupa === 'peles') { const rc = R.roupa === 'peles' ? '#8a6a4a' : C.roupa;
    add(G.cyl(0.2 * kx * Math.max(1, bel * 0.9), 0.2 * kx * Math.max(1, bel * 0.9), 0.05, 10), { c: '#4a3020', b: 'Hips', pos: [0, 0.6 + dy, 0.0], scl: [1, 1, 0.85], jit: 0 });
    for (const zs of [1, -1]) add(G.box(0.2 * kx, 0.2, 0.02, 3), { c: rc, b: p => { const t2 = clamp((0.58 + dy - p.y) / 0.2, 0, 1); return [['Hips', 1 - t2 * 0.4], [p.x > 0 ? 'UpLeg_L' : 'UpLeg_R', t2 * 0.2], [p.x > 0 ? 'UpLeg_R' : 'UpLeg_L', t2 * 0.2]]; }, pos: [0, 0.49 + dy, zs * 0.17 * kx], jit: 0.004, vary: 0.12 });
    if (R.roupa === 'peles') for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; add(G.ico(0.06 * kx, 0), { c: i % 2 ? '#8a6a4a' : '#a88a6a', b: 'Chest', pos: [Math.sin(a) * 0.2 * kx, 0.95 + dy, Math.cos(a) * 0.17 * kx], jit: 0.01 }); } }
  if (R.roupa === 'toga') { add(G.cyl(0.22 * kx * bel, 0.25 * kx * bel, 0.34, 10, true), { c: C.roupa, b: p => { const t2 = clamp((0.62 + dy - p.y) / 0.34, 0, 1); return [['Spine', 1 - t2], ['Hips', t2 * 0.6], [p.x > 0 ? 'UpLeg_L' : 'UpLeg_R', t2 * 0.4]]; }, pos: [0, 0.48 + dy, 0], scl: [1, 1, 0.86], vary: 0.06 });
    add(G.box(0.1, 0.5, 0.02), { c: C.roupa, b: torsoW, pos: [0.04, 0.82 + dy, 0.19 * kx], rot: [0, 0, 30], jit: 0 }); }
  if (R.roupa === 'camisa') for (const s of [1, -1]) add(G.box(0.05, 0.05, 0.01), { c: '#e0c070', b: 'Chest', pos: [s * 0.14, 0.95 + dy, 0.18], rot: [0, 0, 45], jit: 0 });
  if (R.bocaBarriga) { add(G.sph(0.1 * kx, 9, 5), { c: '#2a1418', b: 'Spine', pos: [0, bl[1], bl[2] + 0.17 * kx * bel], scl: [1.1, 0.55, 0.3], jit: 0 });
    for (let i = 0; i < 6; i++) for (const sy of [1, -1]) add(G.cone(0.014 * kx, 0.04 * kx, 4), { c: '#f8f4e8', b: 'Spine', pos: [(i - 2.5) * 0.034 * kx, bl[1] + sy * 0.04 * kx, bl[2] + 0.19 * kx * bel], rot: [sy > 0 ? 180 : 0, 0, 0], jit: 0 }); }
  if (R.chave) { add(G.tube([0, 0.82 + dy, -0.2 * kx], [0, 0.82 + dy, -0.3 * kx], 0.015, 0.015, 5), { c: C.claro, metal: true, mat: 1, b: 'Key', jit: 0 });
    for (const s of [1, -1]) add(new THREE.TorusGeometry(0.045, 0.012, 4, 10), { c: C.claro, metal: true, mat: 1, b: 'Key', pos: [s * 0.05, 0.82 + dy, -0.31 * kx], rot: [0, 90, 0], jit: 0 }); }
  if (R.monte) { const tipo = R.costas;
    add(G.sph(0.32 * kx, 10, 5, 0, Math.PI / 2), { c: C.folha, b: 'Chest', pos: [0, 0.92 + dy, -0.08], scl: [1.1, 0.6, 1.0], jit: 0.01, vary: 0.15 });
    for (let i = 0; i < 6; i++) { const x = (i % 3 - 1) * 0.12 * kx, z = -0.05 - Math.floor(i / 3) * 0.12;
      if (tipo === 'floresta') { add(G.tube([x, 1.05 + dy, z], [x, 1.1 + dy, z], 0.01, 0.01, 4), { c: '#6a4a2e', b: 'Chest', jit: 0 }); add(G.cone(0.04, 0.12, 6), { c: '#2f6b3f', b: 'Chest', pos: [x, 1.15 + dy, z], jit: 0.003 }); }
      if (tipo === 'ruinas') add(G.box(0.05, 0.08 + (i % 2) * 0.05, 0.05), { c: '#c8c0b0', b: 'Chest', pos: [x, 1.08 + dy, z], jit: 0.004 }); }
    if (tipo === 'cachoeira') { add(G.box(0.08, 0.4, 0.02), { c: '#80c8f0', mat: 3, b: 'Chest', pos: [0.1, 0.85 + dy, -0.24 * kx], jit: 0 }); add(G.box(0.12, 0.05, 0.08), { c: '#5a8a3a', b: 'Chest', pos: [0.1, 1.06 + dy, -0.2], jit: 0 }); } }
  // ---------- cabeça
  const hk = R.cabeca === 'gigante' || R.cabeca === 'ogro' || R.cabeca === 'troll' ? 0.82 : 1;
  const HC = [0, 1.12 + dy, 0.0], hr = 0.15 * hk * Math.max(1, kx * 0.9), HB = (x, y, z) => [HC[0] + x, HC[1] + y, HC[2] + z];
  const eyes2 = (x, y, z, r, col = '#1b1712', glow = false) => { for (const s of [1, -1]) add(G.sph(r, 6, 4), { c: col, glow, b: 'Head', pos: HB(s * x, y, z), scl: [1, 1, 0.6], jit: 0, vary: 0 }); };
  const hd = R.cabeca;
  if (hd === 'gigante' || hd === 'ogro' || hd === 'troll' || hd === 'ciclope') {
    add(G.sph(hr, 10, 8), { c: C.pele, b: 'Head', pos: HC, scl: hd === 'troll' ? [0.95, 1.05, 1.15] : hd === 'ogro' ? [1.15, 0.95, 1] : [1, 1, 0.95], jit: J });
    if (hd === 'ciclope') { add(G.sph(hr * 0.42, 9, 7), { c: '#f8f4ec', b: 'Head', pos: HB(0, hr * 0.15, hr * 0.72), jit: 0, vary: 0 }); add(G.sph(hr * 0.22, 7, 5), { c: '#4a8a3a', b: 'Head', pos: HB(0, hr * 0.15, hr * 1.02), jit: 0, vary: 0 }); add(G.sph(hr * 0.11, 6, 4), { c: '#14110c', b: 'Head', pos: HB(0, hr * 0.15, hr * 1.13), jit: 0, vary: 0 });
      add(G.box(hr * 0.9, hr * 0.12, hr * 0.2), { c: C.pelo, b: 'Head', pos: HB(0, hr * 0.55, hr * 0.8), rot: [-10, 0, 0], jit: 0.003 }); if (R.cabelo === 'topete') for (let i = 0; i < 4; i++) add(G.cone(hr * 0.15, hr * 0.5, 4), { c: C.pelo, b: 'Head', pos: HB(0, hr * 0.95, hr * (0.2 - i * 0.2)), rot: [-30 + i * 10, 0, 0], jit: 0.003 }); }
    else { eyes2(hr * 0.36, hr * 0.15, hr * 0.85, hr * (hd === 'ogro' ? 0.1 : 0.13)); for (const s of [1, -1]) add(G.box(hr * 0.4, hr * 0.1, hr * 0.15), { c: C.pelo, b: 'Head', pos: HB(s * hr * 0.36, hr * 0.38, hr * 0.85), rot: [0, 0, s * 12], jit: 0.002 }); }
    const nz = hd === 'troll' ? (R.nariz === 'enorme' ? 2.2 : 1.6) : 1;
    if (hd !== 'ciclope') add(G.ico(hr * 0.22 * nz, 0), { c: hex(C.pele, 0.92), b: 'Head', pos: HB(0, -hr * 0.05, hr * (0.95 + (nz - 1) * 0.3)), scl: [1, 0.9, 1.2], jit: 0.002 });
    if (R.nariz === 'verruga') for (let i = 0; i < 3; i++) add(G.ico(hr * 0.06, 0), { c: C.escuro, b: 'Head', pos: HB((i - 1) * hr * 0.15, hr * 0.05, hr * 1.45), jit: 0 });
    add(G.box(hr * 0.7, hr * 0.06, hr * 0.1), { c: '#2a1418', b: 'Head', pos: HB(0, -hr * 0.42, hr * 0.85), jit: 0 });
    if (hd === 'ogro' || hd === 'troll') for (const s of [1, -1]) add(G.cone(hr * 0.08, hr * 0.3, 4), { c: '#f0e8d0', b: 'Head', pos: HB(s * hr * 0.25, -hr * 0.3, hr * 0.85), jit: 0 });
    for (const s of [1, -1]) add(hd === 'troll' ? G.cone(hr * 0.15, hr * 0.6, 4) : G.sph(hr * 0.2, 6, 4), { c: C.pele, b: 'Head', pos: HB(s * hr * (hd === 'troll' ? 1.1 : 0.98), 0, 0), rot: hd === 'troll' ? [0, 0, -s * 70] : [0, 0, 0], scl: hd === 'troll' ? [1, 1, 1] : [0.5, 1, 0.8], jit: 0.002 });
    if (R.barba === 'cheia') for (let i = 0; i < 10; i++) { const a = (i / 9 - 0.5) * 2.6; add(G.ico(hr * 0.22, 0), { c: C.pelo, b: 'Head', pos: HB(Math.sin(a) * hr * 0.75, -hr * 0.55 - Math.cos(a) * hr * 0.25, hr * 0.55 + Math.cos(a) * hr * 0.2), jit: 0.006, vary: 0.12 }); }
    if (R.barba === 'gelo') for (let i = 0; i < 9; i++) { const a = (i / 8 - 0.5) * 2.4; add(G.cone(hr * 0.1, hr * (0.5 + (i % 3) * 0.25), 5), { c: C.pelo, mat: 3, b: 'Head', pos: HB(Math.sin(a) * hr * 0.7, -hr * 0.75 - (i % 3) * hr * 0.1, hr * 0.6 + Math.cos(a) * hr * 0.15), rot: [180, 0, 0], jit: 0 }); }
    if (R.elmo === 'chifres') { add(G.sph(hr * 1.05, 9, 4, 0, Math.PI / 2), { c: '#9ab0c0', metal: true, mat: 1, b: 'Head', pos: HB(0, hr * 0.15, 0), jit: 0 }); for (const s of [1, -1]) add(G.tube(HB(s * hr * 0.8, hr * 0.5, 0), HB(s * hr * 1.5, hr * 1.4, hr * 0.2), hr * 0.18, hr * 0.02, 6), { c: '#c8e8ff', mat: 3, b: 'Head', jit: 0 }); }
  }
  if (hd === 'oco') { add(G.cyl(hr * 0.95, hr, hr * 1.5, 9), { c: C.claro, metal: true, mat: 1, b: 'Head', pos: HC, jit: 0 }); add(G.sph(hr * 0.95, 9, 4, 0, Math.PI / 2), { c: C.claro, metal: true, mat: 1, b: 'Head', pos: HB(0, hr * 0.75, 0), scl: [1, 0.6, 1], jit: 0 });
    add(G.box(hr * 1.3, hr * 0.15, hr * 0.2), { c: '#0a0a0a', b: 'Head', pos: HB(0, hr * 0.15, hr * 0.92), jit: 0 }); eyes2(hr * 0.3, hr * 0.15, hr * 0.98, hr * 0.1, C.brilho, true);
    add(G.cone(hr * 0.2, hr * 1.2, 5), { c: C.capa || '#a02020', b: 'Head', pos: HB(0, hr * 1.4, -hr * 0.2), rot: [-40, 0, 0], jit: 0.003 }); }
  if (hd === 'caveira') { add(G.sph(hr * 0.95, 9, 7), { c: C.pele, mat: 3, b: 'Head', pos: HC, scl: [0.9, 1, 1.05], jit: 0 }); add(G.box(hr * 1.1, hr * 0.4, hr * 0.8), { c: C.pele, mat: 3, b: 'Head', pos: HB(0, -hr * 0.6, hr * 0.3), jit: 0 });
    eyes2(hr * 0.33, hr * 0.05, hr * 0.82, hr * 0.18, C.brilho, true); for (let i = 0; i < 5; i++) add(G.cone(hr * 0.12, hr * 0.5, 4), { c: C.claro, mat: 3, b: 'Head', pos: HB((i - 2) * hr * 0.3, hr * 0.95, -hr * 0.1), rot: [-20, 0, (i - 2) * 15], jit: 0 }); }
  if (hd === 'abobora') { for (let i = 0; i < 6; i++) add(G.sph(hr * 1.05, 8, 6), { c: i % 2 ? C.abobora : hex(C.abobora, 0.9), b: 'Head', pos: HB(Math.sin(i * 1.05) * hr * 0.25, 0, Math.cos(i * 1.05) * hr * 0.25), scl: [0.7, 0.85, 0.7], jit: 0.002 });
    add(G.tube(HB(0, hr * 0.8, 0), HB(0.02, hr * 1.1, 0), hr * 0.12, hr * 0.08, 5), { c: '#4a6a2a', b: 'Head', jit: 0 });
    for (const s of [1, -1]) add(G.cone(hr * 0.16, hr * 0.25, 3), { c: '#ffd040', glow: true, b: 'Head', pos: HB(s * hr * 0.35, hr * 0.2, hr * 1.05), rot: [90, 0, 0], jit: 0 });
    add(G.box(hr * 0.9, hr * 0.15, hr * 0.1), { c: '#ffd040', glow: true, b: 'Head', pos: HB(0, -hr * 0.3, hr * 1.02), jit: 0 });
    if (R.chapeu === 'palha') { add(G.cyl(hr * 1.9, hr * 1.9, hr * 0.06, 12), { c: '#e0c070', b: 'Head', pos: HB(0, hr * 0.85, 0), jit: 0.004 }); add(G.cyl(hr * 0.7, hr * 0.9, hr * 0.5, 10), { c: '#e0c070', b: 'Head', pos: HB(0, hr * 1.1, 0), jit: 0.004 }); }
    else { add(G.cyl(hr * 1.7, hr * 1.7, hr * 0.06, 12), { c: '#2a2238', b: 'Head', pos: HB(0, hr * 0.85, 0), jit: 0 }); add(G.cone(hr * 0.75, hr * 1.6, 8), { c: '#2a2238', b: 'Head', pos: HB(0, hr * 1.6, -hr * 0.1), rot: [-12, 0, 0], jit: 0 }); } }
  if (hd === 'arvore') { add(G.sph(hr * 0.9, 9, 7), { c: C.pele, b: 'Head', pos: HC, scl: [1, 1.1, 0.95], jit: J, vary: 0.12 }); eyes2(hr * 0.3, hr * 0.1, hr * 0.78, hr * 0.14, '#14110c');
    const cp = R.copa; for (let i = 0; i < 9; i++) { const a = i * 0.7, rr = hr * (cp === 'pontuda' ? 0.5 : 0.9);
      add(cp === 'pontuda' ? G.cone(hr * 0.6, hr * 1.4, 6) : G.ico(hr * 0.55, 0), { c: i % 2 ? C.folha : hex(C.folha, 1.15), b: 'Head', pos: HB(Math.cos(a) * rr, hr * (0.9 + (i % 3) * 0.3), Math.sin(a) * rr - hr * 0.1), jit: 0.006, vary: 0.12 }); }
    if (cp === 'flores') for (let i = 0; i < 6; i++) add(G.ico(hr * 0.15, 0), { c: C.flor, b: 'Head', pos: HB(Math.cos(i) * hr * 0.9, hr * (1.0 + (i % 2) * 0.4), Math.sin(i) * hr * 0.9), jit: 0 }); }
  if (hd === 'cacto') { add(G.sph(hr * 0.95, 9, 7), { c: C.pele, b: 'Head', pos: HC, scl: [1, 1.15, 1], jit: 0.003 }); eyes2(hr * 0.3, hr * 0.1, hr * 0.85, hr * 0.12);
    for (let i = 0; i < 8; i++) add(G.cone(0.008, 0.05, 3), { c: '#f0e8c0', b: 'Head', pos: HB(Math.cos(i * 0.8) * hr * 0.95, hr * 0.4 * Math.sin(i * 2), Math.sin(i * 0.8) * hr * 0.95), rot: [0, -i * 46, 90], jit: 0 });
    if (R.chapeu === 'flor') for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; add(G.sph(1, 5, 3), { c: C.flor, b: 'Head', pos: HB(Math.cos(a) * hr * 0.3, hr * 1.15, Math.sin(a) * hr * 0.3), scl: [hr * 0.35, hr * 0.1, hr * 0.35], jit: 0 }); }
    else { add(G.cyl(hr * 2.0, hr * 2.0, hr * 0.08, 12), { c: '#c8a050', b: 'Head', pos: HB(0, hr * 0.95, 0), jit: 0.003 }); add(G.cyl(hr * 0.6, hr * 0.8, hr * 0.6, 10), { c: '#c8a050', b: 'Head', pos: HB(0, hr * 1.25, 0), jit: 0.003 }); } }
  if (hd === 'pedra' || hd === 'magma') { add(new THREE.DodecahedronGeometry(hr, 0), { c: C.pele, b: 'Head', pos: HC, jit: J, vary: 0.12 });
    add(G.box(hr * 0.5, hr * 0.14, hr * 0.15), { c: C.brilho, glow: true, b: 'Head', pos: HB(hr * 0.33, hr * 0.12, hr * 0.85), rot: [0, 0, -10], jit: 0 }); add(G.box(hr * 0.5, hr * 0.14, hr * 0.15), { c: C.brilho, glow: true, b: 'Head', pos: HB(-hr * 0.33, hr * 0.12, hr * 0.85), rot: [0, 0, 10], jit: 0 });
    if (hd === 'magma') add(G.box(hr * 0.7, hr * 0.1, hr * 0.12), { c: C.brilho, glow: true, b: 'Head', pos: HB(0, -hr * 0.35, hr * 0.85), jit: 0 });
    if (R.chifres === 'curvos') for (const s of [1, -1]) add(G.tube(HB(s * hr * 0.6, hr * 0.5, 0), HB(s * hr * 1.2, hr * 1.1, -hr * 0.3), hr * 0.2, hr * 0.03, 5), { c: C.claro, b: 'Head', jit: 0.004 }); }
  if (hd === 'argila') { add(G.sph(hr, 10, 8), { c: C.pele, b: 'Head', pos: HC, jit: 0.002 }); for (const s of [1, -1]) { add(G.cyl(hr * 0.2, hr * 0.2, hr * 0.08, 8), { c: C.botao, b: 'Head', pos: HB(s * hr * 0.38, hr * 0.15, hr * 0.92), rot: [90, 0, 0], jit: 0 }); }
    add(G.box(hr * 0.5, hr * 0.06, hr * 0.06), { c: C.escuro, b: 'Head', pos: HB(0, -hr * 0.35, hr * 0.94), jit: 0 }); if (R.runa === 'testa') add(G.octa(hr * 0.2), { c: '#60c8ff', glow: true, b: 'Head', pos: HB(0, hr * 0.6, hr * 0.8), scl: [1, 1.2, 0.3], jit: 0 }); }
  if (hd === 'automato') { add(G.box(hr * 1.7, hr * 1.5, hr * 1.5), { c: C.pele, metal: true, mat: 1, b: 'Head', pos: HC, jit: 0 });
    for (const s of [1, -1]) { add(G.cyl(hr * 0.3, hr * 0.3, hr * 0.1, 10), { c: C.claro, metal: true, mat: 1, b: 'Head', pos: HB(s * hr * 0.42, hr * 0.15, hr * 0.78), rot: [90, 0, 0], jit: 0 }); add(G.cyl(hr * 0.18, hr * 0.18, hr * 0.12, 8), { c: C.brilho, glow: true, b: 'Head', pos: HB(s * hr * 0.42, hr * 0.15, hr * 0.8), rot: [90, 0, 0], jit: 0 }); }
    add(G.box(hr * 0.9, hr * 0.12, hr * 0.06), { c: '#2a2a2a', b: 'Head', pos: HB(0, -hr * 0.4, hr * 0.77), jit: 0 });
    if (R.cupula) { add(G.sph(hr * 0.75, 10, 5, 0, Math.PI / 2), { c: '#c0e8ff', mat: 3, b: 'Head', pos: HB(0, hr * 0.75, 0), jit: 0 }); add(G.cyl(hr * 0.35, hr * 0.35, hr * 0.06, 10), { c: C.claro, metal: true, mat: 1, b: 'Head', pos: HB(0, hr * 1.0, 0), rot: [70, 30, 0], jit: 0 }); }
    else { add(G.tube(HB(0, hr * 0.75, 0), HB(0, hr * 1.3, 0), hr * 0.05, hr * 0.05, 4), { c: C.claro, metal: true, mat: 1, b: 'Head', jit: 0 }); add(G.sph(hr * 0.12, 6, 4), { c: C.brilho, glow: true, b: 'Head', pos: HB(0, hr * 1.35, 0), jit: 0 }); } }
  if (hd === 'moedas') { for (let i = 0; i < 5; i++) add(G.cyl(hr * 0.95, hr * 0.95, hr * 0.32, 12), { c: i % 2 ? C.pele : C.claro, metal: true, mat: 1, b: 'Head', pos: HB(0, (i - 2) * hr * 0.3, 0), jit: 0.002 });
    eyes2(hr * 0.35, hr * 0.15, hr * 0.92, hr * 0.15, C.brilho, false); }
  if (hd === 'bule') { add(G.cyl(0.12 * kx, 0.17 * kx, 0.06, 12), { c: C.pele, b: 'Head', pos: HB(0, -0.08, 0), jit: 0.002 });
    if (R.tampa === 'bolinha') add(G.sph(0.04, 7, 5), { c: C.desenho, b: 'Head', pos: HB(0, -0.02, 0), jit: 0 }); else { add(G.cyl(0.13 * kx, 0.13 * kx, 0.01, 12), { c: '#1e1a1a', b: 'Head', pos: HB(0, -0.04, 0), jit: 0 }); add(G.sph(0.08 * kx, 9, 5, 0, Math.PI / 2), { c: '#1e1a1a', b: 'Head', pos: HB(0, -0.04, 0), jit: 0 }); } }
  // ---------- armas
  const F = REST.Hand_R.clone().add(V3(0, -0.045 * kx, 0)), Wsc = Math.max(1, kx * 0.95), T = (z, y = 0) => [F.x, F.y + y, F.z + z * Wsc], WR = { b: 'Hand_R' };
  const arma = R.arma;
  if (arma === 'clava') { add(G.tube(T(-0.12), T(0.62), 0.03 * Wsc, 0.075 * Wsc, 7), { c: '#6a4a2e', jit: 0.006, vary: 0.12, ...WR }); for (let i = 0; i < 4; i++) add(G.ico(0.03 * Wsc, 0), { c: '#5a3a22', pos: T(0.3 + i * 0.08, (i % 2 ? 1 : -1) * 0.05 * Wsc), jit: 0, ...WR }); }
  if (arma === 'machado') { add(G.tube(T(-0.14), T(0.6), 0.024 * Wsc, 0.022 * Wsc, 6), { c: '#6a4a2e', jit: 0.002, ...WR }); add(G.slab([[0.42, -0.03], [0.58, -0.03], [0.66, -0.24], [0.5, -0.28], [0.36, -0.24]].map(([u, v]) => [u * Wsc, v * Wsc]), 0.03 * Wsc), { c: '#a8b0b8', metal: true, mat: 1, pos: [F.x, F.y, F.z], pre: g => g.rotateY(-Math.PI / 2), jit: 0.002, ...WR }); }
  if (arma === 'martelo') { add(G.tube(T(-0.14), T(0.55), 0.024 * Wsc, 0.022 * Wsc, 6), { c: '#6a4a2e', jit: 0.002, ...WR }); add(G.box(0.12 * Wsc, 0.26 * Wsc, 0.14 * Wsc), { c: '#8a9098', metal: true, mat: 1, pos: T(0.55), jit: 0.004, ...WR }); }
  if (arma === 'espada') { add(G.tube(T(-0.07), T(0.07), 0.022, 0.022, 6), { c: '#4a2e1e', jit: 0, ...WR }); add(G.box(0.04, 0.24 * Wsc, 0.04), { c: '#c8a040', metal: true, mat: 1, pos: T(0.09), jit: 0, ...WR });
    add(G.slab([[0.1, -0.04], [0.6, -0.035], [0.7, 0], [0.6, 0.035], [0.1, 0.04]].map(([u, v]) => [u * Wsc, v * Wsc]), 0.016), { c: m === 'gelo' ? '#c8f0ff' : '#c8d0d8', mat: m === 'gelo' ? 3 : 1, metal: m !== 'gelo', pos: [F.x, F.y, F.z], pre: g => g.rotateY(-Math.PI / 2), jit: 0, ...WR });
    if (m === 'cacto') add(G.cone(0.03, 0.4, 4), { c: '#e8e0b0', pos: T(0.3), rot: [90, 0, 0], jit: 0, ...WR }); }
  if (arma === 'cajado') { add(G.tube(T(-0.4), T(0.75), 0.022 * Wsc, 0.028 * Wsc, 6), { c: '#7a5a3a', jit: 0.004, ...WR }); add(new THREE.TorusGeometry(0.06 * Wsc, 0.02 * Wsc, 5, 10, Math.PI * 1.3), { c: '#7a5a3a', pos: T(0.8, 0.04), rot: [0, 90, 0], jit: 0, ...WR }); }
  if (arma === 'foice') { add(G.tube(T(-0.5), T(0.7), 0.016, 0.016, 5), { c: '#6a4a2e', jit: 0.002, ...WR }); add(G.slab([[0, 0], [0.04, 0.02], [0.32, -0.06], [0.38, -0.16], [0.28, -0.08], [0.04, -0.02]], 0.01), { c: '#8a9098', metal: true, mat: 1, pos: T(0.68), pre: g => g.rotateY(Math.PI / 2), jit: 0, ...WR }); }
  if (arma === 'lanterna') { add(G.box(0.07, 0.1, 0.07), { c: '#3a3a3a', metal: true, mat: 1, pos: [F.x, F.y - 0.1, F.z + 0.04], jit: 0, ...WR }); add(G.box(0.05, 0.07, 0.05), { c: '#ffd060', glow: true, pos: [F.x, F.y - 0.1, F.z + 0.04], jit: 0, ...WR }); }
  if (R.escudo) { const FL = REST.ForeArm_L.clone().lerp(REST.Hand_L, 0.5), sc = Wsc; for (const [arm, base0] of [['ForeArm_L', FL]].concat(R.quatroBracos ? [['ForeArm2_L', REST.ForeArm2_L.clone().lerp(REST.Hand2_L, 0.5)]] : []))
    { add(G.cyl(0.2 * sc, 0.2 * sc, 0.03, 12), { c: m === 'metal' ? C.claro : '#8a5a2e', metal: m === 'metal', mat: m === 'metal' ? 1 : 0, b: arm, pos: [base0.x + 0.09 * sc, base0.y, base0.z], rot: [0, 0, 90], jit: 0.002 });
      add(G.sph(0.06 * sc, 7, 4), { c: '#a8b0b8', metal: true, mat: 1, b: arm, pos: [base0.x + 0.105 * sc, base0.y, base0.z], scl: [0.55, 1, 1], jit: 0 }); } }
  if (R.quatroBracos && arma !== 'nada') { const F2 = REST.Hand2_R.clone().add(V3(0, -0.045 * kx, 0)); add(G.tube([F2.x, F2.y, F2.z - 0.12], [F2.x, F2.y, F2.z + 0.5 * Wsc], 0.024 * Wsc, 0.03 * Wsc, 6), { c: '#6a4a2e', b: 'Hand2_R', jit: 0.004 }); add(G.box(0.1 * Wsc, 0.22 * Wsc, 0.12 * Wsc), { c: '#8a9098', metal: true, mat: 1, b: 'Hand2_R', pos: [F2.x, F2.y, F2.z + 0.5 * Wsc], jit: 0.004 }); }
  // ---------- poses: as mesmas dos povos, mapeadas para este corpo
  const L_ARM = [REST.UpperArm_L.distanceTo(REST.ForeArm_L), REST.ForeArm_L.distanceTo(REST.Hand_L)], L_LEG = [REST.UpLeg_L.distanceTo(REST.Leg_L), REST.Leg_L.distanceTo(REST.Foot_L)];
  const CH0 = V3(0, 0.76, 0), HEEL = V3(0, -0.115, -0.07), BALL = V3(0, -0.115, 0.1), armOut = (bel - 1) * 0.2 * kx, curv = R.curvado ? 1 : 0;
  function applyPose(P) {
    B.Hips.position.set(P.hp[0] * kx, 0.115 + (P.hp[1] - 0.115) * legK, P.hp[2] * legK); B.Hips.quaternion.copy(E(P.hr));
    B.Spine.quaternion.copy(E([P.sp[0] + 12 * curv, P.sp[1], P.sp[2]])); B.Chest.quaternion.copy(E([P.ch[0] + 18 * curv, P.ch[1], P.ch[2]])); B.Neck.quaternion.copy(E([P.nk[0] - 12 * curv, P.nk[1], P.nk[2]])); B.Head.quaternion.copy(E([P.hd[0] - 18 * curv, P.hd[1], P.hd[2]]));
    if (B.Key) B.Key.quaternion.setFromAxisAngle(V3(0, 0, 1), (P.key || 0) * D2R);
    B.Hips.updateMatrixWorld(true);
    const qc = B.Chest.getWorldQuaternion(new THREE.Quaternion());
    const sets = [['', 0]].concat(R.quatroBracos ? [['2', 1]] : []);
    for (const [suf, k2] of sets) for (const [a, L, s] of [[P.aL, '_L', 1], [P.aR, '_R', -1]]) {
      const rel = V3(...a.p).sub(CH0); rel.set(rel.x * kx + s * armOut + s * k2 * 0.05, rel.y * armK - k2 * 0.14, rel.z * armK + k2 * 0.08);
      ikPovo(B['UpperArm' + suf + L], B['ForeArm' + suf + L], B['Hand' + suf + L], B.Chest.localToWorld(rel.add(V3(0, dy * 0, 0))), V3(...a.pole).applyQuaternion(qc), L_ARM[0], L_ARM[1], false, qc.clone().multiply(a.q), true);
    }
    for (const [f, L, s] of [[P.fL, '_L', 1], [P.fR, '_R', -1]]) {
      const q = E([f.pitch, f.yaw, 0]), qy = new THREE.Quaternion().setFromAxisAngle(_Y, f.yaw * D2R), pv = f.pitch >= 0 ? BALL : HEEL;
      const ankle = V3(f.g[0] * kx, f.g[1] * legK, f.g[2] * legK).add(V3(0, 0, pv.z).applyQuaternion(qy)).sub(pv.clone().applyQuaternion(q));
      ikPovo(B['UpLeg' + L], B['Leg' + L], B['Foot' + L], ankle, V3(Math.sin(f.yaw * D2R) + s * 0.12, 0, Math.cos(f.yaw * D2R)), L_LEG[0], L_LEG[1], true, q, false);
    }
    B.Hips.updateMatrixWorld(true);
  }
  const slow = R.pesado ? 1.35 : 1;
  const clipdefs = POSES_POVO.filter(c => c.name !== 'Defender' || R.escudo).map(c => ({ name: c.name, dur: c.dur * slow, fps: c.fps, loop: c.loop,
    v: c.loco ? c.loco.S * legK / (c.loco.D * c.loco.T * slow) : undefined, fn: t2 => { const P = c.fn(Math.min(t2 / slow, c.dur - 1e-6)); if (R.chave) P.key = -360 * t2 / (c.dur * slow) * (c.name === 'Parado' ? 0.5 : 2); return P; } }));
  const P0 = finish(kit, skel, [], S.nome, clipdefs, applyPose, {});
  P0.vel = Object.fromEntries(clipdefs.filter(c => c.v).map(c => [c.name, c.v]));
  return P0;
}

// ======================================================================= entrada
export function forgeCriatura(id, cfgIn) {
  const S = ESPECIES[id], cfg = { ...baseCfgEsp(id), ...cfgIn };
  const P = S.fam === 'A' ? forgeA(id, S, cfg) : S.fam === 'C' ? forgeC(id, S, cfg) : S.fam === 'D' ? forgeD(id, S, cfg) : S.fam === 'E' ? forgeE(id, S, cfg) : S.fam === 'F' ? forgeF(id, S, cfg) : S.fam === 'G' ? forgeG(id, S, cfg) : S.fam === 'H' ? forgeH(id, S, cfg) : forgeB(id, S, cfg);
  const scale = S.tam * TAMK[cfg.tamanho] / (S.medida === 'comprimento' ? P.nominalL : P.nominalH);
  P.root.scale.setScalar(scale);
  P.root.updateMatrixWorld(true);
  P.escala = scale; P.altura = S.medida === 'comprimento' ? P.nominalH * scale : S.tam * TAMK[cfg.tamanho]; P.comprimento = P.nominalL * scale; P.vista = Math.max(P.altura, P.comprimento * 0.55);
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
