// todo-text.js — the teacher's words for one "Skills to be made" entry (critic r3 m7, r4 M4/m7).
// The build queue (build-queue.js) keeps the build team's spec, which is full of file names, ids and
// template options; the screen and its print show only what a teacher reads. The CSV keeps the spec.
//
// Pure: no window, no DOM, no state. The page installs real skill labels through wrm-links'
// setSkillLabeler (Node gates install theirs), and the queue's names through setTodoNames().

import { plainWhy, optionText, liveSkillLabel } from './wrm-links.js';

let NAMES = new Map();     // build-queue id -> entry name
/** The queue's entries, so an entry id inside another entry's note reads as that entry's name. */
export function setTodoNames(items) { NAMES = new Map((items || []).map((e) => [e.id, e.name])); }

/** Anything still reading as code after the rewrite: a clause holding it is dropped. */
export const DEV = /\.(?:js|md|json|cjs|mjs)\b|\b[A-Z]{3,}_[A-Z]|\bws-[a-z]|'[a-z-]+'\s*\||\bgains\b|\blanes?\b|\bproposals?-index\b|\bproviders?\/|\bopts\b|\bpanes?\b|\btemplates?\b|\bgenerators?\b|\bregistry\b|\bdispatcher\b|\bprintFormat\b|\bq\.cell\b|\bcell kit\b|\bkit cell\b|\bre-?grade\b|\bn=\d|\bnew:\s*[a-z]|\bwordpic\b|\bpicture-row\b/;

const teacherName = (n) => String(n || '').replace(/\s*\(option\)\s*$/i, ' (new option on an existing skill)');

/** An entry's name in a teacher's words. */
export function todoName(e) {
    const n = String(e.name || '');
    const mig = /^Migrate Legacy (.+?)(?: Visuals?)? to B&W Kit Cells$/i.exec(n);
    if (mig) return `${mig[1]} pictures redrawn in the black-and-white worksheet style`;
    return teacherName(n.replace(/\s*\(new skill [^)]*\)/i, '').replace(/\s*\(template option\)/i, ' (option)'));
}
const isMigrate = (e) => /^vis_migrate/.test(e.id) || /^Migrate Legacy/i.test(e.name);
const isVisual = (e) => /^vis_/.test(e.id);
const nameWords = (e) => todoName(e).replace(/\s*\((?:new )?option(?: on an existing skill)?\)$/i, '').toLowerCase();

