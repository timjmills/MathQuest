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
//   node tests/scripts/ws-options-pin.cjs --check --shard 2/4            # every 4th batch from the 2nd (merged on --write)
//   node tests/scripts/ws-options-pin.cjs --check --resume               # skip batches whose tmp JSON already exists
//   node tests/scripts/ws-options-pin.cjs --list                         # the batches, run nothing (one browser start)
//
//   --batch N        skills per ws-options-verify process (default 25; one browser start per batch)
//   --slots N        batches at once (default 2), each through /tmp/mq-browser-run.sh (it queues behind other sessions)
//   --tmp DIR        where the per-batch JSON goes (default /tmp/mq-options-pin/<UTC date>[.shard-i-of-n]); --resume
//                    reuses it, so a crashed nightly continues where it stopped; a batch's file name carries a hash
//                    of its skills, so a changed selection never reuses a stale file
//   --n N            items per check, passed to ws-options-verify (default: its own, 12 - the precritic's value)
//   --deadline MS    ws-options-verify's per-skill deadline (default 600000: its own 60 s default times out on
//                    add_facts, sub_facts, f_to_d and the mixed pools in a cloud container with shared slots)
//   --out f.json     also write the run: per-skill failures, new / fixed against the pin, timings, page errors
//   --baseline f     the pin file (default design/audit/baselines/options-verify.json)
//   --report-only    exit 0 even when --check finds new failures (a crash still exits non-zero)
//   --keep-tmp       keep the tmp directory after a complete run (it is kept anyway when a batch failed)
//
// How a batch runs: `node tests/scripts/ws-options-verify.cjs --skill <ids> --json <tmp>/b<i>-<hash>.json --report-only`.
// ws-options-verify matches an id in EVERY category, so the skills sharing an id are kept in one batch and results
// outside the selection are dropped. A failing pair is written exactly as ws-precritic forms it:
// `${option}=${JSON.stringify(value)}` for a value, `static:${message}` for a static check. A skill whose verifier timed
// out or crashed in its batch (`*="*"`) is run once more on its own at --deadline, so one slow moment under a shared
// slot does not become a pin. If it times out again it is run with --deadline <--long-deadline, default 1800000 ms>
// and pinned as `*="*"` PLUS the pairs that long run finds: a precritic run that
// times out stays green, one that finishes still fails on a new pair. A batch that exits without its JSON is retried once.
//
// --check: NEW = a failing pair of a skill in the selection that the pin does not list (a skill missing from the pin
// counts every pair as new); FIXED = a pinned pair that no longer fails (listed, not a failure: re-pin with --write
// --skills to drop it). Prints `ws-options-pin: OK` / `ws-options-pin: FAIL` last; exit 1 on FAIL (unless --report-only).
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
    const TMP = path.resolve(arg('tmp', path.join('/tmp/mq-options-pin', date + (shard ? `.shard-${shard.i}-of-${shard.n}` : ''))));
    fs.mkdirSync(TMP, { recursive: true });
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

    // ---- 2. batches: skills sharing an id stay together (ws-options-verify --skill matches ids in every category)
    const byId = new Map();
    for (const s of withOpts) { if (!byId.has(s.skillId)) byId.set(s.skillId, []); byId.get(s.skillId).push(s); }
    const groups = [...byId.values()];
    let batches = [];
    let cur = [];
    for (const g of groups) {
        if (cur.length && cur.length + g.length > BATCH) { batches.push(cur); cur = []; }
        cur.push(...g);
    }
    if (cur.length) batches.push(cur);
    batches = batches.map((skills, i) => ({ i, skills, keys: skills.map((s) => s.key), ids: [...new Set(skills.map((s) => s.skillId))] }));
    if (shard) batches = batches.filter((b) => b.i % shard.n === shard.i - 1);
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
        fs.writeFileSync(path.resolve(arg('out')), JSON.stringify({
            date, commit: gitHead(), mode: WRITE ? 'write' : 'check', shard: SHARD, selected: sel.length, run: fresh.size, noOptions: noOpts.map((s) => s.key),
            wallMs, slotMs: runMs, perSkillMs: runSkills ? Math.round(runMs / runSkills) : null, batches: timings, pageErrors, crashed, missing, reruns,
            optionCounts: optCount, new: newF, fixed, failing: Object.fromEntries([...fresh].map(([k, v]) => [k, v.pairs.map((f) => f.id)])),
        }, null, 1) + '\n');
        console.log(`run written to ${rel(path.resolve(arg('out')))}`);
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
