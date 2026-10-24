// ws-options-pin: pin ws-options-verify's failures for EVERY live skill, and check a fresh run against the pin
// (IMPROVEMENT_PLAN §1.4 S1: a red gate compares with a pinned baseline). The pin is
// design/audit/baselines/options-verify.json, the file ws-precritic's options-verify gate reads (PARSE.optionsVerify):
//   {note, how, pinned, scope: [every live skill], noOptions: [live skills with no option shown],
//    skills: {"cat:skill": ["option=<JSON value>" | "static:<message>"]}}   (an empty list = every value passes)
//
//   node tests/scripts/ws-options-pin.cjs --write                        # every live skill: run and pin (rewrites the file)
//   node tests/scripts/ws-options-pin.cjs --check                        # every live skill: FAIL on a failure not pinned
//   node tests/scripts/ws-options-pin.cjs --write --skills cat:skill,... # re-pin a subset (merged into the file)
//   node tests/scripts/ws-options-pin.cjs --write --category addition    # re-pin one category (merged)
//   node tests/scripts/ws-options-pin.cjs --check --shard 2/28           # the skills of slice 2 of 28 (by hash, below)
//   node tests/scripts/ws-options-pin.cjs --check --resume               # skip batches whose tmp JSON already exists
//   node tests/scripts/ws-options-pin.cjs --list                         # the batches, run nothing (one browser start)
//   node tests/scripts/ws-options-pin.cjs --gate design/audit/matrix     # THE DEPLOY GATE: node only, no browser, seconds
//   node tests/scripts/ws-options-pin.cjs --self-test                    # node only: the hash batching and the gate's fold
//
//   --batch N        skills per ws-options-verify process (default 25; one browser start per batch)
//   --slots N        batches at once (default 2), each through /tmp/mq-browser-run.sh (it queues behind other sessions)
//   --tmp DIR        where the per-batch JSON goes (default /tmp/mq-options-pin/<UTC date>.<commit 12>[-dirty-<diff
//                    hash>][.shard-i-of-n], A12: keyed by the commit, so a --resume after a commit or an edit never
//                    reuses another tree's results); --resume reuses it, so a crashed nightly continues where it
//                    stopped; a batch's file name carries a hash of its skills, so a changed selection never reuses a
//                    stale file. The dir holds run-key.json (date, commit, diff hash, shard); --resume into a dir whose
//                    key differs (a --tmp DIR given by hand, reused on another tree) is refused (exit 2)
//   --n N            items per check, passed to ws-options-verify (default: its own, 12 - the precritic's value)
//   --deadline MS    ws-options-verify's per-skill deadline (default 600000: its own 60 s default times out on
//                    add_facts, sub_facts, f_to_d and the mixed pools in a cloud container with shared slots)
//   --out f.json     also write the run (THE RUN FILE, below)
//   --baseline f     the pin file (default design/audit/baselines/options-verify.json)
//   --report-only    exit 0 even when --check finds new failures (a crash still exits non-zero)
//   --keep-tmp       keep the tmp directory after a complete run (it is kept anyway when a batch failed)
//
// BATCHES AND SLICES (critic r4 N8). A skill's slice of n is a hash of its skill id: (SHA-256 of "options-pin:<id>",
// first 32 bits) mod n, + 1. It depends on the id only, so appending a skill never moves another skill to another
// slice (a split by position in SKILLS did, so a 28-night cycle could skip or repeat skills). --shard i/n runs slice i
// of n: about 714 / 28 = 25.5 skills, one or two balanced batches of at most --batch. Skills that share an id stay in
// one batch, because ws-options-verify --skill matches an id in every category. A full run orders the skills by the
// same hash and cuts balanced batches of at most --batch (29 batches of about 25 for 714 skills).
//
// How a batch runs: `node tests/scripts/ws-options-verify.cjs --skill <ids> --json <tmp>/b<i>-<hash>.json --report-only`.
// Results outside the selection are dropped. A failing pair is written exactly as ws-precritic forms it:
// `${option}=${JSON.stringify(value)}` for a value, `static:${message}` for a static check. A skill whose verifier timed
// out or crashed in its batch (`*="*"`) is run once more on its own at --deadline, so one slow moment under a shared
// slot does not become a pin. If it times out again it is run with --deadline <--long-deadline, default 1800000 ms>
// and pinned as `*="*"` PLUS the pairs that long run finds: a precritic run that
// times out stays green, one that finishes still fails on a new pair. A batch that exits without its JSON is retried once.
//
// --check: NEW = a failing pair of a skill in the selection that the pin does not list (a skill missing from the pin
// counts every pair as new); FIXED = a pinned pair that no longer fails (listed, not a failure: re-pin with --write
// --skills to drop it). Prints `ws-options-pin: OK` / `ws-options-pin: FAIL` last; exit 1 on FAIL (unless --report-only).
//
// THE RUN FILE (--out; the nightly's design/audit/matrix/options-pin-<date>[T<HHMM>][.shard-i-of-n].json):
//   { tool: "ws-options-pin", kind: "options-pin", date, started, finished (ISO), commit, dirty, mode, batching: "hash-v1",
//     shard: "i/n" | null, slice: {i, n} | null, subset (true when --skills / --category narrowed it), complete (no
//     crashed batch, no skill without a result), pin {file, sha256, pinned}, selected, run, noOptions, wallMs, slotMs,
//     perSkillMs, batches, pageErrors, crashed, missing, reruns, optionCounts,
//     failing {"cat:skill": [every failing pair of that skill in this run; [] = it ran and every value passed]},
//     new [{key, id, msg, unpinned}] (judged against the pin named above), fixed [{key, id}] }
//   It carries no `rows`, so ws-coverage-matrix's fold lists it as "an options-pin report" and never folds it.
//
// --gate <dir> (critic r4 D1: the deploy reads the nightly results instead of running the pin, ≈ 1 h 52 min on two
// slots). Node only: no browser slot, a few seconds. It folds every <dir>/options-pin-*.json, ordered by `finished`
// (ISO time; a file without one by the date in its name at 00:00 UTC), ties broken by file name, into each skill's
// NEWEST result (the last file whose `failing` lists the skill; a crashed batch's skills are not listed, so they keep
// their older result). A file with `dirty: true` can add a failure but never clears one. A10: a file whose `finished`
// is more than 10 min after now (clock skew) is a WARNING: like a dirty file it can add a failure but never clears
// one, it is not the newest file (age) and it checks no slice; it is ordered by its `started` (else its name). Then:
//   FAIL     a live skill (data.js SKILLS, retired and custom_mixed out) whose newest result has a failing pair the
//            CURRENT pin (--baseline) does not list: a NEW pair that no later check fixed (a skill missing from the
//            pin counts every pair); or an unreadable options-pin file; or, ONCE ALL 28 SLICES HAVE BEEN CHECKED, the
//            newest file finished more than 24 h ago
//   WARNING  (passes) no options-pin file yet; fewer than the 28 slices checked (a complete, clean run file of slice
//            i/28, "hash-v1" batching, or a complete clean full run, which counts as all 28); or the newest file is
//            more than 24 h old before all 28 are checked (the matrix's rule before its first full baseline)
//   OK       otherwise
// Exit 0 OK, 1 FAIL, 4 WARNING (ws-deploy-gates.sh reads 4 as WARNING). The last line is `ws-options-pin --gate: OK`,
// `WARNING` or `FAIL`. MQ_NOW (ISO time) replaces the clock (fixtures: tests/fixtures/precritic/deploy/options-pin/).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const has = (k) => process.argv.includes('--' + k);

