# Boom Cards comprehensive catalog — synthesis

## Document Overview

Boom Cards is a browser-delivered, deck-based digital task-card platform widely used in K-5 classrooms. Teachers assign decks; students play through cards that auto-grade most interactions and route un-gradeable ones (handwriting, voice, open-response) to a manual queue. The platform has become the de facto standard for no-prep interactive ELA practice.

This catalog matters for Literacy Quest because it documents the complete menu of interaction patterns that K-5 ELA teachers already expect and trust. **Any new platform that wants teacher adoption must at minimum match the Boom interaction set — and must surpass it in five specific dimensions** where Boom falls short: case-sensitivity control, flexible acceptable-answer matching, saved voice recordings, smarter open-response grading, and longitudinal IEP-goal dashboards.

The key design insight: Boom's enormous content library is actually the same five or six interactions repeated in different visual costumes. **Literacy Quest should build a small set of composable primitives and derive all skill activities from them.**

---

## The 10 Core Boom Interaction Primitives

### 1. Multiple Choice — Single Answer
Any element flagged Correct or Wrong. Green/red feedback; retry until correct unless surrender enabled. **K-2:** pair with images and audio. **2-5:** text-only OK; 4-choice standard.

### 2. Multiple Choice — Multi-Select
Same as MC but Submit-gated. Highlights correct green and incorrect red. The only Boom mechanism for "select all that apply." **K-2:** use sparingly — high cognitive load.

### 3. Tap-the-Element / Hotspot
Any image or text box flagged Correct/Wrong functions as a hotspot. **K-2:** workhorse for phonological awareness/phonics. **2-5:** tap-the-word for grammar, proofreading, text evidence.

### 4. Drag-and-Drop with Linked Drop Zones
Elements marked Draggable; targets marked Drop Zone. Author wires draggable-to-zone pairs. Drop zones support accept-all, accept-any, or accept-specific. Tile must be >50% inside zone. **K-2:** primary vehicle for phoneme manipulation, letter tiles. **2-5:** Venn diagrams, cause-effect matching, evidence highlighting, shades-of-meaning ordering.

### 5. Fill-in-the-Blank — Auto-Graded
FIB block accepts typed text; author enters accepted answers. **Known limitations:** students must satisfy ALL listed correct answers (not any one); no documented case-sensitivity toggle. Literacy Quest must resolve both day-one.

### 6. Open-Response FIB — Human-Scored
Open-ended FIB routes to teacher's Manual Grading queue. **Purple speech bubble** indicator in student reports. Partial-credit rubric available.

### 7. Ink (Free Draw)
Free-draw canvas per card; "Allow" or "Require" Ink. Always manual-graded. Routes to same purple bubble queue. **K-2:** letter tracing, drawing responses. **2-5:** editing marks, grammar underlining.

### 8. Voice Memo — Student-Only, Not Saved
10-second recording; student plays back, can re-record. **NOT saved, NOT teacher-accessible.** Currently a self-monitoring tool only. **Literacy Quest differentiator:** store server-side with parental consent.

### 9. Tap-to-Reveal / Hide-When-Tapped
Element flagged "disappear when tapped" exposes Z-ordered content underneath. Mystery-picture, memory-match. Pure reveal cards do not capture an answer — combine with MC or D&D for grading.

### 10. Chain Images
Image element linked to multiple subsequent images; tapping cycles. Letter formation stroke-order, step-by-step process visuals.

### Additional Primitives
- **Audio playback** — Per-element speaker buttons (up to 30s recordings for Premium). Single most important ELL/SPED accommodation for K-2.
- **Video embedding** — Short videos; no granular telemetry.
- **Lesson cards** — No answer requirement; anchor charts, direction cards.
- **Navigation buttons** — Advance/return/jump; enable sub-deck menus.

---

## K-5 Literacy Patterns by Domain

| Domain | Typical Boom Pattern | Primary Mechanic | Example Prompt |
|---|---|---|---|
| **Phonological Awareness** | Listen + tap rhyming picture; drag tokens for syllable count | Tap-correct + audio; drag tokens | "Tap the picture that rhymes with cat." |
| **Phonics** | Drag letter tiles into Elkonin boxes; sort words by vowel pattern | Drag-and-drop tiles; drag-to-bin | "Build rain. Drag r, a, i, n into the boxes." |
| **Sight Words** | Listen + tap the word; drag scrambled letters into order | Tap-correct + audio; drag tiles | "Tap the word said. Drag letters to spell were." |
| **Vocabulary** | Read + tap synonym/antonym; drag into category bins; order shades-of-meaning | MC + photo; drag-to-bin; drag sequence | "Which word means the same as happy?" |
| **Fluency** | Drag scoop marks under phrases; Voice Memo for oral reading | Drag/Ink; Voice Memo | "Drag a scoop under each phrase." |
| **Comprehension** | MC after passage; drag events 1st/2nd/3rd; drag highlight onto text evidence | MC; drag sequence; drag highlight | "What is this passage mostly about?" |
| **Grammar/Mechanics** | Tap part of speech; drag into POS bins; choose correctly punctuated sentence | Tap-hotspot; drag-to-bin; MC | "Tap the noun." |
| **Spelling** | Build with letter tiles from audio; sort by pattern; tap misspelled word | Drag tiles + audio; drag-to-bin; hotspot | "Build corn." |
| **Writing** | Drag words into sentence frame; type corrected sentence; choose best topic sentence | D&D; FIB; MC; open-response FIB | "Drag the words into order." |

