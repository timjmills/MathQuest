# Adaptive MAP Practice: Design

**Status:** Plan only. No code written yet.
**Audience:** Tim Mills (project owner) + Claude Code (implementer).
**Scope:** Upgrade `js/modules/map-engine.js` from a fixed-tier, fixed-length, single-RIT engine into a research-grade adaptive practice loop with per-skill mastery tracking, gradual cross-tier (K-2 ↔ 3-5) movement, domain-independent RIT estimation, item-exposure control, an end-early summary, and an unlimited mode.
**Companion docs:** `MAP_MODE_PLAN.md` §6, §9; `MAP Growth K-5 Math Practice App_ Complete Build Reference MD.md` Part 9; `NWEA MAP Growth Mathematics_ Implementation Guide for Math Quest K-5 Practice Mode MD.md` §1A.

---

## 1. Research summary

### 1.1 Rasch 1PL IRT — the gold standard for K-12 CAT

The Rasch (one-parameter logistic / 1PL) model is the only IRT model NWEA publishes for MAP Growth. It models the probability that a person of ability θ answers an item of difficulty b correctly as

```
P(correct | θ, b) = 1 / (1 + exp(-(θ - b)))
```

There is no separate discrimination (a) or guessing (c) parameter — every item is assumed equally discriminating. This **dramatically simplifies item banking, item analysis, and adaptive item selection**, which is why nearly all large-scale K-12 systems use it.[^assess1pl][^wikiirt]

Adaptive selection in 1PL: at each step, pick the item whose b is closest to the current θ estimate (this maximizes Fisher information at θ — for the Rasch model, item information peaks exactly at b = θ and equals 0.25 there).[^cogniq] After the response, update θ using maximum-likelihood (MLE) or expected a posteriori (EAP). For short fixed-length CATs (< 10 items) a step-up/step-down heuristic works almost as well as full MLE re-estimation between items.[^massur]

Best practice for K-5 specifically: target ~50% expected correct (b ≈ θ) for measurement, but ~70% expected correct (b ≈ θ - 0.85 logits ≈ θ - 4 RIT) for **practice** — children disengage at 50% success.[^rasch_rmt] MAP itself splits the difference; NWEA targets ~50% during measurement but EISA biases toward grade-level content, which usually pulls items slightly easier than a pure-info pick for off-grade-level students.[^nwea_eisa_overview]

### 1.2 NWEA EISA — bias toward grade-level content

The Enhanced Item Selection Algorithm (EISA) was rolled out by NWEA in spring 2023 (18 states), summer 2024 (16 more), and is universal for the 2025-26 school year.[^nwea_eisa_research] EISA differs from pure Rasch info-maximization in three ways:

1. **Grade-level prior**. The selector reweights candidate items by an inverse penalty based on distance from the student's enrolled grade's RIT band. A 3rd-grader with θ=210 (Grade 4 territory) still sees Grade 3 items preferentially when they are within range, instead of jumping straight to Grade 4-5 items.
2. **Higher mean math scores**. EISA students score higher on average than traditional MAP — partly because grade-level items are slightly easier (better content match) and partly because they're more familiar.[^nwea_eisa_research]
3. **Concordance tables published by NWEA** to map EISA scores to traditional MAP scores so longitudinal data still works.[^nwea_eisa_overview]

**Implication for MathQuest:** when we add grade-level bias, we should make the bias gentle (not absolute). EISA does **not** prevent off-grade items entirely — it just makes them ~30-50% less likely than equally-informative grade-level items.

### 1.3 IXL SmartScore — within-skill mastery via dynamic difficulty

IXL uses a **per-skill 0-100 SmartScore** (not RIT). Each skill is independent. The score moves up on correct answers, down on incorrect. **Key parameters**:[^ixl_smartscore][^ixl_guide]

- Score increments are **larger when low**, **smaller when high** (asymptotic approach to 100). This creates a "challenge zone" past 90 where one wrong answer subtracts 5-10 but a correct only adds 1-2.
- 80 = "Excellent" / proficient threshold.
- 100 = mastery; locks the skill but invites continued practice ("recommendations").
- Easier questions appear when the score drops, building **confidence** before re-attempting harder content. This is an explicit confidence-builder loop, not just adaptivity.

### 1.4 Khan Academy — five mastery levels per skill

