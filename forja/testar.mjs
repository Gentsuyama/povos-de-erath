// Teste rápido de uma família do bestiário: node forja/testar.mjs <A|B|C|D|E...>
import { ESP_ORDEM, ESPECIES, forgeCriatura, baseCfgEsp, randomCfgEsp, rng } from './erath_criaturas.js';
let bad = 0; const r = rng(9), fam = process.argv[2];
for (const id of ESP_ORDEM.filter(k => ESPECIES[k].fam === fam)) { try { const t0 = Date.now(); const P = forgeCriatura(id, baseCfgEsp(id)); for (let i = 0; i < 4; i++) forgeCriatura(id, randomCfgEsp(id, r));
  console.log(String(ESPECIES[id].num).padStart(3), id.padEnd(24), P.tris, 'tri', P.clips.map(c => c.name).join('/'), [...new Set(P.info.molas)].join(','), (Date.now() - t0) + 'ms', JSON.stringify(Object.fromEntries(Object.entries(P.vel).map(([k, v]) => [k, +v.toFixed(2)])))); }
  catch (e) { bad++; console.log('ERRO', id, e.message, e.stack.split('\n').slice(1, 3).join(' | ')); } }
console.log('falhas', bad, 'total', ESP_ORDEM.length);
