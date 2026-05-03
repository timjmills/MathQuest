# Phase 0 — User Decisions on Open Questions

User reviewed `STUDY_NOTES.md` on 2026-05-03 and answered the 8 open questions in §10. These answers are authoritative for Phase 1 onwards.

| # | Question | Decision |
|---|---|---|
| 1 | Build order priority | **Builder's call.** Going Phonics first (matches Tim's classroom focus + ~300 atoms — biggest payoff), then fluency / vocab / comprehension / grammar / mechanics / writing. Phonemic awareness scaffolds Phonics and is built alongside it as foundational. |
| 2 | Audio pipeline | **Free Web Speech API.** No Polly Neural / ElevenLabs. Web Speech is what Math Quest already uses (`hints-speech.js` with voice warming + cancel-stall workarounds); reuse the same module. K-2 still gets audio default ON, but it's synthesized live, not pre-rendered. |
| 3 | Norms year default | **2025 NWEA norms.** Newer cohort, post-EISA calibrated. No 2020 toggle for now (can add later if teachers ask). |
| 4 | Voice Memo | **Drop entirely.** Don't build the Voice Memo widget at all (originally a Stage 3 feature). No parental consent UX needed. |
| 5 | Item content authoring | **AI-generated.** Procedural generators per skill (mirrors Math Quest's `gen-*.js` pattern). Each generator takes a skill atom + difficulty band and produces a templated item with word lists, passages, distractors. No human-authored content library; no item-authoring UI in Stage 2. |
| 6 | Skill code system | **Unified code system.** Extend the existing `?code=` URL scheme (Math Quest's `skill-codes.js`) to handle literacy decks too. Same compact format, with subject prefix (e.g., `M:` for math, `R:` for reading, `L:` for language) so a single URL can encode any subject's deck. |
| 7 | Login / roster | **Same anonymous setup as MAP Quest math.** No login, no roster, no class lists. Skill picker → grade selector → MAP RIT band selector → start practice. Reports live in the existing dashboard scoped to the local browser session/cookie. |
| 8 | Diagnostic placement test | **No placement test.** Student picks their RIT band manually from a dropdown (same UX as MAP Quest math). Skip the 30-40 item adaptive diagnostic. |

## Implications for Phase 1

- **No login / no roster** — every report is per-browser session. We don't need a "Needs Grading" cross-student queue (Stage 3 Boom feature) since there is no student identity.
- **AI-generated content** means the build is pure code: no item-authoring UI, no content vendor deliverables, no JSON content imports. Each skill atom maps to a generator function. Mirrors `gen-fractions.js`-style modules in Math Quest exactly.
- **Voice Memo dropped** simplifies Stage 3 considerably. We only need the manual-grading queue for open-response FIB and Ink.
- **Web Speech API only** simplifies the audio pipeline — no asset cache, no CDN, no parental-consent storage. Just `speakQuestion()` with the existing voice-warming code.
- **2025 norms** — RIT thresholds calibrated to post-EISA cohort. Grade-level means run ~2 RIT lower than 2020.
- **No placement test** — first-launch UX is a grade picker + RIT band picker, with sensible defaults from the 2025 norms table.
- **Unified code system** — one `?code=` URL share scheme across math, reading, language. The format extends to `M:AB3-CD5|...`, `R:EF7-GH2|...`, `L:IJ4-KL9|...` with subject prefix.
- **Phonics-first build order** — phonics + phonemic awareness atoms ship in MVP. Other strands stub the schema and graph but content waits for later sprints.
