// grade-of.js — the ONE helper for US grade words and order on the teacher screens (design/cards/lessons-browser §5, R3).
//
//   usGradeOfYear('R') = 'PK', 'Y1' = 'K', 'Y2' … 'Y7' = '1' … '6'   (UK Year − 1)
//   lessonGradeOf(lesson, skillGrade)  the SCHOOL grade a lesson is listed in (owner R3: the school's placement wins);
//                          only a lesson the school places nowhere uses Year − 1 (a library step lesson) or its skill's
//                          grade (a `skill:<category>:<skill>` lesson; the caller passes data.js getSkillGrade, so this
//                          file stays importable in node without the app's globals)
//   sortGrades(list)       unique, in the order PK, K, 1 … 6, M (generated chips, never a hand list)
//   gradeWord / gradeLong  'Pre-K', 'K', 'Grade 3', 'Mixed levels' / 'Kindergarten' for K
//
// Pure: no window, no DOM, no state.

export const GRADE_ORDER = ['PK', 'K', '1', '2', '3', '4', '5', '6', 'M'];

/** UK Year → US grade: R → PK, Y1 → K, Y2..Y7 → 1..6 ('' for anything else). */
export function usGradeOfYear(y) {
    const s = String(y || '').trim();
    if (s === 'R') return 'PK';
    const m = /^Y([1-7])$/.exec(s);
    if (!m) return '';
    return m[1] === '1' ? 'K' : String(+m[1] - 1);
}

/** A grade's place in GRADE_ORDER (unknown grades last). */
export const gradeRank = (g) => { const i = GRADE_ORDER.indexOf(String(g)); return i < 0 ? GRADE_ORDER.length : i; };

/** Unique grades in the order PK, K, 1 … 6, M. */
export function sortGrades(list) {
    return [...new Set((list || []).map(String).filter(Boolean))].sort((a, b) => gradeRank(a) - gradeRank(b) || a.localeCompare(b));
}

/** The chip word: 'Pre-K', 'K', 'Grade 3', 'Mixed levels'. */
export function gradeWord(g) {
    const s = String(g || '');
    if (s === 'PK') return 'Pre-K';
    if (s === 'K') return 'K';
    if (s === 'M') return 'Mixed levels';
    return /^\d$/.test(s) ? `Grade ${s}` : s;
}
/** The long word (aria labels, headings): 'Kindergarten' for K, else gradeWord. */
export const gradeLong = (g) => (String(g) === 'K' ? 'Kindergarten' : gradeWord(g));

/**
 * The grade a lesson shows under (R3). A school-sequence lesson (it carries `grade`, a WRM_SEQUENCE grade id) keeps it;
 * a `skill:<cat>:<skill>` lesson takes its skill's grade; a library step lesson ('Y3.B1.S2') its step year − 1.
 */
export function lessonGradeOf(lesson, skillGrade = null) {
    if (!lesson) return '';
    if (typeof lesson === 'object' && lesson.grade) return String(lesson.grade);
    const id = typeof lesson === 'string' ? lesson : String(lesson.id || '');
    const sk = /^skill:([a-z_]+):([a-z0-9_]+)$/.exec(id);
    if (sk) { const g = typeof skillGrade === 'function' ? skillGrade(sk[2], sk[1]) : null; return g == null ? '' : String(g); }
    const st = /^(R|Y[1-7])\.B\d+\.S\d+$/.exec(id);
    return st ? usGradeOfYear(st[1]) : '';
}