**Audio on every text element is the baseline for K-2 across all domains.**

---

## Cross-Reference Matrix: Pedagogical Category × Mechanic

| Domain | Tap/MC | D&D | FIB auto | Open FIB | Ink | Voice | Reveal | Audio | Chain |
|---|---|---|---|---|---|---|---|---|---|
| Phonological/PA | Primary | Heavy | Rare | No | Rare | Articulation | Mystery pic | Required K-2 | Stroke models |
| Phonics | Primary | Heavy | Common | Rare | Letter tracing | Articulation | Common | Required K-2 | Letter formation |
| Sight Words | Primary | Heavy | Common | Rare | Handwriting | Self-monitor | Common | Required K-1 | None |
| Vocabulary | Primary | Heavy | Some | Definitions | None | None | Some | ELL essential | Examples |
| Fluency | Some | Phrase scooping | None | None | Scoop marks | Yes (private) | None | Modeled passages | None |
| Comprehension | Primary | Sequencing, evidence | Some | Summaries | Highlighting | None | Mystery review | ELL essential | None |
| Grammar/Mechanics | Primary | Sorting, sentence-build | Common | None | Editing marks | None | None | Helpful | None |
| Spelling | Primary | Tile build, sorts | Heavy | None | Handwriting | None | None | Required K-2 | None |
| Writing | Some | Sentence frames | Heavy | Heavy | Proofreading | Read-aloud | None | Helpful | None |

---

## ELL & SPED Considerations

**ELL:**
- Per-element audio is the single most important feature.
- Picture-supported answer choices reduce English-text load.
- Boom Store Accessibility Toggles filter for audio/visual/motor accommodations.
- Sentence-level context backed by photo is highest-leverage Tier 2 vocab format for grades 3-5.
- On-screen keyboards for non-English characters.

**SPED:**
- Switch-device support via Z-order management (Shift+Tab to back up).
- Errorless multiple choice (one obvious correct answer + clearly different distractors) for new-skill introduction.
- Embedded audio for reading-fragile students.
- Hide Cards + Custom Play Settings for IEP-aligned scaffolding.
- Picture-only response options for AAC users.
- SPED community values Boom for IEP progress monitoring via Reports' longitudinal accuracy by skill.

---

## Staged Build Recommendations

### Stage 1 — Minimum Viable Interaction Set (Build First)
**The 6 Stage 1 widgets are the minimum viable widget library.** Build these completely before Stage 2:

1. **Multiple choice** — text and image options, single + multi-select.
2. **Tap-correct hotspot** — any element flag-able as correct/wrong.
3. **Drag-and-drop with linked drop zones** — multiple correct draggables per zone, accept-any / accept-all / accept-specific.
4. **Fill-in-the-blank with auto-grading** — list-of-acceptable-answers field, case-sensitivity toggle, trim/normalize whitespace, "any one of" matching.
5. **Per-element audio playback** — one-tap "speaker" affordance, default on for every K-2 text element.
6. **Self-checking feedback** — green/red, ding/whoops, attempt-tracking, per-card answer logging.

### Stage 2 — Differentiation and Scaffolding
7. **Custom Play Settings** — shuffle, limit cards, limit attempts, show answer on surrender, hide cards (named EXACTLY as Boom).
8. **Open-response text with manual grading queue** — partial-credit rubric, purple speech bubble pattern.
9. **Tap-to-reveal / hide-when-tapped** — mystery picture, memory match.
10. **Chain Images** — stroke models, sequence visuals.

### Stage 3 — High-Value Additions
11. **Ink / free-draw** for handwriting and editing-mark practice (manual graded).
12. **Voice Memo for self-monitoring** — Literacy Quest's differentiator: save and surface to teacher.
13. **Reports** — per-card accuracy, attempts, fastest-correct-response time, session timeline, CSV export. **This drives teacher adoption.**
14. **Accessibility** — ALT text, screen-reader Z-order, keyboard/switch nav, Accessibility filter toggles.

