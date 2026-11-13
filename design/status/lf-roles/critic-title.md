# Critic: the teacher's page title (lf-roles title), round 1

Independent critic, Opus medium, 2026-11-13. Branch `claude/sweet-newton-c8wrv1-lf-roles-title` at `aaafcfb67`, graded in a separate
worktree. No code changed. PNGs: `design/status/lf-roles/title/critic/`.

## Verdict: FAIL (one criterion at 7, on one host)

| Criterion | Pages (pupil + key) | Teacher print dialog | Simple print dialog |
|---|---|---|---|
| C1 Ease of use | 9 | 8 | **7** (T1: editing in the middle of the title moves the cursor to the end) |
| C2 Educational value | 9 | 9 | 9 |
| C3 Spacing and layout | 8 | 8 | 8 |
| C4 Standard fidelity | 9 | 9 | 9 |

Every page I rendered passes at 8 or more. The simple print's Page title box fails C1 because of one defect (T1), which is cheap
to fix. After that fix, and with the minor findings at the builder's discretion, I expect this to pass. Re-check only T1, plus
T2 and T3 if the builder changes the header CSS.

## What I ran

**(a) Pages.** `window.buildSheet` (harness `tests/lib/ws-harness.cjs`), 10 roles: independent, more-practice, guided, test,
error-analysis, reason-it, review, scripted-model, word-problems and lesson. Each at M and L, in 9 variants: default; above;
below; a 2-line title; 2-line + above; an over-long title; over-long + above; `<b>x</b> & y "q" <img src=x onerror=alert(1)>`;
and a whitespace-only title with above. That makes 180 builds, each measured on the pupil page and the key (title text, line
count, font pt, header order and height, body top, overflow), and 134 page-1 PNGs. I also ran edge cases: Name / Date / Score
off; Letter paper; Title off but with text; key after each page; and a 2-page sheet.

- Font: the title is always the size token (M 16 pt, L 18 pt). It never shrinks and never takes more than 2 lines. Pupil
  page and key print the same words on every page.
- Header height: 22.98 mm for 1 line and 28.98 mm for 2 lines, ABOVE and BELOW alike. The body starts 6 mm lower for a
  2-line title, and no page overflows.
- Escaping: `<b>x</b> & y …` prints literally (`&lt;b&gt;…&amp;…`). No element is injected, on the page, the key or the
  dialog preview.
- Empty or whitespace title: falls back to the skill's "I Can …" title, and still honours ABOVE.
- Multi-page sheets: the title is on page 1 only. Page 2 gets the 12 mm continuation header (Name only, no title), which
  matches HD-20. The key behaves the same. The lesson packet's 3 pages each carry the same title, fitted at L (HD-11).
- Key header: "Answer Key" stays on the Name rule, and the title sits above or below it as asked
  (`independent-L-long-above-key.png`).

**(b) Dialogs at 1280 and 1024** (`dialog-teacher-{1280,1024}-*.png`, `dialog-simple-{1280,1024}-*.png`).

- Defaults: both dialogs have "Below name" selected and an empty box, with the placeholder "Taken from the skill when left
  empty" / "The skill's own title".
- Captions: the default caption is right. A 2-line title gets "takes two lines". A cut title gets a warning that quotes the
  exact words that print, at the size chosen (teacher print L: "…say each step aloud…"; simple print M: "…to a partner…").
- Layout: no horizontal scroll and no console errors.
- Typing: I typed real keystrokes with pauses longer than the debounce. Focus stays in the box.

**(c) Share codes.**

- Round trip through a link: in the simple print (teacher mode) I typed a title and set it to "Above". Then: ★ Save as quick
  print → ⋯ → Copy link (clipboard captured). I opened the `?qp=` link in a fresh browser with empty localStorage. The link
  imported, and re-opening it restored the box text, "Above name", the request header (`titleText`, `titlePos`) and the
  preview title.
