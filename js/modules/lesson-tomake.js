// lesson-tomake.js — "Skills to be made for this lesson" (owner 2026-10-17: "on the white rose page clearly say all of
// the planned/needed/added skills that will be made to fully cover that lesson/standard … per lesson", then "per
// grade/domain").
//
// ONE de-duplicated list per lesson, gathered from every source that plans work for it:
//   1. the lesson's own build list (links.build: the curated year file's `build`);
//   2. WRM_PROPOSALS (wrm.js) whose steps or improves name the lesson's White Rose step, and every Skills to be made
//      entry (build-queue.js) that names the step or the school-site lesson;
//   3. the standards audit: every build-list entry a partial / gap verdict for one of the lesson's CCSS codes (or a
//      lettered part of one) or its Essential Elements sends a missing clause to (standards-audit.js);
//   4. the detailed lesson's follow-on / to-make items (data/curriculum/detailed-lessons.json), joined to an entry
//      when the item names one, else kept as its own row.
// The do-first list (links.preBuild) is a second, separate list; an entry in both is said once, in the first.
//
// Every word a teacher reads is composed from structured fields or passes plain-words.js WHOLE (todo-text.js names
// and teaches lines; a missing clause only when plain). Pure: no window, no DOM, no state.

import { CCSS_AUDIT, EE_AUDIT } from './standards-audit.js';
import { WRM_PROPOSALS } from './wrm.js';
import { WRM_EXTENSIONS, STANDARD_PROPOSALS, canonicalEntry } from './build-list.js';
import { todoName, todoTeaches } from './todo-text.js';
import { liveSkillLabel, proposalLabel } from './wrm-links.js';
import { plainNote, isPlain } from './plain-words.js';
import { proposedName } from './detailed-links.js';

export const KIND_TAG = { new: 'New skill', option: 'New option', fix: 'Fix', picture: 'New picture', lesson: 'Follow-on lesson' };
export const STATUS_TAG = { planned: 'Planned', building: 'Being built' };
export const EMPTY_FULL = 'Nothing more to make: the skills below cover every part of this lesson.';
export const EMPTY_GAP = 'Not planned yet: no skill is on the build list for this lesson.';
export const EMPTY_UNIT = 'Nothing more to make for this domain.';

const uniq = (a) => [...new Set(a.filter(Boolean))];
const lowerFirst = (s) => (/^[A-Z][a-z]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);

/** The lesson's standard codes: its CCSS codes and its Essential Elements. */
export function lessonCodes(lesson, links = null) {
    const ee = (links && links.step && links.step.ee) || (lesson && lesson.siteInfo && lesson.siteInfo.ee) || [];
    return { ccss: uniq((lesson && lesson.ccss) || []), ee: uniq(ee) };
}

/** The audit verdicts of a code: the code itself and its lettered parts (4.NF.B.3 → 4.NF.B.3a … 3d). */
function verdictsOf(table, code) {
    const out = [];
    for (const [k, a] of Object.entries(table)) if (k === code || (k.startsWith(code) && /^[a-z]$/.test(k.slice(code.length)))) out.push([k, a]);
    return out;
}

/** A missing clause in plain words: whole, else its first part, with build-team brackets ("(owner …)") dropped. */
export function plainClause(text) {
    const s = String(text || '');
    // a bracket of maths ("(3 × 5 × 2 = 3 × 10)") stays; a bracket of words is the build team's comment
    const dropWords = (t) => t.replace(/\s*\(([^()]*)\)/g, (m, inner) => ((inner.match(/[A-Za-z]{2,}/g) || []).length >= 2 ? '' : m)).replace(/\s{2,}/g, ' ').trim();
    const first = s.split(/;/)[0];
    for (const c of [dropWords(first), dropWords(s), first, s]) {
        const p = plainNote(c);
        if (p && !/\b(?:the skill|skills? in the app|tags? moved|was tagged|were tagged)\b/i.test(p)) return p;
    }
    return '';
}

