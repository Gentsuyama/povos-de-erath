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

CEL = 256            # tamanho da célula de saída (px)
ALVO = 0.78          # altura média da criatura dentro da célula
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
        tirar = np.zeros(n + 1, bool); tirar[1:] = (area > 60) & (claro < 14)
        cheio &= ~tirar[furos]
    cheio = ndi.binary_opening(cheio, iterations=1)
    return cheio, d


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


def quadros(img, esperado=5):
    rgb = np.asarray(img.convert('RGB'))
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
    # largura típica de um quadro: das linhas em que os quadros não se encostam
    info, larg = [], []
    for y0, y1 in linhas:
        col = m[y0:y1].sum(axis=0).astype(np.float32); segs = ajustar(faixas(col, gap=3, minimo=0), col) if False else faixas(col, gap=3, minimo=0)
        # junta só pedaços realmente pequenos
        segs = [sg for sg in segs]; ws = [b - a for a, b in segs]
        sep = len(segs) >= 3 and max(ws) < 1.5 * float(np.median(ws))
        if sep: larg += ws
        info.append((y0, y1, col, segs, sep))
    W = float(np.median(larg)) if larg else None
    out = []
    for y0, y1, col, segs, sep in info:
        x_ini, x_fim = segs[0][0], segs[-1][1]
        if sep: cortes = [segs[0][0]] + [(segs[k][1] + segs[k + 1][0]) // 2 for k in range(len(segs) - 1)] + [segs[-1][1]]
        else:
            n = max(1, int(round((x_fim - x_ini) / (W * 1.08)))) if W else esperado
            cortes = [x_ini]
            for t in range(1, n):
                alvo = x_ini + (x_fim - x_ini) * t // n; r = int((x_fim - x_ini) / n * 0.3)
                jan = col[max(x_ini, alvo - r):alvo + r]; cortes.append(max(x_ini, alvo - r) + int(np.argmin(jan)))
            cortes.append(x_fim)
        n = len(cortes) - 1
        faixa = m[y0:y1]; lab, nl = ndi.label(faixa)
        dono = np.zeros_like(lab)                                     # célula dona de cada pixel
        for k, sl in enumerate(ndi.find_objects(lab), start=1):
            if sl is None: continue
            comp = lab[sl] == k; xs = np.nonzero(comp)[1] + sl[1].start
            if xs.max() - xs.min() < (x_fim - x_ini) / n * 1.4:           # pedaço inteiro vai para a célula do seu centro
                c = min(n - 1, max(0, int(np.searchsorted(cortes, xs.mean()) - 1)))
                dono[sl][comp] = c + 1
            else:                                                         # quadros grudados: corta pelas colunas
                cc = np.clip(np.searchsorted(cortes, np.arange(sl[1].start, sl[1].stop), side='right') - 1, 0, n - 1) + 1
                dono[sl][comp] = np.broadcast_to(cc, comp.shape)[comp]
        for c in range(1, n + 1):
            mm_full = dono == c
            if mm_full.sum() < 50: continue
            ys, xs = np.nonzero(mm_full); a0, a1, b0, b1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
            mm = mm_full[a0:a1, b0:b1]
            alfa = Image.fromarray((mm * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
            rgba = Image.fromarray(np.ascontiguousarray(rgb[y0 + a0:y0 + a1, b0:b1])).convert('RGBA'); rgba.putalpha(alfa)
            out.append({'img': rgba, 'h': a1 - a0, 'cx': (xs - b0).mean(), 'base': a1 - a0 - 1, 'w': b1 - b0})
    if out:
        med = float(np.median([q['h'] * q['w'] for q in out])); out = [q for q in out if q['h'] * q['w'] > med * 0.25]
    return out


def montar(qs, escala, mov):
    hmed = float(np.median([q['h'] for q in qs]))
    cels = []
    for q in qs:
        k = escala
        if mov != 'atacar' and abs(q['h'] - hmed) / hmed > 0.12: k *= hmed / q['h']    # ruído de escala da IA (não é movimento)
        im = q['img'].resize((max(1, round(q['img'].width * k)), max(1, round(q['img'].height * k))), Image.LANCZOS)
        cel = Image.new('RGBA', (CEL, CEL), (0, 0, 0, 0))
        x = round(CEL / 2 - q['cx'] * k); y = round(CEL * 0.94 - q['base'] * k)            # centro de massa no meio, pés numa linha
        cel.paste(im, (x, y), im)
        cels.append(cel)
    return cels


def main(src, dst):
    os.makedirs(dst, exist_ok=True)
    arqs = sorted(f for f in os.listdir(src) if f.endswith('.jpg'))
    grupos = {}
    for f in arqs:
        cri, mov, d = f[:-4].split('_'); grupos.setdefault(cri, []).append((mov, d, f))
    man = {}
    for cri, itens in grupos.items():
        fat = {(mov, d): quadros(Image.open(os.path.join(src, f))) for mov, d, f in itens}
        os.makedirs(os.path.join(dst, cri), exist_ok=True); man[cri] = {}
        for (mov, d), qs in fat.items():
            if not qs: print('vazio', cri, mov, d); continue
            hmed = float(np.median([q['h'] for q in qs]))
            esc = CEL * ALVO / hmed                                                          # cada folha vem num zoom diferente: iguala pela altura mediana
            cels = montar(qs, esc, mov)
            D = DIRS[d]
            for nome, lista in [(D, cels)] + ([(ESPELHO[D], [c.transpose(Image.FLIP_LEFT_RIGHT) for c in cels])] if D in ESPELHO else []):
                tira = Image.new('RGBA', (CEL * len(lista), CEL), (0, 0, 0, 0))
                for i, c in enumerate(lista): tira.paste(c, (i * CEL, 0))
                tira.save(os.path.join(dst, cri, f'{mov}_{nome}.webp'), quality=88, method=5)
                man[cri].setdefault(mov, {})[nome] = len(lista)
            print(f'{cri:8} {mov:7} {D:2} {len(cels):2} quadros')
    json.dump({'celula': CEL, 'criaturas': man}, open(os.path.join(dst, 'manifesto.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
