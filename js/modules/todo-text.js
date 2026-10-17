// todo-text.js — the teacher's words for one "Skills to be made" entry and for a MAP task note (fix round 6).
// WHITELIST, not blacklist: every line is COMPOSED from structured fields (the entry's name, the live skill's
// label, option labels and values from skill-options.js, White Rose step grades and titles, standard codes, MAP
// task names). The build team's free text (teaches, representation, closes, option notes) is shown only when it
// passes plain-words.js WHOLE; otherwise the composed sentence stands alone. The CSV keeps every note as written.
//
// Pure: no window, no DOM, no state. The page installs real skill labels through wrm-links' setSkillLabeler
// (Node gates install theirs), and the queue's entries through setTodoNames().

import { liveSkillLabel, proposalName, gradeOfYear, stepTitle, taskName, siteLessonLabel } from './wrm-links.js';
import { wrmStep } from './wrm.js';
import { optionsFor } from './skill-options.js';
import { plainNote, isPlain } from './plain-words.js';
import { DOMAINS } from './build-queue.js';
import { VISUALS } from './visual-catalogue.js';

let NAMES = new Map();     // build-queue id -> entry
/** The queue's entries, so a MAP row can name the entry that closes it. */
export function setTodoNames(items) { NAMES = new Map((items || []).map((e) => [e.id, e])); }

