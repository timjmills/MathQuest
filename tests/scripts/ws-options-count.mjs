// How many live skills in each category show an option panel, and of what kind.
//
//   node tests/scripts/ws-options-count.mjs            # counts per category
//   node tests/scripts/ws-options-count.mjs all        # plus the skill lists
//   node tests/scripts/ws-options-count.mjs fractions  # plus the lists for one category
//
// "own" = the skill declares options of its own in skill-options.js; "measured-only" = it shows
// only what ws-options-derive measured (Max Number / Decimals / a support level); "none" = no
// control at all. Runs in bare node (no browser): data.js and skill-options.js are import-safe.
globalThis.window = globalThis;
globalThis.document = { documentElement: { classList: { add() {}, remove() {} } }, getElementById() { return null; }, querySelector() { return null; }, addEventListener() {} };
globalThis.localStorage = { getItem() { return null; }, setItem() {} };
const root = new URL('../../', import.meta.url).pathname;
const D = await import(root + 'js/modules/data.js');
const SO = await import(root + 'js/modules/skill-options.js');
await import(root + 'js/modules/skill-options-derived.js');
await import(root + 'js/modules/skill-options-pools.js');
const own = (c, s) => SO.ownOptionsFor(c, s);
const rows = {};
const detail = process.argv[2];
for (const [cat, list] of Object.entries(D.SKILLS)) {
    if (!Array.isArray(list)) continue;
    for (const s of list) {
        if (s.retired || s.v === 'custom_mixed') continue;
        const off = SO.offeredOptionsFor(cat, s.v);
        const o = own(cat, s.v);
        const r = rows[cat] = rows[cat] || { live: 0, own: 0, measuredOnly: 0, none: 0, noneList: [], measList: [], ownList: [] };
        r.live++;
        if (!off.length) { r.none++; r.noneList.push(s.v); }
        else if (!o.length) { r.measuredOnly++; r.measList.push(`${s.v}[${off.map(x => x.id).join(',')}]`); }
        else { r.own++; r.ownList.push(`${s.v}[${off.map(x => x.id).join(',')}]`); }
    }
}
const t = { live: 0, own: 0, measuredOnly: 0, none: 0 };
console.log('category'.padEnd(22), 'live', 'own', 'measured-only', 'none');
for (const [c, r] of Object.entries(rows)) {
    console.log(c.padEnd(22), String(r.live).padStart(4), String(r.own).padStart(4), String(r.measuredOnly).padStart(13), String(r.none).padStart(4));
    for (const k in t) t[k] += r[k];
    if (detail && (detail === 'all' || detail === c)) {
        if (r.noneList.length) console.log('   NONE:', r.noneList.join(' '));
        if (r.measList.length) console.log('   MEASURED:', r.measList.join(' '));
        if (detail !== 'all') console.log('   OWN:', r.ownList.join(' '));
    }
}
console.log('TOTAL'.padEnd(22), String(t.live).padStart(4), String(t.own).padStart(4), String(t.measuredOnly).padStart(13), String(t.none).padStart(4));
