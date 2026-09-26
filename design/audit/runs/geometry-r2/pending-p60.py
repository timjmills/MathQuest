import os
os.chdir('/home/user/MathQuest/.claude/worktrees/agent-a7a96a9df845ec37d')
p='js/modules/sheet/cells/solid-kit.js'
s=open(p).read()
def rep(old, new):
    global s
    assert old in s, old[:80]
    s = s.replace(old, new, 1)
rep("""const FIT_W = { S: 54, M: 80, L: 80 };
""", """const FIT_W = { S: 54, M: 80, L: 80 };
// geometry-r2 (footprints: a volume page held 4 at L): the solid stands BESIDE its answers - the
// solid on the left, "Volume =" over its box on the right - in a half-page cell at every size, so
// a page holds 3 rows at L and 4 at S. A story's bare sketch is a small picture beside one-line
// answers. The unit is then written once under the row ("All lengths are in cm.").
const FIG_BESIDE = { S: { w: 30, h: 21 }, M: { w: 34, h: 25 }, L: { w: 38, h: 28 } };
const SKETCH_BESIDE = { S: { w: 18, h: 13 }, M: { w: 20, h: 15 }, L: { w: 22, h: 17 } };
const FIT_BESIDE = { S: 46, M: 46, L: 46 };
const BESIDE_COL = { S: { wMm: 93, maxCols: 2 }, M: { wMm: 93, maxCols: 2 }, L: { wMm: 93, maxCols: 2 } };
/** Beside when every label finds its place in the narrower room (else the solid stands over its answers). */
export function besideOf(p, ctx = null) {
    if (!ctx) return true;
    try {
        const f = solidSVG(p, ctx, { beside: true });
        return !f.labels.some((lb) => lb.forced) && f.W <= FIT_BESIDE[sizeOf(ctx)] + 2;
    } catch (e) { return true; }
}
""")
rep("""export function solidSVG(p, ctx) {
    const size = sizeOf(ctx);
    const bb = bounds(p);
    const dPt = labelPt(ctx), uPt = textPt(ctx), dMm = dPt * PT_MM;
    const unit = unitOnLabels(p) ? String(p.unit || '') : '';
    const labW = (v) => textW(v, dPt) + (unit && v !== '?' ? textW(` ${unit}`, uPt) : 0);
    // a story's sketch is smaller (the story is the item; the sketch is a picture of it)
    let k = Math.min(FIG[size].w / (bb.x1 - bb.x0 || 1), FIG[size].h / (bb.y1 - bb.y0 || 1)) * (p.sketch ? 0.6 : 1);""",
"""export function solidSVG(p, ctx, { beside = false } = {}) {
    const size = sizeOf(ctx);
    const bb = bounds(p);
    const dPt = labelPt(ctx), uPt = textPt(ctx), dMm = dPt * PT_MM;
    const unit = unitOnLabels(p) && !beside ? String(p.unit || '') : '';
    const labW = (v) => textW(v, dPt) + (unit && v !== '?' ? textW(` ${unit}`, uPt) : 0);
    // a story's sketch is smaller (the story is the item; the sketch is a picture of it)
    const small = beside && p.sketch && !(p.labels || []).length;
    const fig = small ? SKETCH_BESIDE[size] : beside ? FIG_BESIDE[size] : FIG[size];
    const FIT = beside ? FIT_BESIDE : FIT_W;
    let k = Math.min(fig.w / (bb.x1 - bb.x0 || 1), fig.h / (bb.y1 - bb.y0 || 1)) * (p.sketch && !small ? 0.6 : 1);""")
rep("""        if (placed.some((q) => q.forced) && tries < 8 && (X1 - X0) * 1.12 + 3 <= FIT_W[size]) { k *= 1.12; continue; }
        if (X1 - X0 + 3 <= FIT_W[size] || tries === 8) break;
        k *= Math.max(0.6, (FIT_W[size] - 3 - (X1 - X0 - (bb.x1 - bb.x0) * k)) / ((bb.x1 - bb.x0) * k));""",
"""        if (placed.some((q) => q.forced) && tries < 8 && (X1 - X0) * 1.12 + 3 <= FIT[size]) { k *= 1.12; continue; }
        if (X1 - X0 + 3 <= FIT[size] || tries === 8) break;
        k *= Math.max(0.6, (FIT[size] - 3 - (X1 - X0 - (bb.x1 - bb.x0) * k)) / ((bb.x1 - bb.x0) * k));""")
