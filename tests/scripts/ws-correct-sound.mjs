#!/usr/bin/env node
// ws-correct-sound: the correct-answer "B, power-up" sound (owner request 2026-11-14).
//   node tests/scripts/ws-correct-sound.mjs [--root DIR] [--skill cat:skill] [--widths 1280,1024] [--wav out.wav]
// Rules:
//   SOUND-PLAN    js/modules/correct-sound.js exports the note plan: 4 square-wave notes C5 E5 G5 C6 (523.25, 659.25,
//                 783.99, 1046.50 Hz), 70 / 70 / 70 / 400 ms, only the last with an exponential decay, peak gain 0.12-0.15
//   SOUND-ONCE    on the practice card, the online worksheet and the quiz (instant feedback), at 1280 and 1024:
//                 a correct answer with Sound on plays the power-up exactly once; a wrong answer 0; a correct answer with
//                 Sound off 0. AudioContext is replaced by a counting stub; a "play" is one square oscillator at C6.
// --wav FILE renders the sound once (OfflineAudioContext in the browser) to a 16-bit mono WAV.
// --skill picks the practice skill (default addition: first number-answer skill); the sound is host-wide, so a lane's
// --skill run checks the hosts with that skill's items when they are plain number answers, else with the default.
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const arg = (k, d = null) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null ? argv[i + 1] : d; };
const ROOT = resolve(arg('--root', process.env.MQ_ROOT || join(HERE, '..', '..')));
process.env.MQ_ROOT = ROOT;
const require = createRequire(import.meta.url);
const { open } = require(join(HERE, '..', 'lib', 'ws-harness.cjs'));
const NAME = 'ws-correct-sound';
const WIDTHS = String(arg('--widths', '1280,1024')).split(',').map(Number);
const SKILL_ARG = (arg('--skill', '') || '').split(',').map((s) => s.trim()).filter(Boolean)[0] || null;
const WAV = arg('--wav', null);

const SPEC = [[523.25, 0.07, false], [659.25, 0.07, false], [783.99, 0.07, false], [1046.50, 0.4, true]];
const findings = [];
const F = (rule, where, msg) => findings.push(`${rule} ${where}: ${msg}`);

const STUB = () => {
    window.__oscLog = [];
    class FakeParam { constructor(o) { this.o = o; } setValueAtTime(v) { if (this.o) this.o.freq = v; return this; } linearRampToValueAtTime() { return this; } exponentialRampToValueAtTime() { return this; } }
    class FakeNode { connect(x) { return x; } disconnect() {} }
    class FakeCtx {
        constructor() { this.state = 'running'; this.currentTime = 0; this.destination = new FakeNode(); }
        resume() { return Promise.resolve(); }
        createOscillator() { const o = new FakeNode(); const rec = { type: 'sine', freq: 0 }; o.frequency = new FakeParam(rec); o.start = () => { rec.type = o.type; window.__oscLog.push(rec); }; o.stop = () => {}; return o; }
        createGain() { const g = new FakeNode(); g.gain = new FakeParam(null); return g; }
    }
    window.AudioContext = FakeCtx; window.webkitAudioContext = FakeCtx;
};

