// BROWSER LOCK (design/LESSON_LIBRARY_PLAN.md phase 0): one headless-Chrome gate at a time on this
// machine. Several agent lanes share one overloaded host; two browser gates at once starve each other
// (a 25-seed lesson gate took four times as long beside another lane's render sweep) and time out.
// A gate takes the lock before it launches Chrome and gives it back when it closes.
//
//   const lock = require('../lib/browser-lock.cjs');
//   const release = await lock.acquire('ws-lesson-check');   // waits its turn
//   ... launch the browser, run ...
//   release();
//
// ws-harness.cjs open() takes it when the caller passes `{lock: 'name'}` or the environment sets
// MQ_BROWSER_LOCK=1, and releases it in close().
//
// The lock is a file in the OS temp directory (shared by every worktree), created with O_EXCL. It
// holds {pid, name, cwd, at}. A lock whose process is gone, or older than `staleMs` (default 3 h), is
// broken. A waiter never deadlocks: after `timeoutMs` (default 2 h; MQ_BROWSER_LOCK_TIMEOUT in ms) it
// warns and runs without the lock. MQ_BROWSER_LOCK=0 turns the lock off.
const fs = require('fs');
const os = require('os');
const path = require('path');

const LOCK = process.env.MQ_BROWSER_LOCK_FILE || path.join(os.tmpdir(), 'mathquest-browser.lock');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function alive(pid) {
    if (!Number.isInteger(pid) || pid <= 0) return false;
    try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}

/** The current holder {pid, name, cwd, at}, or null (no lock, or an unreadable one). */
function holder() {
    try { return JSON.parse(fs.readFileSync(LOCK, 'utf8')); } catch (e) { return null; }
}

function tryTake(name) {
    try {
        const fd = fs.openSync(LOCK, 'wx');
        fs.writeSync(fd, JSON.stringify({ pid: process.pid, name, cwd: process.cwd(), at: Date.now() }));
        fs.closeSync(fd);
        return true;
    } catch (e) {
        if (e.code === 'EEXIST') return false;
        throw e;
    }
}

/**
 * Wait for the lock and take it. Resolves to `release()` (idempotent; also run on process exit).
 * @param {string} name   who holds it (shown to the waiters)
 * @param {{timeoutMs?: number, staleMs?: number, pollMs?: number, log?: (s: string) => void}} [o]
 */
async function acquire(name = 'gate', o = {}) {
    if (process.env.MQ_BROWSER_LOCK === '0') return () => {};
    const timeoutMs = o.timeoutMs ?? (Number(process.env.MQ_BROWSER_LOCK_TIMEOUT) || 2 * 3600e3);
    const staleMs = o.staleMs ?? 3 * 3600e3;
    const pollMs = o.pollMs ?? 5000;
    const log = o.log || ((s) => process.stderr.write(`${s}\n`));
    const t0 = Date.now();
    let told = false;
    for (;;) {
        if (tryTake(name)) break;
        const h = holder();
        if (!h) {
            // Unreadable: another process is writing it right now, or it is corrupt. A fresh file
            // is left alone; one older than 10 s is broken.
            let age = 0;
            try { age = Date.now() - fs.statSync(LOCK).mtimeMs; } catch (e) { continue; }   // (gone: retry)
            if (age > 10e3) { try { fs.unlinkSync(LOCK); } catch (e) { /* taken meanwhile */ } continue; }
            await sleep(500);
            continue;
        }
        if (h.pid === process.pid) break;   // (this process already holds it)
        if (!alive(h.pid) || Date.now() - Number(h.at || 0) > staleMs) {
            // Broken: its process is gone, or it is older than any gate runs. Removed only while it
            // is still that holder's file (another waiter may have broken and retaken it).
            const again = holder();
            if (again && again.pid === h.pid && again.at === h.at) { try { fs.unlinkSync(LOCK); } catch (e) { /* gone */ } }
            continue;
        }
        if (Date.now() - t0 > timeoutMs) {
            log(`browser-lock: waited ${Math.round((Date.now() - t0) / 60e3)} min for ${h.name} (pid ${h.pid}); running WITHOUT the lock`);
            return () => {};
        }
        if (!told) { log(`browser-lock: ${name} waits for ${h.name} (pid ${h.pid}, since ${new Date(h.at).toISOString().slice(11, 19)})`); told = true; }
        await sleep(pollMs);
    }
    let done = false;
    const release = () => {
        if (done) return;
        done = true;
        process.removeListener('exit', release);
        try { const h = holder(); if (h && h.pid === process.pid) fs.unlinkSync(LOCK); } catch (e) { /* gone */ }
    };
    process.on('exit', release);
    return release;
}

module.exports = { acquire, holder, LOCK };
