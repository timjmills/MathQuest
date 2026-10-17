// detailed-links.js — the DETAILED lessons (data/curriculum/detailed-lessons.json, made with the V22 lesson maker
// inside the sheet kit) as the White Rose lessons screen shows them (WRM page round 9).
//
// The file's shape (meta.joins): lessons[] { id, title (I Can), ownerTitle, grade, siteLessonId (= site-lessons.json
// lessons[].id), wrmSteps[], skills { used [{key, opts, role}], proposed [text] }, pack { pdf, html, … }, status }.
// A record joins a school-site lesson by `siteLessonId` and, when it names them, White Rose steps by `wrmSteps`.
//
// Every teacher-facing word is composed or passes plain-words.js WHOLE (ruling 6): the title (else the owner's title),
// the skills by their own labels (the page's labeler), and each proposed item only when it reads as plain English.
// Paths: only a path inside this site or an https link is ever followed.
//
// Pure: no window, no DOM, no state.

import { isPlain, plainNote } from './plain-words.js';

/** A link the page may follow: an https URL, or a path inside this site (no "..", no scheme). */
export const safeHref = (u) => (typeof u === 'string' && /^(?:https:\/\/[^\s"'<>]+|[A-Za-z0-9_][A-Za-z0-9_./%-]*)$/.test(u) && !/\.\./.test(u) ? u : '');

/** A proposed item in plain words: "Follow-on lesson: Write numbers to 1,000 in words", "New option: story type", or ''. */
export function proposedName(raw) {
    const t = String(raw || '').replace(/\s+/g, ' ').replace(/\s*->\s*/g, ' → ').replace(/(^|[\s(])x (?=\d)/g, '$1× ').trim();
    if (!t) return '';
    const m = /^(follow-on lessons?|new skill|option|redo)\b\s*(?:[0-9a-z]{1,3}\b)?\s*:?\s*(.*)$/i.exec(t);
    const kind = m ? m[1].toLowerCase() : '';
    const body = m ? m[2] : t;
    const lead = /^follow-on lessons/.test(kind) ? 'Follow-on lessons' : /^follow-on/.test(kind) ? 'Follow-on lesson' : kind === 'new skill' ? 'New skill' : kind === 'option' ? 'New option' : kind === 'redo' ? 'To redo' : '';
    const tries = [body, body.replace(/\s*\([^()]*\)/g, '').replace(/\s+-\s+.*$/, '').trim()];
    // an option or skill named by its code: its bracket says what it is ("option wpSituation (story type)")
    const br = /\(([^()]+)\)/.exec(body);
    if (br && !/:/.test(br[1])) tries.push(br[1]);
    for (const x of tries) {
        if (!x) continue;
        const line = lead ? `${lead}: ${x}` : x;
        const p = plainNote(line);
        if (p && isPlain(x, { fragment: false })) return p.replace(/\.$/, '');
    }
    return '';
}

/** One file record → what the screen needs, or null when it cannot be joined. */
export function detailedRecord(r) {
    if (!r || typeof r !== 'object' || !r.id) return null;
    const title = [r.title, r.ownerTitle].map((t) => String(t || '').trim()).find((t) => t && isPlain(t)) || 'Detailed lesson';
    const used = ((r.skills && r.skills.used) || [])
        .filter((x) => x && /^[a-z_]+:[a-z0-9_]+$/.test(String(x.key || '')))
        .map((x) => ({ key: x.key, opts: x.opts && typeof x.opts === 'object' && Object.keys(x.opts).length ? x.opts : null }));
    const build = [...new Set(((r.skills && r.skills.proposed) || []).map(proposedName).filter(Boolean))];
    return {
        id: String(r.id), title, grade: String(r.grade || ''), site: String(r.siteLessonId || ''),
        steps: (r.wrmSteps || []).filter((s) => typeof s === 'string'),
        pack: safeHref(r.pack && (r.pack.pdf || r.pack.html)), used, build, status: String(r.status || ''),
    };
}

/** The file → { bySite: Map(site id → [rec]), byStep: Map(step id → [rec]), all: [rec] }. */
export function indexDetailed(data) {
    const list = Array.isArray(data) ? data : data && Array.isArray(data.lessons) ? data.lessons : [];
    const all = list.map(detailedRecord).filter(Boolean);
    const bySite = new Map();
    const byStep = new Map();
    const add = (m, k, rec) => { if (!k) return; if (!m.has(k)) m.set(k, []); m.get(k).push(rec); };
    for (const rec of all) {
        add(bySite, rec.site, rec);
        for (const s of rec.steps) add(byStep, s, rec);
    }
    return { bySite, byStep, all };
}

/** The detailed lessons of one White Rose screen lesson (its site id, then its step), each once. */
export function detailedOf(index, lesson) {
    if (!index || !lesson) return [];
    const out = [];
    for (const rec of [...(index.bySite.get(lesson.site || '') || []), ...(index.byStep.get(lesson.step || '') || [])]) if (!out.includes(rec)) out.push(rec);
    return out;
}

/** Every line a teacher reads about one detailed lesson (for the gates; the screen composes the same words). */
export function detailedTexts(rec, labelOf = () => null) {
    const labels = rec.used.map((x) => labelOf(x.key)).filter(Boolean);
    return [
        `Detailed lesson: ${rec.title}`,
        DETAILED_CAP,
        labels.length ? `Its skills: ${labels.join(', ')}.` : '',
        rec.build.length ? `Still to make: ${rec.build.join('; ')}.` : '',
        ...DETAILED_BUTTONS,
    ].filter(Boolean);
}
export const DETAILED_CAP = 'A whole lesson made for this school lesson: teacher pages, the pupil packet and every answer key.';
export const DETAILED_BUTTONS = ['Open the detailed lesson', 'Practice link', 'Make it'];
