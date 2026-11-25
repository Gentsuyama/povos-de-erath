"""Fatia folhas de sprites geradas no Google Flow (10 quadros em grade, fundo branco) em animações de 8 direções.

uso: python sprites/fatiar_folhas.py <pasta_das_folhas> <pasta_saida>
  folhas: <criatura>_<movimento>_<dir>.jpg com dir em frente, 34frente, perfil, 34costas, costas
saída: <pasta_saida>/<criatura>/<movimento>_<D8>.webp (tira horizontal de quadros) + manifesto.json
  D8 (tela): S, SE, E, NE, N geradas; SW, W, NW espelhadas de SE, E, NE.
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

DIRS = {'frente': 'S', '34frente': 'SE', 'perfil': 'E', '34costas': 'NE', 'costas': 'N'}
ESPELHO = {'SE': 'SW', 'E': 'W', 'NE': 'NW'}


def mascara(rgb):
    """fundo = branco ligado à borda; o claro de dentro (peito, barriga) continua opaco"""
    d = 255.0 - rgb.astype(np.float32).min(axis=2)               # quão longe do branco
    duro = d > 22
    duro = ndi.binary_closing(duro, iterations=2)
    cheio = ndi.binary_fill_holes(duro)
    furos, n = ndi.label(cheio & ~duro)                                  # buracos: vão entre as pernas (branco) volta a ser fundo;
    if n:                                                                 # brilho pequeno no olho ou no casco continua opaco
        area = ndi.sum(np.ones_like(d), furos, range(1, n + 1)); claro = ndi.mean(d, furos, range(1, n + 1))
        tirar = np.zeros(n + 1, bool); tirar[1:] = (area > 60) & (claro < 6)
        cheio &= ~tirar[furos]
    cheio = ndi.binary_opening(cheio, iterations=1)
    return cheio, d


def centro_nucleo(mm):
    """x do miolo do corpo: tira as partes finas (cajado, lança, pernas finas, cauda) e pega o maior pedaço"""
    h = mm.shape[0]; e = ndi.binary_erosion(mm, iterations=max(2, int(h * 0.025)))
    if e.sum() < mm.sum() * 0.08: e = ndi.binary_erosion(mm, iterations=max(1, int(h * 0.01)))
    if e.sum() < 30: return float(np.nonzero(mm)[1].mean())
    lab, n = ndi.label(e)
    if n > 1: ar = ndi.sum(e, lab, range(1, n + 1)); e = lab == (int(np.argmax(ar)) + 1)
    return float(np.nonzero(e)[1].mean())


def bacias(dd, mm, mk):
    """watershed por fila de prioridade: inunda das sementes pelas partes mais grossas primeiro; a fronteira cai nos pontos finos"""
    import heapq
    lab = np.where(mk > 0, mk, 0).astype(np.int32); H, W = mm.shape; fila = []
    for y, x in zip(*np.nonzero(lab)): heapq.heappush(fila, (-dd[y, x], y, x))
    while fila:
        _, y, x = heapq.heappop(fila); l = lab[y, x]
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < H and 0 <= nx < W and mm[ny, nx] and not lab[ny, nx]:
                lab[ny, nx] = l; heapq.heappush(fila, (-dd[ny, nx], ny, nx))
    return lab


def faixas(perfil, gap=4, minimo=1):
    """trechos contínuos com conteúdo, separados por pelo menos `gap` posições vazias"""
    ok = perfil > minimo; out = []; ini = None; vazio = 0
    for i, v in enumerate(ok):
        if v:
            if ini is None: ini = i
            vazio = 0
        elif ini is not None:
            vazio += 1
            if vazio >= gap: out.append([ini, i - vazio + 1]); ini = None; vazio = 0
    if ini is not None: out.append([ini, len(ok)])
    return out


def ajustar(segs, perfil):
    """junta pedaços estreitos (pata/antena solta) e divide blocos largos (quadros encostados)"""
    if not segs: return segs
    for _ in range(20):
        ws = [b - a for a, b in segs]; med = float(np.median(ws))
        k = min(range(len(segs)), key=lambda i: ws[i])
        if ws[k] >= med * 0.45 or len(segs) == 1: break
        if k == 0: j = 1
        elif k == len(segs) - 1: j = k - 1
        else: j = k - 1 if segs[k][0] - segs[k - 1][1] < segs[k + 1][0] - segs[k][1] else k + 1
        a, b = min(k, j), max(k, j); segs[a] = [segs[a][0], segs[b][1]]; del segs[b]
    ws = [b - a for a, b in segs]; med = float(np.median(ws)); out = []
    for a, b in segs:
        n = int(round((b - a) / med))
        if n >= 2 and (b - a) > med * 1.6:
            cortes = [a]
            for t in range(1, n):
                alvo = a + (b - a) * t // n; r = int(med * 0.25)
                janela = perfil[max(a, alvo - r):min(b, alvo + r)]
                cortes.append(max(a, alvo - r) + int(np.argmin(janela)) if len(janela) else alvo)
            cortes.append(b); out += [[cortes[t], cortes[t + 1]] for t in range(n)]
        else: out.append([a, b])
    return out


def apagar_chao(rgb):
    """apaga linhas de chão finas (guia de pose): faixa cinza horizontal longa com branco logo acima e abaixo"""
    a = rgb.copy(); f = a.astype(np.int16); H, W = f.shape[:2]
    cinza = (f.max(2) - f.min(2) < 18) & (f.min(2) > 110) & (f.max(2) < 235)
    for y in range(3, H - 3):
        lin = cinza[y]
        if lin.sum() < W * 0.08: continue
        branco = lambda yy: f[yy].min(1) > 238
        ok = lin & (branco(y - 3) | branco(y + 3))
        lab, n = ndi.label(ok)
        for i in range(1, n + 1):
            xs = np.nonzero(lab == i)[0]
            if len(xs) > W * 0.04: a[max(0, y - 2):y + 3, xs[0]:xs[-1] + 1] = 255
    return a

def quadros(img, esperado=5):
    rgb = apagar_chao(np.asarray(img.convert('RGB')))
    m, d = mascara(rgb)
    perfil = np.convolve(m.sum(axis=1).astype(np.float32), np.ones(9) / 9, mode='same')
    linhas = faixas(m.sum(axis=1), gap=6, minimo=2)
    def partir(a, b):                                                  # linhas grudadas (pata encostando na linha de baixo): corta no vale mais fundo
        if b - a <= m.shape[0] * 0.55: return [[a, b]]
        i0, i1 = a + (b - a) // 6, b - (b - a) // 6; c = i0 + int(np.argmin(perfil[i0:i1]))
        if perfil[c] > perfil[a:b].max() * 0.4: return [[a, b]]
        return partir(a, c) + partir(c, b)
    linhas = [q for a, b in linhas for q in partir(a, b)]
    hmed = float(np.median([b - a for a, b in linhas]))
    def forcar(a, b):                                                  # faixa com o dobro da altura das outras = duas linhas grudadas
        k = int(round((b - a) / hmed))
        if k < 2 or (b - a) < hmed * 1.6: return [[a, b]]
        cortes = [a]
        for t in range(1, k):
            alvo = a + (b - a) * t // k; r = int((b - a) / k * 0.3); cortes.append(max(a, alvo - r) + int(np.argmin(perfil[max(a, alvo - r):alvo + r])))
        cortes.append(b); return [[cortes[t], cortes[t + 1]] for t in range(k)]
    if len(linhas) > 1: linhas = [q for a, b in linhas for q in forcar(a, b)]
    hs = [b - a for a, b in linhas]
    linhas = [l for l, h in zip(linhas, hs) if h > max(hs) * 0.3]
    out = []
    for y0, y1 in linhas:
        faixa = m[y0:y1]; lab, nl = ndi.label(faixa, structure=np.ones((3, 3)))
        if nl == 0: continue
        objs = ndi.find_objects(lab); areas = ndi.sum(faixa, lab, range(1, nl + 1))
        corpos = [k for k in range(nl) if areas[k] >= areas.max() * 0.25]          # pedaço grande = um corpo (ou corpos grudados)
        larg = [objs[k][1].stop - objs[k][1].start for k in corpos]; wb = float(np.median(larg))
        if len(corpos) < 4:                                                            # menos corpos que o esperado (5 por linha): estão grudados
            xs_ln = np.nonzero(faixa.any(axis=0))[0]; wb = min(wb, (xs_ln.max() - xs_ln.min()) / 5)
        quadros_ln = []                                                                # cada quadro = máscara na faixa
        for k in corpos:
            comp = lab == k + 1; w = objs[k][1].stop - objs[k][1].start; n = int(round(w / wb))
            if w > wb * 1.55 and n >= 2:                                                # corpos grudados (arma encostando): bacias com n sementes
                dd = ndi.distance_transform_edt(comp); mk = np.zeros(comp.shape, np.int32); d2 = dd.copy(); faixa_x = w / n * 0.45
                for t in range(n):
                    yy, xx = np.unravel_index(int(np.argmax(d2)), d2.shape)
                    if d2[yy, xx] <= 0: break
                    Y, X = np.ogrid[:comp.shape[0], :comp.shape[1]]; mk[(np.hypot(Y - yy, X - xx) < max(3, dd[yy, xx] * 0.5)) & comp] = t + 1
                    d2[:, max(0, int(xx - faixa_x)):int(xx + faixa_x)] = 0
                bac = bacias(dd, comp, mk)
                quadros_ln += [bac == t for t in range(1, n + 1) if (bac == t).sum() > 50]
            else: quadros_ln.append(comp)
        # pedaços pequenos (ponta de arma, pé solto) vão para o corpo mais perto, se estiver perto
        cx = [np.nonzero(q)[1].mean() for q in quadros_ln]
        for k in range(nl):
            if k in corpos: continue
            sl = objs[k]; mx = (sl[1].start + sl[1].stop) / 2
            dists = [min(abs(mx - np.nonzero(q)[1].min()), abs(mx - np.nonzero(q)[1].max()), 0 if np.nonzero(q)[1].min() <= mx <= np.nonzero(q)[1].max() else 1e9) for q in quadros_ln]
            j = int(np.argmin(dists))
            if dists[j] < wb * 0.5: quadros_ln[j] = quadros_ln[j] | (lab == k + 1)
        for mm_full in sorted(quadros_ln, key=lambda q: np.nonzero(q)[1].mean()):
            ys, xs = np.nonzero(mm_full); a0, a1, b0, b1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
            mm = mm_full[a0:a1, b0:b1]
            alfa = Image.fromarray((mm * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
            rgba = Image.fromarray(np.ascontiguousarray(rgb[y0 + a0:y0 + a1, b0:b1])).convert('RGBA'); rgba.putalpha(alfa)
            out.append({'img': rgba, 'h': a1 - a0, 'cx': centro_nucleo(mm), 'base': a1 - a0 - 1, 'w': b1 - b0})
    if out:
        med = float(np.median([q['h'] * q['w'] for q in out])); out = [q for q in out if q['h'] * q['w'] > med * 0.25]
    if len(out) > 2:                                                       # quadro largo demais = dois bichos juntos: divide de novo
        wmed = float(np.median([q['w'] for q in out])); novo = []
        for q in out:
            k = int(round(q['w'] / wmed))
            novo += redividir(q, k) if q['w'] > wmed * 1.6 and k >= 2 else [q]
        out = novo
    return out


def redividir(q, k):
    """bacias com k sementes nos miolos mais grossos, afastadas na horizontal"""
    a = np.asarray(q['img']); mm = a[..., 3] > 127; dd = ndi.distance_transform_edt(mm)
    mk = np.zeros(mm.shape, np.int32); mk[~mm] = -1; d2 = dd.copy(); faixa = q['w'] / k * 0.45
    for i in range(k):
        y, x = np.unravel_index(int(np.argmax(d2)), d2.shape)
        if d2[y, x] <= 0: break
        yy, xx = np.ogrid[:mm.shape[0], :mm.shape[1]]; mk[(np.hypot(yy - y, xx - x) < max(3, dd[y, x] * 0.5)) & mm] = i + 1
        d2[:, max(0, int(x - faixa)):int(x + faixa)] = 0
    bac = bacias(dd, mm, mk)
    partes = []
    for i in range(1, k + 1):
        m2 = (bac == i) & mm
        if m2.sum() < 50: continue
        ys, xs = np.nonzero(m2); a0, a1, b0, b1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        sub = a[a0:a1, b0:b1].copy(); sub[..., 3] = np.where(m2[a0:a1, b0:b1], sub[..., 3], 0)
        partes.append((b0, {'img': Image.fromarray(sub), 'h': a1 - a0, 'cx': centro_nucleo(m2[a0:a1, b0:b1]), 'base': a1 - a0 - 1, 'w': b1 - b0}))
    return [p for _, p in sorted(partes, key=lambda t: t[0])] or [q]


ALTURA = 200         # altura mediana da criatura em px (a célula cresce em volta do maior quadro)
FOLGA = 10


def altura_util(q):
    m = np.asarray(q['img'])[..., 3] > 127; w = m.sum(1); lim = w.max() * 0.14
    rows = np.nonzero(w >= lim)[0]
    return float(q['base'] - rows.min() + 1) if len(rows) else float(q['h'])


def limpar(qs, mov):
    """descarta quadros-lixo: altura muito fora da mediana (pedaço, ou dois bichos empilhados)"""
    if len(qs) < 4: return qs
    hmed = float(np.median([q['h'] for q in qs])); lo, hi = 0.5, 1.85                          # arma erguida aumenta a altura: só tira lasca e linha empilhada
    return [q for q in qs if lo <= q['h'] / hmed <= hi]


def escalas(qs, mov):
    """escala de cada quadro. A folha inteira vai para ALTURA (pela mediana). Fora do ataque, cada quadro é
    reescalado pela altura útil (pés até o topo do corpo, sem ponta de arma): acaba o "cresce e encolhe" da IA"""
    hmed = float(np.median([q['h'] for q in qs])); base = ALTURA / hmed
    if mov == 'atacar': return [base] * len(qs)
    hu = [altura_util(q) for q in qs]; hum = float(np.median(hu))
    return [base * hum / h for h in hu]


def transformar(cel, s, dx, px, py):
    """escala em volta do pivô (pés) e desloca na horizontal"""
    if abs(s - 1) < 1e-3 and abs(dx) < 0.5: return cel
    a = 1 / s; c = px - (px + dx) / s; e = 1 / s; f = py - py / s
    return cel.transform(cel.size, Image.AFFINE, (a, 0, c, 0, e, f), resample=Image.BICUBIC)


def registrar(cels, mov, px, py, frac=0.25, escala=False):
    """tira o tremor e a mudança de tamanho: encaixa cabeça+tronco de cada quadro sobre o quadro de referência
    (escala em volta dos pés + deslocamento horizontal); os pés continuam no chão e as pernas livres"""
    if len(cels) < 3 or mov == 'atacar': return cels
    from scipy.signal import fftconvolve
    A = [np.asarray(c)[..., 3] > 127 for c in cels]
    hs = [(lambda r: r.max() - r.min() if len(r) else 0)(np.nonzero(a.any(1))[0]) for a in A]
    r = int(np.argsort(hs)[len(hs) // 2])
    ref = A[r]; ys = np.nonzero(ref.any(1))[0]; topo, hh = ys.min(), ys.max() - ys.min()
    def banda(m):                                                        # metade de cima do corpo (cabeça e tronco)
        b = np.zeros(m.shape, np.float32); yy = np.nonzero(m.any(1))[0]
        if len(yy): t = yy.min(); b[t:t + int(hh * frac)] = m[t:t + int(hh * frac)]
        return b
    br = banda(ref); sr = br.sum(); W = ref.shape[1]; lim_dx = int(W * 0.2)
    out = []
    for i, c in enumerate(cels):
        if i == r: out.append(c); continue
        melhor = (-1, 1.0, 0)
        for sc in (np.arange(0.88, 1.121, 0.02) if escala else [1.0]):
            m = np.asarray(transformar(c, sc, 0, px, py))[..., 3] > 127
            bm = banda(m)
            if bm.sum() == 0: continue
            corr = fftconvolve(bm, br[::-1, ::-1], mode='same')[ref.shape[0] // 2]   # só deslocamento horizontal (dy = 0)
            cx0 = W // 2; jan = corr[max(0, cx0 - lim_dx):cx0 + lim_dx + 1]
            j = int(np.argmax(jan)); dice = 2 * jan[j] / (sr + bm.sum())
            if dice > melhor[0]: melhor = (dice, sc, -(j + max(0, cx0 - lim_dx) - cx0))
        out.append(transformar(c, melhor[1], melhor[2], px, py))
    return out


def cabeca_x(m):
    """centro do miolo da cabeça: topo do corpo, sem hastes finas (cajado, lança, machado erguido)"""
    yy = np.nonzero(m.any(1))[0]
    if not len(yy): return None
    t, h = yy.min(), yy.max() - yy.min(); b = m[t:t + max(4, int(h * 0.24))]
    e = ndi.binary_erosion(b, iterations=max(2, int(h * 0.012)))
    if e.sum() < 20: e = b
    lab, n = ndi.label(e)
    if n > 1: ar = ndi.sum(e, lab, range(1, n + 1)); e = lab == (int(np.argmax(ar)) + 1)
    return float(np.nonzero(e)[1].mean())


def estabilizar(cels, mov, px, py):
    """tremor: a cabeça fica no mesmo x em todos os quadros (pés no chão, altura já igualada)"""
    if len(cels) < 3 or mov == 'atacar': return cels
    xs = [cabeca_x(np.asarray(c)[..., 3] > 127) for c in cels]
    ok = [x for x in xs if x is not None]
    if not ok: return cels
    alvo = float(np.median(ok))
    return [transformar(c, 1.0, alvo - x, px, py) if x is not None else c for c, x in zip(cels, xs)]


def passo(cels, py, H):
    """quanto o personagem anda por quadro (px da célula): 2 passos por ciclo; passo = abertura máxima dos pés − largura do pé"""
    ws = []
    for c in cels:
        m = np.asarray(c)[..., 3] > 127; faixa = m[max(0, py - int(H * 0.07)):py + 1]
        xs = np.nonzero(faixa.any(0))[0]; ws.append(xs.max() - xs.min() if len(xs) else 0)
    if not ws or max(ws) == 0: return 0
    return round(2 * (max(ws) - min(ws)) / len(cels), 2)


def limitar_vel(v):
    """velocidade medida pela varredura vale como está; só socorre arte que não anda (v≈0, ciclo sem passo)"""
    vel = v.get('vel', {}); a = vel.get('andar', 0); c = vel.get('correr', 0)
    if a < 2: a = 6.0; v.setdefault('aviso', []).append('andar sem passo na arte')
    if c < a * 1.3: c = a * 2.2; v.setdefault('aviso', []).append('correr sem passo na arte')
    v['vel'] = {'andar': round(a, 2), 'correr': round(c, 2)}


def pes_chao(m):
    """centros x dos pés que tocam o chão (faixa de 3,5% da altura acima da base)"""
    ys = np.nonzero(m.any(1))[0]; b = ys.max(); h = b - ys.min()
    band = ndi.binary_closing(m[int(b - h * 0.035):b + 1].any(0), iterations=3); lab, n = ndi.label(band)
    return [float(np.nonzero(lab == i)[0].mean()) for i in range(1, n + 1) if (lab == i).sum() >= 4]

def vel_medida(cels, vmax=90.0):
    """velocidade (px/quadro) que deixa o pé de apoio mais parado no chão: varre v e minimiza o deslize médio.
    Arte que não anda (pernas paradas) dá v≈0; ciclo de passo de verdade dá um mínimo claro."""
    P = [pes_chao(np.asarray(c)[..., 3] > 127) for c in cels]; n = len(P); melhor = (0.0, 1e9)
    for v in np.arange(0, vmax + 0.01, 0.5):
        d = [min(abs(p + k * v - q - (k + 1) * v) for p in P[k] for q in P[(k + 1) % n]) for k in range(n) if P[k] and P[(k + 1) % n]]
        if d and np.mean(d) < melhor[1]: melhor = (float(v), float(np.mean(d)))
    if melhor[1] > 12:
        # corrida: o pé de apoio troca a cada 1-2 quadros e a varredura fica plana; usa quanto o pé no chão recua
        rec = [P[k][0] - P[k + 1][0] for k in range(n - 1) if len(P[k]) == 1 and len(P[k + 1]) == 1 and 5 <= P[k][0] - P[k + 1][0] <= vmax]
        if len(rec) >= 2: melhor = (float(np.median(rec)), -1.0)
    return melhor

def main(src, dst):
    os.makedirs(dst, exist_ok=True)
    arqs = sorted(f for f in os.listdir(src) if f.endswith('.jpg'))
    grupos = {}
    for f in arqs:
        cri, mov, d = f[:-4].split('_'); grupos.setdefault(cri, []).append((mov, d, f))
    man = {}
    for cri, itens in grupos.items():
        fat = {(mov, d): limpar(quadros(Image.open(os.path.join(src, f))), mov) for mov, d, f in itens}
        ks = {key: escalas(qs, key[0]) for key, qs in fat.items() if qs}
        # célula da criatura: cabe o quadro mais largo e o mais alto de todas as animações, com o pivô nos pés, no centro
        meia = max(max(q['cx'] * k, (q['w'] - q['cx']) * k) for key in ks for q, k in zip(fat[key], ks[key]))
        alto = max(q['base'] * k for key in ks for q, k in zip(fat[key], ks[key]))
        W = int(np.ceil(meia)) * 2 + FOLGA * 2; H = int(np.ceil(alto)) + FOLGA * 2; px, py = W // 2, H - FOLGA
        os.makedirs(os.path.join(dst, cri), exist_ok=True); man[cri] = {'celula': [W, H], 'pivo': [px, py], 'anim': {}}
        for (mov, d), qs in fat.items():
            if not qs: print('vazio', cri, mov, d); continue
            cels = []
            for q, k in zip(qs, ks[(mov, d)]):
                im = q['img'].resize((max(1, round(q['img'].width * k)), max(1, round(q['img'].height * k))), Image.LANCZOS)
                cel = Image.new('RGBA', (W, H), (0, 0, 0, 0)); cel.paste(im, (round(px - q['cx'] * k), round(py - q['base'] * k)), im); cels.append(cel)
            D = DIRS[d]
            if D == 'E' and mov in ('andar', 'correr'):
                v, desl = vel_medida(cels); man[cri].setdefault('vel', {})[mov] = round(v, 2); man[cri].setdefault('deslize', {})[mov] = round(desl, 1)
            for nome, lista in [(D, cels)] + ([(ESPELHO[D], [c.transpose(Image.FLIP_LEFT_RIGHT) for c in cels])] if D in ESPELHO else []):
                tira = Image.new('RGBA', (W * len(lista), H), (0, 0, 0, 0))
                for i, c in enumerate(lista): tira.paste(c, (i * W, 0))
                tira.save(os.path.join(dst, cri, f'{mov}_{nome}.webp'), quality=88, method=5)
                man[cri]['anim'].setdefault(mov, {})[nome] = len(lista)
        print(f'{cri:8} célula {W}x{H}  ' + ' '.join(f'{m}_{DIRS[d]}:{len(q)}' for (m, d), q in fat.items() if len(q) != 10))
    for v in man.values(): limitar_vel(v)
    json.dump({'criaturas': man}, open(os.path.join(dst, 'manifesto.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
