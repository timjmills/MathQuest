// links-data.js — loads the curated link files the tagging lanes write (data/curriculum/links/):
//   index.json        { "years": ["R", "Y1", …], "map": true|false, "detailed": true|false } — which files exist
//                     (so a missing file never costs a failed request or a console error). Generated from the
//                     files on disk: node tests/scripts/ws-wrm-page-unit.mjs --write-index
//   <YEAR>.json       may also hold a top-level "lessons" section: the school site's own lessons, keyed by their
//                     site id (data/curriculum/site-lessons.json), with the same record shape as a step
//   <YEAR>.json       per White Rose year: steps (direct / partial / verdict / missing / pre / related /
//                     build / preBuild) and proposals (skills still to make)
//   MAP.json          the MAP Growth audit: rows (task, strand, RIT band, status, skills, proposal) and
//                     proposals
// Files load ON DEMAND, each once per page (critic r1 M5): the White Rose screen asks for the years of the
// unit on screen, the MAP page for MAP.json, and only "Skills to be made" for everything.
// Every screen keeps working without the files (computed fallbacks). Nothing here ever rejects.

let idxP = null;
const yearP = {};
let mapP = null;
let detP = null;

const get = (f) => fetch(`data/curriculum/links/${f}`).then((r) => (r.ok ? r.json() : null)).catch(() => null);

/** → Promise<{ years: [...], map: bool, detailed: bool }> */
export function loadIndex() {
    if (!idxP) {
        idxP = get('index.json').then((idx) => ({
            years: idx && Array.isArray(idx.years) ? idx.years.filter((y) => /^(R|Y[1-6])$/.test(y)) : [],
            map: !!(idx && idx.map),
            detailed: !!(idx && idx.detailed),
        }));
    }
    return idxP;
}

/** One year's file, or null when it does not exist. */
export function loadYear(y) {
    if (!yearP[y]) yearP[y] = loadIndex().then((idx) => (idx.years.includes(y) ? get(`${y}.json`) : null)).then((d) => (d && d.steps ? d : null));
    return yearP[y];
}

/** MAP.json, or null. */
export function loadMap() {
    if (!mapP) mapP = loadIndex().then((idx) => (idx.map ? get('MAP.json') : null));
    return mapP;
}

/**
 * The DETAILED lessons (round 9: the real file, data/curriculum/detailed-lessons.json, made with the V22 lesson maker).
 * Fetched only when index.json says "detailed": true. Shape (its meta.joins): { meta, lessons: [{ id, title, grade,
 * siteLessonId (= site-lessons.json lessons[].id), wrmSteps[], skills { used [{key, opts, role}], proposed [] },
 * pack { pdf, html }, … }] }. detailed-links.js indexes it for the White Rose screen.
 * → Promise<{ meta, lessons: [...] } | null>
 */
export function loadDetailed() {
    if (!detP) {
        detP = loadIndex().then((idx) => (idx.detailed ? fetch('data/curriculum/detailed-lessons.json').then((r) => (r.ok ? r.json() : null)).catch(() => null) : null))
            .then((d) => (d && Array.isArray(d.lessons) ? d : null));
    }
    return detP;
}

/** Everything: → { years: {Y3: data, …}, map: data|null }. */
export function loadLinksData() {
    return loadIndex().then(async (idx) => {
        const out = { years: {}, map: null };
        const files = await Promise.all(idx.years.map(loadYear));
        idx.years.forEach((y, i) => { if (files[i]) out.years[y] = files[i]; });
        out.map = await loadMap();
        return out;
    });
}
