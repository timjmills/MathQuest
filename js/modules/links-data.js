// links-data.js — loads the curated link files the tagging lanes write (data/curriculum/links/):
//   index.json        { "years": ["R", "Y1", …], "map": true|false } — which files exist (so a missing
//                     file never costs a failed request or a console error)
//   <YEAR>.json       per White Rose year: steps (direct / partial / verdict / missing / pre / related /
//                     build / preBuild) and proposals (skills still to make)
//   MAP.json          the MAP Growth audit: rows (task, strand, RIT band, status, skills, proposal) and
//                     proposals
// The White Rose, MAP and "Skills to be made" screens all read through this one loader, once per page.
// Every screen keeps working without the files (computed fallbacks).

let loading = null;

/** → Promise<{ years: {Y3: data, …}, map: data|null }>; never rejects. */
export function loadLinksData() {
    if (loading) return loading;
    const get = (f) => fetch(`data/curriculum/links/${f}`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    loading = get('index.json').then(async (idx) => {
        const out = { years: {}, map: null };
        if (!idx || typeof idx !== 'object') return out;
        const years = Array.isArray(idx.years) ? idx.years.filter((y) => /^(R|Y[1-6])$/.test(y)) : [];
        const files = await Promise.all(years.map((y) => get(`${y}.json`)));
        years.forEach((y, i) => { if (files[i] && files[i].steps) out.years[y] = files[i]; });
        if (idx.map) out.map = await get('MAP.json');
        return out;
    });
    return loading;
}