Khan Academy's mastery system uses 5 levels per skill: **Attempted → Familiar (50 pts) → Proficient (80 pts) → Mastered (100 pts)** with a separate "energy points" effort metric (not mastery).[^khan_mastery] Mastery is decay-resistant but not permanent — the system periodically schedules **mastery challenges** that re-test old skills (Leitner-style spaced repetition).

### 1.5 DreamBox — strategy-aware adaptivity

DreamBox is the most sophisticated K-8 adaptive math: it tracks not just right/wrong but **which solution strategy** the student used (e.g., counting on vs. decomposing-to-10) and adjusts both difficulty and **scaffolding/hint density** accordingly. Reports 50,000 data points per hour per student.[^dreambox] Out of scope for MathQuest's near-term, but informs the "adaptive hints" feature in §4.5e.

### 1.6 Stopping rules — SE-based vs. fixed length

The standard error (SE) stopping rule is the most-cited best practice: terminate when SE(θ) drops below a threshold (commonly 0.30 logits ≈ ±3 RIT for high-stakes; 0.50 logits ≈ ±5 RIT for low-stakes practice).[^cat_stopping][^cat_stopping_pmc] **For elementary math practice**, pure SE stopping has a known weakness: thin item pools at the tails (very low or very high θ) make the SE never converge for outliers, and the test runs forever. The accepted fix is a **hybrid rule**: stop when *(SE ≤ threshold) OR (items ≥ N_max) OR (items ≥ N_min AND SE plateau)*. The 2018 Choi et al. simulation found a hybrid SE-plus-N_max rule consistently produced the best precision-per-item.[^cat_stopping]

### 1.7 Item exposure control — Sympson-Hetter and randomesque

In a session, if you always pick the most-informative item, the same items get over-exposed and the bank's security/freshness suffers. Two methods dominate:[^sympson_hetter]

- **Sympson-Hetter**: each item has an exposure parameter k_i ∈ [0,1]. After info-maximization picks item i, draw r ~ U(0,1); administer if r ≤ k_i, else move to next-best. k_i is set to enforce a target maximum exposure rate (e.g., 0.20 = item appears in ≤20% of sessions). Requires offline simulation to calibrate k_i.
- **Randomesque** (Kingsbury & Zara): pick the top-k (typically 5) most-informative items and randomly choose one. Trivial to implement, no calibration needed, but lets exposure drift higher than Sympson-Hetter.[^sympson_hetter]

For a single-session math practice app, randomesque is more than sufficient. The actual concern is **within-session repetition** (same skill × same parameters within one sitting), which neither method solves directly — that needs an explicit dedup hash.

### 1.8 Domain independence — g vs. specific abilities

The empirical literature on math abilities consistently finds:[^g_math_pmc][^g_math_sciencedirect]

1. **General cognitive ability (g) explains 40-60% of variance** in elementary math achievement across all subdomains (OA, NO, MD, G).
2. **Domain-specific abilities** (number sense, spatial reasoning, computation fluency) add 15-30% of variance on top of g.
3. **Subdomain correlations** at K-5 typically run r = 0.55-0.75 — high but not 1.0.

**Implication:** treating domains as fully independent (separate RIT tracks) overcorrects (information about one domain *does* inform others); treating them as identical undercorrects (a kid can be strong in OA and weak in G). Best practice: track per-domain estimates, but **let them weakly inform each other** via a shrinkage prior (e.g., per-domain RIT pulled 20% toward overall RIT after each item).

### 1.9 K-2 vs 3-5 crossover (NWEA hard rules)

Per `NWEA MAP Growth Mathematics_ Implementation Guide for Math Quest K-5 Practice Mode MD.md` §1A and Build Reference §2:

- **Switch K-2 → 3-5**: trigger when the running RIT estimate ≥ 200 (item pool thins above 200 in K-2; 3-5 has the depth).
- **Switch 3-5 → K-2**: trigger when running RIT estimate ≤ 170 (3-5 floor is 181; below that is mostly K-2 content).
- NWEA itself does **not** switch test forms mid-session — instead it suggests retest with a different form. For a practice app we have flexibility: we can offer transparent cross-tier item inclusion mid-session, but the *announcement* should still be soft (toast/banner) rather than abrupt.