/** The spec's note in plain words: entry ids become their names, files and source tables go, then plainWhy. */
export function plainLine(x, e = {}) {
    let t = String(x || '');
    if (!t) return '';
    t = t.replace(/`([^`]*)`/g, '$1').replace(/\b(?:pane|template):([a-z0-9-]+)/g, '$1 picture')
        .replace(/\b([a-z]+(?:_[a-z0-9]+)*)_\*/g, (m, a) => `the ${a.replace(/_/g, ' ')} skills`);
    // "(wrm.js)", "(STANDARD_PROPOSALS)", "(part A)", "(build-list.js)": where the build team keeps it
    t = t.replace(/\s*\((?:[^()]*?(?:\.(?:js|md|json)\b|\b[A-Z]{3,}_[A-Z]+\b|proposals-index|\blane\b|\bgenerator\b|\bpart [A-Z]\b))[^()]*\)/g, '');
    t = t.replace(/\b(?:WRM|STANDARD_PROPOSALS|VISUAL_BUILDS|WRM_EXTENSIONS|WRM_PROPOSALS)\s+(?=[a-z][a-z0-9]*_)/g, '');
    t = t.replace(/\b(?:STANDARD_PROPOSALS|VISUAL_BUILDS|WRM_EXTENSIONS|WRM_PROPOSALS)\b\s*/g, '');
    // another entry's id → its name, in quotes
    t = t.replace(/\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/g, (id, off, s) => (NAMES.has(id) && s[off - 1] !== ':' ? `"${todoName({ id, name: NAMES.get(id) })}"` : id));
    t = plainWhy(t, { key: e.skill || '', step: (e.wrmSteps || [])[0] || '' });
    // what still reads as code goes, one clause at a time
    const kept = t.split(/(?<=[;.])\s+(?=[A-Za-z"(])/).filter((c) => !DEV.test(c));
    return kept.join(' ').replace(/[;,]\s*$/, '').trim();
}

/** A MAP.json row's note (its `closes`) in plain words, for the MAP task screen. */
export function mapNote(text, skills = []) {
    return plainLine(String(text || '').replace(/\s*\(part [A-Z]\)/g, ''), { skill: (skills || [])[0] || '' });
}

/** "What pupils will do". */
export function todoTeaches(e) {
    if (isMigrate(e)) return 'The same questions as now, drawn in the black-and-white worksheet style, the same on paper and on screen.';
    if (isVisual(e)) return `New pictures on worksheets and on screen: ${nameWords(e)}. The pupil answers from the picture.`;
    return plainLine(e.teaches, e) || `Practise ${nameWords(e)}.`;
}

/** "How it looks": the drawing, never the build spec (critic r4 M4 step 3). */
export function todoLooks(e) {
    if (isMigrate(e)) return 'Black-and-white boxed cells, drawn the same on paper and on screen.';
    let t = String(e.representation || '');
    // the design standard every page keeps: said once on the page, not on every entry
    t = t.replace(/(^|[.;]\s*)print:\s*(?:one\s+)?(?:boxed\s+)?B&W\s+(?:boxed\s+)?(?:Andika\s+)?cell(?:\s*\([^)]*\))?(?:,\s*big digits)?(?:,\s*single grey for structure only)?\s*[;,]?\s*/gi, '$1On paper: ');
    t = t.replace(/\bscreen:\s*/gi, 'On screen: ');
    t = t.replace(/\s*\((?=[^()]*\b(?:production|MC|hot spot|select-all|selection|matching)\b)[^()]*\)/g, '').replace(/,?\s*(?:never|not)(?: single| text)? MC\b/g, '');
    t = t.replace(/[^.;]*\bcomes from vis_[a-z_]+\.?/g, '');
    // a bare list of drawing names ("counters, seqstrip") says nothing to a teacher
    if (/^\s*[a-z0-9-]+(?:\s*[,+]\s*[a-z0-9-]+)*\s*$/i.test(t)) t = '';
    let out = plainLine(t, e).replace(/^On paper:\s*(\S)/, (m, c) => `On paper: ${c}`);
    if (isVisual(e) && (!out || out.length < 12)) out = '';
    if (!out) out = isVisual(e) ? `A black-and-white line drawing of ${nameWords(e)}, the same on paper and on screen.` : 'A black-and-white boxed question, the same on paper and on screen.';
    return out.charAt(0).toUpperCase() + out.slice(1);
}

/** "Gap it fills": plain, one line per step, never twice. */
export function todoCloses(e) {
    return [...new Set((e.closes || []).map((c) => plainLine(c, e)).filter((c) => c && !/^\s*(?:none|n\/a|-)\s*\.?$/i.test(c) && !/\breused\b/i.test(c)))];
}

/** The kind line's tail: the live skill it changes (by its label) and the option in the dialog's words. */
export function todoKindTail(e) {
    const parts = [];
    const lab = e.skill ? liveSkillLabel(e.skill) : null;   // N19: a skill not made yet is the entry itself
    if (lab) parts.push(lab);
    if (e.option) {
        const o = optionText(e.skill, e.option);
        const kept = o.split(/(?<=[;.])\s+/).filter((c) => !DEV.test(c)).join(' ').replace(/[;,]\s*$/, '');
        if (kept) parts.push(`Option: ${kept}`);
    }
    return parts;
}

/** Every field a teacher reads for one entry, for the screen, the print and the gates. */
export function todoTexts(e) {
    return { name: todoName(e), teaches: todoTeaches(e), closes: todoCloses(e), looks: todoLooks(e), kind: todoKindTail(e) };
}