// Content words, to tell which clause of a verdict an entry closes (the audit lists clauses and entries, not pairs).
const STOP = new Set(['with', 'that', 'this', 'from', 'into', 'their', 'there', 'than', 'then', 'them', 'they', 'each', 'only', 'also', 'when', 'what',
    'which', 'where', 'skill', 'skills', 'page', 'pages', 'number', 'numbers', 'pupil', 'pupils', 'item', 'items', 'option', 'new']);
export const contentWords = (t) => new Set((String(t || '').toLowerCase().match(/[a-z]{4,}/g) || []).map((w) => w.replace(/(?:ing|es|s)$/, '')).filter((w) => w.length >= 4 && !STOP.has(w)));
const overlap = (a, b) => { let n = 0; for (const w of a) if (b.has(w)) n += 1; return n; };
const entryWords = (e, id) => contentWords([e && e.name, e && e.teaches, e && e.option, (WRM_PROPOSALS[id] || STANDARD_PROPOSALS[id] || {}).name, id.replace(/_/g, ' ')].join(' '));

/**
 * The clause of one verdict that a build id closes: the only clause when the verdict has one clause and one entry;
 * else the clause that shares the most words with the entry (never a clause that shares none — a guess would put
 * another entry's part on this row).
 */
function clausesFor(a, id, e) {
    const miss = a.missing || [];
    const build = a.build || [];
    if (!build.includes(id) || !miss.length) return [];
    if (build.length === 1) return miss.slice();
    const words = entryWords(e, id);
    return miss.filter((m) => overlap(contentWords(m), words) > 0);
}

/** Several plain clauses as one line: "Multistep problems using × and ÷; an equation with a letter for the unknown." */
export function joinClauses(list) {
    const parts = uniq(list.map(plainClause)).map((p) => p.replace(/\.$/, ''));
    if (!parts.length) return '';
    const line = `${parts.map((p, i) => (i ? lowerFirst(p) : p)).join('; ')}.`;
    return isPlain(line) ? line : `${parts[0]}.`;
}

const andWords = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
/** "2-digit × 1-digit" → "2 × 1"; "4×1" → "4 × 1". */
const sizeShort = (t) => String(t).trim().replace(/(\d+)-digit\s*×\s*(\d+)-digit/g, '$1 × $2').replace(/(\d)\s*×\s*(\d)/g, '$1 × $2');
/**
 * What the entry itself will cover, in full and short (coordinator 2026-10-17: a proposal whose own teaches names more
 * than the audit clause shows its whole coverage): its teaches line, an option list written out as sizes, and, when
 * part of it already exists as skills (`built`), which parts exist and which are still to build. '' when not plain.
 */
export function entryCoverage(e, id) {
    const p = STANDARD_PROPOSALS[id] || WRM_PROPOSALS[id] || {};
    const raw = String((e && e.teaches) || p.teaches || '');
    const m = /^(.*?);\s*option\s+"([a-z]+)"\s*:\s*(.+)$/i.exec(raw);
    if (!m) return plainNote(raw);
    const head = plainNote(m[1]).replace(/\.$/, '');
    const vals = m[3].split(/\s*,\s*/).map(sizeShort).filter(Boolean);
    if (!head || !vals.length) return '';
    const word = m[2].toLowerCase() === 'size' ? 'sizes' : `${m[2].toLowerCase()} choices`;
    let line = `${head}, at the ${word} ${andWords(vals)}.`;
    const built = p.built || (e && e.built);
    if (built && Array.isArray(built.remaining) && built.remaining.length) {
        const left = built.remaining.map(sizeShort);
        const have = vals.filter((x) => !left.includes(x));
        if (have.length) line += ` ${andWords(have)} ${have.length > 1 ? 'are' : 'is'} already skills in the app; ${andWords(left)} ${left.length > 1 ? 'are' : 'is'} still to build.`;
    }
    return isPlain(line) ? line : plainNote(raw);
}