const ROOT = process.env.MQ_ROOT ? path.resolve(process.env.MQ_ROOT) : path.resolve(__dirname, '..', '..');
const VERIFY = path.join(__dirname, 'ws-options-verify.cjs');
const RUNNER = '/tmp/mq-browser-run.sh';
const BASE = path.resolve(ROOT, arg('baseline', 'design/audit/baselines/options-verify.json'));
const rel = (p) => { const r = path.relative(ROOT, p); return !r ? p : r.startsWith('..') ? p : r; };

/* ============================================================================ batches by hash (N8), pure */

const h32 = (s) => parseInt(crypto.createHash('sha256').update(String(s)).digest('hex').slice(0, 8), 16);
/** A skill id's slice of n (1-based): a hash of the id only, so appending skills never moves another skill. */
const sliceOf = (skillId, n) => (h32('options-pin:' + skillId) % n) + 1;
/**
 * The batches of a selection: `skills` = [{key, categoryId, skillId, ...}] (the skills with options). Skills sharing
 * an id form one group (ws-options-verify --skill matches an id in every category). With `shard` {i, n} only the groups
 * of slice i of n are kept. The groups are ordered by their hash and cut into balanced batches of at most `batch`
 * skills (one group larger than `batch` is a batch of its own). Returns [{i, skills, keys, ids}].
 */
