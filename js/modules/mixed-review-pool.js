// mixed-review-pool.js — the APP side of the mixed review page type (card design/cards/mixed-review/mixed-review.md §7a,
// §9b step 2). The dealer itself is js/modules/mixed-review.js (DEALER V1, frozen by sha256); this file builds what it reads:
//   - poolRows():        the live registry rows {id, code, grade, area, kind, placement, passed} the dealer filters;
//   - placementGrades(): a skill's SCHOOL placement (the school grades whose pacing lessons link it, allLessons() + linksFor);
//   - DEFAULT_FILTERS:   the panel's defaults (lead rulings §9.6, §9.15);
//   - weightsFrom():     the screen-only adapt weights (EX-MXR-ADAPT, §7a Weighting): never read on print.
// Rules (card §10 L4, L5): a row carries its footprint KIND (the provider's StaticFootprint.kind, recorded as is), never a
// class `fc`, so V1's frozen KIND_CLASS / rowOf decides the class; a row's code is FROZEN_SKILL_CODES[id], never an
// auto-assigned code. MIXED and NOSTD skills are never rows (§7a areas). The checks: ws-mix-review --check pool / share.

import { SKILLS, getSkillGrade } from './data.js';
import { areaOf } from './teacher-areas.js';
import { FROZEN_SKILL_CODES } from './skill-codes-frozen.js';
import { REDESIGN_PASSED } from './redesign-passed.js';
import { getProvider } from './sheet/index.js';
import { allLessons, linksFor } from './wrm-links.js';

/** The panel's defaults: 10 problems, order mixed, week off, from my lessons off, only 8/10 OFF (§9.6, §9.15). */
export const DEFAULT_FILTERS = Object.freeze({ grades: [], areas: [], onlyPassed: false, untick: [], fromLessons: false, count: 10, order: 'mixed', week: false });

/** A lesson's grade as a chip: PK (WRM Reception) sits under K; 6 and above under 6+ ('6'). */
const chipOf = (g) => (g === 'PK' || g === 'K' ? 'K' : Number(g) >= 6 ? '6' : String(g));

let PLACEMENT = null;
/** id -> [chip grades] from the school pacing: every sequenced lesson's direct skills (curated, else SKILL_WRM). */
function placementMap() {
    if (PLACEMENT) return PLACEMENT;
    PLACEMENT = new Map();
    for (const lesson of allLessons()) {
        if (!lesson || !lesson.seq || !lesson.grade) continue;
        const links = linksFor(lesson);
        for (const d of (links && links.direct) || []) {
            const set = PLACEMENT.get(d.key) || new Set();
            set.add(chipOf(lesson.grade));
            PLACEMENT.set(d.key, set);
        }
    }
    return PLACEMENT;
}
/** A skill's school placement grades (sorted K, 1 .. 6), or [] when no pacing lesson links it. */
export function placementGrades(id) {
    const order = ['K', '1', '2', '3', '4', '5', '6'];
    return [...(placementMap().get(id) || [])].sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

/** The provider's static footprint kind, recorded as is ('legacy' when the provider authors none). */
export function footprintKind(categoryId, skillId) {
    try {
        const p = getProvider(categoryId, skillId);
        const f = typeof p.footprint === 'function' ? p.footprint({ categoryId, skillId }) : p.footprint;
        return (f && f.kind) || 'legacy';
    } catch (e) { return 'legacy'; }
}

/** The live registry: one row per live (not retired) skill with a frozen code, outside MIXED / NOSTD. */
export function poolRows() {
    const rows = [];
    for (const [categoryId, list] of Object.entries(SKILLS)) {
        for (const s of list || []) {
            if (!s || s.retired || !s.v) continue;
            const id = `${categoryId}:${s.v}`;
            const area = areaOf(categoryId, s.v);
            if (area === 'MIXED' || area === 'NOSTD') continue;
            const code = FROZEN_SKILL_CODES[id];
            if (!code) continue;
            const g = getSkillGrade(s.v, categoryId);
            rows.push({ id, code, grade: g == null ? 'M' : String(g), area, kind: footprintKind(categoryId, s.v), placement: placementGrades(id), passed: REDESIGN_PASSED.has(id) });
        }
    }
    return rows;
}

/** Screen-only adapt weights (EX-MXR-ADAPT): w = 1 + due + weak, in 1..4, keyed by bare skill id as progress.js keys it.
 *  due = 1 when sr[id].nextReview <= today (+1 more at Leitner box 1 or 2); weak = 1 when progress[id].total >= 5 and
 *  mastery < 70; a skill with no record has w = 1. `ids` are the bare ids of the code's listed skills. */
export function weightsFrom(progress = {}, sr = {}, ids = [], today = new Date().toISOString().slice(0, 10)) {
    const out = {};
    for (const id of ids) {
        const r = sr && sr[id]; const p = progress && progress[id];
        const due = r && r.nextReview && String(r.nextReview).slice(0, 10) <= today ? 1 + (Number(r.box) === 1 || Number(r.box) === 2 ? 1 : 0) : 0;
        const weak = p && Number(p.total) >= 5 && Number(p.mastery) < 70 ? 1 : 0;
        out[id] = 1 + due + weak;
    }
    return out;
}
