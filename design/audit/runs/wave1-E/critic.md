# Wave 1 Lane E critic (commit 9fb3af7) - PASS

Scores: C1 8, C2 8, C3 8, C4 8.

Verified: ws-screen-answer (base10_build, ten_frame_build) OK; ws-boot-smoke OK; ws-load-check OK (2 play requests, both local);
base10_build x3 under 6 CPU burners in an exclusive block: 3/3 OK. MQ_IGNORE_CERT absent from the tree (grep clean).
Old vs new test: only the fixed 700 ms sleep was replaced by two waits; no assertion changed or weakened.
defer: LZString is used only at call time in quiz-storage.js, html2canvas only in google-classroom.js; module entry is
also deferred and runs after them in document order, so the ?code=/boot path cannot run before lz-string.

Defects (ranked):
1. js/modules/worksheet.js ~979: flag is set unconditionally at the 900 ms timer, though the comment says widgets mount
   "later under load". A late mount is only caught by the 5-stable-frames wait (tests/scripts/ws-screen-answer.cjs ~430),
   which is a heuristic. Fix: set the flag when widgets report mounted, or keep the stable-frames wait as the guard (it is).
2. Resize relayout (worksheet.js ~988) leaves the flag at '1' while cards move; covered only by the stable-frames wait.
3. ws-screen-answer.cjs ~427/432: the 30 s timeouts give a generic waitForFunction error, no "layout never settled" message.
   Fix: catch and rethrow with the skill id and which wait failed.
4. LOAD_CHECK.md: the slow-CDN figures (17.3 s -> 8.3 s) are not reproducible by ws-load-check.cjs; add a --slow-cdn mode
   or label them as one-off. ws-load-check's fail path (external call) was not exercised by a negative test.
5. Commit trailer says "Claude Opus 5.5"; the rule is Sonnet 5.5 attribution.
6. ">=10 stressed passes" is claimed 15/15 by the builder; I reproduced 3/3 only.

## Opus re-grade (2026-10-02) - FAIL

Scores: C1 8, C2 7, C3 7, C4 8.

Reproduced: ws-screen-answer (base10_build, ten_frame_build) OK; ws-boot-smoke OK; ws-load-check OK (2 play requests, local
Andika); base10_build x3 under 6 burners in one exclusive block: 3/3 OK. Test diff: only `sleep(700)` replaced by two waits; no
assertion touched. defer: lz-string/html2canvas are ordered before the (deferred) module entry; LZString used only at call
time (quiz-storage.js:281/289), html2canvas only in google-classroom.js:120. No cert-bypass code left. The worksheet fix is sound.

Defects (ranked):
1. tests/scripts/ws-load-check.cjs:25-36 - the gate records requests only on `response`/`requestfailed`. An external call that
   is still pending (hung school filter, slow beacon) when the 1.5 s tail ends is never seen, so the gate passes. The push also
   happens after `await res.buffer()`, so the load/play split (`reqs.slice(loadReqs.length)`) is by arrival order of async
   handlers, not by when the request started. Fix: listen on `page.on('request')`, tag the phase at request time, and fail on
   any non-local request in the play phase whether or not it completed.
2. ws-load-check.cjs:46 comment "right answers typed in" is false: the loop only regenerates/renders questions; no answer is
   submitted, so the answer path (submitAnswer, XP, progress save, session save) is not covered by the "0 per-pupil external
   calls" claim. Fix: actually submit answers (and a worksheet check) or narrow the claim in LOAD_CHECK.md.
3. LOAD_CHECK.md "Failure modes"/"Done": 17.3 s -> 8.3 s slow-CDN figures cannot be reproduced by any script in the tree.
   Fix: add a `--slow-cdn <ms>` request-interception mode to ws-load-check, or label them one-off.
4. worksheet.js:979 / :985-990 - flag goes '1' at the 900 ms timer regardless of late widget mounts, and resize relayout never
   resets it; correctness rests on the 5-stable-frame wait in ws-screen-answer.cjs:431-436. Acceptable for the test, but the
   comment at :974 overstates the flag. Fix: reset to '0' in the resize handler and set '1' after its pass.
5. ws-screen-answer.cjs:428/437 - 30 s timeouts surface as a bare TimeoutError; wrap with the skill id and which wait failed.

### Opus re-grade: defects in the owner's required form (supersedes the list above)