const isMigrate = (e) => /^vis_migrate/.test(e.id || '') || /^Migrate Legacy/i.test(e.name || '');
const isVisual = (e) => /^vis_/.test(e.id || '');
const lowerFirst = (s) => (/^[A-Z][a-z]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const andList = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
/** An entry name the build list left as a placeholder ("A new picture in Fractions"). */
const placeholder = (t) => /^A new (?:picture|skill) in\b/.test(t);
/**
 * M11 (critic r7): what a picture entry ADDS, in the White Rose catalogue's own words (VISUALS: the representations
 * the entry closes), each name without its bracket and shown only when plain: "fraction shapes and fraction bars".
 */
function visualWhat(e) {
    const names = [];
    for (const [, name, ids] of Object.values(VISUALS)) {
        if (!(ids || []).includes(e.id)) continue;
        const t = lowerFirst(String(name).replace(/\s*\([^()]*\)/g, '').split(/[,;]/)[0].replace(/\s*\/\s*/g, ' or ').replace(/\s{2,}/g, ' ').trim());
        if (t && isPlain(t, { fragment: false }) && !names.includes(t)) names.push(t);
    }
    return names.length ? names.slice(0, 3).join('; ') : '';
}

/** An entry's name in a teacher's words: the name when plain, else without its bracket, else what it is for. */
export function todoName(e) {
    const n = String(e.name || '');
    const mig = /^Migrate Legacy (.+?)(?: Visuals?)? to (?:the )?B&W .+$/i.exec(n);
    if (mig) return isPlain(`${mig[1]} pictures`) ? `${mig[1]} pictures redrawn in the black-and-white worksheet style` : 'Pictures redrawn in the black-and-white worksheet style';
    const t = n.replace(/\s*\(new skill [^)]*\)/i, '').replace(/\s*\((?:template )?option\)\s*$/i, ' (new option on an existing skill)');
    if (isPlain(t)) return t;
    const bare = t.replace(/\s*\([^()]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
    if (bare && isPlain(bare)) return bare;
    if (isVisual(e)) { const w = visualWhat(e); if (w) return `New pictures: ${w}`; }
    const lab = e.skill ? liveSkillLabel(e.skill) : null;
    if (lab && isPlain(lab)) return `${lab}: a new option`;
    const st = (e.wrmSteps || []).map(stepTitle).find(Boolean);
    if (st) return `A new ${isVisual(e) ? 'picture' : 'skill'} for "${st}"`;
    const dom = (DOMAINS.find((d) => d[0] === e.domain) || [])[1];
    return `A new ${isVisual(e) ? 'picture' : 'skill'}${dom ? ` in ${dom}` : ''}`;
}
const nameWords = (e) => todoName(e).replace(/\s*\(new option on an existing skill\)$/i, '');

/** A step as a teacher reads it: 'Grade 2, "Hundreds"'. */
export const stepLabel = (id) => { const t = stepTitle(id); return t ? `${gradeOfYear(String(id).split('.')[0])}, "${t}"` : ''; };
const stepsJoin = (ids) => {
    const l = [...new Set(ids.map(stepLabel).filter(Boolean))];
    return `${l.slice(0, 3).join('; ')}${l.length > 3 ? ` and ${l.length - 3} more` : ''}`;
};

/** "What pupils will do": the plain teaches sentence, else composed from the name and its first step. */
export function todoTeaches(e) {
    if (isMigrate(e)) return 'The same questions as now, drawn in the black-and-white worksheet style, the same on paper and on screen.';
    if (isVisual(e)) { const w = visualPicture(e); return `New pictures on worksheets and on screen: ${w}. The pupil answers from the picture.`; }
    const note = plainNote(e.teaches);
    if (note) return note;
    const st = (e.wrmSteps || []).find((s) => wrmStep(s));
    return st ? `Practise "${nameWords(e)}", for ${stepLabel(st)}.` : `Practise "${nameWords(e)}".`;
}

// m12 (critic r6): "How it looks" names WHAT the entry draws and how the pupil answers, read from its
// representation against this fixed table of drawings (our words, never the note's), so 436 entries do not share
// one sentence. An option that draws nothing new says nothing here: its Kind line already names the setting.
const DRAWS = [
    [/ten[- ]?frames?/i, 'a ten frame'], [/\bcounters?\b/i, 'counters'], [/\bdominoe?s?\b/i, 'dominoes'], [/\bdots?\b|dot (?:array|cards?)/i, 'dots'],
    [/base[- ]?(?:10|ten)|\brods?\b|\bflats?\b/i, 'base-ten blocks'], [/place[- ]value (?:chart|dis[ck]s?|counters)/i, 'a place-value chart'],
    [/number[- ]?lines?/i, 'a number line'], [/\btracks?\b|hundred square|number (?:chart|grid)/i, 'a number chart'],
    [/two-bar|bar comparison|comparison bars?/i, 'two bars to compare'], [/part[- ]whole|cherry|bar model|bar diagram/i, 'a part-whole or bar model'],
    [/\barrays?\b/i, 'an array'], [/equal groups|\bgroups\b/i, 'groups of objects'], [/\bcubes?\b/i, 'cubes'],
    [/\bclocks?\b|clock face/i, 'a clock face'], [/\bcoins?\b|\bmoney\b|dollars?|cents?\b/i, 'coins and notes'], [/\brulers?\b/i, 'a ruler'],
    [/thermometer/i, 'a thermometer'], [/protractor|\bangles?\b/i, 'angles'], [/fraction (?:bars?|strips?|circles?|walls?)|\bshaded?\b|\bshading\b/i, 'shaded fraction pictures'],
    [/\bshapes?\b|polygons?|triangles?|quadrilaterals?|outlines?|\bsolids?\b|\b3-?d\b|\b2-?d\b/i, 'shapes'],
    [/coordinate|\bgrids?\b|\baxes\b/i, 'a grid'], [/\bgraphs?\b|pictograph|line plot|bar chart|tally/i, 'a graph or chart'], [/\btables?\b/i, 'a table'],
    [/\bscales?\b|balance/i, 'a scale'], [/\bobjects?\b|line-art|\bpictures?\b|\bpictured\b|\bpicture-row\b|wordpic/i, 'pictures of objects'],
    [/count[- ]by row|counting row|\bcount-row\b/i, 'a counting row'], [/\bstory|stories|word problem/i, 'a short story'], [/equation|number sentence|\bsentences?\b/i, 'a number sentence'],
];
const ANSWERS = [
    [/\btick\b|tick boxes|check box/i, 'ticks a box'], [/\bcircles?\b(?! (?:and|or) )|\bring\b/i, 'circles the answer'], [/\bshade\b/i, 'shades the part'],
    [/\bdraw(?:s|ing)? (?:the|a|dots|lines?)\b/i, 'draws the answer'], [/\btap\b|\bchoose\b|\bpick\b|which (?:one|picture|diagram)/i, 'chooses the answer'],
    [/\bmatch\b/i, 'matches the pairs'], [/\bwrite\b|answer box|\bslots?\b|\bboxes?\b/i, 'writes the answer'],
];
// M11 (critic r7): the sheet kit's template ids (js/modules/sheet/cells/, plus the ones the build list names as new),
// in a teacher's words. A representation note that is a list of these ids is never shown as written.
export const KIT_WORDS = {
    'add-three': 'three numbers to add', 'area-model': 'an area model', arrays: 'an array', 'arrays-turn': 'an array turned round',
    'bar-graph': 'a bar graph', 'bar-model': 'a bar model', base10: 'base-ten blocks', bond: 'a part-whole bond', chartwindow: 'part of a hundred chart',
    clock: 'a clock face', 'cloze-bank': 'a word bank', coins: 'coins and notes', compare: 'two groups to compare', 'coord-grid': 'a grid',
    'count-row': 'a counting row', counters: 'counters', 'data-table': 'a table', division: 'a long division', equation: 'a number sentence',
    expression: 'an expression', fact: 'a number fact', 'fact-family': 'a fact family', family: 'a fact family', figures: 'shapes',
    'frac-model': 'shaded fraction pictures', 'function-table': 'a table', 'hop-line': 'jumps on a number line',
    'long-division': 'a long division', 'money-columns': 'money in columns', 'mult-chart': 'part of a multiplication chart',
    'mult-grid': 'a multiplication grid', 'nl-place': 'a number line', 'number-line': 'a number line', 'perimeter-shape': 'a shape with its sides',
    pictograph: 'a pictograph', pv: 'a place-value chart', rcdws: 'a word problem checklist', remainder: 'a division with a remainder',
    ruler: 'a ruler', seqstrip: 'a number track', shapes: 'shapes', stack: 'a column sum', 'tally-chart': 'a tally chart', tenframe: 'a ten frame',
    thermometer: 'a thermometer', timeline: 'a timeline', 'value-line': 'a number line', 'word-work': 'a short story', wordpic: 'a picture story',
    words: 'number words',
    // the new ones the build list names ("+ new: …")
    'picture-row': 'pictures of objects', 'measure-scale': 'a scale', 'graph-axes': 'a graph or chart', 'shape-grid': 'a grid',
    'pv-support': 'a place-value chart', 'angle-kit': 'angles', 'solid-kit': 'shapes',
};
/** A representation note the teacher never reads as written: a template-id list, "+ new:", or the build team's own words. */
export const TEMPLATE_LIST = /^[A-Z][a-z0-9-]+(?:, [a-z0-9-]+)*(?: \+ new: [a-z0-9-]+(?:, [a-z0-9-]+)*)?\.?$/;
export const BUILD_NOTE = /\+ new:|^The existing\b|^The skill['’]s own\b|\bno [a-z]+ (?:row|boxes|bank)\b/i;
const kitIds = (t) => String(t || '').toLowerCase().split(/[\s,.+:]+/).filter((w) => Object.prototype.hasOwnProperty.call(KIT_WORDS, w));
/** A picture entry's picture, named by what it adds (the catalogue's words), else its own name when plain. */
function visualPicture(e) {
    const n = nameWords(e);
    if (/^New pictures: /.test(n)) return n.slice(14);
    if (/^A new picture for /.test(n)) return lowerFirst(n);
    if (!placeholder(n)) return `"${n}"`;
    return visualWhat(e) || 'a new picture';
}
/** "How it looks": the plain representation note, else what it draws and how the pupil answers, else '' (hidden). */
export function todoLooks(e) {
    if (isMigrate(e)) return 'Black-and-white boxed questions, drawn the same on paper and on screen.';
    if (isVisual(e)) return `A new black-and-white line drawing: ${visualPicture(e)}, the same on paper and on screen.`;
    const raw = String(e.representation || '').trim();
    const idList = TEMPLATE_LIST.test(raw.charAt(0).toUpperCase() + raw.slice(1)) || /\+ new:/.test(raw);
    const whole = plainNote(raw);
    if (whole && !idList && !BUILD_NOTE.test(whole)) return whole;
    const rep = `${raw} ${e.spec && typeof e.spec === 'object' ? [].concat(e.spec.problemTypes || []).join(' ') : ''}`;
    const kit = idList ? [...new Set(kitIds(raw).map((k) => KIT_WORDS[k]))] : [];
    const draws = [...new Set([...kit, ...DRAWS.filter(([re]) => re.test(rep)).map(([, w]) => w)])].slice(0, 3);
    const ans = (ANSWERS.find(([re]) => re.test(rep)) || [])[1] || '';
    if (!draws.length) return e.kind === 'option' ? '' : ans ? `Black-and-white boxed questions; the pupil ${ans}.` : '';
    const t = `Shows ${draws.length < 2 ? draws[0] : `${draws.slice(0, -1).join(', ')} and ${draws[draws.length - 1]}`} in black and white${ans ? `; the pupil ${ans}` : ''}.`;
    return isPlain(t) ? t : '';
}

/**
 * "Gap it fills": one line per gap, composed from its structured lead (a White Rose step, a standard code, a MAP
 * task) and the gap note when it is plain, never twice.
 */
export function todoCloses(e) {
    const out = [];
    // m17 (critic r7): the steps and school lessons with no note of their own share ONE line, said once
    const bare = [];
    let bareAt = -1;
    const addBare = (lab) => { if (bareAt < 0) { bareAt = out.length; out.push(''); } if (!bare.includes(lab)) bare.push(lab); };
    for (const g of e.gaps || []) {
        if (/^\s*none\.?\s*$/i.test(String(g.text || '')) && !g.step && !g.lesson && !g.code && !g.map) continue;   // m12: no "None." line
        const note = plainNote(g.text);
        let line = '';
        if (g.step && stepLabel(g.step) && !note) { addBare(stepLabel(g.step)); continue; }
        if (g.lesson && siteLessonLabel(g.lesson) && !note) { addBare(siteLessonLabel(g.lesson)); continue; }
        if (g.step) line = stepLabel(g.step) ? `${stepLabel(g.step)}: ${note}` : note;
        else if (g.lesson) { const lab = siteLessonLabel(g.lesson); line = lab ? `${lab}, a school lesson: ${note}` : note; }
        else if (g.code) line = `${g.code}: ${note || 'not yet fully taught.'}`;
        else if (g.map) { const tn = taskName(g.map); line = isPlain(`MAP task "${tn}"`) ? `MAP task "${tn}": ${note || 'no skill practises it yet.'}` : ''; }
        else if (g.none) line = `No skill teaches ${stepsJoin(g.none)}.`;
        else if (g.improves) line = `Today's skills cover only part of ${stepsJoin(g.improves)}.`;
        else if (!/\breused\b/i.test(String(g.text || ''))) line = note;
        if (line && !out.includes(line)) out.push(line);
    }
    if (bareAt >= 0) {
        if (bare.length === 1) out[bareAt] = `${bare[0]}: no skill teaches all of it yet.`;
        else {
            // one lead-in, then the lessons grouped by grade: 'Grade 2: "Add lengths", "Compare lengths"; Grade 3: "…"'
            const by = new Map();
            for (const b of bare.slice(0, 12)) { const m = /^(.+?), (".*")$/.exec(b) || [b, '', b]; if (!by.has(m[1])) by.set(m[1], []); by.get(m[1]).push(m[2]); }
            const GO = ['Pre-K', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
            const list = [...by].sort((x, y) => (GO.indexOf(x[0]) + 1 || 99) - (GO.indexOf(y[0]) + 1 || 99)).map(([gr, ts]) => (gr ? `${gr}: ${ts.join(', ')}` : ts.join(', '))).join('; ');
            out[bareAt] = `No skill teaches these lessons in full yet. ${list}${bare.length > 12 ? `; and ${bare.length - 12} more lessons` : ''}.`;
        }
    }
    if (!out.length && (e.wrmSteps || []).length) out.push(`No skill teaches ${stepsJoin(e.wrmSteps)}.`);
    if (!out.length && (e.ccss || []).length) out.push(`Not yet fully taught: ${e.ccss.join(', ')}.`);
    return out;
}

// An option written as "<id> <value>: <what it does>" in a build note: the id is read against the skill's own
// option labels (skill-options.js) or this table of the setting names the build list uses.
const OPTION_LABELS = { band: 'Numbers to', bands: 'Numbers to', forms: 'What the items ask', form: 'What the items ask', parts: 'Parts',
    denoms: 'Denominators', denominators: 'Denominators', span: 'Number line range', places: 'Decimal places', decimals: 'Decimal places',
    objects: 'Objects', pictures: 'Pictures', support: 'Support', response: 'How the pupil answers', task: 'Task', unknown: 'What is missing',
    level: 'Support level', steps: 'Count in', step: 'Count in', words: 'Number words', layout: 'Layout', focus: 'Focus', items: 'Items',
    size: 'Size', mode: 'Mode' };
const VAL = `(?:"[^"]*"|'[^']*'|\\d+(?:,\\d{3})*(?:\\s*[-–]\\s*\\d+(?:,\\d{3})*)?)`;
const OPT_HEAD = new RegExp(`^([a-z]+)\\s*:?\\s*(${VAL}(?:\\s*(?:\\/|\\||\\bor\\b|\\band\\b|,)\\s*${VAL})*)\\s*([:;,(—-]?)\\s*([\\s\\S]*)$`, 'i');
/** The option of an entry in the dialog's words: its label and values (always kept), then the note when plain. */
export function optionLine(skill, raw) {
    // M11 (critic r7): a value code in brackets ("(tiles 41)") is the build list's, not a word
    const text = String(raw || '').replace(/\s*\((?:tiles|codec|code|key)\s+\d+\)/g, '').trim();
    if (!text) return '';
    // two settings joined by "+" ('mode "share among M" + response "drag"'): each in the dialog's words
    const both = /^[a-z]+\s+"[^"]*"(?:\s+\+\s+[a-z]+\s+"[^"]*")+$/.test(text) ? text.split(/\s+\+\s+/) : [];
    if (both.length > 1) {
        const parts = both.map((t) => optionLine(skill, t));
        return parts.every(Boolean) ? parts.join('. ') : '';
    }
    const m = OPT_HEAD.exec(text);
    if (m) {
        const id = m[1].toLowerCase();
        let def = null;
        if (skill && skill.includes(':')) { try { const [c, s] = skill.split(':'); def = optionsFor(c, s).find((d) => d.id === id) || null; } catch (x) { def = null; } }
        // M11: a setting the dialog does not name yet is named by its own word ("method" -> "Method")
        // (only for quoted values with no further quoted value after them: 'set "tenths", "hundredths"')
        const named0 = /^["']/.test(m[2]) && !/["']/.test(m[4]) && /^[a-z]{3,}$/.test(id) && isPlain(id, { fragment: false });
        const label = def ? String(def.label || '') : OPTION_LABELS[id] || (named0 ? id.charAt(0).toUpperCase() + id.slice(1) : '');
        if (label) {
            const vals = m[2].split(/\s*(?:\/|\||\bor\b|\band\b|,(?!\d{3}))\s*/).map((v) => v.replace(/^["']|["']$/g, '').trim()).filter(Boolean)
                .map((v) => { const hit = def && (def.values || []).find((x) => String(x.v) === v.replace(/,/g, '')); return hit ? String(hit.l).replace(/\s*\(default\)$/i, '') : v; });
            const head = /^bands?$/.test(id) && (!def || /^numbers to$/i.test(label)) ? `Numbers to ${vals.join(' or ')}` : `${label}: ${vals.join(', ')}`;
            let rest = m[4].trim();
            if (m[3] === '(' && rest.endsWith(')')) rest = rest.slice(0, -1);
            // "and pictures" runs on from the values; a clause after ":" or "(" is its own sentence
            const runOn = !m[3] && /^[a-z]/.test(rest);
            const tail = !rest ? '' : runOn ? (isPlain(rest, { fragment: false }) ? ` ${rest.replace(/[.;,]$/, '')}` : '') : (plainNote(rest) ? `${/[.?!]$/.test(head) ? '' : '.'} ${plainNote(rest).replace(/\.$/, '')}` : '');
            if (isPlain(head)) return `${head}${tail}`;
        }
    }
    // "objects: show the group, add or take one": the setting's name, then its words when they are plain
    const named = /^([a-z]+):\s+(.+)$/i.exec(text);
    if (named) {
        const id = named[1].toLowerCase();
        let def = null;
        if (skill && skill.includes(':')) { try { const [c, s] = skill.split(':'); def = optionsFor(c, s).find((d) => d.id === id) || null; } catch (x) { def = null; } }
        const label = (def && def.label) || OPTION_LABELS[id] || id.charAt(0).toUpperCase() + id.slice(1);
        const line = `${label}: ${named[2].replace(/[.;,]$/, '')}`;
        if (isPlain(line)) return line;
    }
    // never the build list's own form, a setting word then its quoted value ('mode "share among M"')
    if (/^[a-z]+ ["']/.test(text)) return '';
    return isPlain(text, { fragment: false }) && isPlain(`Option: ${text}`) ? text.replace(/[.;,]$/, '') : '';
}

/** The kind line's tail: the live skill it changes (by its label) and the option in the dialog's words. */
export function todoKindTail(e) {
    const parts = [];
    const lab = e.skill ? liveSkillLabel(e.skill) : null;   // N19: a skill not made yet is the entry itself
    if (lab && isPlain(lab, { fragment: false })) parts.push(lab);
    if (e.option) {
        // a bracket that is not plain is left out before the line is given up (N37: "(incl. zero place)")
        const o = optionLine(e.skill, e.option) || optionLine(e.skill, String(e.option).replace(/\s*\([^()]*\)/g, ''));
        parts.push(o ? `Option: ${o}` : 'A new setting on this skill');
    }
    return parts;
}

/** Every field a teacher reads for one entry, for the screen, the print and the gates. */
export function todoTexts(e) {
    return { name: todoName(e), teaches: todoTeaches(e), closes: todoCloses(e), looks: todoLooks(e), kind: todoKindTail(e) };
}

/**
 * A MAP task's note (MAP · Practise by task): the row's note when it is plain, else a sentence composed from the
 * entry that closes it ('"Meaning of the equal sign" will add: …'), else nothing. Never starts with an id.
 */
export function mapNote(text, row = {}) {
    const whole = plainNote(text);
    if (whole && !/^Adds?\b/.test(whole)) return whole;   // N37: a note with no subject ("Adds writing …") is composed instead
    const id = row.proposal || '';
    if (!id) return '';
    const e = row.entry || NAMES.get(id) || { id, name: proposalName(id) };
    // N31 (critic r6): the row's own clause when the note is "<entry id> adds <what>" — what THIS task gains — read
    // by the entry id the row names, and shown only when that clause is plain
    const own = new RegExp(`^${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:['’]s?)?(?: MAP clause)? (?:adds|will add)\\s+(.+)$`, 'i').exec(String(text || '').trim());
    const clause = own ? plainNote(own[1]) : '';
    if (clause) return `"${nameWords(e)}" will add: ${lowerFirst(clause)}`;
    const teaches = plainNote(e.teaches);
    if (teaches) return `"${nameWords(e)}" will add: ${lowerFirst(teaches)}`;
    return `"${nameWords(e)}" is still to be built.`;
}

/** One MAP line of an entry: strand · RIT band · the task (its MAP name) or the kind of item MAP asks. */
export function mapLine(m) {
    const what = m.task ? taskName(m.task) : taskName(m.taskType || '');
    return [m.strand, m.ritBand ? `RIT ${m.ritBand}` : '', what && isPlain(what, { fragment: false }) ? what : ''].filter(Boolean).join(' · ');
}