rep("""    return { html: svg(ctx, W, H, body, { cls: 'sk-solid', label: aria }), W, H, gap: glyphGap(dPt),""",
"""    return { html: svg(ctx, W, H, body, { cls: 'sk-solid', label: aria }), W, H, gap: glyphGap(dPt), beside,""")
rep("""function answerLine(p, ctx, a) {
    const trace = ctx.state === 'traced' || (ctx.state === 'blank' && p.traced);
    const bctx = trace ? { ...ctx, state: 'traced' } : ctx;
    const b = box(bctx, { id: a.id, value: shown(p, ctx, a), w: blankWidth(Math.max(2, String(a.ans).length), sizeOf(ctx)), h: S(ctx).writeMm + 2, mark: 'blank' });
    const t = (s) => `<span style="font-size:${P(ctx, textPt(ctx))};line-height:1.2;white-space:nowrap;">${esc(s)}</span>`;
    return""",
"""function answerLine(p, ctx, a, stacked = false) {
    const trace = ctx.state === 'traced' || (ctx.state === 'blank' && p.traced);
    const bctx = trace ? { ...ctx, state: 'traced' } : ctx;
    const b = box(bctx, { id: a.id, value: shown(p, ctx, a), w: blankWidth(Math.max(2, String(a.ans).length), sizeOf(ctx)), h: S(ctx).writeMm + 2, mark: 'blank' });
    const t = (s) => `<span style="font-size:${P(ctx, textPt(ctx))};line-height:1.2;white-space:nowrap;">${esc(s)}</span>`;
    if (stacked) {
        return `<div class="sk-ask" style="display:flex;flex-direction:column;align-items:flex-start;gap:${L(ctx, 0.8)};">${t(`${a.label} =`)}`
            + `<div style="display:flex;align-items:center;gap:${L(ctx, 1.5)};">${b}${a.unit ? t(a.unit) : ''}</div></div>`;
    }
    return""")
rep("""        const bare = p.sketch && !hintsOn(p, ctx);
        const f = solidSVG(bare ? { ...p, labels: [] } : p, ctx);
        const story = (p.story || []).length
            ? `<div class="sk-story" style="font-size:${P(ctx, textPt(ctx) + 2)};""",
"""        const bare = p.sketch && !hintsOn(p, ctx);
        const q = bare ? { ...p, labels: [] } : p;
        const beside = besideOf(q, ctx);
        const f = solidSVG(q, ctx, { beside });
        const story = (p.story || []).length
            ? `<div class="sk-story" style="font-size:${P(ctx, textPt(ctx) + 1)};""")
rep("""        const unitLine = !bare && p.unit && !unitOnLabels(p) && (p.labels || []).length""",
"""        const unitLine = !bare && p.unit && (!unitOnLabels(p) || beside) && (p.labels || []).length""")
rep("""        const asks = (p.ask || []).map((a) => answerLine(p, ctx, a)).join('');
        return root(ctx, `${story}""",
"""        if (beside && f.html) {
            // the given line over the row [solid | answers], the unit line under it, one 2 mm column
            const asks = (p.ask || []).map((a) => answerLine(p, ctx, a, !bare)).join('');
            return root(ctx, `${story}<div style="display:flex;flex-direction:column;align-items:center;gap:${L(ctx, 2)};">${given}`
                + `<div class="sk-beside" style="display:flex;align-items:center;justify-content:center;gap:${L(ctx, 4)};"><div style="line-height:0;">${f.html}</div>`
                + `<div style="display:flex;flex-direction:column;align-items:flex-start;gap:${L(ctx, 2)};">${asks}</div></div>${unitLine}</div>${formula}`);
        }
        const asks = (p.ask || []).map((a) => answerLine(p, ctx, a)).join('');
        return root(ctx, `${story}""")
rep("""    footprint(p, ctx) {
        const col = SOLID_COL[sizeOf(ctx)];""",
"""    footprint(p, ctx) {
        const q = p.sketch && !hintsOn(p, ctx) ? { ...p, labels: [] } : p;
        const col = (besideOf(q, ctx) ? BESIDE_COL : SOLID_COL)[sizeOf(ctx)];""")
open(p,'w').write(s)

p='js/modules/gen-geo-kit.js'
s=open(p).read()
rep("""    { first: (n) => `${n} has a fish tank shaped like a rectangular prism.`, unit: 'ft' },
    { first: (n) => `${n} packs a storage box.`, unit: 'ft' },
    { first: (n) => `${n} builds a sandbox with straight sides.`, unit: 'ft' },
    { first: (n) => `${n} wraps a gift box.`, unit: 'in' },
    { first: (n) => `${n} fills a planter shaped like a rectangular prism.`, unit: 'm' },""",
"""    // geometry-r2 (footprints): three short lines, so a story is no taller than a drawn solid
    { first: (n) => `${n}'s fish tank is a rectangular prism.`, unit: 'ft' },
    { first: (n) => `${n}'s storage box is a rectangular prism.`, unit: 'ft' },
    { first: (n) => `${n}'s sandbox is a rectangular prism.`, unit: 'ft' },
    { first: (n) => `${n}'s gift box is a rectangular prism.`, unit: 'in' },
    { first: (n) => `${n}'s planter is a rectangular prism.`, unit: 'm' },""")
rep("""            `What is its volume in cubic ${UNIT_NAME[unit]}?`,""", """            'What is its volume?',""")
open(p,'w').write(s)
print('done')