---

## 2. Current engine capabilities

### 2.1 What works (as of 2026-04)

`chooseNextSkill()` in `js/modules/map-engine.js` (lines 361-425):

- **Domain rotation** — prefers least-seen domain; correct in spirit (matches NWEA's content-balancing requirement).
- **Randomesque** — picks from top 3-5 closest by `|b - target|`; correct exposure-control choice for our scale.
- **Step-size adaptive update** — `±(3 + min(streak, 5))` RIT per response is a reasonable Robbins-Monro-style heuristic; not Bayesian-pure but effective in practice.
- **Target offset** — `target = currentRit - 4` aims for ~70% expected correct, which is the right number for K-5 practice (vs. ~50% for measurement).
- **Per-domain item count** is already tracked (`state.mapPerDomainItems`) — most of the data we need for per-domain RIT is already being recorded.
- **Time cap** + **fixed item count** stopping rules both implemented.

### 2.2 What's missing for full adaptivity

| Gap | Impact |
|-----|--------|
| **Tier is fixed for the session** | Student starting in K-2 can't access 3-5 items even if their RIT clearly belongs there, and vice versa. Hard ceiling/floor pinches accuracy. |
| **No per-skill mastery tracking** | The same skill keeps appearing at the same difficulty even after 5/5 correct (waste) or 0/5 (frustration). Per-skill state is lost between items. |
| **Single overall RIT, no per-domain estimates** | A kid strong in OA but weak in G gets the same difficulty in both domains. Per-domain RIT exists in `mapPerDomainItems` count form but not as an actual θ estimate. |
| **No item-exposure dedup within session** | Same skill × same parameter values can repeat in a 25-item session (low probability with our skill count, but non-zero and very frustrating when it happens). |
| **No SE-based termination** | Always runs the full N items; no way to stop when the estimate is already precise enough or to keep going when it isn't. |
| **No end-early** | Student who needs to leave loses all data; no graceful "finalize what you have" path. |
| **No unlimited mode** | Free-play / extended practice not supported; engine assumes a target item count. |
| **No grade-level bias (EISA-equivalent)** | Off-grade items appear with equal weight; doesn't match modern MAP behavior. |
| **No recovery mode** | After 3 wrong in a row, next item is just "RIT - 24" (3×8) — that's a big drop but no explicit confidence-builder UX. |

---

## 3. Recommended adaptive model

### 3.1 Per-skill mastery tracking

Each skill maintains a **sliding window of the last N attempts** (default N=5). State key:

```js
// in state.js, on the existing state object
mapSkillHistory: {
  // skillId → { attempts: [true,false,true,...], lastSeen: timestamp }
  add_facts: { attempts: [true,true,true,true,true], lastSeen: 1714060800000 },
  fraction_number_line: { attempts: [false,false,true], lastSeen: 1714061100000 },
  // ...
}
```

**Mastery thresholds** (modeled on IXL SmartScore semantics, adapted for sliding window):

| Window state | Label | Selector behavior |
|---|---|---|
| 5/5 correct | **Mastered** | Drop selection weight to 0.2× for the rest of session; prefer harder skills in same domain |
| 4/5 correct | **Proficient** | Drop weight to 0.5×; can still appear |
| 3/5 correct | **Developing** | 1.0× (default weight) |
| 1-2/5 correct | **Struggling** | 0.5× weight + force same-domain easier skill on next selection |
| 0/5 correct | **Confused** | 0.2× weight + trigger recovery mode (§4.5b) |

Implementation in `chooseNextSkill()`:

```js
import { state } from './state.js';

function getSkillMasteryWeight(skillId) {
  const hist = state.mapSkillHistory?.[skillId];
  if (!hist || hist.attempts.length === 0) return 1.0; // unseen, default
  const recent = hist.attempts.slice(-5);
  const correct = recent.filter(Boolean).length;
  if (recent.length < 3) return 1.0; // not enough data
  if (correct === recent.length) return 0.2; // mastered
  if (correct >= 4) return 0.5;
  if (correct === 0) return 0.2;
  if (correct <= 2) return 0.5;
  return 1.0;
}
```

The pool sort then becomes weighted distance:

```js
pool.sort((a, b) => {
  const wa = getSkillMasteryWeight(a.skill);
  const wb = getSkillMasteryWeight(b.skill);
  return Math.abs(a.b - target) / wa - Math.abs(b.b - target) / wb;
});
```

### 3.2 Cross-tier movement (gradual, opt-in)

Replace the fixed `state.mapTier` filter with a **soft tier preference**:

```js
// Tier classification of every skill is already implied by its RIT band.
// Compute "active tier" dynamically based on current RIT:
function getActiveTierBands(currentRit, declaredTier) {
  if (declaredTier === 'mixed') return ALL_BANDS;
  if (declaredTier === 'k2') {
    // Once RIT stably ≥ 200, transparently include 3-5 floor bands
    if (currentRit >= 200) return [...K2_BANDS, '191-200', '201-210'];
    return K2_BANDS;
  }
  if (declaredTier === '35') {
    if (currentRit <= 170) return [...M35_BANDS, '161-170', '171-180'];
    return M35_BANDS;
  }
  return ALL_BANDS;
}
```

**Crossover banner** (UX): when the engine first detects the threshold cross, show a one-time toast for 4 seconds: *"Including some 3-5 items now — you're scoring high enough!"* with a small "Stay K-2 only" button to lock the original tier. The actual switch is silent in the item stream — students just see slightly different items mixed in.

**Stable threshold logic** to avoid flapping: require 3 consecutive items where currentRit ≥ 200 (or ≤ 170) before triggering. Also require a minimum of 5 items completed before the engine considers the cross.

### 3.3 Domain-independent RIT with shrinkage

Track per-domain RIT separately, but shrink toward the overall mean to reflect g-factor correlation:

```js
// state.js additions
mapDomainRit: { OA: 185, NO: 185, MD: 185, G: 185 }, // initialized to overall start
mapDomainItems: { OA: 0, NO: 0, MD: 0, G: 0 },       // items completed per domain
mapDomainCorrect: { OA: 0, NO: 0, MD: 0, G: 0 },
```

Update on each response:

```js
function updateDomainRit(domain, isCorrect, streak) {
  const step = 3 + Math.min(streak, 5);
  const delta = isCorrect ? +step : -step;
  // Update the domain estimate
  state.mapDomainRit[domain] += delta;
  // Also update the overall (existing behavior)
  state.mapCurrentRit += delta;
  // Shrinkage: pull each domain 20% toward the overall mean after every item
  const overallRit = state.mapCurrentRit;
  const SHRINKAGE = 0.20;
  for (const d of Object.keys(state.mapDomainRit)) {
    state.mapDomainRit[d] =
      state.mapDomainRit[d] * (1 - SHRINKAGE) + overallRit * SHRINKAGE;
  }
}
```

**Item selection** then uses the per-domain RIT for the chosen domain rather than the overall RIT, so the kid weak in G sees easier G items but stays on grade-level for OA:

```js
const targetForDomain = state.mapDomainRit[chosenDomain] - 4;
```

### 3.4 Item-exposure control (within-session dedup)

Hash each item by `(skillId, parameter signature)` and track shown hashes per session:

```js
// state.js
mapShownItemHashes: new Set(), // cleared on session start

// after generateQuestion() returns q:
const sig = q.text + '|' + (q.ans ?? '') + '|' + JSON.stringify(q.options ?? null);
const hash = simpleHash(sig); // any 32-bit hash
if (state.mapShownItemHashes.has(hash)) {
  // try regenerating up to 3 times
  // if still duplicate, accept it (extremely rare with 250+ skills × random params)
}
state.mapShownItemHashes.add(hash);
```

Across sessions: not needed for v1. If usage data later shows item-staleness complaints, persist `mapShownItemHashes` in localStorage with a 30-day TTL.

### 3.5 Stopping rules (three modes)

| Mode | Stop condition |
|---|---|
| **Fixed length** (default, current behavior) | `mapItemCount >= mapItemCountTarget` |
| **SE-based** | `(estimatedSE <= seThreshold AND mapItemCount >= 10) OR mapItemCount >= 50` |
| **Unlimited** | No automatic stop; only user-triggered "End Session" |

SE estimation (for N items completed):

```js
// Rough SE formula for Rasch model with item info ~0.25 at b≈θ:
// SE(θ) ≈ 1 / sqrt(sum of item informations) ≈ 1 / sqrt(N * 0.25) = 2/sqrt(N)
// In RIT scale (1 logit ≈ 4.5 RIT), SE_RIT ≈ (2/sqrt(N)) * 4.5 ≈ 9/sqrt(N)
function estimateMapSE(itemCount) {
  if (itemCount < 1) return 99;
  return 9 / Math.sqrt(itemCount);
}
// Default seThreshold = 3.0 RIT → stops at N ≈ 9 items if estimate is precise
```

For SE mode, also enforce a **minimum 2 items per selected domain** (already the implicit rule in current code) before stopping is allowed.

---

## 4. Recommended new features

### 4.1 End-Early summary button (P0)

Always-visible "End Session" button in the MAP session view header. Click → confirm modal → call `finalizeMapSession()` → show results screen with whatever data was collected.

```js
// in map-engine.js (new export)
export function endMapSessionEarly() {
  if (!state.mapMode) return;
  if (state.mapItemCount === 0) {
    showToast('Answer at least one item first');
    return;
  }
  const confirmed = confirm(
    `End now? You've answered ${state.mapItemCount} item${state.mapItemCount > 1 ? 's' : ''}. ` +
    `Your results will be based on what you've done so far.`
  );
  if (confirmed) finalizeMapSession({ endedEarly: true });
}
```

The results view shows a small "Ended early" tag and notes the SE was wider than usual. All other report content (per-domain RIT, ready-to-learn cards) renders the same.

### 4.2 Unlimited mode (P0)

Add a fourth session mode alongside Simulation, Practice, Worksheet:

```js
// state.js
mapSessionMode: 'unlimited', // 'simulation' | 'practice' | 'unlimited' | 'worksheet'
```

When `mapSessionMode === 'unlimited'`:
- `mapItemCountTarget = Infinity`
- The "Item N of M" banner shows "Item N" with no denominator.
- The End Session button is the only way out.
- Engine still tracks RIT, per-domain RIT, mastery — these continue to refine indefinitely.
- Optional: every 10 items, show a non-blocking toast: *"You've done 10 items. Want a quick break?"*

Selector UI: add a fourth option chip below Simulation/Practice — **"Unlimited (Free Practice)"**. Default item-count slider hidden when this is chosen.

### 4.3 Recovery mode (P1)

After 3 incorrect in a row on the same skill OR across same domain: the engine forces a **confidence-builder item** — same domain, RIT 8-12 below current, and explicitly easier visual scaffolding (full hint enabled, work-space shown).

```js
function shouldEnterRecoveryMode() {
  if (state.mapIncorrectStreak < 3) return false;
  // Don't recover more than once per 8 items
  if (state.mapItemCount - state.mapLastRecoveryAt < 8) return false;
  return true;
}