function planBatches(skills, { batch, shard = null }) {
    const byId = new Map();
    for (const s of skills) { if (!byId.has(s.skillId)) byId.set(s.skillId, []); byId.get(s.skillId).push(s); }
    let groups = [...byId.entries()].map(([id, list]) => ({ id, list, h: h32('options-pin:' + id) }));
    if (shard) groups = groups.filter((g) => g.h % shard.n === shard.i - 1);
    groups.sort((a, b) => a.h - b.h || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const total = groups.reduce((n, g) => n + g.list.length, 0);
    const target = total ? Math.ceil(total / Math.max(1, Math.ceil(total / batch))) : batch;
    const out = [];
    let cur = [];
    for (const g of groups) {
        if (cur.length && cur.length + g.list.length > target) { out.push(cur); cur = []; }
        cur.push(...g.list);
    }
    if (cur.length) out.push(cur);
    return out.map((list, i) => ({ i, skills: list, keys: list.map((s) => s.key), ids: [...new Set(list.map((s) => s.skillId))] }));
}

/* ============================================================================ the --resume tmp dir (A12), pure */

/**
 * The run's key: what a --resume may continue. `commit` = full HEAD sha (null outside git), `diffHash` = a hash of
 * `git diff HEAD` when the tree has local edits (null when clean), `shard` = {i, n} | null.
 */
const runKeyOf = ({ date, commit, diffHash = null, shard = null }) => ({ date, commit: commit || 'nogit', diff: diffHash || null, shard: shard ? `${shard.i}/${shard.n}` : null });
/** The default tmp dir for a key: /tmp/mq-options-pin/<date>.<commit 12>[-dirty-<diff 8>][.shard-i-of-n] (A12). */
const tmpDirFor = (key, base = '/tmp/mq-options-pin') => path.join(base, `${key.date}.${String(key.commit).slice(0, 12)}${key.diff ? `-dirty-${String(key.diff).slice(0, 8)}` : ''}${key.shard ? `.shard-${key.shard.replace('/', '-of-')}` : ''}`);
/** --resume into `dir`: null when it may continue, else why not (a run-key.json from another tree, date or shard). */
function resumeRefusal(dir, key) {
    const f = path.join(dir, 'run-key.json');
    if (!fs.existsSync(f)) return null;   // a fresh dir
    let k; try { k = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return `${f} is unreadable (${e.message.slice(0, 60)})`; }
    const diff = ['date', 'commit', 'diff', 'shard'].filter((x) => (k[x] || null) !== (key[x] || null));
    return diff.length ? `${dir} holds the batches of another run (${diff.map((x) => `${x} ${k[x] || 'none'} there, ${key[x] || 'none'} now`).join('; ')}); a --resume would mix two trees' results. Run without --resume, or with another --tmp` : null;
}

/* ============================================================================ the deploy gate (D1), node only */

const OPIN_RE = /^options-pin-.*\.json$/;
const nameTime = (f) => { const m = /(\d{4}-\d{2}-\d{2})(?:T(\d{2})(\d{2}))?/.exec(f); return m ? Date.parse(`${m[1]}T${m[2] || '00'}:${m[3] || '00'}:00Z`) : NaN; };
/**
 * Fold every <dir>/options-pin-*.json into each skill's newest result. `pin` = the current pin ({skills}). Files are
 * ordered by `finished` (else the date in the name), ties by name. A dirty file can add NEW pairs but never clears.
 * Returns { files: [{file, when, j}], bad: [{file, error}], skills: Map(key -> {pairs, newPairs, file, when}),
 *           slices: Set(i of 28 checked), full: bool (all 28, or a complete clean full run), newest: ms | null,
 *           dirtyIgnored: [{key, file}] }.
 */
const SKEW_MS = 10 * 60 * 1000;   // A10: a `finished` up to 10 min ahead of the clock is clock skew, not a future file
function foldOptionPins(dir, pin, now = Date.now()) {
    const names = (fs.existsSync(dir) ? fs.readdirSync(dir) : []).filter((f) => OPIN_RE.test(f));
    const files = [], bad = [];
    for (const f of names) {
        const file = path.join(dir, f);
        let j;
        try { j = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { bad.push({ file, error: e.message.slice(0, 120) }); continue; }
        if (!j || typeof j !== 'object' || !j.failing || typeof j.failing !== 'object') { bad.push({ file, error: 'no "failing" map (not an options-pin run file)' }); continue; }
        const fin = Date.parse(j.finished);
        // A10: a `finished` beyond the clock skew is not trusted: ordered by `started` (else the name), never clears
        if (Number.isFinite(fin) && fin > now + SKEW_MS) {
            const st = Date.parse(j.started);
            const sane = Number.isFinite(st) && st <= now + SKEW_MS;
            files.push({ file, name: f, when: sane ? st : nameTime(f), src: sane ? 'started (finished is in the future)' : 'name (finished is in the future)', future: { finished: j.finished, aheadH: (fin - now) / 3600000 }, j });
            continue;
        }
        files.push({ file, name: f, when: Number.isFinite(fin) ? fin : nameTime(f), src: Number.isFinite(fin) ? 'finished' : 'name', j });
    }
    files.sort((a, b) => (a.when - b.when) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    const pinned = (pin && pin.skills) || {};
    const skills = new Map(), slices = new Set(), dirtyIgnored = [], future = [];
    let full = false, newest = null;
    for (const e of files) {
        const j = e.j;
        const untrusted = j.dirty || e.future;
        if (e.future) future.push({ file: e.file, finished: e.future.finished, aheadH: e.future.aheadH, cleared: [] });
        for (const [key, pairs] of Object.entries(j.failing)) {
            const list = Array.isArray(pairs) ? pairs.map(String) : [];
            const p = pinned[key];
            const newPairs = list.filter((x) => !p || !p.includes(x));
            // N3 analogue: a run on a dirty tree can add a failure, never clear one; A10: nor can a future-dated file
            if (untrusted && !newPairs.length) {
                if (skills.has(key) && skills.get(key).newPairs.length) { if (j.dirty) dirtyIgnored.push({ key, file: e.file }); else future[future.length - 1].cleared.push(key); }
                continue;
            }
            skills.set(key, { pairs: list, newPairs, file: e.file, when: e.when });
        }
        if (untrusted) continue;
        if (Number.isFinite(e.when) && (newest === null || e.when > newest)) newest = e.when;
        const complete = j.complete === true;
        if (!complete || j.batching !== 'hash-v1' || j.subset) continue;
        const sl = j.slice || (typeof j.shard === 'string' && /^(\d+)\/(\d+)$/.test(j.shard) ? { i: +j.shard.split('/')[0], n: +j.shard.split('/')[1] } : null);
        if (!sl) full = true;
        else if (sl.n === 28) slices.add(sl.i);
    }
    if (slices.size === 28) full = true;
    return { files, bad, skills, slices, full, newest, dirtyIgnored, future };
}

/** Live skills from data.js in node (as the in-browser listing: SKILLS minus `retired` and custom_mixed). */
async function liveKeysNode(root) {
    globalThis.localStorage = globalThis.localStorage || { getItem: () => null, setItem() {}, removeItem() {} };
    if (!globalThis.window) globalThis.window = globalThis;
    const q = [console.log, console.warn]; console.log = console.warn = () => {};
    let SKILLS;
    try { ({ SKILLS } = await import(require('url').pathToFileURL(path.join(root, 'js', 'modules', 'data.js')).href)); } finally { [console.log, console.warn] = q; }
    const live = new Set();
    for (const [cat, list] of Object.entries(SKILLS)) if (Array.isArray(list)) for (const s of list) if (s && s.v && !s.retired && s.v !== 'custom_mixed') live.add(`${cat}:${s.v}`);
    return live;
}

/** The gate's verdict: { code 0 | 1 | 4, lines, fold }. `live` = Set of live skill keys. */
function gateVerdict({ dir, pinFile, live, now }) {
    const lines = [], warnings = [], refusals = [];
    const say = (l) => lines.push(`options gate: ${l}`);
    let pin = null;
    try { pin = JSON.parse(fs.readFileSync(pinFile, 'utf8')); } catch (e) { refusals.push(`the pin ${rel(pinFile)} is unreadable (${e.message.slice(0, 80)})`); }
    const fo = foldOptionPins(dir, pin, now);
    say(`${fo.files.length} options-pin run file(s) in ${rel(dir)}, folded by finished time; ${fo.skills.size} skill(s) with a result; pin ${rel(pinFile)}${pin && pin.pinned ? ` (pinned ${pin.pinned})` : ''}`);
    for (const b of fo.bad) refusals.push(`unreadable options-pin file ${rel(b.file)}: ${b.error}`);
    say(fo.full ? 'every slice checked (all 28 slices, or a complete full run)' : `${fo.slices.size} of 28 slices checked${fo.slices.size ? ` (${[...fo.slices].sort((a, b) => a - b).join(', ')})` : ''}`);
    // NEW pairs of live skills: the newest result per skill, judged against the CURRENT pin
    const news = [];
    for (const [key, r] of fo.skills) {
        if (!r.newPairs.length) continue;
        if (!live.has(key)) { say(`${key} has NEW pair(s) in ${path.basename(r.file)}, but it is not a live skill (ignored)`); continue; }
        news.push(`${key}: ${r.newPairs.slice(0, 3).join(', ')}${r.newPairs.length > 3 ? ` and ${r.newPairs.length - 3} more` : ''} (newest result: ${path.basename(r.file)}${pin && pin.skills && !pin.skills[key] ? '; the skill is not in the pin' : ''})`);
    }
    // A10: a file dated in the future (beyond 10 min of clock skew) clears nothing and is not the newest result
    for (const f of fo.future) warnings.push(`${path.basename(f.file)} finished ${f.finished}, ${f.aheadH.toFixed(1)} h after now (beyond the 10-min clock skew): it can add a failure but clears none${f.cleared.length ? ` (it would have cleared ${f.cleared.join(', ')})` : ''}, checks no slice and is not the newest file; fix the clock that wrote it, or the file`);
    for (const d of fo.dirtyIgnored) say(`${d.key}: ${path.basename(d.file)} ran on a dirty tree and lists no new pair; it does not clear the earlier NEW pair (N3)`);
    if (news.length) refusals.push(`${news.length} live skill(s) have a failing pair the pin does not list, and no later check fixed it: ${news.slice(0, 10).join('; ')}${news.length > 10 ? ' ...' : ''}. Fix the option (a later nightly, or ws-options-pin --check --skills <cat:skill> --out ${rel(dir)}/options-pin-<date>T<HHMM>.json on a clean tree, that no longer fails clears it), or re-pin it on purpose with a STATUS note: node tests/scripts/ws-options-pin.cjs --write --skills <cat:skill>`);
    // age and coverage (the matrix's rule: a warning until the whole set has been checked once)
    if (fo.newest === null) {
        const why = `no options-pin run file in ${rel(dir)} (the nightly writes options-pin-<date>.json)`;
        if (fo.full) refusals.push(why); else warnings.push(`${why}; not refused until all 28 slices have been checked`);
    } else {
        const age = (now - fo.newest) / 3600000;
        if (age > 24) {
            const why = `the newest options-pin file finished ${age.toFixed(1)} h ago, more than 24 h`;
            if (fo.full) refusals.push(why); else warnings.push(`${why}; not refused until all 28 slices have been checked`);
        } else say(`the newest options-pin file finished ${age.toFixed(1)} h ago`);
        if (!fo.full) warnings.push(`only ${fo.slices.size} of 28 slices have been checked: the options of the skills in the other slices are not checked at this deploy (the nightly checks one slice a night)`);
    }
    for (const w of warnings) say(`WARNING - ${w}`);
    for (const r of refusals) say(`REFUSED - ${r}`);
    if (!news.length && !fo.bad.length) say('no NEW failing pair of a live skill in the newest results');
    const code = refusals.length ? 1 : warnings.length ? 4 : 0;
    lines.push(`ws-options-pin --gate: ${code === 1 ? 'FAIL' : code === 4 ? 'WARNING' : 'OK'}`);
    return { code, lines, fold: fo };
}

/** --self-test (node only): the hash batching (N8) and the gate's fold (D1) on generated directories. */
function selfTest() {
    const bad = []; let n = 0;
    const ok = (c, m) => { n++; if (!c) bad.push(m); };
    const os = require('os');
    // batching: 714 skills over 9 categories, a few ids shared across categories
    const mk = (count, from = 0) => Array.from({ length: count }, (_, k) => { const i = k + from; const skillId = i % 50 === 7 && i > 7 ? `shared${i % 4}` : `skill${i}`; return { categoryId: `cat${i % 9}`, skillId, key: `cat${i % 9}:${skillId}` }; });
    const all = mk(714).filter((s, i, a) => a.findIndex((x) => x.key === s.key) === i);
    const where = new Map(); let total = 0; const sizes = [];
    for (let i = 1; i <= 28; i++) {
        let inShard = 0;
        for (const b of planBatches(all, { batch: 25, shard: { i, n: 28 } })) {
            total += b.keys.length; inShard += b.keys.length;
            for (const k of b.keys) where.set(k, (where.get(k) || []).concat(i));
            ok(b.keys.length <= 25 || b.ids.length === 1, `batches: slice ${i} has a batch of ${b.keys.length} > 25`);
        }
        sizes.push(inShard);
    }
    ok(total === all.length && where.size === all.length && [...where.values()].every((v) => v.length === 1), `N8: the 28 slices partition the skills (${total} placed, ${where.size} distinct of ${all.length})`);
    ok(Math.max(...sizes) <= 2 * Math.ceil(all.length / 28) + 6, `N8: no slice is far above ${Math.ceil(all.length / 28)} skills (largest ${Math.max(...sizes)})`);
    const grown = [...all, ...mk(60, 5000)];
    ok(all.every((s) => planBatches(grown, { batch: 25, shard: { i: where.get(s.key)[0], n: 28 } }).some((b) => b.keys.includes(s.key))), 'N8: appending 60 skills never moves an existing skill to another slice');
    ok(all.every((s) => sliceOf(s.skillId, 28) === where.get(s.key)[0]), 'N8: sliceOf names the slice planBatches puts a skill in');
    const shared = all.filter((s) => s.skillId.startsWith('shared'));
    ok(shared.length > 4 && planBatches(all, { batch: 25 }).every((b) => shared.filter((s) => b.ids.includes(s.skillId)).every((s) => b.keys.includes(s.key))), 'batches: skills sharing an id stay in one batch');
    const fullB = planBatches(all, { batch: 25 });
    ok(fullB.every((b) => b.keys.length <= 25 || b.ids.length === 1) && fullB.reduce((a, b) => a + b.keys.length, 0) === all.length && fullB.length === Math.ceil(all.length / 25), `batches: a full run is ${Math.ceil(all.length / 25)} balanced batches of at most 25 (${fullB.length}: ${fullB.map((b) => b.keys.length).join(',')})`);
    // the gate's fold, on generated directories
    const live = new Set(['a:x', 'a:y', 'b:z']);
    const pin = { skills: { 'a:x': ['o="1"'], 'a:y': [], 'b:z': [] } };
    const now = Date.parse('2026-10-23T12:00:00Z');
    const dir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'mq-opin-'));
    const put = (d, f, o) => fs.writeFileSync(path.join(d, f), JSON.stringify({ tool: 'ws-options-pin', batching: 'hash-v1', complete: true, dirty: false, ...o }));
    const run = (d) => { const pf = path.join(d, 'pin.json'); fs.writeFileSync(pf, JSON.stringify(pin)); return gateVerdict({ dir: d, pinFile: pf, live, now }); };
    let d = dir();
    let v = run(d);
    ok(v.code === 4 && v.lines.some((l) => /WARNING - no options-pin run file/.test(l)), `D1: no options-pin file is a WARNING (${v.code})`);
    put(d, 'options-pin-2026-10-23.json', { finished: '2026-10-23T02:00:00Z', shard: '3/28', slice: { i: 3, n: 28 }, failing: { 'a:x': ['o="1"', 'o="2"'] } });
    v = run(d);
    ok(v.code === 1 && v.lines.some((l) => /REFUSED - 1 live skill\(s\) .*a:x: o="2"/.test(l)), `D1: a NEW pair of a live skill refuses (${v.code})`);
    put(d, 'options-pin-2026-10-23T0900.json', { finished: '2026-10-23T09:00:00Z', shard: null, failing: { 'a:x': ['o="1"'], 'a:y': [], 'b:z': [] } });
    v = run(d);
    ok(v.code === 0, `D1: NEW then fixed by a later (complete, full) check is OK (${v.code}: ${v.lines.slice(-3).join(' | ')})`);
    put(d, 'options-pin-2026-10-23T1000.json', { finished: '2026-10-23T10:00:00Z', shard: '4/28', slice: { i: 4, n: 28 }, dirty: true, failing: { 'a:x': ['o="1"', 'o="9"'] } });
    ok(run(d).code === 1, 'D1/N3: a dirty run can add a NEW pair');
    fs.rmSync(d, { recursive: true, force: true });
    // ordered by finished, not by name (the D2 class): a lane file that finished BEFORE the nightly does not override it
    d = dir();
    put(d, 'options-pin-lane-check.json', { finished: '2026-10-23T00:30:00Z', shard: null, failing: { 'a:x': ['o="1"'] } });
    put(d, 'options-pin-2026-10-23.json', { finished: '2026-10-23T02:10:00Z', shard: '5/28', slice: { i: 5, n: 28 }, failing: { 'a:x': ['o="1"', 'o="3"'] } });
    v = run(d);
    ok(v.code === 1 && /newest result: options-pin-2026-10-23\.json/.test(v.lines.join('\n')), `D1/D2: ordered by finished: the nightly's NEW pair (02:10) is newer than the lane's clean result (00:30) (${v.code})`);
    fs.rmSync(d, { recursive: true, force: true });
    // a dirty clean result does not clear
    d = dir();
    put(d, 'options-pin-2026-10-22.json', { finished: '2026-10-22T02:00:00Z', shard: null, failing: { 'a:x': ['o="1"', 'o="2"'] } });
    put(d, 'options-pin-2026-10-23.json', { finished: '2026-10-23T02:00:00Z', shard: null, dirty: true, failing: { 'a:x': ['o="1"'] } });
    v = run(d);
    ok(v.code === 1 && v.lines.some((l) => /dirty tree .* does not clear/.test(l)), `N3: a dirty run file never clears a NEW pair (${v.code})`);
    fs.rmSync(d, { recursive: true, force: true });
    // stale: a warning before all 28 slices, a refusal after
    d = dir();
    put(d, 'options-pin-2026-10-21.json', { finished: '2026-10-21T02:00:00Z', shard: '1/28', slice: { i: 1, n: 28 }, failing: { 'a:y': [] } });
    v = run(d);
    ok(v.code === 4 && v.lines.some((l) => /WARNING - the newest options-pin file finished 58\.0 h ago/.test(l)), `D1: stale before all 28 slices is a WARNING (${v.code})`);
    for (let i = 2; i <= 28; i++) put(d, `options-pin-2026-10-21T01${String(i).padStart(2, '0')}.json`, { finished: '2026-10-21T02:00:00Z', shard: `${i}/28`, slice: { i, n: 28 }, failing: {} });
    v = run(d);
    ok(v.code === 1 && v.fold.full && v.lines.some((l) => /REFUSED - the newest options-pin file finished 58\.0 h ago/.test(l)), `D1: stale after all 28 slices is refused (${v.code}, full ${v.fold.full})`);
    fs.rmSync(d, { recursive: true, force: true });
    // an incomplete run, a --skills subset and a position-batched shard are not checked slices
    d = dir();
    put(d, 'options-pin-2026-10-23.json', { finished: '2026-10-23T02:00:00Z', shard: null, complete: false, failing: {} });
    put(d, 'options-pin-2026-10-23T0300.json', { finished: '2026-10-23T03:00:00Z', shard: null, subset: true, failing: {} });
    put(d, 'options-pin-2026-10-23T0400.json', { finished: '2026-10-23T04:00:00Z', shard: '2/28', batching: undefined, failing: {} });
    v = run(d);
    ok(v.code === 4 && !v.fold.full && v.fold.slices.size === 0, `D1: an incomplete run, a --skills subset and a position-batched shard are not checked slices (${v.fold.slices.size})`);
    fs.writeFileSync(path.join(d, 'options-pin-broken.json'), '{oops');
    ok(run(d).code === 1, 'D1: an unreadable options-pin file refuses');
    fs.rmSync(d, { recursive: true, force: true });
    // a NEW pair of a skill that is not live is ignored
    d = dir();
    put(d, 'options-pin-2026-10-23.json', { finished: '2026-10-23T02:00:00Z', shard: null, failing: { 'gone:skill': ['o="1"'] } });
    v = run(d);
    ok(v.code === 0 && v.lines.some((l) => /gone:skill .* not a live skill \(ignored\)/.test(l)), `D1: a skill that is not live is ignored (${v.code})`);
    fs.rmSync(d, { recursive: true, force: true });
    // A10: a file whose `finished` is beyond 10 min of clock skew clears nothing, is not the newest, checks no slice
    d = dir();
    put(d, 'options-pin-2026-10-22.json', { finished: '2026-10-22T02:00:00Z', shard: '3/28', slice: { i: 3, n: 28 }, failing: { 'a:x': ['o="1"', 'o="2"'] } });
    put(d, 'options-pin-2026-10-23T0200.json', { started: '2026-10-23T02:00:00Z', finished: '2026-10-24T09:00:00Z', shard: '4/28', slice: { i: 4, n: 28 }, failing: { 'a:x': ['o="1"'] } });
    v = run(d);
    ok(v.code === 1 && v.fold.future.length === 1 && v.fold.future[0].cleared.join() === 'a:x' && v.lines.some((l) => /WARNING - options-pin-2026-10-23T0200\.json finished 2026-10-24T09:00:00Z, 21\.0 h after now .* clears none \(it would have cleared a:x\)/.test(l)) && !v.fold.slices.has(4), `A10: a future-dated file (21 h ahead) does not clear the NEW pair, warns, checks no slice (${v.code}; ${v.lines.filter((l) => /WARNING|REFUSED/.test(l)).join(' | ').slice(0, 300)})`);
    ok(v.lines.some((l) => /newest options-pin file finished 34\.0 h ago/.test(l)), 'A10: the future-dated file is not the newest file (the age is the 10-22 file\'s 34.0 h)');
    put(d, 'options-pin-2026-10-23T0300.json', { finished: '2026-10-23T12:09:00Z', shard: '5/28', slice: { i: 5, n: 28 }, failing: { 'a:x': ['o="1"'] } });
    v = run(d);
    ok(v.code === 4 && v.fold.slices.has(5) && v.fold.future.length === 1, `A10: a file 9 min ahead (within the skew) is trusted: it clears the pair and counts its slice (${v.code})`);
    put(d, 'options-pin-2026-10-23T1209.json', { started: '2026-10-23T12:09:30Z', finished: '2027-01-01T00:00:00Z', shard: null, failing: { 'a:x': ['o="1"', 'o="7"'] } });
    v = run(d);
    ok(v.code === 1 && v.lines.some((l) => /a:x: o="7"/.test(l)), `A10: a future-dated file (ordered by its started, 12:09:30, after the file that finished 12:09) can still ADD a failing pair (${v.code})`);
    fs.rmSync(d, { recursive: true, force: true });
    // A12: the --resume tmp dir is keyed by the commit and the local diff; a dir of another run refuses a --resume
    const k1 = runKeyOf({ date: '2026-10-23', commit: 'a'.repeat(40) }), k2 = runKeyOf({ date: '2026-10-23', commit: 'b'.repeat(40) });
    const k1d = runKeyOf({ date: '2026-10-23', commit: 'a'.repeat(40), diffHash: 'f00dfeed00000000' }), k1s = runKeyOf({ date: '2026-10-23', commit: 'a'.repeat(40), shard: { i: 3, n: 28 } });
    ok(tmpDirFor(k1) === '/tmp/mq-options-pin/2026-10-23.aaaaaaaaaaaa' && tmpDirFor(k1d) === '/tmp/mq-options-pin/2026-10-23.aaaaaaaaaaaa-dirty-f00dfeed' && tmpDirFor(k1s) === '/tmp/mq-options-pin/2026-10-23.aaaaaaaaaaaa.shard-3-of-28', `A12: the default tmp dir names the commit, the diff and the shard (${tmpDirFor(k1)}, ${tmpDirFor(k1d)}, ${tmpDirFor(k1s)})`);
    ok(new Set([k1, k2, k1d, k1s].map((k) => tmpDirFor(k))).size === 4, 'A12: two commits, a dirty tree and a shard of the same date get four different dirs');
    d = dir();
    ok(resumeRefusal(d, k1) === null, 'A12: --resume into a fresh dir continues');
    fs.writeFileSync(path.join(d, 'run-key.json'), JSON.stringify(k1));
    ok(resumeRefusal(d, k1) === null, 'A12: --resume on the same commit continues');
    ok(/commit a+ there, b+ now/.test(resumeRefusal(d, k2) || ''), `A12: --resume of a dir written on another commit is refused (${(resumeRefusal(d, k2) || 'null').slice(0, 160)})`);
    ok(/diff none there, f00dfeed00000000 now/.test(resumeRefusal(d, k1d) || ''), 'A12: --resume after a local edit (another diff hash) is refused');
    fs.rmSync(d, { recursive: true, force: true });
    if (bad.length) { console.log(`ws-options-pin --self-test: FAIL - ${bad.length} of ${n}`); bad.forEach((b) => console.log('  - ' + b)); process.exit(1); }
    console.log(`ws-options-pin --self-test: OK (${n} assertions)`);
}

module.exports = { planBatches, sliceOf, foldOptionPins, gateVerdict, runKeyOf, tmpDirFor, resumeRefusal };

if (require.main === module && has('self-test')) { selfTest(); return; }
if (require.main === module && has('gate')) {
    const gdir = path.resolve(ROOT, arg('gate', 'design/audit/matrix') || 'design/audit/matrix');
    liveKeysNode(ROOT).then((live) => {
        const v = gateVerdict({ dir: gdir, pinFile: BASE, live, now: process.env.MQ_NOW ? Date.parse(process.env.MQ_NOW) : Date.now() });
        v.lines.forEach((l) => console.log(l));
        process.exit(v.code);
    }).catch((e) => { console.log(`options gate: crash ${e && e.message}`); console.log('ws-options-pin --gate: FAIL'); process.exit(1); });
    return;
}
if (require.main !== module) return;

/* ============================================================================ in-browser listing */

// `--list-internal out.json` (spawned through the runner): every live skill and how many options it shows the teacher,
// exactly as ws-options-verify lists them (SKILLS, minus retired and custom_mixed; offeredOptionsFor).
if (has('list-internal')) {
    (async () => {
        const { open } = require('../lib/ws-harness.cjs');
        const app = await open({ seed: 1 });
        const skills = await app.page.evaluate(() => {
            const out = [];
            for (const [categoryId, list] of Object.entries(window.SKILLS)) {
                if (!Array.isArray(list)) continue;
                for (const s of list) {
                    if (s.retired || s.v === 'custom_mixed') continue;
                    out.push({ key: `${categoryId}:${s.v}`, categoryId, skillId: s.v, nOffered: window.offeredOptionsFor(categoryId, s.v).length });
                }
            }
            return out;
        });
        await app.close();
        fs.writeFileSync(arg('list-internal'), JSON.stringify(skills));
    })().catch((e) => { console.error(e); process.exit(2); });
    return;
}

/* ============================================================================ helpers */

function ensureRunner() {
    if (!fs.existsSync(RUNNER)) fs.copyFileSync(path.join(__dirname, 'mq-browser-run.sh'), RUNNER);
    fs.chmodSync(RUNNER, 0o755);
}

function runLogged(args, logFile) {
    return new Promise((resolve) => {
        const log = fs.openSync(logFile, 'w');
        const p = spawn(RUNNER, args, { cwd: ROOT, env: { ...process.env, MQ_ROOT: ROOT, MQ_BROWSER_WAIT_LOG: '1' }, stdio: ['ignore', log, log] });
        p.on('close', (code) => { fs.closeSync(log); resolve(code); });
    });
}

const slotWait = (logFile) => { const m = /mq-browser-run: slot \d+ after (\d+)s/.exec(fs.readFileSync(logFile, 'utf8')); return m ? Number(m[1]) * 1000 : 0; };
const idOf = (v) => `${v.option}=${JSON.stringify(v.value)}`;
const isVerifierFail = (r) => (r.results || []).some((v) => v.option === '*');
// The failing pairs of one ws-options-verify result, in its own order (options as offered, values in order, then statics).
const pairsOf = (r) => [
    ...(r.results || []).filter((v) => (v.fails || []).length).map((v) => ({ id: idOf(v), msg: v.fails[0] })),
    ...(r.statics || []).map((m) => ({ id: `static:${m}`, msg: m })),
];
const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
const fmtS = (ms) => `${(ms / 1000).toFixed(1)} s`;

/* ============================================================================ main */

(async () => {
    const WRITE = has('write');
    const CHECK = has('check') || !WRITE;
    const BATCH = Math.max(1, parseInt(arg('batch', '25'), 10));
    const SLOTS = Math.max(1, parseInt(arg('slots', '2'), 10));
    const N = arg('n', null);
    const DEADLINE = parseInt(arg('deadline', '600000'), 10);
    const LONG_DEADLINE = parseInt(arg('long-deadline', '1800000'), 10);
    const SHARD = arg('shard', null);
    const ONLY = arg('skills', null);
    const CAT = arg('category', null);
    const date = new Date().toISOString().slice(0, 10);
    let shard = null;
    if (SHARD) {
        const m = /^(\d+)\/(\d+)$/.exec(SHARD);
        if (!m || +m[1] < 1 || +m[1] > +m[2]) { console.error('ws-options-pin: --shard takes i/n (1 <= i <= n)'); process.exit(2); }
        shard = { i: +m[1], n: +m[2] };
    }
    // A12: the tmp dir is keyed by the commit (and the local diff), so a --resume never reuses another tree's batches
    const RUN_KEY = runKeyOf({ date, commit: gitHead(), diffHash: gitDiffHash(), shard });
    const TMP = path.resolve(arg('tmp', tmpDirFor(RUN_KEY)));
    if (has('resume')) { const why = resumeRefusal(TMP, RUN_KEY); if (why) { console.log(`ws-options-pin: --resume refused (A12): ${why}`); console.log('ws-options-pin: FAIL'); process.exit(2); } }
    else if (resumeRefusal(TMP, RUN_KEY)) {
        // a fresh run into a dir of another run (a --tmp given by hand): start it clean, so a later --resume of THIS run
        // reads only its own batches
        for (const f of fs.readdirSync(TMP)) fs.rmSync(path.join(TMP, f), { recursive: true, force: true });
    }
    fs.mkdirSync(TMP, { recursive: true });
    fs.writeFileSync(path.join(TMP, 'run-key.json'), JSON.stringify(RUN_KEY) + '\n');
    ensureRunner();
    const T0 = Date.now();

    // ---- 1. every live skill (one browser start; reused on --resume)
    const listFile = path.join(TMP, 'skills.json');
    if (!(has('resume') && fs.existsSync(listFile))) {
        const lf = path.join(TMP, 'list.log');
        const rc = await runLogged(['node', __filename, '--list-internal', listFile], lf);
        if (rc || !fs.existsSync(listFile)) { console.log(fs.readFileSync(lf, 'utf8').trim().split('\n').slice(-5).join('\n')); console.log('ws-options-pin: FAIL - could not list the live skills'); process.exit(2); }
    }
    const live = JSON.parse(fs.readFileSync(listFile, 'utf8'));
    const liveKeys = new Set(live.map((s) => s.key));
    let sel = live;
    if (ONLY) {
        const want = ONLY.split(',').map((s) => s.trim()).filter(Boolean);
        const unknown = want.filter((k) => !liveKeys.has(k) && !live.some((s) => s.skillId === k));
        if (unknown.length) { console.log(`ws-options-pin: FAIL - not a live skill: ${unknown.join(', ')} (use cat:skill)`); process.exit(2); }
        sel = live.filter((s) => want.includes(s.key) || want.includes(s.skillId));
    }
    if (CAT) sel = sel.filter((s) => s.categoryId === CAT);
    if (!sel.length) { console.log('ws-options-pin: FAIL - no live skill selected'); process.exit(2); }
    const withOpts = sel.filter((s) => s.nOffered > 0);
    const noOpts = sel.filter((s) => !s.nOffered);

    // ---- 2. batches (N8): by a hash of the skill id, so a slice never depends on the skills' positions; skills sharing
    // an id stay together (ws-options-verify --skill matches ids in every category)
    const batches = planBatches(withOpts, { batch: BATCH, shard });
    const runKeys = new Set(batches.flatMap((b) => b.keys));
    console.log(`ws-options-pin: ${sel.length} live skill(s) selected (${withOpts.length} with options, ${noOpts.length} with none); ${batches.length} batch(es) of up to ${BATCH}${shard ? ` (shard ${shard.i}/${shard.n}: ${runKeys.size} skill(s))` : ''}, ${SLOTS} at a time; tmp ${TMP}`);
    if (has('list')) {
        for (const b of batches) console.log(`  batch ${b.i}: ${b.keys.join(' ')}`);
        console.log(`  no options: ${noOpts.map((s) => s.key).join(' ') || '-'}`);
        return;
    }

    // ---- 3. run the batches, two at a time through the runner
    const fileOf = (b, tag = '') => path.join(TMP, `b${String(b.i).padStart(3, '0')}${tag}-${hash(b.ids.join(','))}.json`);
    const verifyArgs = (ids, jf, extra = []) => ['node', VERIFY, '--skill', ids.join(','), '--json', jf, '--report-only', ...(N ? ['--n', N] : []), ...(extra.includes('--deadline') ? [] : ['--deadline', String(DEADLINE)]), ...extra];
    const timings = [];
    const pageErrors = [];
    const crashed = [];
    let next = 0;
    let done = 0;
    const runBatch = async (b, jf, tag, extra = []) => {
        const lf = jf.replace(/\.json$/, '.log');
        for (let attempt = 1; attempt <= 2; attempt++) {
            if (fs.existsSync(jf)) fs.rmSync(jf);
            const c0 = Date.now();
            const rc = await runLogged(verifyArgs(b.ids, jf, extra), lf);
            const ms = Date.now() - c0;
            const waitMs = slotWait(lf);
            const log = fs.readFileSync(lf, 'utf8');
            const pe = /page errors during the run: (\d+) \(first: ([^\n]*)\)/.exec(log);
            if (pe) pageErrors.push({ batch: tag, n: +pe[1], first: pe[2].slice(0, 200) });
            if (fs.existsSync(jf)) { timings.push({ batch: tag, skills: b.skills.length, ms, waitMs, rc }); return { ms, waitMs }; }
            const tail = log.trim().split('\n').slice(-3).join(' | ');
            process.stdout.write(`  batch ${tag}: exit ${rc} without its JSON (attempt ${attempt}): ${tail.slice(0, 300)}\n`);
            if (attempt === 2) { crashed.push({ batch: tag, keys: b.keys, tail }); return null; }
        }
        return null;
    };
    const worker = async () => {
        while (next < batches.length) {
            const b = batches[next++];
            const jf = fileOf(b);
            let note = 'resumed';
            if (!(has('resume') && fs.existsSync(jf))) {
                const t = await runBatch(b, jf, String(b.i));
                note = t ? `${fmtS(t.ms)}${t.waitMs ? ` (${fmtS(t.waitMs)} of it waiting for a slot)` : ''}, ${fmtS((t.ms - t.waitMs) / b.skills.length)} a skill` : 'CRASHED';
            }
            done++;
            process.stdout.write(`  batch ${done}/${batches.length} (#${b.i}, ${b.skills.length} skill(s)): ${note}  [${fmtS(Date.now() - T0)}]\n`);
        }
    };
    await Promise.all(Array.from({ length: Math.min(SLOTS, batches.length) }, worker));

    // ---- 4. collect; a skill whose verifier timed out or crashed is run once more on its own
    const fresh = new Map();   // key -> [{id, msg}]
    const collect = (jf, keys) => {
        let j = null; try { j = JSON.parse(fs.readFileSync(jf, 'utf8')); } catch (e) { return; }
        for (const r of j.results || []) if (keys.includes(r.key)) fresh.set(r.key, { pairs: pairsOf(r), verifierFail: isVerifierFail(r) });
    };
    for (const b of batches) collect(fileOf(b), b.keys);
    const reruns = [...fresh].filter(([, v]) => v.verifierFail).map(([k]) => k);
    // Pass 1: on its own at --deadline. Pass 2, for a skill that still times out: with --long-deadline, so its real
    // failing pairs are known; it is then pinned with `*="*"` (it does time out at --deadline, twice) PLUS those
    // pairs, so a run that does finish still sees a new failure.
    const pool = async (keys, fn) => { let i = 0; await Promise.all(Array.from({ length: Math.min(SLOTS, keys.length) }, async () => { while (i < keys.length) await fn(keys[i++]); })); };
    const solo = async (k, prefix, extra, label) => {
        const s = live.find((x) => x.key === k);
        const b = { i: `${prefix}-${s.skillId}`, skills: [s], keys: [k], ids: [s.skillId] };
        const jf = path.join(TMP, `${prefix}-${s.categoryId}-${s.skillId}.json`);
        if (!(has('resume') && fs.existsSync(jf))) {
            const t = await runBatch(b, jf, `${prefix} ${k}`, extra);
            process.stdout.write(`  ${label} ${k}: ${t ? fmtS(t.ms) : 'CRASHED'}  [${fmtS(Date.now() - T0)}]\n`);
        }
        let j = null; try { j = JSON.parse(fs.readFileSync(jf, 'utf8')); } catch (e) { return null; }
        return (j.results || []).find((r) => r.key === k) || null;
    };
    const slow = [];
    await pool(reruns, async (k) => {
        const r = await solo(k, 'rerun', [], `rerun on its own at --deadline ${DEADLINE}:`);
        if (r && !isVerifierFail(r)) fresh.set(k, { pairs: pairsOf(r), verifierFail: false, recovered: true });
        else slow.push(k);
    });
    await pool(slow, async (k) => {
        const r = await solo(k, 'long', ['--deadline', String(LONG_DEADLINE)], `times out twice at --deadline ${DEADLINE}; rerun with --deadline ${LONG_DEADLINE}:`);
        const timeout = fresh.get(k).pairs.find((p) => p.id === '*="*"');
        fresh.set(k, { pairs: [timeout, ...(r && !isVerifierFail(r) ? pairsOf(r) : [])], verifierFail: true, slow: true, longOk: !!(r && !isVerifierFail(r)) });
    });
    const missing = [...runKeys].filter((k) => !fresh.has(k));
    const wallMs = Date.now() - T0;

    // ---- 5. compare with the pin
    let pin = null;
    try { pin = JSON.parse(fs.readFileSync(BASE, 'utf8')); } catch (e) { pin = null; }
    const pinSkills = (pin && pin.skills) || {};
    const newF = [], fixed = [];
    for (const [k, v] of fresh) {
        const p = pinSkills[k];
        for (const f of v.pairs) if (!p || !p.includes(f.id)) newF.push({ key: k, ...f, unpinned: !p });
        for (const id of p || []) if (!v.pairs.some((f) => f.id === id)) fixed.push({ key: k, id });
    }
    const verifierStill = [...fresh].filter(([, v]) => v.slow).map(([k, v]) => `${k}${v.longOk ? ` (${v.pairs.length - 1} pair(s) at --deadline ${LONG_DEADLINE})` : ` (also at --deadline ${LONG_DEADLINE})`}`);

    // ---- 6. report
    const nFail = [...fresh.values()].filter((v) => v.pairs.length).length;
    const optCount = {};
    for (const [, v] of fresh) for (const f of v.pairs) { const o = f.id.startsWith('static:') ? 'static' : f.id.split('=')[0]; optCount[o] = (optCount[o] || 0) + 1; }
    const runMs = timings.reduce((n, t) => n + t.ms - t.waitMs, 0);
    const runSkills = timings.reduce((n, t) => n + t.skills, 0);
    console.log('');
    console.log(`skills run: ${fresh.size} with options (${noOpts.length} with none); ${nFail} with at least one failing pair, ${[...fresh.values()].reduce((n, v) => n + v.pairs.length, 0)} failing pair(s)`);
    console.log(`time: wall ${fmtS(wallMs)}; ${timings.length} process(es) ran ${runSkills} skill(s) in ${fmtS(runMs)} of slot time (${runSkills ? fmtS(runMs / runSkills) : '-'} a skill, browser start included), ${fmtS(timings.reduce((n, t) => n + t.waitMs, 0))} waiting for a slot`);
    console.log(`failing pairs by option: ${Object.entries(optCount).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([o, n]) => `${o} ${n}`).join(', ') || 'none'}`);
    if (reruns.length) console.log(`verifier timeout / crash in a batch, rerun on its own: ${reruns.length} (${reruns.length - verifierStill.length} recovered)${verifierStill.length ? `; timed out again, pinned as *="*" plus the long-deadline pairs: ${verifierStill.join(', ')}` : ''}`);
    if (pageErrors.length) console.log(`page errors (ws-precritic reads such a run as a crash): ${pageErrors.map((p) => `batch ${p.batch}: ${p.n} (${p.first})`).join(' ; ')}`);
    if (crashed.length) console.log(`CRASHED batches (no JSON after a retry): ${crashed.map((c) => `#${c.batch} [${c.keys.join(' ')}]: ${c.tail.slice(0, 200)}`).join(' ; ')}`);
    if (missing.length) console.log(`no result for: ${missing.join(', ')}`);
    console.log(`against ${rel(BASE)}${pin ? ` (pinned ${pin.pinned})` : ' (missing)'}: ${newF.length} new failing pair(s) in ${new Set(newF.map((f) => f.key)).size} skill(s), ${fixed.length} fixed pair(s) in ${new Set(fixed.map((f) => f.key)).size} skill(s)`);
    const show = (list, fmt, max = 40) => { for (const x of list.slice(0, max)) console.log('  ' + fmt(x)); if (list.length > max) console.log(`  … ${list.length - max} more`); };
    if (newF.length) { console.log('NEW:'); show(newF, (f) => `${f.key} ${f.id}${f.unpinned ? ' (skill not pinned)' : ''}: ${String(f.msg).slice(0, 140)}`, has('verbose') ? 1e9 : 40); }
    if (fixed.length) { console.log('FIXED (pinned, no longer failing):'); show(fixed, (f) => `${f.key} ${f.id}`, has('verbose') ? 1e9 : 40); }

    if (arg('out', null)) {
        // THE RUN FILE (header): what --gate folds at deploy (D1). `failing` holds every skill that ran (an empty list =
        // it ran and passed); a crashed batch's skills are absent, so they keep their older result in the fold.
        const outF = path.resolve(arg('out'));
        let pinSha = null; try { pinSha = crypto.createHash('sha256').update(fs.readFileSync(BASE)).digest('hex'); } catch (e) { /* no pin */ }
        fs.mkdirSync(path.dirname(outF), { recursive: true });
        const tmpF = `${outF}.tmp-${process.pid}`;
        fs.writeFileSync(tmpF, JSON.stringify({
            tool: 'ws-options-pin', kind: 'options-pin', date, started: new Date(T0).toISOString(), finished: new Date().toISOString(), commit: gitHead(), dirty: gitDirty(),
            mode: WRITE ? 'write' : 'check', batching: 'hash-v1', shard: SHARD, slice: shard, subset: !!(ONLY || CAT), complete: !(crashed.length || missing.length),
            pin: { file: rel(BASE), sha256: pinSha, pinned: pin ? pin.pinned : null },
            selected: sel.length, run: fresh.size, noOptions: noOpts.map((s) => s.key),
            wallMs, slotMs: runMs, perSkillMs: runSkills ? Math.round(runMs / runSkills) : null, batches: timings, pageErrors, crashed, missing, reruns,
            optionCounts: optCount, new: newF, fixed, failing: Object.fromEntries([...fresh].map(([k, v]) => [k, v.pairs.map((f) => f.id)])),
        }, null, 1) + '\n');
        fs.renameSync(tmpF, outF);
        console.log(`run written to ${rel(outF)}`);
    }

    const incomplete = crashed.length || missing.length;
    // ---- 7. write the pin (merged: keys outside this run keep their entries)
    if (WRITE) {
        if (incomplete) { console.log('ws-options-pin: FAIL - not writing the pin: some batches have no result (re-run with --resume)'); process.exit(2); }
        const full = !ONLY && !CAT && !shard;
        const old = pin || {};
        const skills = full ? {} : { ...(old.skills || {}) };
        for (const s of withOpts) if (runKeys.has(s.key)) skills[s.key] = fresh.get(s.key).pairs.map((f) => f.id);
        for (const s of noOpts) delete skills[s.key];
        // drop keys that are no longer live skills with options
        for (const k of Object.keys(skills)) if (!liveKeys.has(k) || noOpts.some((s) => s.key === k) || live.some((s) => s.key === k && !s.nOffered)) delete skills[k];
        const scope = full ? live.map((s) => s.key) : [...new Set([...(old.scope || []), ...sel.map((s) => s.key)])].filter((k) => liveKeys.has(k));
        const noOptions = live.filter((s) => !s.nOffered && scope.includes(s.key)).map((s) => s.key);
        const ordered = {};
        for (const s of live) if (skills[s.key]) ordered[s.key] = skills[s.key];
        const doc = {
            note: old.note || 'Pinned ws-options-verify failures per skill (IMPROVEMENT_PLAN §1.4 S1: red gates compare with a pinned baseline). Each entry is option=<JSON value> (as ws-options-verify prints it) or static:<message>. ws-precritic fails on any failing pair not listed here, and on any failure of a skill not listed. Remove a pair when its defect is fixed; never add one to make a new failure pass without a STATUS note.',
            how: `node tests/scripts/ws-options-pin.cjs --write (every live skill: ws-options-verify --skill <batch ids> --deadline ${DEADLINE} --json per batch of ${BATCH}, two batches at a time through /tmp/mq-browser-run.sh; a verifier timeout is re-run on its own); --write --skills cat:skill,... re-pins a subset; --check compares a fresh run with this pin. The skills that need more than ws-options-verify's 60 s default deadline time out under a plain run: pass --deadline 600000.`,
            pinned: date,
            scope,
            noOptions,
            skills: ordered,
        };
        // what changed against the previous pin, per key
        const changed = [];
        for (const k of new Set([...Object.keys(old.skills || {}), ...Object.keys(ordered)])) {
            const a = (old.skills || {})[k], b = ordered[k];
            if (!a && b) { if (old.skills) changed.push(`+ ${k} (${b.length} pair(s))`); continue; }
            if (a && !b) { changed.push(`- ${k} (was ${a.length} pair(s))`); continue; }
            const add = b.filter((x) => !a.includes(x)), rem = a.filter((x) => !b.includes(x));
            if (add.length || rem.length) changed.push(`~ ${k}: +${add.length} [${add.slice(0, 4).join(', ')}${add.length > 4 ? ', …' : ''}] -${rem.length} [${rem.slice(0, 4).join(', ')}${rem.length > 4 ? ', …' : ''}]`);
        }
        fs.mkdirSync(path.dirname(BASE), { recursive: true });
        fs.writeFileSync(BASE, JSON.stringify(doc, null, 1) + '\n');
        console.log(`pin written: ${rel(BASE)} - scope ${scope.length} skill(s), ${Object.keys(ordered).length} with options, ${Object.values(ordered).filter((l) => l.length).length} with pairs, ${noOptions.length} with no options`);
        const prevPinned = new Set(Object.keys(old.skills || {}));
        const changedPrev = changed.filter((c) => prevPinned.has(c.split(' ')[1].replace(/:$/, '')));
        console.log(`against the previous pin's ${prevPinned.size} skill(s): ${changedPrev.length} changed${changedPrev.length ? ':' : ''}`);
        for (const c of changedPrev) console.log('  ' + c);
        if (incomplete === 0 && !has('keep-tmp') && !pageErrors.length) fs.rmSync(TMP, { recursive: true, force: true });
        console.log('ws-options-pin: OK');
        return;
    }
    if (!incomplete && !has('keep-tmp') && !pageErrors.length && !newF.length) fs.rmSync(TMP, { recursive: true, force: true });
    if (incomplete || newF.length) {
        console.log(`ws-options-pin: FAIL${incomplete ? ' (incomplete run: re-run with --resume)' : ''}`);
        if (incomplete) process.exit(2);
        if (!has('report-only')) process.exit(1);
    } else console.log('ws-options-pin: OK');
})().catch((e) => { console.error(e); console.log('ws-options-pin: FAIL (crash)'); process.exit(2); });

function gitHead() {
    try { return require('child_process').execFileSync('git', ['-C', ROOT, 'rev-parse', 'HEAD'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch (e) { return null; }
}
/** A hash of `git diff HEAD` (tracked files outside design/audit/matrix and baselines), or null on a clean tree (A12). */
function gitDiffHash() {
    try {
        const out = require('child_process').execFileSync('git', ['-C', ROOT, 'diff', 'HEAD', '--', '.', ':(exclude)design/audit/matrix', ':(exclude)design/audit/baselines'], { stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 256 * 1024 * 1024 });
        return out.length ? crypto.createHash('sha256').update(out).digest('hex').slice(0, 16) : null;
    } catch (e) { return null; }
}
/** Tracked files with local edits outside design/audit/ (the run file and the matrix files themselves do not count). */
function gitDirty() {
    try {
        return require('child_process').execFileSync('git', ['-C', ROOT, 'status', '--porcelain', '--untracked-files=no'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString()
            .split('\n').filter(Boolean).map((l) => l.slice(3)).some((f) => !/^design\/audit\/(matrix|baselines)\//.test(f));
    } catch (e) { return null; }
}