### Stage 4 — Differentiators
15. **Server-stored voice recording** with longer durations (parental consent).
16. **Auto-scored short-answer** with teacher-defined rubric assisted by AI.
17. **Longitudinal IEP-goal dashboards** keyed to skill rather than deck.

---

## Boom Limitations to Surpass

The catalog explicitly names five differentiators for Literacy Quest:

1. **Case-sensitivity toggle on FIB** — Boom has no documented public toggle. Resolve at data model level day one.
2. **"Any one of" acceptable-answer matching** — Boom requires students to satisfy ALL listed answers. Implement true "any-of" with multi-accepted-answers UI.
3. **Saved voice recordings** — Boom is 10s, student-only, not saved. Store server-side (parental consent), surface in teacher report view.
4. **Smarter open-response grading** — Boom's manual queue is binary with basic rubric. AI-assisted scoring with teacher confirmation.
5. **Longitudinal IEP-goal dashboards** — Boom reports are deck-level/session-level. SPED teachers need skill-keyed longitudinal accuracy curves with goal lines.

---

## Custom Play Settings (Verbatim Boom Names)

Use Boom's exact terminology so teachers feel familiar:

- **Shuffle cards** — "ideal for reinforcing recall and preventing memorization based on the order"
- **Limit cards** — "limit the number of cards in each play session to make a large deck more manageable"
- **Limit attempts** — "control how many times a student can attempt a deck"
- **Show answers** — "show the answer if a student gives up in early practice sessions" (surrender mode)
- **Hide cards** — omit specific cards from a student's view (IEP differentiation, pacing)

---

## Open-Response Grading Queue

The pattern to replicate: **purple speech bubble indicator** appears in a student's individual report on any card with un-gradeable answer type (open-response FIB, Ink, stored Voice Memo). Teacher clicks "Grade them," reviews, scores correct/incorrect/partially correct.

For Literacy Quest:
- Any FIB flagged open-ended, any Ink card, and any stored Voice Memo card injects the purple speech bubble badge.
- Teacher dashboard needs a "Needs Grading" queue aggregating all un-reviewed responses across students/assignments.
- Partial credit (0 / 0.5 / 1.0 of assigned points) supported.

---

## Reports — Teacher-Adoption Driver

Teachers expect:
- **Per-card accuracy** — % from most recent 3 sets of play
- **Attempts per card** — tries before correct submission
- **Fastest correct response time** — fluency/automaticity surface
- **Session timeline** — "Performance by Play Session" with score and timestamps
- **Answer choice log** — what was actually selected (not just right/wrong)
- **CSV export** — Excel-readable, organized by deck and student

Boom does NOT capture audio button taps, video views, or voice recordings. If Literacy Quest assesses listening/speaking, build that telemetry independently.

**Reports drive adoption — build into Stage 3 without compromise.**

---

## Implications for Literacy Quest's Design

- **Build Stage 1 first, completely.** The six Stage 1 items constitute the minimum viable widget library. Every skill domain's core interactions can be composed from these six. Do not start Stage 2 until Stage 1 covers 80%+ of planned activities.
- **Resolve FIB case-sensitivity and "any-of" matching at the data model level, day one.** Building correctly avoids painful retrofit and is an immediate differentiator.
- **Per-element audio is non-negotiable for K-2 and ELL.** Every text element has a one-tap audio affordance.
- **Custom Play Settings must use Boom's exact names.** "shuffle cards", "limit cards", "limit attempts", "show answers", "hide cards" — verbatim. Different terminology creates friction.
- **Manual grading queue must implement the purple speech bubble pattern.** Open-response FIB, Ink, stored Voice Memo flag with this indicator. The aggregation queue across students is a teacher workflow requirement.
- **Voice Memo and smarter open-response grading are the highest-leverage differentiators.** Saving recordings server-side and AI-assisted scoring are Boom's biggest gaps.
- **IEP-goal dashboards are the SPED adoption trigger.** Longitudinal skill-keyed accuracy dashboards (NOT deck-level session reports) are what SPED teachers need.
- **Errorless design for initial SPED/ELL introduction.** One obvious correct + clearly different distractors. Graduate to multi-select/FIB only as accuracy stabilizes >70%.
- **Reports drive adoption — build in Stage 3 without compromise.** Per-card accuracy, attempts, response time, session timeline, answer-choice log, CSV export are expectations not nice-to-haves.
- **Lead every multi-skill deck with a lesson card.** Anchor chart with definition + example before any practice card is standard in highest-rated TPT decks.
- **Use the cross-reference matrix as a deck-creation checklist.** Every K-2 deck must have audio on every text element. Every K-1 phonics deck must include at least one drag-and-drop interaction. Every comprehension deck for grades 2-5 should include at least one drag-the-highlight evidence-citation card.