- Old code: I made a 2-skill QP1 code on **origin/master** and opened it on master and on the branch. It re-encodes to the
  same code. The record is identical and the request is identical (no title fields). The pupil and key HTML are
  byte-identical.

**(d) Byte identity.**

- `node tests/scripts/ws-frame-title.cjs --hashes-against tests/fixtures/precritic/frame-title/master-hashes.json`: OK. That
  is 690 builds, 1,338 titled pages and 196 of 196 hashes identical.
- My own spot-hash on `origin/master a6883082c` versus the branch: 6 other passed skills (`placevalue:value`,
  `division:div_facts`, `subtraction:sub_2d_1d`, `composing:number_word_form`, `subtraction:sub_wp_20`,
  `multiplication:mult_facts`) × 9 roles × M/L, with seed 777 and Score on. All **108 of 108** pupil + key hashes are
  identical (4 are role/skill errors on both trees alike).
- Also green: `ws-title-code` OK, `ws-boot-smoke` OK, and the syntax check on all 7 changed modules.
- CSS is additive: 11 lines added, none removed or changed.

## Findings

| Id | Where | What | Severity | Automatic check that would catch it |
|---|---|---|---|---|
| **T1** | `simple-print.js` `render()` (focus restore: `setSelectionRange(el.value.length, …)`), Page title box | The teacher puts the cursor inside the title to fix a word and types. After the 450 ms debounce, the preview rebuilds, `render()` redraws the dialog and puts the cursor at the **end**. The next keystrokes land at the end of the title. Reproduced: cursor after "Fract", type `X`, wait 3 s, type `Y` → `FractXions & … suY`. Earlier free-text fields in this dialog were short numbers, but this is the first long free-text box, and editing a title mid-string is the normal case. | **Major** (C1 7 on the simple print host) | Add to `ws-frame-title-ui`: type a title, move the cursor to position 5, type `X`, wait past the debounce and the build, type `Y`, then assert the value contains `XY`. Fix: save and restore `selectionStart`/`selectionEnd` in `render()`, or update the caption in place without redrawing the input. |
| T2 | `css/sheet-kit.css` `.ws-head--title-above > .ws-title` | In the ABOVE layout the title's ink ends 6.5 mm (L) / 7.2 mm (M) above the Name row's ink, while the Name row sits 1.2 mm above the rule. In the BELOW layout the gaps are 2.7 mm and 1.0 mm. The title reads a little detached and floats at the top of the band (`zoom-independent-M-above-head.png`). It is still clean and does not overlap. | Minor (C3) | Ink-band scan of the header PNG (as in this report): in ABOVE, the title→field-row gap is at most the BELOW layout's field-row→title gap + 1.5 mm. |
| T3 | `[data-ws-title="custom"]` line-height 7 mm, BELOW, 2 lines | The second line's descenders sit 0.68 mm (L) / 0.85 mm (M) above the 2.25 pt rule. The default one-line page has 1.02–1.2 mm. The ink gap between the two lines at L is 0.5 mm. It is legible (`zoom-independent-L-long-rule.png`) but tighter than the default page. | Minor (C3) | Ink-clearance check: title ink to rule ≥ the default page's clearance (1.0 mm) for 1 and 2 lines. |
| T4 | `teacher-print.js` | The title controls are in three cards: Page title (What to print), Title place (Page setup) and Title on/off (Header check boxes). With Title unchecked, the box and Title place stay live and do nothing, and the caption says nothing. | Minor (C1) | A UI check: header.title off → `#tvSheetTitle` and `title-pos` are disabled, or their caption says "Title is off". |
| T5 | `css/simple-print.css` `.sp-ptitle-in` | The box is about 270 px wide at both 1280 and 1024, and the label wraps to "Page / title". A 100-character title shows about 30 characters, so the teacher cannot review it without scrolling inside the box. The CSS `max-width: 480px` is never reached. | Minor (C1) | Dialog geometry: `#spPageTitle` width ≥ 400 px at a viewport of 1024 or more; the label stays on one line. |
| T6 | `WORKSHEET_DESIGN_STANDARD.md` HD-14, HD-10 | The standard still says a title "is never truncated" and is at most 60 characters. The owner's request allows a teacher title to be cut with "…" and a warning. The builder's note explains why, but the standard was not amended. I did not check whether L-VERBS / VQ-TITLE skip `data-ws-title="custom"`. | Minor (C4, docs) | `ws-precritic` doc-drift line: a frame option that overrides an HD rule cites an HD-xx amendment. Also run `ws-print-lint` on a custom-title page and expect no L-VERBS/VQ-TITLE failure. |
| T7 | every role with a fixed title (HD-13) | A custom title replaces "Test A: …" / "Test B: …", "Review: …" and "Reason It". With a custom title, Test A and Test B differ only in the 7 pt footer "Form A/B". This is the owner's request (the teacher's words), but the dialog does not say so. | Nit (C2) | none needed; optional caption "Replaces the page type's own title, e.g. Test A:". |
| T8 | `sheet/frame.js` `pageHeader` | Backward-compatible: `pageTitle` gained only an optional 3rd argument, and `page()` keeps its signature and bytes. But `pageHeader(h)` does not apply `page()`'s defaults (`name: true, date: true`), so `pageHeader({title})` prints no Name/Date. Its doc also mentions `tabMeta`, which it does not emit. lf-engine must pass `name` and `date` itself. | Nit (API) | Unit test: `pageHeader({...pageDefaults, title})` equals the `<header>` slice of `page({header:{title}})`. |
| T9 | (pre-existing) Name / Date / Score all off | The band stays 23 mm with an empty field row, so in ABOVE the empty row sits between the title and the rule. The same 23 mm band appears on master in the BELOW layout (HD title-lift is not in the kit). Not this lane's defect. | Nit | — |
| T10 | simple print caption | A 2-line title costs a row (independent M: 16 → 12 items). The teacher print caption says "the body is 6 mm shorter"; the simple print caption does not. The count line above the preview does update. | Nit (C1) | — |