/** The ids of the Skills to be made entries a raw detailed-lesson item names ("new skill patterns:notice_patterns …"). */
function idsInText(raw, byId, bySkill) {
    const out = [];
    for (const m of String(raw || '').matchAll(/\b([a-z_]+:[a-z0-9_]+|[a-z]+_[a-z0-9_]+)\b/g)) {
        const t = m[1];
        if (byId.has(t)) out.push(t);
        else if (bySkill.has(t)) out.push(bySkill.get(t));
        else if (t.includes(':') && byId.has(t.split(':')[1])) out.push(t.split(':')[1]);
    }
    return uniq(out);
}

const kindOfEntry = (e, id) => {
    const raw = (e && e.kindRaw) || (WRM_PROPOSALS[id] || STANDARD_PROPOSALS[id] || {}).kind || '';
    if (['new', 'skill'].includes(raw)) return 'new';
    if (['option', 'band'].includes(raw)) return 'option';
    if (['repair', 'migration'].includes(raw)) return 'fix';
    return raw ? 'picture' : 'new';
};

/** The row's name in a teacher's words (no ids): a skill, "<option> — a new choice on <skill>", or "Fix: …". */
export function rowName(e, id, kind) {
    const base = e ? todoName(e) : proposalLabel(id);
    const words = String(base).replace(/\s*\(new option on an existing skill\)$/i, '').trim();
    if (kind === 'option') {
        const skill = (e && e.skill) || (WRM_PROPOSALS[id] || STANDARD_PROPOSALS[id] || {}).skill || '';
        const live = skill ? liveSkillLabel(skill) : null;
        const lead = /^(.+): a new option$/.exec(words);
        if (lead) return `A new choice on ${lead[1]}`;
        if (live && isPlain(live, { fragment: false })) return `${words} — a new choice on ${live}`;
        const host = Object.entries(WRM_PROPOSALS).find(([hid, q]) => q.kind === 'new' && q.skill === skill && hid !== id)
            || Object.entries(STANDARD_PROPOSALS).find(([hid, q]) => q.kind === 'new' && q.skill === skill && hid !== id);
        if (host) return `${words} — a new choice on ${proposalLabel(host[0])}, a skill still to be made`;
        return `${words} — a new choice on an existing skill`;
    }
    if (kind === 'fix') return /^Fix\b/.test(words) ? words : `Fix: ${lowerFirst(words)}`;
    return words;
}

/**
 * The planned items of one lesson.
 *   lesson   a wrm-links lesson; links = linksFor(lesson)
 *   queue    buildQueue(...).items (names, kinds, gap lines); without it the rows use the build list's own names
 *   detailed the lesson's detailed records (detailedOf), each with `proposed` (raw) and `build` (plain) items
 * → { items: [row], pre: [row], codes }   row = { id, name, kind, kindTag, covers, codes, status, statusTag, sources, todo }
 */
