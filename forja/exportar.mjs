// Exporta os personagens prontos para o jogo:  npm run exportar   (ou: node forja/exportar.mjs [variações por raça])
// Saída em personagens/: <raca>/<raca>_padrao.glb + variações sorteadas (semente fixa, sempre iguais), catalogo.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { RACAS, RACA_ORDEM, catsOf, baseCfg, randomCfg, nameOf, forge, exportGeometry, rng, CLIPDEF, combinacoes } from './erath_forja.js';
import { ESPECIES, ESP_ORDEM, catsOfEsp, baseCfgEsp, randomCfgEsp, nomeVariacao, forgeCriatura, exportGeometry as exportGeoC, rng as rngC, combinacoesEsp } from './erath_criaturas.js';

// o GLTFExporter usa FileReader para o binário; o Node não tem
globalThis.FileReader ??= class { readAsArrayBuffer(b) { b.arrayBuffer().then(r => { this.result = r; this.onloadend?.(); }); }
  readAsDataURL(b) { b.arrayBuffer().then(r => { this.result = 'data:application/octet-stream;base64,' + Buffer.from(r).toString('base64'); this.onloadend?.(); }); } };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'personagens');
const NVAR = +(process.argv[2] || 4);
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');

function toGLB(P, geoFn = exportGeometry) {
  P.restPose(); P.root.updateMatrixWorld(true);
  P.mesh.geometry = geoFn(P);
  return new Promise((res, rej) => new GLTFExporter().parse(P.root, b => res(Buffer.from(b)), rej, { binary: true, animations: P.clips }));
}
const catalogo = { gerado: new Date().toISOString().slice(0, 10), versao_three: '0.160.0', animacoes: CLIPDEF.map(c => ({ nome: c.name, duracao: c.dur, loop: !!c.loop })),
  convencoes: { unidade: 'metro', cima: '+Y', frente: '+Z', esquerda_do_personagem: '+X', materiais: ['fosco', 'metal', 'brilho (sem luz)'] }, racas: {} };
let total = 0;
for (const raca of RACA_ORDEM) {
  const R = RACAS[raca], dir = path.join(OUT, raca); fs.mkdirSync(dir, { recursive: true });
  const lista = [{ arquivo: `${raca}_padrao.glb`, cfg: baseCfg(raca) }];
  const r = rng(1000 + RACA_ORDEM.indexOf(raca));
  for (let i = 0; i < NVAR; i++) { const c = randomCfg(raca, r); let f = `${raca}_${slug(nameOf(raca, c)[0])}`, k = 2;
    while (lista.some(x => x.arquivo === f + '.glb')) f = `${raca}_${slug(nameOf(raca, c)[0])}${k++}`;
    lista.push({ arquivo: f + '.glb', cfg: c }); }
  const ents = [];
  for (const it of lista) {
    const P = forge(raca, it.cfg), buf = await toGLB(P);
    fs.writeFileSync(path.join(dir, it.arquivo), buf); total += buf.length;
    const [nome, epiteto] = nameOf(raca, it.cfg);
    ents.push({ arquivo: `${raca}/${it.arquivo}`, nome, epiteto, kb: Math.round(buf.length / 1024), triangulos: P.tris, ossos: P.info.ossos, molas: P.info.molas,
      velocidade_andar: +P.meas.Andar.v.toFixed(3), velocidade_correr: +P.meas.Correr.v.toFixed(3), cfg: it.cfg });
    console.log(`${raca.padEnd(10)} ${it.arquivo.padEnd(34)} ${String(Math.round(buf.length / 1024)).padStart(4)} KB  ${P.tris} tri`);
  }
  catalogo.racas[raca] = { nome: R.nome, titulo: R.titulo, combinacoes: combinacoes(raca), categorias: catsOf(raca).map(c => ({ chave: c.k, nome: c.n, opcoes: c.o.map(o => ({ chave: o[0], nome: o[1] })) })), personagens: ents };
}
// ---------- criaturas (bestiário): padrão + variações sorteadas
const NVC = +(process.argv[3] || 2);
catalogo.criaturas = {};
for (const id of ESP_ORDEM) {
  const S = ESPECIES[id], dir = path.join(OUT, 'criaturas', id); fs.mkdirSync(dir, { recursive: true });
  const r = rngC(5000 + S.num), lista = [{ arquivo: `${id}_padrao.glb`, cfg: baseCfgEsp(id) }];
  for (let i = 0; i < NVC; i++) { const c = randomCfgEsp(id, r); lista.push({ arquivo: `${id}_${slug(nomeVariacao(id, c))}.glb`, cfg: c }); }
  const ents = [];
  for (const it of lista) {
    const P = forgeCriatura(id, it.cfg), buf = await toGLB(P, exportGeoC);
    fs.writeFileSync(path.join(dir, it.arquivo), buf); total += buf.length;
    ents.push({ arquivo: `criaturas/${id}/${it.arquivo}`, variacao: nomeVariacao(id, it.cfg), kb: Math.round(buf.length / 1024), triangulos: P.tris, ossos: P.info.ossos,
      molas: [...new Set(P.info.molas)], altura_m: +P.altura.toFixed(3), animacoes: P.clips.map(c => c.name), velocidades: Object.fromEntries(Object.entries(P.vel).map(([k, v]) => [k, +v.toFixed(3)])), cfg: it.cfg });
  }
  catalogo.criaturas[id] = { num: S.num, nome: S.nome, grupo: S.grupo, familia: S.fam, voa: !!S.voa, tamanho_m: S.tam, descricao: S.desc, combinacoes: combinacoesEsp(id),
    categorias: catsOfEsp(id).map(c => ({ chave: c.k, nome: c.n, opcoes: c.o.map(o => ({ chave: o[0], nome: o[1] })) })), arquivos: ents };
  console.log(`criatura ${String(S.num).padStart(3)} ${id.padEnd(22)} ${ents.map(e => e.kb + 'KB').join(' ')}`);
}
fs.writeFileSync(path.join(OUT, 'catalogo.json'), JSON.stringify(catalogo, null, 1));
console.log(`OK ${RACA_ORDEM.length * (NVAR + 1)} povos + ${ESP_ORDEM.length * (NVC + 1)} criaturas, ${(total / 1048576).toFixed(2)} MB em ${OUT}`);