## Checks this round adds (process rule 00)

- T1 is the only finding that would fail a page or host, and it is a dialog-interaction defect. No geometry, hash or code
  check finds it. Add a **caret-preservation probe** to `ws-frame-title-ui`, and make it general: any text input in a
  dialog that redraws on debounce keeps its cursor after the redraw. It belongs on precritic's `--teacher` path.
- T2/T3: `ws-frame-title` TITLE-PLACE already checks that boxes do not overlap. It does not compare ink clearance against
  the default page. Scanning the header band's ink (this report's method: the row profile of the screenshot above the
  rule) would turn "tight" into a number.
- Speed: the builder's checks were thorough. Hash pin, old-code fixture and escaping were all green on first run, so no
  hour was lost to them. Typing tests that use real keystrokes and cursor movement belong in the first build of any
  dialog text field (LESSONS_LEARNED candidate: "a dialog field is tested by typing, not by setting `.value`").

## PNGs looked at (`design/status/lf-roles/title/critic/`)

- `independent-{M,L}-{default,above,below,two,two-above,long,long-above,esc,ws}-{pupil,key}.png`, and the same for `test-*`.
- `{guided,error-analysis,reason-it,review,scripted-model,word-problems,more-practice}-M-{above,two-above,long-above}-*.png`,
  plus `*-L-long-*.png`.
- Zooms: `zoom-independent-M-above-head.png`, `zoom-independent-L-long-rule.png`, `zoom-simple-1280-warning.png`, and the
  contact sheet `contact-guided-model-wp-reasonkey.png`.
- Dialogs: `dialog-teacher-{1280,1024}-{default,long-above,two,esc,spaces}.png`,
  `dialog-simple-{1280,1024}-{default,long-above,two,more-options}.png`, `dialog-simple-1280-warn.png` and
  `dialog-simple-1280-from-link.png` (re-opened from the link in a fresh browser).
