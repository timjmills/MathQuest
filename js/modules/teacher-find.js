// teacher-find.js — the ONE search-and-filter bar of the teacher screens (owner ruling
// 2026-09-26, design/TEACHER_SCREENS.md "Browsing skills, sets, lessons"): grade, domain, a code
// (CCSS, EE or White Rose small step / unit) and text, with the same List | Thumbnails toggle
// in the same place, remembered per teacher (teacher-preview.js skillView).
//
//   codeHits(q)            a Set of 'category:skill' keys when q is a code, else null
//   findBarHTML(ns, st)    the bar (ids prefixed by ns); controls carry data-find="q|grade|domain"
//   findSkills(st)         the catalogue filtered by the bar's state {q, grade, domain}
//
// Codes: 3.OA.7, 3.OA, EE.3.OA.6, M.EE.3.OA.6 (standards.js), Y3.B1 or Y3.B1.S4 (wrm.js).

import { icon, esc, skillCatalogue, levelText } from './teacher-ui.js';
import { viewToggleHTML } from './teacher-preview.js';
import { looksLikeStandardCode, findStandard, skillsForStandard, skillsMatchingCode } from './standards.js';
import { skillsForWrmStep, WRM_STEPS } from './wrm.js';

const WRM_RE = /^(R|Y[1-6])(\.B\d{1,2}(\.S\d{1,2})?)?$/i;

/** The skills a code names ('category:skill' keys), or null when q is not a code. */
export function codeHits(q) {
    const t = String(q || '').trim();
    if (!t) return null;
    if (WRM_RE.test(t)) {
        const id = t.toUpperCase();
        const steps = WRM_STEPS.filter((s) => s.id === id || s.id.startsWith(`${id}.`));
        return new Set(steps.flatMap((s) => skillsForWrmStep(s.id)));
    }
    try {
        if (looksLikeStandardCode(t)) return new Set(findStandard(t) ? skillsForStandard(t) : skillsMatchingCode(t));
    } catch (e) { /* not a code */ }
    return null;
}

const LEVELS = ['K', '1', '2', '3', '4', '5', '6', 'M'];

/** The bar: text (or a code), grade, domain, and the List | Thumbnails toggle. */
export function findBarHTML(ns, st, view) {
    const domains = [...new Map(skillCatalogue().map((s) => [s.domainId, s.domainName])).entries()];
    return `<div class="tv-find" role="search" aria-label="Find a skill">
  <div class="tv-search tv-find-q"><label class="tv-sr" for="${ns}Q">Search skills or a code</label>${icon('search', 18)}<input id="${ns}Q" class="tv-input" type="search" data-find="q" value="${esc(st.q || '')}" placeholder="Search, or a code: 3.NBT.2, EE.3.OA.2, Y3.B1" autocomplete="off"></div>
  <div><label class="tv-sr" for="${ns}G">Grade</label><select id="${ns}G" class="tv-select" data-find="grade"><option value="">All levels</option>${LEVELS.map((l) => `<option value="${l}"${st.grade === l ? ' selected' : ''}>${esc(levelText(l))}</option>`).join('')}</select></div>
  <div><label class="tv-sr" for="${ns}D">Domain</label><select id="${ns}D" class="tv-select" data-find="domain"><option value="">All domains</option>${domains.map(([id, name]) => `<option value="${esc(id)}"${st.domain === id ? ' selected' : ''}>${esc(name)}</option>`).join('')}</select></div>
  ${view ? viewToggleHTML(view) : ''}
</div>`;
}

/** The catalogue filtered by the bar's state. */
export function findSkills(st = {}) {
    const hits = codeHits(st.q);
    const words = hits ? [] : String(st.q || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    return skillCatalogue().filter((s) => {
        if (st.grade && s.level !== st.grade) return false;
        if (st.domain && s.domainId !== st.domain) return false;
        if (hits) return hits.has(`${s.categoryId}:${s.skillId}`);
        if (!words.length) return true;
        const hay = `${s.label} ${s.categoryName} ${s.domainName} ${s.skillId.replace(/_/g, ' ')}`.toLowerCase();
        return words.every((w) => hay.includes(w));
    });
}

export default { codeHits, findBarHTML, findSkills };