D1. tests/scripts/ws-load-check.cjs:25-36 (gate blind spot). WHAT: requests are recorded only in `response` and
`requestfailed` handlers, after `await res.buffer()`. Observed: an external request still pending when the 1.5 s tail
(line 51) ends is never pushed, so `bad` is empty and the gate prints OK. Expected: any request to another origin made during
practice fails the gate, finished or not. The load/play split (`reqs.slice(loadReqs.length)`, line 53) follows the order the
async handlers finish, not when each request started. WHY: C2 (what is proven): the gate cannot prove its own claim; costs
C2 8 -> 7. FIX: add `page.on('request', r => seen.push({ url: r.url(), local: r.url().startsWith(base), phase }))`, record
`phase` at request time, and compute `bad = seen.filter(r => r.phase === 'play' && !r.local && !/^(data|blob):/.test(r.url))`;
keep the response handler only for byte counts. CHECK: a negative probe. In the play phase run
`page.evaluate(() => { fetch('https://example.invalid/x').catch(()=>{}); })` and also intercept a CDN URL that never responds
(`page.setRequestInterception(true)`, never call `continue`). `ws-load-check` must print FAIL and exit 1 for both. Remove the
probe afterwards, or keep it as a `--self-test` flag.

D2. tests/scripts/ws-load-check.cjs:46-50 (coverage claim). WHAT: the comment says "five questions, right answers typed in".
Observed: the loop only calls `generateQuestion()` and `renderQuestion()`; `submitAnswer`, XP, progress save and session save
never run. Expected: the practice phase exercises the full answer path a pupil uses. WHY: C2 (the "0 per-pupil external
calls" line in LOAD_CHECK.md covers less than it states) and C3 (comment contradicts the code); costs C3 8 -> 7. FIX: in each
loop pass, fill `#answerInput` with `String(state.currentQ.ans)` and call `window.submitAnswer()`. After the loop, run one
worksheet (`state.gameMode='worksheet'; initWorksheet();` then the check button) and one `endGame`/save-session. CHECK: the
printed play list includes at least 5 submits (log `state.score` before and after: it rises by 5), and the gate is still OK.

D3. design/audit/LOAD_CHECK.md, "Failure modes" bullet 3 and "Done in this change" (unreproducible figure). WHAT: "17.3 s
before, 8.3 s after" with an 8 s CDN hang, and "2.55 s to 1.80 s". No script in the tree produces either. Expected: every
measured number can be re-run. WHY: C3 (doc accuracy) and C4 (the owner asked for measured load numbers); costs C3 1 point.
FIX: add `--slow-cdn <ms>` to ws-load-check.cjs. With request interception, hold every `cdn.jsdelivr.net` request for <ms>
before `continue()`, and print the time from page start until `window.generateQuestion` exists. In LOAD_CHECK.md, cite the
command `node tests/scripts/ws-load-check.cjs --slow-cdn 8000` beside the figure. CHECK: running the command on this tree
gives about 8.3 s, and about 17 s on 9fb3af7~1.

D4. js/modules/worksheet.js:974-980 and :985-990 (flag semantics). WHAT: `data-mq-laid-out` becomes '1' at the 900 ms pass
even if a widget mounts later; the resize relayout (line 989) never sets it to '0'. Expected: the flag is '0' whenever a
relayout is pending. WHY: C2/C3: the comment at :974 promises more than the code gives. The test is still correct only
because of the stable-frames wait (ws-screen-answer.cjs:431-436), so this costs no point today but is a trap for the next
driver. FIX: in the resize handler, set `g.dataset.mqLaidOut = '0'` before the 150 ms timeout, and `'1'` right after
`layoutWorksheetGrid(g)`. Reword :974 to "'1' after the last scheduled pass; late widget mounts can still move cards, so
drivers also wait for stable frames". CHECK: in the browser, dispatch `resize` and read the flag at once ('0') and after
200 ms ('1').

D5. tests/scripts/ws-screen-answer.cjs:428 and :437 (diagnosability). WHAT: a timeout gives a bare puppeteer `TimeoutError`
with no skill id. Expected: the message names the skill and which wait failed. WHY: C1 (whoever runs it must guess); no point
lost alone. FIX: wrap each wait in try/catch and rethrow
`new Error(\`\${c}:\${k} worksheet: \${which} not reached in 30 s (flag=\${flag}, fonts=\${status})\`)`, reading flag and
status with a `page.evaluate` in the catch. CHECK: temporarily set the timeout to 1 ms; the error names the skill and the wait.

What each criterion needs to reach 10:
- C1 8 -> 10: D5, plus a single wrapper `node tests/scripts/ws-screen-answer.cjs --stress N` that starts the burners and loops
  N runs itself, so the ">= 10 stressed passes" can be re-run with one command. Today the builder's 15/15 cannot be repeated
  that way; I reproduced 3/3.
- C2 7 -> 10: D1 with its negative probe, D2, and D4.
- C3 7 -> 10: D2's comment, D3, and D4's reworded comment.
- C4 8 -> 10: D3 (measured numbers reproducible), plus a recorded run of the stressed loop of at least 10 in
  design/audit/runs/wave1-E/ (command and output), matching the ">= 10 consecutive stressed passes" in MASTER_PLAN 1.9.