export function lessonToMake(lesson, links, { queue = [], detailed = [] } = {}) {
    if (!lesson || lesson.type === 'assessment') return { items: [], pre: [], codes: { ccss: [], ee: [] } };
    const byId = new Map((queue || []).map((e) => [e.id, e]));
    const bySkill = new Map();
    for (const e of queue || []) if (e.skill && e.kind === 'new' && !bySkill.has(e.skill)) bySkill.set(e.skill, e.id);
    const codes = lessonCodes(lesson, links);
    const order = [];
    const hit = new Map();      // id -> { sources:Set, codes:Set, clauses:[] }
    const add = (id0, source, code = '', clauses = []) => {
        const id = canonicalEntry(id0);   // W3: a merged id is listed once, under the id it was merged into
        if (!id) return;
        if (!hit.has(id)) { hit.set(id, { sources: new Set(), codes: new Set(), clauses: [] }); order.push(id); }
        const h = hit.get(id);
        h.sources.add(source);
        if (code) h.codes.add(code);
        for (const c of clauses) if (c && !h.clauses.includes(c)) h.clauses.push(c);
    };
    // 1. the lesson's own build list
    for (const id of (links && links.build) || []) add(id, 'lesson');
    // 2. White Rose proposals and Skills to be made entries that name this step or this school lesson
    if (lesson.step) {
        for (const [id, p] of Object.entries(WRM_PROPOSALS)) if ((p.steps || []).includes(lesson.step) || (p.improves || []).includes(lesson.step)) add(id, 'wrm');
    }
    for (const e of queue || []) {
        if ((lesson.step && (e.wrmSteps || []).includes(lesson.step)) || (lesson.site && (e.siteLessons || []).includes(lesson.site))) add(e.id, 'wrm');
    }
    // 3. the standards audit: what each partial / gap verdict of the lesson's codes is still missing
    for (const [table, list] of [[CCSS_AUDIT, codes.ccss], [EE_AUDIT, codes.ee]]) {
        for (const code of list) {
            for (const [k, a] of verdictsOf(table, code)) {
                if (!a || a.status === 'full' || !Array.isArray(a.build)) continue;
                for (const id of a.build) add(id, 'standard', k, clausesFor(a, id, byId.get(id)));
            }
        }
    }
    // 4. the detailed lesson's to-make items: joined to an entry when they name one, else a row of their own
    const free = [];
    for (const rec of detailed || []) {
        const raws = rec.proposed || [];
        raws.forEach((raw) => {
            const ids = idsInText(raw, byId, bySkill);
            if (ids.length && !/^\s*redo\b/i.test(raw)) { ids.forEach((id) => add(id, 'detailed')); return; }
            let text = proposedName(raw);
            // "redo mult_properties forms 1-3 (legacy)": the skill by its label, and the forms it names
            const redo = /^\s*redo\s+([a-z_]+(?::[a-z0-9_]+)?)\b(?:\s+forms?\s+(\d+)\s*[-–]\s*(\d+))?/i.exec(raw);
            if (redo && liveSkillLabel(redo[1])) text = `To redo: "${liveSkillLabel(redo[1])}"${redo[2] ? `, its question forms ${redo[2]} to ${redo[3]}` : ''}`;
            if (!text || free.some((f) => f.text === text)) return;
            free.push({ text, rec: rec.id });
        });
    }
    const preIds = uniq(((links && links.preBuild) || []).filter((id) => !hit.has(id)));
    const row = (id, h) => {
        const e = byId.get(id) || null;
        const kind = kindOfEntry(e, id);
        const own = new Set([...codes.ccss, ...codes.ee]);
        const eCodes = e ? [...(e.ccss || []), ...(e.ee || [])] : [];
        const touches = (c) => [...own].some((o) => c === o || (c.startsWith(o) && /^[a-z]$/.test(c.slice(o.length))));
        let rc = h ? [...h.codes] : [];
        if (!rc.length) rc = eCodes.filter(touches);
        if (!rc.length && h && !h.sources.has('standard')) rc = codes.ccss.slice();
        // Covers: the lesson's own gap line for this entry, else the standard's missing clause, else the extension's
        // scope, else what the entry will have pupils do
        // the lesson's gap line names every entry of its build list: on a row only when it is the one entry, or the
        // line shares words with this entry
        const own1 = ((links && links.build) || []).length <= 1;
        const gapHere = e ? (e.gaps || []).filter((g) => (lesson.step && g.step === lesson.step) || (lesson.site && g.lesson === lesson.site))
            .filter((g) => own1 || overlap(contentWords(g.text), entryWords(e, id)) > 0).map((g) => plainClause(g.text)).find(Boolean) : '';
        const clause = h ? joinClauses(h.clauses) : '';
        const ext = WRM_EXTENSIONS[id] && rc.some((c) => (WRM_EXTENSIONS[id].ccss || []).includes(c) || (WRM_EXTENSIONS[id].ee || []).includes(c)) ? plainClause(WRM_EXTENSIONS[id].adds) : '';
        // the entry's own coverage wins when it names more than the line found: an option list or a part already built,
        // or every word of that line is in it
        const full = entryCoverage(e, id);
        const found = gapHere || clause || ext;
        const rawT = String((e && e.teaches) || (STANDARD_PROPOSALS[id] || WRM_PROPOSALS[id] || {}).teaches || '');
        const namesMore = !!full && (/;\s*option\s+"/i.test(rawT) || !!(STANDARD_PROPOSALS[id] || {}).built
            || (!!found && [...contentWords(found)].every((w) => contentWords(full).has(w)) && contentWords(full).size > contentWords(found).size));
        const covers = (namesMore ? full : found) || full || (e ? todoTeaches(e) : '') || 'The part of the lesson no skill teaches yet.';
        const status = e && e.building ? 'building' : 'planned';
        return { id, name: rowName(e, id, kind), kind, kindTag: KIND_TAG[kind], covers, codes: uniq(rc).map((c) => c.replace(/^M\./, '')), status, statusTag: STATUS_TAG[status],
            sources: h ? [...h.sources] : ['earlier'], todo: id };
    };
    const items = order.map((id) => row(id, hit.get(id)));
    for (const f of free) {
        const m = /^(Follow-on lessons?|New skill|New option|To redo): (.*)$/.exec(f.text);
        const kind = !m ? 'new' : /^Follow-on/.test(m[1]) ? 'lesson' : m[1] === 'New option' ? 'option' : m[1] === 'To redo' ? 'fix' : 'new';
        const b0 = m ? m[2] : f.text;
        const body = /^[a-z]/.test(b0) && kind !== 'fix' && kind !== 'lesson' ? b0.charAt(0).toUpperCase() + b0.slice(1) : b0;
        const name = kind === 'fix' ? `Fix: ${/^"/.test(body) ? body : lowerFirst(body)}` : kind === 'lesson' ? `${m[1]}: ${body}` : kind === 'option' ? `${body.charAt(0).toUpperCase()}${body.slice(1)} — a new choice on this lesson's skills` : body;
        items.push({ id: '', name, kind, kindTag: KIND_TAG[kind], covers: kind === 'lesson' ? 'The next part of this lesson, as its own detailed lesson.' : kind === 'fix' ? 'The questions the detailed lesson uses, redone to match this lesson.' : 'A part of this lesson the detailed lesson plans.',
            codes: codes.ccss.slice(), status: 'planned', statusTag: STATUS_TAG.planned, sources: ['detailed'], todo: '', detailed: f.rec });
    }
    const pre = preIds.map((id) => row(id, null));
    return { items, pre, codes };
}

