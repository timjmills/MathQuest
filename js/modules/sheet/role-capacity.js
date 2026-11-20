// sheet/role-capacity.js - every page role's DESIGNED capacity ceiling, per size (EBLAST r3, 2026-11-20).
// Pure (SCC-01): no window, no DOM, no state. Sourced from WORKSHEET_DESIGN_STANDARD.md §12.1 "Ceilings by page role"
// ("a ceiling is never exceeded; a smaller count is always allowed") and the role module that enforces it.
//
// Why it exists (critic eblast r1 / r2, round cap): the page-fill rules (ws-empty-band EB-LASTPAGE / CAP-PARITY) INFERRED a
// page's capacity from its white space ("another row fits"), so a page full BY DESIGN (Mixed practice L at its 5-row
// ceiling; a Scripted Model's fixed frames) read as a defect. The rules now read this table instead.
//
//   by    'role'    - the role chooses its own count (counts()) up to the ceiling: judged by the page-fill rules
//         'teacher' - the teacher's count sets it (PG-23: a last page may end short): not judged
//         'fixed'   - a fixed layout (one problem and its frames, banded parts, a fixed probe): not a capacity, not judged
//         'table'   - capacity comes from a per-skill ladder / fit table, not one ceiling: not judged
//   unit  'items' (cells a page) or 'rows' (shelves a page, Mixed practice)
//   M, L  the ceiling a page at that size (the upper end of a §12.1 range); null where the role has none (by 'table')
//   cite  where the value comes from
export const ROLE_CAPACITY = Object.freeze({
    'independent': { by: 'teacher', unit: 'items', M: 6, L: 6, cite: 'WDS §12.1 Independent / More Practice 6 (16 one-symbol; DN-1a dense packing); PG-23 teacher count' },
    'more-practice': { by: 'teacher', unit: 'items', M: 6, L: 6, cite: 'WDS §12.1 Independent / More Practice (as independent); PG-23 teacher count' },
    'guided': { by: 'role', unit: 'items', M: 8, L: 6, cite: 'WDS §12.1 Guided page 8 / 3-6 tries plus the Model; guided.js CEILING' },
    'error-analysis': { by: 'role', unit: 'items', M: 4, L: 4, cite: 'WDS §12.1 Error analysis 4 / 2-4; error-analysis.js CEILING' },
    'review': { by: 'role', unit: 'items', M: 12, L: 12, cite: 'WDS §12.1 Review 12 / 8-12; review.js CEILING' },
    'test': { by: 'role', unit: 'items', M: 16, L: 12, cite: 'WDS §12.1 Test A / B 16 / 12 (procedures 4); test.js CEILING' },
    'pre-skill-check': { by: 'role', unit: 'items', M: 20, L: 16, cite: 'WDS §12.1 Pre-skill check up to 20 / up to 16; PAGE_TYPES PT-PRE-1 four quadrants on one page' },
    'mixed-practice': { by: 'role', unit: 'rows', M: 7, L: 5, cite: 'WDS §12.1 Mixed practice 7 rows / 5 rows (unit-packed); mixed-practice.js MAX_SHELVES' },
    'true-false': { by: 'role', unit: 'items', M: 6, L: 4, cite: 'WDS §12.1 True or False? 6 / 4; true-false.js CEILING' },
    'reason-it': { by: 'role', unit: 'items', M: 3, L: 2, cite: 'WDS §12.1 Reason It 3 / 2; reason-it.js ROWS' },
    'word-problems': { by: 'role', unit: 'items', M: 3, L: 3, cite: 'WDS §12.1 Word problems, plain rows 3 / 3 (2 if 4-5 lines); word-problems.js PER_PAGE' },
    'stretch': { by: 'fixed', unit: 'items', M: 2, L: 1, cite: 'WDS §12.1 Stretch 1-2 / 1: one open task and its results table' },
    'scripted-model': { by: 'fixed', unit: 'items', M: 1, L: 1, cite: 'WDS §12.1 Scripted model: 1 problem, 3-6 frames, same at every size (the frames are not a capacity)' },
    'opener': { by: 'fixed', unit: 'items', M: 5, L: 5, cite: 'WDS §12.1 Lesson opener 1-2 Model + 3 / 1-2 + 2-3 Guided, plus bands (banded layout)' },
    'lesson': { by: 'fixed', unit: 'items', M: null, L: null, cite: 'PAGE_TYPES lesson: banded parts (PT-ENG-3), the remainder stays blank at the foot' },
    'fact-probe': { by: 'fixed', unit: 'items', M: 20, L: 20, cite: 'WDS §12.1 Fact probe 20 / 20 (fixed probe)' },
    'fact-rows': { by: 'table', unit: 'items', M: null, L: null, cite: 'WDS §12.1 Fact rows: by ladder table, 25-90 (12.3), not one ceiling' },
});

/** The declared capacity of a role, or null when it declares none. */
export const roleCapacity = (role) => ROLE_CAPACITY[role] || null;

/** Whether a measured page {rows, items} is AT (or above) its role's declared ceiling at `size` (true = full by design). */
export function atCeiling(role, size, pg) {
    const c = roleCapacity(role);
    if (!c || !pg || !Number.isFinite(c[size])) return false;
    const n = c.unit === 'rows' ? pg.rows : pg.items;
    return Number.isFinite(n) && n >= c[size];
}

/** The declaration defects of a list of roles: a role with no entry, or a judged role ('role') without numeric M / L. */
export function capacityGaps(roles) {
    const out = [];
    for (const r of roles) {
        const c = ROLE_CAPACITY[r];
        if (!c) { out.push(`${r}: declares no capacity ceiling`); continue; }
        if (!['role', 'teacher', 'fixed', 'table'].includes(c.by)) out.push(`${r}: unknown 'by' ${c.by}`);
        if (!c.cite) out.push(`${r}: no source cited`);
        if (c.by === 'role' && !(Number.isFinite(c.M) && Number.isFinite(c.L))) out.push(`${r}: judged ('role') but no M / L ceiling`);
    }
    return out;
}