function pickRecoveryItem(currentDomain) {
  const recoveryTarget = state.mapDomainRit[currentDomain] - 12;
  // Use a softer randomesque (top 8 instead of top 3)
  // and force any unmastered easier skill in this domain
  // ...
}
```

UX: subtle banner at the top of the item: *"Let's try a quick warm-up."* Soft language; does **not** say "you're struggling."

### 4.4 Domain heatmap live display (P1)

Mini 4-cell color strip in the session banner showing current per-domain RIT relative to overall. Updates after each response. Color scale: green (≥ overall + 5), yellow (within ±5), orange (overall - 5 to overall - 10), red (< overall - 10).

Useful for self-aware older students; can be hidden for K-2 to avoid anxiety. Toggle in `mapFeatures` panel.

### 4.5 Other features brainstormed

| Feature | Rationale | Effort |
|---|---|---|
| **a. Challenge round** (after 5 correct in a row, ask "Want a challenge?" → 3 items at RIT + 10) | Engagement, ceiling exploration; opt-in so no penalty | Small |
| **b. Recovery mode** (above §4.3) | Confidence preservation; mirrors IXL drop-then-easier loop | Medium |
| **c. Domain heatmap** (above §4.4) | Self-monitoring for older students, teacher visibility | Small |
| **d. Time-of-day weighting** (afternoon → bias slightly easier; -2 RIT shift between 14:00-18:00) | Energy curve research; especially useful for K-2 | Tiny |
| **e. Adaptive hints** (mastery-based: if last 3 attempts on this skill all wrong, auto-show hint after 8s instead of requiring tap) | Removes friction for struggling students | Medium |
| **f. Skill-pair scaffolding** (if skill X has prereq Y in a `SKILL_PREREQS` map, and X is failed, briefly inject Y) | Concept-graph routing; closer to DreamBox | Large |
| **g. Mastery streak banner** (visible badge: "Mastered 3 skills today") | Motivation, gamification continuity | Tiny |
| **h. End-of-session "Ready to Learn" cards** (already partially in plan) — split into Reinforce / Develop / Introduce based on per-skill mastery + per-domain RIT proximity | Direct teacher/student next-step routing | Medium |
| **i. Configurable target accuracy** (slider in advanced settings: 60% / 70% / 80% expected correct) | Lets parents tune for confidence vs. challenge | Tiny |

---

## 5. Implementation roadmap

### Phase 1 — small, high-value (~1 day)

1. **End-early button + summary** (§4.1). Adds `endMapSessionEarly()` export to `map-engine.js`, button in `mapSessionView` HTML, results view tag for "ended early."
2. **Unlimited mode** (§4.2). New session mode chip, hide item-count slider when chosen, banner shows "Item N" without denominator, engine handles `Infinity` target.
3. **Within-session item-exposure dedup** (§3.4). Cheap win; just a Set on `state` and a hash check.

**Verification:** Run a session, hit End Early after 3 items, see results render. Run an unlimited session for 30+ items, confirm engine continues. Run a session with a tiny pool (e.g., 1 selected band + 1 domain) and confirm no item repeats verbatim.

### Phase 2 — medium (~2-3 days)

4. **Per-skill mastery tracking** (§3.1). New `state.mapSkillHistory` map; weight modifier in `chooseNextSkill()`; mastery shown on results screen.
5. **Cross-tier opt-in banner** (§3.2). Soft tier expansion based on `currentRit`; toast on first cross; "Stay [tier] only" lock button.
6. **Recovery mode** (§4.3). Streak-triggered easier item with soft banner.
7. **Mastery streak badge** (§4.5g). Tiny addition; reuses existing `gamification.js` patterns.

**Verification:** Run a 25-item session, intentionally get 5/5 on `add_facts` early — confirm it stops appearing. Get 3 wrong in a row on `mult_facts` — confirm next mult/OA item is markedly easier with banner. Set initial RIT artificially high in K-2 mode — confirm 3-5 band items start appearing after threshold cross.

### Phase 3 — larger, research-validation (~3-5 days)

8. **Per-domain RIT with shrinkage** (§3.3). State additions; updateDomainRit() function; chooseNextSkill uses per-domain target.
9. **SE-based termination** (§3.5). New session mode option; hybrid stop rule with N_min and N_max.
10. **Domain heatmap live display** (§4.4). Mini DOM widget in banner; updates on response.
11. **Adaptive hints** (§4.5e). Hook into existing `hints-speech.js`; auto-show if recent mastery on this skill is low.
12. **Challenge round** (§4.5a). Streak-triggered modal; 3 hardened items; opt-in.

**Verification:** Per-domain divergence test: simulate a session where 80% of OA items get correct answers, 20% of G items — confirm per-domain RIT diverges by 20+ RIT points. SE termination test: turn it on, run; confirm session ends earlier than the fixed default when responses are consistent. Heatmap: visual smoke test in dev tools.

### Phase 4 — polish

13. Time-of-day weighting (§4.5d) — half-day work.
14. Configurable target accuracy slider (§4.5i) — tiny.
15. Skill-pair scaffolding with prereq map (§4.5f) — defer; needs a curated `SKILL_PREREQS` lookup.

---

## 6. What's known vs unknown

### Known (from research)

- **Rasch 1PL is the right model** — NWEA uses it, all major K-12 CATs use it, the math is simple.[^assess1pl][^wikiirt]
- **NWEA targets ~50% expected correct for measurement; practice apps should target ~70%.** Empirically, K-5 students disengage at sub-60% success.
- **EISA biases toward grade-level content** (~30-50% reweight) but doesn't block off-grade items.[^nwea_eisa_research]
- **IXL SmartScore is per-skill**, asymptotic, with explicit easier-on-decline behavior; 80=proficient, 100=mastery.[^ixl_smartscore][^ixl_guide]
- **Khan Academy uses 5 mastery levels per skill** (50/80/100 anchors) with periodic mastery challenges (Leitner spaced repetition).[^khan_mastery]
- **Domain correlation in K-5 math is r ≈ 0.55-0.75** — high enough that shrinkage is justified, low enough that per-domain tracking is worthwhile.[^g_math_pmc][^g_math_sciencedirect]
- **Sympson-Hetter is overkill** for a single-session practice app; randomesque + within-session dedup is sufficient.[^sympson_hetter]
- **SE-based stopping is the published best practice**, but only with a N_max safety net to handle thin-pool tails.[^cat_stopping][^cat_stopping_pmc]
- **The hard NWEA crossover thresholds are RIT 200 (K-2 → 3-5) and RIT 170 (3-5 → K-2)** per `MAP_MODE_PLAN.md` §1A.

### Unknown (will need empirical tuning)

- **Optimal step size for per-question RIT update for K-5.** We currently use 3-8 RIT per response (escalating with streak). NWEA uses a Bayesian update with a prior that's not public. Our heuristic is reasonable; only A/B testing with real students would refine it.
- **Whether to show RIT to students.** Engagement (visible progress) vs. anxiety (a falling number is demoralizing). Default proposal: hide from K-2, show subtle progress bar to 3-5, never show raw RIT below the results screen. Toggle in `mapFeatures`.
- **Optimal stopping criterion for free-play (no SE target).** "Until user is bored" is the honest answer; the 10-item gentle break suggestion is a guess.
- **Mastery decay window.** IXL/Khan use weeks-to-months; our session-bound mastery is a reasonable v1 but a "stale skills resurface after 7 days" rule (Leitner-style) would be a future enhancement and could reuse the existing `gamification.js` Leitner box logic.
- **Whether time-of-day biasing helps or annoys.** Probably small effect; cheap to A/B if we ever build telemetry.
- **Cross-tier banner copy & friction.** "Including 3-5 items now" might confuse some kids. Real-user testing needed.
- **Per-skill weight values (0.2, 0.5, 1.0).** First-pass guess; tune from session-replay data.
- **Recovery-mode cooldown.** "Once per 8 items" is a guess; could be too rigid for very-struggling students.

---

## 7. Code-touch summary

| File | Phase | Change |
|---|---|---|
| `js/modules/state.js` | 1 | + `mapShownItemHashes` (Set), `mapSessionEndedEarly` (bool) |
| `js/modules/state.js` | 2 | + `mapSkillHistory` (object), `mapTierDeclared` (string), `mapTierActive` (string), `mapLastRecoveryAt` (int) |
| `js/modules/state.js` | 3 | + `mapDomainRit` (object), `mapDomainCorrect` (object), `mapStopRule` (string), `mapSeThreshold` (number) |
| `js/modules/map-engine.js` | 1-3 | + `endMapSessionEarly()`, hash-dedup in `nextMapItem()`, mastery weights in `chooseNextSkill()`, soft tier expansion, per-domain RIT update, recovery-mode branch, SE termination check |
| `js/modules/map-mode-ui.js` | 1 | + Unlimited mode chip, hide item-count slider when chosen, "End Session" button in session header |
| `js/modules/map-mode-ui.js` | 2 | + Cross-tier toast banner, "Stay K-2 only" lock |
| `js/modules/map-mode-ui.js` | 3 | + Domain heatmap mini-strip in session banner |
| `js/modules/map-results.js` | 1 | + "Ended early" tag + slightly different SE wording |
| `js/modules/map-results.js` | 2 | + Per-skill mastery list (Reinforce/Develop/Introduce categorization) |
| `js/modules/hints-speech.js` | 3 | + Auto-hint trigger when `mapSkillHistory[skill]` shows recent failures |
| `js/modules/globals.js` | 1-3 | + `Object.assign(window, { endMapSessionEarly })` etc. for new functions called from inline handlers |
| `index.html` | 1 | + End Session button in `mapSessionView`, Unlimited chip in selector |
| `css/map-mode.css` | 1-3 | + `.map-end-early-btn`, `.map-unlimited-chip`, `.map-recovery-banner`, `.map-domain-heatmap` |

---

## 8. Acceptance criteria

For Phase 1 to ship:
- [ ] End Session button appears in MAP session view (header, top-right).
- [ ] Clicking End Session prompts confirmation; on confirm, results render with whatever data exists.
- [ ] Unlimited mode chip exists in selector; choosing it hides the item-count slider.
- [ ] In unlimited mode, banner shows "Item N" not "Item N of M" and engine never auto-stops.
- [ ] No item repeats verbatim within a single session (verified with a 30-item session in a single skill).

For Phase 2:
- [ ] After 5/5 correct on a skill, that skill's appearance frequency drops by ≥3× (counted over next 20 items).
- [ ] After 3 wrong in a row, next item is from same domain, RIT 8-12 lower, with "Let's try a quick warm-up" banner.
- [ ] In K-2 mode, when running RIT crosses 200 (3 consecutive items), a one-time toast appears and 3-5 items begin appearing.

For Phase 3:
- [ ] `state.mapDomainRit` diverges by ≥10 RIT between strongest and weakest domain after a 25-item session with skewed accuracy.
- [ ] SE-based stop mode terminates a session at fewer than the fixed default N when responses are consistent.
- [ ] Domain heatmap renders in the session banner and updates after each response.

---

## 9. References

[^assess1pl]: ["The One Parameter Logistic Model" — Assessment Systems](https://assess.com/one-parameter-logistic-model/)
[^wikiirt]: ["Item response theory" — Wikipedia](https://en.wikipedia.org/wiki/Item_response_theory)
[^cogniq]: ["Item Characteristic Curve: IRT & Test Theory Guide" — Cogn-IQ](https://www.cogn-iq.org/learn/theory/item-characteristic-curve/)
[^massur]: ["How to run IRT analyses in R" — Philipp K. Masur](https://philippmasur.de/2022/05/13/how-to-run-irt-analyses-in-r/)
[^rasch_rmt]: ["Computer Adaptive Tests (CAT), Item Selection, Standard Errors and Stopping Rules" — Rasch Measurement Transactions](https://www.rasch.org/rmt/rmt202f.htm)
[^nwea_eisa_overview]: ["NWEA News.MAP Growth EISA overview - 2025"](https://connection.nwea.org/s/nwea-news/map-growth-eisa-overview-MC7KGBNC6FVJG77CKQIPL77YJMWM?language=en_US)
[^nwea_eisa_research]: ["MAP Growth with enhanced item-selection algorithm" (NWEA Research Guide PDF)](https://www.nwea.org/uploads/Research-MAP-Growth-with-enhanced-item-selection-algorithm-updates-on-score-compatibility_NWEA_Research_Guide.pdf)
[^ixl_smartscore]: ["IXL — How does the SmartScore work?"](https://www.ixl.com/help-center/article/1272663/how_does_the_smartscore_work)
[^ixl_guide]: ["IXL SmartScore Guide" (PDF)](https://www.ixl.com/materials/SmartScore_Guide.pdf)
[^khan_mastery]: ["How do Khan Academy's Mastery levels work?" — Khan Academy Help Center](https://support.khanacademy.org/hc/en-us/articles/5548760867853--How-do-Khan-Academy-s-Mastery-levels-work)
[^dreambox]: ["DreamBox Math: Continuous Assessment & Adaptivity" — DreamBox Learning](https://dreamboxlearning.zendesk.com/hc/en-us/articles/27281596241043-DreamBox-Math-Continuous-Assessment-Adaptivity)
[^cat_stopping]: ["Comparing computer adaptive testing stopping rules under the generalized partial-credit model" — Behavior Research Methods, Springer (Choi et al., 2018)](https://link.springer.com/article/10.3758/s13428-018-1068-x)
[^cat_stopping_pmc]: ["Stopping Rules for Computer Adaptive Testing When Item Banks Have Nonuniform Information" — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC7518406/)
[^sympson_hetter]: ["What is the Sympson-Hetter Item Exposure Control?" — Assessment Systems](https://assess.com/sympson-hetter-item-exposure-control/)
[^g_math_pmc]: ["Relative Contributions of g and Basic Domain-Specific Mathematics Skills to Complex Mathematics Competencies" — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10695353/)
[^g_math_sciencedirect]: ["The interplay of g and mathematical abilities in large-scale assessments across grades" — ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0160289616302914)
