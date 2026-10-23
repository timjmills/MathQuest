#!/usr/bin/env node
// ws-status-index — merge hygiene (IMPROVEMENT_PLAN §1.4 S6, §1.6.6, Q-S3).
//
// Lanes write ONLY their own design/status/<lane>.md. The integrator / lead runs this tool, which
// regenerates the region of design/STATUS.md between the status-index markers from those files.
// Nothing outside the markers is ever changed.
//
//   node tests/scripts/ws-status-index.mjs                 regenerate the generated region
//   node tests/scripts/ws-status-index.mjs --check         exit 1 if the region is stale (deploy gate)
//   node tests/scripts/ws-status-index.mjs --init          one time: add the top section + markers, archive the old file
//   node tests/scripts/ws-status-index.mjs --verify-lines <ref>
//                                                          every line of <ref>:design/STATUS.md appears, in order, now
//   node tests/scripts/ws-status-index.mjs --owner-go [--json]
//                                                          every `Owner go: <family>, <YYYY-MM-DD>` line; malformed = exit 1
//                                                          (family: a SKILLS category, a spec-card id or a line of
//                                                          design/status/families.txt; date: real and not after today)
//   node tests/scripts/ws-status-index.mjs --conflicts --since <YYYY-MM-DD|commit>
//                                                          re-run every merge since then; count STATUS / stamp conflicts
//   node tests/scripts/ws-status-index.mjs --self-test     inline fixtures in a temp dir
//   --root <dir>                                           repo root (default: two levels above this script)
//
// Output convention: last line `ws-status-index: OK` or `ws-status-index: FAIL`, non-zero exit on FAIL.
// No dependencies beyond node and git.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const TOOL = 'ws-status-index';
const START = '<!-- status-index:start -->';
const END = '<!-- status-index:end -->';
const STATUS_REL = 'design/STATUS.md';
const LANES_REL = 'design/status';
const ARCHIVE_HEADING = '## Archive — STATUS before Wave 0 (to 2026-10-23)';

export const STATES = ['planned', 'building', 'critic', 'fix', 'passed', 'merged', 'paused', 'done'];
export const PROFILES = ['mq-opus-low', 'mq-opus-medium', '—'];
export const HEADER_KEYS = ['Lane', 'Title', 'Session', 'Branch', 'Owner of files', 'State', 'Updated',
  'Builder profile', 'Critic rounds'];
export const GO_RE = /^Owner go: ([a-z][a-z0-9_:-]*), (\d{4}-\d{2}-\d{2})$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// ---------------------------------------------------------------- known families
//
// A go line's <family> must be a known id: a category of SKILLS (js/modules/data.js, read as text: the module needs a
// browser), a spec-card id (design/cards/<id>/), or a line of design/status/families.txt (the plan's template-family
// ids, which are not categories). Its date must not be after today.
const FAMILIES_REL = 'design/status/families.txt';
const CARDS_REL = 'design/cards';