async function main() {
    const { page, close, problems } = await open({ viewport: { width: 1280, height: 900, deviceScaleFactor: 1 }, lock: NAME });
    try {
        // SOUND-PLAN (read before the stub is installed on a reload)
        const plan = await page.evaluate(() => { const m = window.MQ_CORRECT_SOUND; return m ? { notes: m.POWERUP_NOTES, peak: m.POWERUP_PEAK } : null; });
        if (!plan) F('SOUND-PLAN', 'correct-sound.js', 'no MQ_CORRECT_SOUND export (the power-up module is not loaded)');
        else {
            if (plan.notes.length !== 4) F('SOUND-PLAN', 'notes', `${plan.notes.length} notes, want 4`);
            SPEC.forEach(([f, d, dec], i) => { const n = plan.notes[i] || {}; if (Math.abs(n.freq - f) > 0.01 || Math.abs(n.dur - d) > 1e-6 || !!n.decay !== dec) F('SOUND-PLAN', `note ${i + 1}`, `${n.freq} Hz ${n.dur} s decay=${n.decay}, want ${f} Hz ${d} s decay=${dec}`); });
            if (!(plan.peak >= 0.12 && plan.peak <= 0.15)) F('SOUND-PLAN', 'peak', `gain ${plan.peak}, want 0.12-0.15`);
        }
        if (WAV && plan) {
            const b64 = await page.evaluate(async () => {
                const sr = 44100; const ctx = new OfflineAudioContext(1, Math.ceil(sr * 0.75), sr);
                window.MQ_CORRECT_SOUND.scheduleCorrectSound(ctx, 0.02);
                const buf = await ctx.startRendering(); const d = buf.getChannelData(0);
                const out = new DataView(new ArrayBuffer(44 + d.length * 2)); const w = (o, s) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
                w(0, 'RIFF'); out.setUint32(4, 36 + d.length * 2, true); w(8, 'WAVEfmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 1, true);
                out.setUint32(24, sr, true); out.setUint32(28, sr * 2, true); out.setUint16(32, 2, true); out.setUint16(34, 16, true); w(36, 'data'); out.setUint32(40, d.length * 2, true);
                for (let i = 0; i < d.length; i++) out.setInt16(44 + i * 2, Math.max(-1, Math.min(1, d[i])) * 32767, true);
                let s = ''; const u = new Uint8Array(out.buffer); for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode(...u.subarray(i, i + 8192)); return btoa(s);
            });
            mkdirSync(dirname(resolve(WAV)), { recursive: true }); writeFileSync(resolve(WAV), Buffer.from(b64, 'base64'));
            console.log(`wav: ${WAV}`);
        }
        await page.evaluateOnNewDocument(STUB);
        await page.reload({ waitUntil: 'networkidle2' });
        await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
        await page.evaluate(() => Promise.all([window.__mqLoadDeferred, window.__mqLoadWorksheet].filter(Boolean).map((f) => f().then(() => true, () => false))));
        const skill = await page.evaluate((want) => {
            const plain = (c, k) => { try { for (let i = 0; i < 6; i++) { const q = window.generateQuestionFor({ category: c, skill: k, seed: 11 + i, itemIndex: i }); if (!q || (q.answerType && q.answerType !== 'number') || (q.options && q.options.length) || !/^-?\d+$/.test(String(q.ans))) return false; } return true; } catch (e) { return false; } };
            if (want) { const [c, k] = want.split(':'); if (plain(c, k)) return want; }
            for (const s of window.SKILLS.addition || []) if (s && s.v && plain('addition', s.v)) return `addition:${s.v}`;
            return null;
        }, SKILL_ARG);
        if (!skill) { F('SOUND-ONCE', 'setup', 'no plain number-answer skill to drive the hosts'); }
        const wait = (ms) => new Promise((r) => setTimeout(r, ms));
        const plays = () => page.evaluate(() => window.__oscLog.filter((o) => o.type === 'square' && Math.abs(o.freq - 1046.5) < 0.01).length);
        for (const w of skill ? WIDTHS : []) {
            await page.setViewport({ width: w, height: w === 1024 ? 768 : 900, deviceScaleFactor: 1 });
            for (const host of ['card', 'worksheet', 'quiz']) {
                for (const [run, sound, right] of [['correct, Sound on', true, true], ['wrong, Sound on', true, false], ['correct, Sound off', false, true]]) {
                    const before = await plays();
                    const err = await page.evaluate(async ({ host, skill, sound, right, seed }) => {
                        try {
                            window.setSfxEnabled(sound);
                            const [c, k] = skill.split(':'); const st = window.state;
                            const item = (sd, ix) => window.generateQuestionFor({ category: c, skill: k, seed: sd, itemIndex: ix });
                            const val = (q) => String(right ? q.ans : Number(q.ans) + 1);
                            document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
                            if (host === 'card') {
                                st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
                                window.showView('gameView'); st.currentQ = item(seed, 0); window.renderQuestion();
                                const inp = document.getElementById('answerInput'); if (!inp) return 'no #answerInput';
                                inp.value = val(st.currentQ); window.submitAnswer(); return null;
                            }
                            if (host === 'worksheet') {
                                st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 4; window.initWorksheet();
                                const q = st.worksheetQs[0]; const inp = document.getElementById('ws_input_0'); if (!q || !inp) return 'no worksheet item 0';
                                inp.value = val(q); window.checkWorksheetAnswer(0, true); window.checkWorksheetAnswer(0, true); return null;
                            }
                            const questions = [0, 1].map((ix) => { const q = item(seed + ix, ix); return { id: ix, skillId: k, points: 1, questionData: window.quizQuestionData(Object.assign({ categoryId: c }, q)) }; });
                            const test = { id: null, name: 'Sound', sections: [{ id: 0, label: 'A', layout: { columns: 1, spacing: 'normal' }, instructions: '', questions }], settings: { timeLimit: null, randomOrder: false, showFeedback: 'instant', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                            window.handleQuizURL(window.compressTestForURL(test));
                            const nm = document.getElementById('qtStudentName'); nm.value = 'A'; nm.dispatchEvent(new Event('input'));
                            window.startQuizTest();
                            const v = val(st.quizAllQuestions[0].question.questionData);
                            window.submitQuizTextAnswer(0, v); window.submitQuizTextAnswer(0, v); return null;
                        } catch (e) { return String((e && e.message) || e).slice(0, 160); }
                    }, { host, skill, sound, right, seed: 21 + w });
                    await wait(700);
                    const n = (await plays()) - before;
                    const want = sound && right ? 1 : 0;
                    const where = `${host} ${w}px (${run})`;
                    if (err) F('SOUND-ONCE', where, `host did not run: ${err}`);
                    else if (n !== want) F('SOUND-ONCE', where, `${n} power-up plays, want ${want}`);
                    else console.log(`  ok  ${where}: ${n}`);
                    await wait(350);
                }
            }
        }
        await page.evaluate(() => window.setSfxEnabled(true));
        const errs = problems.filter((p) => p.type === 'pageerror');
        errs.forEach((p) => F('SOUND-ONCE', 'page', p.text.slice(0, 160)));
        console.log(`skill: ${skill}`);
    } finally { await close(); }
    findings.forEach((f) => console.log(`  FAIL ${f}`));
    console.log(`${NAME}: ${findings.length ? 'FAIL' : 'OK'}`);
    process.exit(findings.length ? 1 : 0);
}
main().catch((e) => { console.error(e); console.log(`${NAME}: FAIL`); process.exit(1); });