/** The empty-state line of a lesson with nothing planned (honest: "full" only when the verdict says so). */
export function emptyLine(links) {
    return links && links.verdict === 'full' ? EMPTY_FULL : EMPTY_GAP;
}

/** The lesson sentence: "To cover every part of this lesson and its standards (3.OA.B.5), these will be made:". */
export function leadLine(codes, n) {
    const list = [...(codes.ccss || [])];
    const std = list.length ? ` and its standard${list.length > 1 ? 's' : ''} (${list.join(', ')})` : '';
    return `To cover every part of this lesson${std}, ${n === 1 ? 'this will be made' : 'these will be made'}:`;
}

/**
 * A unit's planned items: every lesson's rows, de-duplicated (by entry id, or by name for a detailed-lesson row), each
 * with the lessons it serves, in the order they first appear. lessons = [{ lesson, links, detailed }].
 */
export function unitToMake(lessons, { queue = [] } = {}) {
    const out = [];
    const at = new Map();
    for (const { lesson, links, detailed } of lessons) {
        if (!lesson || lesson.type === 'assessment') continue;
        const r = lessonToMake(lesson, links, { queue, detailed });
        for (const x of r.items) {
            const k = x.todo || `~${x.name}`;
            if (!at.has(k)) { at.set(k, { ...x, codes: x.codes.slice(), lessons: [] }); out.push(at.get(k)); }
            const u = at.get(k);
            for (const c of x.codes) if (!u.codes.includes(c)) u.codes.push(c);
            if (!u.lessons.includes(lesson)) u.lessons.push(lesson);
        }
    }
    return out;
}