export function skillsCategories(dataJsText) {
  const at = dataJsText.search(/^export const SKILLS = \{/m);
  if (at < 0) return [];
  const body = dataJsText.slice(at);
  const end = body.search(/^\};/m);
  const out = [];
  for (const m of body.slice(0, end < 0 ? undefined : end).matchAll(/^ {4}([a-z][a-z0-9_]*): \[/gm)) out.push(m[1]);
  return out;
}

export function knownFamilies(root) {
  const fams = new Set();
  const sources = [];
  const data = path.join(root, 'js/modules/data.js');
  if (fs.existsSync(data)) { const c = skillsCategories(fs.readFileSync(data, 'utf8')); c.forEach((x) => fams.add(x)); sources.push(`${c.length} SKILLS categories`); }
  const fl = path.join(root, FAMILIES_REL);
  if (fs.existsSync(fl)) {
    let n = 0;
    for (const line of fs.readFileSync(fl, 'utf8').split('\n')) { const t = line.replace(/#.*/, '').trim(); if (t) { fams.add(t); n++; } }
    sources.push(`${n} in ${FAMILIES_REL}`);
  }
  const cd = path.join(root, CARDS_REL);
  if (fs.existsSync(cd)) {
    const ids = fs.readdirSync(cd, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
    ids.forEach((x) => fams.add(x));
    sources.push(`${ids.length} spec cards`);
  }
  return { set: fams, sources };
}

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function validDate(s) {
  if (!DATE_RE.test(s)) return false;
  const d = new Date(s + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

// ---------------------------------------------------------------- lane files

// A lane file is a *.md in design/status/ whose name does not start with "_" and whose first
// non-blank lines (after an optional "# " title) carry the `Lane:` header. Anything else in the
// folder (README.md, defect-classes.md, metrics.md, CSVs, _TEMPLATE.md) is ignored.
function headerStart(lines) {
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i++;
  if (i < lines.length && /^# /.test(lines[i])) {
    i++;
    while (i < lines.length && lines[i].trim() === '') i++;
  }
  return i;
}

export function isLaneText(text) {
  const lines = text.split('\n');
  const i = headerStart(lines);
  return i < lines.length && /^Lane:\s*\S/.test(lines[i]);
}

// opts: {families: Set (null = do not check), today: 'YYYY-MM-DD'}
export function parseLane(text, rel, { families = null, today = localToday() } = {}) {
  const errors = [];
  const lines = text.replace(/\r$/gm, '').split('\n');
  let i = headerStart(lines);
  const header = {};
  for (; i < lines.length && lines[i].trim() !== ''; i++) {
    const m = /^([A-Za-z][A-Za-z ]*?):\s*(.*)$/.exec(lines[i]);
    if (!m) { errors.push(`${rel}:${i + 1}: header line is not "Key: value": ${lines[i]}`); continue; }
    if (!HEADER_KEYS.includes(m[1])) { errors.push(`${rel}:${i + 1}: unknown header key "${m[1]}"`); continue; }
    if (m[1] in header) errors.push(`${rel}:${i + 1}: header key "${m[1]}" repeated`);
    header[m[1]] = m[2].trim();
  }
  for (const k of HEADER_KEYS) if (!header[k]) errors.push(`${rel}: header "${k}" missing or empty`);
  if (header.Lane && !/^[a-z0-9][a-z0-9-]*$/.test(header.Lane)) errors.push(`${rel}: Lane "${header.Lane}" is not a lowercase id`);
  if (header.Lane && path.basename(rel, '.md') !== header.Lane) errors.push(`${rel}: Lane "${header.Lane}" does not match the file name`);
  if (header.State && !STATES.includes(header.State)) errors.push(`${rel}: State "${header.State}" is not one of ${STATES.join(', ')}`);
  if (header.Updated && !validDate(header.Updated)) errors.push(`${rel}: Updated "${header.Updated}" is not a YYYY-MM-DD date`);
  if (header['Builder profile'] && !PROFILES.includes(header['Builder profile'])) errors.push(`${rel}: Builder profile "${header['Builder profile']}" is not one of ${PROFILES.join(', ')}`);
  if (header['Critic rounds'] && !/^\d+, \S.*$/.test(header['Critic rounds'])) errors.push(`${rel}: Critic rounds "${header['Critic rounds']}" is not "<n>, <last verdict>"`);

  // Sections and go lines.
  const go = [];
  let section = null;
  let sawGoSection = false;
  let inComment = false;
  for (let j = i; j < lines.length; j++) {
    const line = lines[j];
    const h = /^## (.+?)\s*$/.exec(line);
    if (h) { section = h[1]; if (section === 'Owner go') { if (sawGoSection) errors.push(`${rel}:${j + 1}: second "## Owner go" section`); sawGoSection = true; } inComment = false; continue; }
    if (section === 'Owner go') {
      // Only blank lines, HTML comments and go lines may stand here.
      if (inComment) { if (line.includes('-->')) inComment = false; continue; }
      if (line.trim() === '') continue;
      if (/^\s*<!--/.test(line)) { if (!line.includes('-->')) inComment = true; continue; }
      const m = GO_RE.exec(line);
      if (!m) { errors.push(`${rel}:${j + 1}: malformed go line (want "Owner go: <family>, <YYYY-MM-DD>"): ${line}`); continue; }
      if (!validDate(m[2])) { errors.push(`${rel}:${j + 1}: go line date "${m[2]}" is not a real date`); continue; }
      if (m[2] > today) { errors.push(`${rel}:${j + 1}: go line date "${m[2]}" is in the future (today is ${today})`); continue; }
      if (families && !families.has(m[1])) { errors.push(`${rel}:${j + 1}: go line family "${m[1]}" is not a known family (a SKILLS category in js/modules/data.js, a spec card in ${CARDS_REL}/, or a line of ${FAMILIES_REL})`); continue; }
      go.push({ family: m[1], date: m[2], lane: header.Lane || path.basename(rel, '.md'), file: rel, line: j + 1 });
    } else if (/^\s*Owner go:/.test(line)) {
      errors.push(`${rel}:${j + 1}: "Owner go:" line outside the "## Owner go" section (it would not count)`);
    }
  }
  if (!sawGoSection) errors.push(`${rel}: no "## Owner go" section`);
  for (const s of ['Now', 'Open questions', 'Log']) {
    if (!lines.some((l) => l.trim() === `## ${s}`)) errors.push(`${rel}: no "## ${s}" section`);
  }
  return { rel, header, go, errors };
}

// opts: {families: Set | null (default: knownFamilies(root)), today}
export function readLanes(root, opts = {}) {
  const families = opts.families !== undefined ? opts.families : knownFamilies(root).set;
  const today = opts.today || localToday();
  const dir = path.join(root, LANES_REL);
  const lanes = [];
  const ignored = [];
  if (!fs.existsSync(dir)) return { lanes, ignored, errors: [] };
  for (const name of fs.readdirSync(dir).sort()) {
    const rel = `${LANES_REL}/${name}`;
    const full = path.join(dir, name);
    if (!fs.statSync(full).isFile() || !name.endsWith('.md') || name.startsWith('_')) { ignored.push(rel); continue; }
    const text = fs.readFileSync(full, 'utf8');
    if (!isLaneText(text)) { ignored.push(rel); continue; }
    lanes.push(parseLane(text, rel, { families, today }));
  }
  const errors = lanes.flatMap((l) => l.errors);
  const seen = new Map();
  for (const l of lanes) {
    if (!l.header.Lane) continue;
    if (seen.has(l.header.Lane)) errors.push(`${l.rel}: lane id "${l.header.Lane}" also used by ${seen.get(l.header.Lane)}`);
    seen.set(l.header.Lane, l.rel);
  }
  return { lanes, ignored, errors };
}

// ---------------------------------------------------------------- the generated region

const cellEsc = (s) => String(s).replace(/\|/g, '\\|');

export function renderRegion(lanes) {
  const out = [START,
    '<!-- Generated by `node tests/scripts/ws-status-index.mjs` from design/status/<lane>.md. Do not edit by hand: edit the lane file, then the lead re-runs the tool. -->',
    '',
    '### Lanes now',
    ''];
  const sorted = [...lanes].sort((a, b) => (a.header.Lane || '').localeCompare(b.header.Lane || ''));
  if (!sorted.length) out.push('_No lane files yet._');
  else {
    out.push('| Lane | Title | State | Updated | Builder profile | Critic rounds | File |', '|---|---|---|---|---|---|---|');
    for (const l of sorted) {
      const h = l.header;
      const link = `[${path.basename(l.rel)}](${l.rel.replace(/^design\//, '')})`;
      out.push(`| ${cellEsc(h.Lane)} | ${cellEsc(h.Title)} | ${cellEsc(h.State)} | ${cellEsc(h.Updated)} | ${cellEsc(h['Builder profile'])} | ${cellEsc(h['Critic rounds'])} | ${link} |`);
    }
  }
  out.push('', '### Owner go', '');
  const go = sorted.flatMap((l) => l.go).sort((a, b) => a.date.localeCompare(b.date) || a.family.localeCompare(b.family) || a.lane.localeCompare(b.lane));
  if (!go.length) out.push('_No family has an owner go yet._');
  else {
    out.push('| Family | Date | Lane |', '|---|---|---|');
    for (const g of go) out.push(`| ${cellEsc(g.family)} | ${g.date} | ${cellEsc(g.lane)} |`);
  }
  out.push(END);
  return out.join('\n');
}

export function splitRegion(text) {
  const a = text.indexOf(START);
  const b = text.indexOf(END);
  if (a < 0 || b < 0 || b < a) return null;
  if (text.indexOf(START, a + 1) >= 0 || text.indexOf(END, b + 1) >= 0) return null;
  return { before: text.slice(0, a), region: text.slice(a, b + END.length), after: text.slice(b + END.length) };
}

export function regenerate(text, lanes) {
  const parts = splitRegion(text);
  if (!parts) throw new Error(`${STATUS_REL} has no single ${START} … ${END} region (run --init once)`);
  return parts.before + renderRegion(lanes) + parts.after;
}

export function initText(oldText, lanes) {
  if (oldText.includes(START) || oldText.includes(END)) throw new Error(`${STATUS_REL} already has the status-index markers; --init runs once`);
  const top = [
    '# Status — index (generated) and archive',
    '',
    'Since Wave 0 (2026-10-23, `design/IMPROVEMENT_PLAN.md` §1.4 S6) every lane writes **only** its own',
    '`design/status/<lane>.md` (format: `design/status/README.md`). Lanes never edit this file and never run',
    '`ws-stamp-assets`. Only the integrator or the lead runs `node tests/scripts/ws-status-index.mjs`, which rewrites the',
    'region between the markers below from the lane files; `--check` fails when it is stale, and `--owner-go` lists',
    'the owner\'s go lines that the deploy runner reads. Everything outside the markers is never changed by the tool;',
    'the archive below is this file as it stood before Wave 0, kept byte for byte.',
    '',
    renderRegion(lanes),
    '',
    ARCHIVE_HEADING,
    '',
    '',
  ].join('\n');
  return top + oldText;
}

// Every line of `oldText` appears in `newText`, in order. Returns the first missing line or null.
export function missingLine(oldText, newText) {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  let k = 0;
  for (let i = 0; i < oldLines.length; i++) {
    while (k < newLines.length && newLines[k] !== oldLines[i]) k++;
    if (k >= newLines.length) return { index: i + 1, line: oldLines[i] };
    k++;
  }
  return null;
}

// ---------------------------------------------------------------- conflicts (the S6 measurement)

function git(root, args, opts = {}) {
  return spawnSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...opts });
}

export function mergeTreeSupported(root) {
  const r = git(root, ['merge-tree', '-h']);
  return /--write-tree/.test((r.stdout || '') + (r.stderr || ''));
}

const watched = (f) => f === 'design/STATUS.md' || f === 'index.html' || f.startsWith('design/status/');

function conflictsWriteTree(root, p1, p2) {
  const r = git(root, ['merge-tree', '--write-tree', '--name-only', '--no-messages', p1, p2]);
  if (r.status === 0) return { files: [] };
  if (r.status !== 1) return { error: (r.stderr || '').trim().split('\n')[0] || `merge-tree exit ${r.status}` };
  const lines = r.stdout.split('\n').slice(1); // first line is the tree id
  const files = [];
  for (const l of lines) { if (l === '') break; files.push(l); }
  return { files: [...new Set(files)] };
}

function conflictsWorktree(root, p1, p2) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-status-wt-'));
  try {
    const add = git(root, ['worktree', 'add', '--detach', '--quiet', dir, p1]);
    if (add.status !== 0) return { error: (add.stderr || '').trim().split('\n')[0] };
    const m = git(dir, ['-c', 'user.name=ws-status-index', '-c', 'user.email=ws-status-index@localhost', 'merge', '--no-commit', '--no-ff', '--quiet', p2]);
    const d = git(dir, ['diff', '--name-only', '--diff-filter=U']);
    if (m.status !== 0 && !d.stdout.trim()) return { error: (m.stderr || '').trim().split('\n')[0] || 'merge failed' };
    return { files: d.stdout.split('\n').filter(Boolean) };
  } finally {
    git(root, ['worktree', 'remove', '--force', dir]);
    fs.rmSync(dir, { recursive: true, force: true });
    git(root, ['worktree', 'prune']);
  }
}

export function measureConflicts(root, since, { method } = {}) {
  const useWriteTree = method ? method === 'write-tree' : mergeTreeSupported(root);
  const range = DATE_RE.test(since) ? ['--since', since, 'HEAD'] : [`${since}..HEAD`];
  const log = git(root, ['log', '--merges', '--format=%H %cs %P', ...range]);
  if (log.status !== 0) throw new Error(`git log failed: ${log.stderr.trim()}`);
  const shallow = git(root, ['rev-parse', '--is-shallow-repository']).stdout.trim() === 'true';
  const rows = [];
  for (const line of log.stdout.split('\n').filter(Boolean)) {
    const [sha, date, ...parents] = line.split(' ');
    const subject = git(root, ['log', '-1', '--format=%s', sha]).stdout.trim();
    const row = { sha, date, subject, parents };
    if (parents.length !== 2) { row.error = `octopus merge (${parents.length} parents), not re-run`; rows.push(row); continue; }
    const missing = parents.filter((p) => git(root, ['cat-file', '-e', `${p}^{commit}`]).status !== 0);
    if (missing.length) { row.error = `parent ${missing[0].slice(0, 9)} not in this clone`; rows.push(row); continue; }
    const base = git(root, ['merge-base', parents[0], parents[1]]);
    if (base.status !== 0) { row.error = shallow ? 'no merge base in this shallow clone (deepen it)' : 'no merge base'; rows.push(row); continue; }
    const res = useWriteTree ? conflictsWriteTree(root, parents[0], parents[1]) : conflictsWorktree(root, parents[0], parents[1]);
    Object.assign(row, res);
    rows.push(row);
  }
  const ok = rows.filter((r) => !r.error);
  const counts = {
    merges: rows.length,
    rerun: ok.length,
    unknown: rows.length - ok.length,
    anyConflict: ok.filter((r) => r.files.length).length,
    status: ok.filter((r) => r.files.includes('design/STATUS.md')).length,
    stamp: ok.filter((r) => r.files.includes('index.html')).length,
    laneFiles: ok.filter((r) => r.files.some((f) => f.startsWith('design/status/'))).length,
    watched: ok.filter((r) => r.files.some(watched)).length,
    otherOnly: ok.filter((r) => r.files.length && !r.files.some(watched)).length,
  };
  return { method: useWriteTree ? 'git merge-tree --write-tree' : 'temporary worktree + git merge', shallow, rows, counts };
}

// ---------------------------------------------------------------- self-test

function selfTest() {
  const fails = [];
  const check = (cond, msg) => { if (!cond) fails.push(msg); else console.log(`  ok  ${msg}`); };
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-status-index-'));
  try {
    const root = path.join(tmp, 'repo');
    fs.mkdirSync(path.join(root, LANES_REL), { recursive: true });
    const oldStatus = '# Status and handover — old\n\n## 1. What is live\n\n- a | b\n- the same line\n- the same line\n\n```\ncode\n```\n';
    fs.writeFileSync(path.join(root, STATUS_REL), oldStatus);
    const lane = (id, state, goLines = []) => [
      `Lane: ${id}`, `Title: Lane ${id}`, 'Session: —', `Branch: claude/x-${id}`, 'Owner of files: tests/x',
      `State: ${state}`, 'Updated: 2026-10-23', 'Builder profile: mq-opus-medium', 'Critic rounds: 0, none', '',
      '## Now', '- building', '', '## Owner go', '<!-- go lines only -->', ...goLines, '', '## Open questions', '- none', '',
      '## Log', '- 2026-10-23: started', ''].join('\n');
    const w = (name, text) => fs.writeFileSync(path.join(root, LANES_REL, name), text);
    // the known families of the fixture: SKILLS categories (data.js read as text), families.txt, spec-card ids
    fs.mkdirSync(path.join(root, 'js/modules'), { recursive: true });
    fs.writeFileSync(path.join(root, 'js/modules/data.js'), "export const DOMAINS = {\n    number: { cats: ['addition'] },\n};\nexport const SKILLS = {\n    addition: [\n        { v: 'add', l: 'Add' },\n    ],\n    subtraction: [],\n    fractions: [\n    ],\n};\nexport const OTHER = {\n    notafamily: [],\n};\n");
    const RL = (r) => readLanes(r, { today: '2026-10-24' });
    w('alpha.md', lane('alpha', 'building', ['Owner go: addition, 2026-10-22']));
    w('beta.md', lane('beta', 'planned'));
    // Non-lane files that must be ignored.
    w('_TEMPLATE.md', lane('template', 'planned', ['Owner go: bogus family, never']));
    w('defect-classes.md', '# Defect classes\n\n| Class | Kind |\n|---|---|\n| SIZE | machine |\n\n## Owner go\nnot a go line\n');
    w('README.md', '# Lane status files\n\nOwner go: <family>, <YYYY-MM-DD>\n');
    w('defect-tally.csv', 'class,report\nSIZE,r1\n');
    w('metrics.md', '# Metrics\n\nLane notes are not lanes.\n');

    // 1. ignore rule
    const r1 = RL(root);
    check(r1.errors.length === 0, `fixture lanes parse with no errors (${r1.errors.join('; ') || 'none'})`);
    check(r1.lanes.map((l) => l.header.Lane).join(',') === 'alpha,beta', 'only alpha.md and beta.md are lanes');
    check(['_TEMPLATE.md', 'defect-classes.md', 'README.md', 'defect-tally.csv', 'metrics.md'].every((n) => r1.ignored.includes(`${LANES_REL}/${n}`)), 'non-lane files in design/status are ignored');

    // 2. --init preserves every line
    const inited = initText(oldStatus, r1.lanes);
    check(inited.endsWith(oldStatus), '--init keeps the old file as a byte-for-byte suffix');
    check(missingLine(oldStatus, inited) === null, '--init: every old line appears, in order');
    check(inited.includes(ARCHIVE_HEADING) && inited.indexOf(ARCHIVE_HEADING) < inited.indexOf('# Status and handover — old'), '--init puts the archive heading above the old content');
    let threw = false; try { initText(inited, r1.lanes); } catch { threw = true; }
    check(threw, '--init refuses to run twice');
    check(missingLine(oldStatus, inited.replace('- the same line\n', '')) !== null, 'line check catches a dropped (duplicate) line');
    check(missingLine('a\nb\nc', 'a\nc\nb') !== null, 'line check catches lines out of order');

    // 3. idempotent regeneration
    const g1 = regenerate(inited, r1.lanes);
    const g2 = regenerate(g1, RL(root).lanes);
    check(g1 === inited && g2 === g1, 'regeneration is idempotent (byte-identical on a second run)');

    // 4. region-only edits
    const edited = g1.replace(ARCHIVE_HEADING, `${ARCHIVE_HEADING}\n\nLead note added by hand.`) + '- appended by the lead\n';
    w('beta.md', lane('beta', 'critic', ['Owner go: fractions, 2026-10-24']));
    const r2 = RL(root);
    const stale = regenerate(edited, r2.lanes) !== edited;
    check(stale, 'a lane change makes the region stale (--check would fail)');
    const g3 = regenerate(edited, r2.lanes);
    const pe = splitRegion(edited), p3 = splitRegion(g3);
    check(pe.before === p3.before && pe.after === p3.after, 'regeneration changes nothing outside the markers');
    check(p3.region.includes('| beta | Lane beta | critic |') && p3.region.includes('| fractions | 2026-10-24 | beta |'), 'the region shows the new state and go line');
    check(missingLine(oldStatus, g3) === null, 'old lines still present after regeneration');

    // 5. malformed go lines fail
    w('gamma.md', lane('gamma', 'building', ['Owner go: subtraction 2026-10-23']));
    const r3 = RL(root);
    check(r3.errors.some((e) => e.includes('gamma.md:') && e.includes('malformed go line')), 'a malformed go line is an error with file:line');
    w('gamma.md', lane('gamma', 'building', ['Owner go: subtraction, 2026-02-30']));
    check(RL(root).errors.some((e) => e.includes('not a real date')), 'an impossible go date is an error');
    w('gamma.md', lane('gamma', 'building').replace('## Log\n', '## Log\nOwner go: subtraction, 2026-10-23\n'));
    check(RL(root).errors.some((e) => e.includes('outside the "## Owner go" section')), 'a go line outside its section is an error');
    w('gamma.md', lane('gamma', 'building', ['Owner go: subtraction, 2026-10-25']));
    check(RL(root).errors.some((e) => e.includes('gamma.md:') && e.includes('in the future')), 'N1: a go date after today is an error');
    w('gamma.md', lane('gamma', 'building', ['Owner go: notafamily, 2026-10-23']));
    check(RL(root).errors.some((e) => e.includes('"notafamily" is not a known family')), 'N1: an unknown family is an error (an object other than SKILLS does not count)');
    check(JSON.stringify(skillsCategories(fs.readFileSync(path.join(root, 'js/modules/data.js'), 'utf8'))) === '["addition","subtraction","fractions"]', 'N1: SKILLS categories are read from data.js as text');
    w('gamma.md', lane('gamma', 'building', ['Owner go: stack, 2026-10-23', 'Owner go: long-division, 2026-10-23']));
    const e5 = RL(root).errors;
    check(e5.some((e) => e.includes('"stack" is not a known family')) && e5.some((e) => e.includes('"long-division" is not a known family')), 'N1: template-family ids need families.txt or a card');
    fs.writeFileSync(path.join(root, 'design/status/families.txt'), '# template families\nstack   # the column template\n');
    fs.mkdirSync(path.join(root, 'design/cards/long-division'), { recursive: true });
    check(RL(root).errors.length === 0, 'N1: a family listed in design/status/families.txt or a spec-card id is accepted');
    w('gamma.md', lane('gamma', 'sleeping'));
    check(RL(root).errors.some((e) => e.includes('State "sleeping"')), 'an unknown State is an error');
    fs.rmSync(path.join(root, LANES_REL, 'gamma.md'));
    const goLines = RL(root).lanes.flatMap((l) => l.go);
    check(goLines.length === 2 && goLines.every((g) => /^design\/status\/(alpha|beta)\.md$/.test(g.file) && g.line > 0), 'go lines carry lane, file and line');

    // 6. the conflicts measurement on a tiny repo
    const gr = path.join(tmp, 'git');
    fs.mkdirSync(path.join(gr, 'design'), { recursive: true });
    const g = (...a) => execFileSync('git', ['-c', 'commit.gpgsign=false', '-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'init.defaultBranch=main', ...a], { cwd: gr, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    g('init', '-q');
    fs.writeFileSync(path.join(gr, STATUS_REL), 'a\nb\n'); fs.writeFileSync(path.join(gr, 'index.html'), 'v=1\n'); fs.writeFileSync(path.join(gr, 'x.js'), '1\n');
    g('add', '.'); g('commit', '-qm', 'base');
    g('checkout', '-qb', 'lane');
    fs.writeFileSync(path.join(gr, STATUS_REL), 'a\nlane\n'); fs.writeFileSync(path.join(gr, 'x.js'), '2\n'); g('commit', '-qam', 'lane');
    g('checkout', '-q', 'main');
    fs.writeFileSync(path.join(gr, STATUS_REL), 'a\nmain\n'); g('commit', '-qam', 'main');
    try { g('merge', '-q', 'lane'); } catch { /* conflict expected */ }
    fs.writeFileSync(path.join(gr, STATUS_REL), 'a\nmain\nlane\n'); g('commit', '-qam', 'merge lane (STATUS conflict)');
    g('checkout', '-qb', 'clean'); fs.writeFileSync(path.join(gr, 'y.js'), '1\n'); g('add', '.'); g('commit', '-qm', 'clean');
    g('checkout', '-q', 'main'); fs.writeFileSync(path.join(gr, 'z.js'), '1\n'); g('add', '.'); g('commit', '-qm', 'z');
    g('merge', '-q', '--no-edit', 'clean');
    for (const method of mergeTreeSupported(gr) ? ['write-tree', 'worktree'] : ['worktree']) {
      const m = measureConflicts(gr, '2000-01-01', { method });
      check(m.counts.merges === 2 && m.counts.status === 1 && m.counts.anyConflict === 1 && m.counts.stamp === 0, `--conflicts (${method}) finds 1 STATUS conflict in 2 merges`);
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  if (fails.length) { for (const f of fails) console.log(`  FAIL ${f}`); return false; }
  return true;
}

// ---------------------------------------------------------------- CLI

function main(argv) {
  const has = (f) => argv.includes(f);
  const val = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
  const root = path.resolve(val('--root') || defaultRoot);
  const statusPath = path.join(root, STATUS_REL);
  const json = has('--json');
  const done = (ok) => { (json ? console.error : console.log)(`${TOOL}: ${ok ? 'OK' : 'FAIL'}`); return ok ? 0 : 1; };

  if (has('--self-test')) return done(selfTest());

  if (has('--verify-lines')) {
    const ref = val('--verify-lines') || 'HEAD';
    const r = git(root, ['show', `${ref}:${STATUS_REL}`]);
    if (r.status !== 0) { console.log(`cannot read ${ref}:${STATUS_REL}: ${r.stderr.trim()}`); return done(false); }
    const now = fs.readFileSync(statusPath, 'utf8');
    const miss = missingLine(r.stdout, now);
    const oldLines = r.stdout.split('\n').length;
    console.log(miss ? `line ${miss.index} of ${ref}:${STATUS_REL} is missing or out of order: ${miss.line.slice(0, 120)}`
      : `all ${oldLines} lines of ${ref}:${STATUS_REL} appear in order in ${STATUS_REL}${now.endsWith(r.stdout) ? ' (and the old file is a byte-for-byte suffix)' : ''}`);
    return done(!miss);
  }

  if (has('--conflicts')) {
    const since = val('--since');
    if (!since) { console.log('--conflicts needs --since <YYYY-MM-DD|commit>'); return done(false); }
    const m = measureConflicts(root, since);
    console.log(`merges since ${since} (method: ${m.method}${m.shallow ? '; SHALLOW clone' : ''})`);
    for (const r of m.rows) {
      const tag = r.error ? `UNKNOWN (${r.error})` : r.files.length ? `conflict: ${r.files.join(', ')}` : 'clean';
      console.log(`  ${r.sha.slice(0, 9)} ${r.date} ${tag} — ${r.subject.slice(0, 80)}`);
    }
    const c = m.counts;
    console.log(`merges: ${c.merges}; re-run: ${c.rerun}; unknown: ${c.unknown}`);
    console.log(`conflicted: ${c.anyConflict} (STATUS.md ${c.status}, index.html ${c.stamp}, design/status/* ${c.laneFiles}; any of these ${c.watched}; only other files ${c.otherOnly})`);
    return done(c.unknown === 0);
  }

  const { lanes, errors } = readLanes(root);

  if (has('--owner-go')) {
    const go = lanes.flatMap((l) => l.go).sort((a, b) => a.date.localeCompare(b.date) || a.family.localeCompare(b.family));
    for (const e of errors) console.error(`error: ${e}`);
    if (json) console.log(JSON.stringify(go, null, 2));
    else if (!go.length) console.log('no Owner go lines');
    else for (const g of go) console.log(`${g.family}\t${g.date}\t${g.lane}\t${g.file}:${g.line}`);
    return done(errors.length === 0);
  }

  for (const e of errors) console.log(`error: ${e}`);
  if (!fs.existsSync(statusPath)) { console.log(`no ${STATUS_REL}`); return done(false); }
  const text = fs.readFileSync(statusPath, 'utf8');

  if (has('--init')) {
    if (errors.length) return done(false);
    let next;
    try { next = initText(text, lanes); } catch (e) { console.log(e.message); return done(false); }
    const miss = missingLine(text, next);
    if (miss || !next.endsWith(text)) { console.log('init would lose content; nothing written'); return done(false); }
    fs.writeFileSync(statusPath, next);
    console.log(`initialised ${STATUS_REL}: ${lanes.length} lanes; all ${text.split('\n').length} old lines kept below "${ARCHIVE_HEADING}"`);
    return done(true);
  }

  let next;
  try { next = regenerate(text, lanes); } catch (e) { console.log(e.message); return done(false); }
  if (has('--check')) {
    const fresh = next === text;
    console.log(fresh ? `${STATUS_REL} index is up to date (${lanes.length} lanes)` : `${STATUS_REL} index is STALE: run node tests/scripts/ws-status-index.mjs`);
    return done(fresh && errors.length === 0);
  }
  if (errors.length) { console.log('lane files have errors; index not written'); return done(false); }
  if (next !== text) fs.writeFileSync(statusPath, next);
  console.log(`${next === text ? 'unchanged' : 'regenerated'}: ${STATUS_REL} index (${lanes.length} lanes, ${lanes.flatMap((l) => l.go).length} go lines)`);
  return done(true);
}

process.exitCode = main(process.argv.slice(2));
