# Graphics Overhaul Plan — IXL Quality Target

> **Goal:** Re-tier MathQuest's on-screen and print SVG graphics so a parent or teacher would believe a problem came off ixl.com. Today the visuals read "homemade math worksheet generator." After this plan they should read "professionally produced K-6 curriculum."

---

## 1. IXL benchmark

IXL's visual identity is exceptionally consistent across every skill and grade. The graphics overhaul targets these benchmarks (synthesised from research + screenshots in `audit-graphics/`):

### 1.1 Color palette (target hex codes)

A small, deliberate, color-blind-safe palette. Categorical charts use **no more than 6 hues**, with a single neutral background. Best-practice references (Carbon, US gov data design standards, Viridis) all converge on this constraint — IXL clearly follows it.

| Token | Hex | Use |
|---|---|---|
| `bg` | `#ffffff` | All chart backgrounds (no card-tinted backgrounds in IXL) |
| `surface` | `#f7f9fc` | Optional alternate row / panel |
| `axis` | `#212121` | Axis lines, tick lines, frame strokes |
| `axisSoft` | `#5a6772` | Tick labels, secondary text |
| `grid` | `#e6e8ec` | Faint inner grid lines |
| `primary` | `#1565c0` | Default series, highlight stroke (already used for boxplot) |
| `accentWarm` | `#ef6c00` | Secondary series / second arc on hop-line |
| `fill[0]` | `#1e88e5` | Categorical 1 — blue |
| `fill[1]` | `#43a047` | Categorical 2 — green |
| `fill[2]` | `#fb8c00` | Categorical 3 — orange |
| `fill[3]` | `#8e24aa` | Categorical 4 — purple |
| `fill[4]` | `#e53935` | Categorical 5 — red |
| `fill[5]` | `#00897b` | Categorical 6 — teal |
| `correct` | `#2e7d32` | Answered correct |
| `incorrect` | `#c62828` | Answered wrong |

All fills are paired with the SAME hex used at full saturation for the stroke (no near-duplicate "2563eb stroke + 60a5fa fill" pairings — that's a current amateur signal). Soft fills, when wanted, are produced via `fill-opacity="0.18"` on the saturated color, NOT a separate pastel hex.

### 1.2 Typography

```
fontStack: '"Open Sans", "Inter", -apple-system, BlinkMacSystemFont,
            "Segoe UI", Roboto, sans-serif'
```

Open Sans is the de-facto educational typeface (Google Fonts, used by IXL, Khan Academy, Pearson). Inter is the fallback for any platform that doesn't have it. **Every `<text>` element MUST declare `font-family`** — the current code emits `<text>` with no `font-family`, which falls back to the user-agent default (often a serif). This single fix produces an immediate quality lift.

Standard sizes (in SVG user units):
- Title: **15** px, weight 700
- Axis label: **13** px, weight 600
- Tick label / data value: **11** px, weight 400
- Annotation: **10** px, weight 500

### 1.3 Stroke conventions

IXL uses essentially **two stroke widths** across all figures:
- `STROKE.normal = 1.5` px — geometry outlines, axis lines, tick marks, grid
- `STROKE.bold = 2.5` px — emphasis: highlighted bar, target shape, answer marker

Plus a hairline for grid: `STROKE.hair = 0.75`. Today MathQuest uses **14 different stroke-width values** (`0.5, 0.6, 0.7, 1, 1.4, 1.5, 1.6, 2, 2.2, 2.5, 3, 4, 5, 6`) — collapsing this to 3 is one of the highest-impact changes.

All strokes use `stroke-linecap="round"` for hand-drawn warmth on free-floating segments (number-line hops, fraction-bar dividers); axis lines stay square. `vector-effect="non-scaling-stroke"` should be set on lines/rects so strokes stay crisp at any zoom.

### 1.4 Layout & viewBox conventions

- **Padding inside viewBox: 12 px minimum** on every side. Current code clips labels (`createAngleSVG` "fits then clamps" instead of expanding the viewBox).
- **Aspect ratio:** keep viewBox proportional to actual content; never force 1:1 on a wide chart.
- **Title/legend live OUTSIDE the SVG** in an HTML wrapper (so the SVG can be reused at different sizes). Today many graphs hard-code titles inside HTML divs with `var(--accent-purple)` — fine, but the divs need consistent typography (currently mixed inline `font-size:1.05rem` / `1.1rem` / `1rem`).
- **Anti-aliased text:** every `<text>` MUST declare `text-anchor` AND `dominant-baseline`. Many existing `<text>` elements omit `dominant-baseline`, so vertical alignment drifts between browsers.

### 1.5 IXL design patterns to emulate

- **Bar charts:** white background, single color per series (no rainbow per bar), thin grey gridlines behind bars, value label INSIDE the top of the bar (white text) when bar is tall enough, otherwise above in dark text.
- **Pie charts:** white slice borders (1.5 px), labels with leader lines for thin slices, NO drop shadow.
- **Number lines:** tick marks ABOVE AND BELOW the line at endpoints, single-color line, simple solid arrowheads, labels centered on tick using `dominant-baseline="hanging"`.
- **Fraction circles & bars:** single saturated fill (say `#1e88e5`) for filled parts, white for empty parts, `1.5px` `#212121` divider lines — no drop shadow, no `filter: drop-shadow()` (currently set inline in `fracCircleSVG`, line 74).
- **Geometry shapes:** outline-only or 18%-opacity fill with matching saturated stroke. Right-angle marker is a 10×10 square in the corner. Dimension labels OUTSIDE the figure with explicit `text-anchor` and 6-8 px offset.
- **Coordinate planes:** white background, hairline grid (`#e6e8ec`), bold axes (`#212121`), labelled tick marks every unit, plotted points are 4 px filled circles in `#c62828` with optional `(x,y)` label at offset (8,-8).

---

## 2. Current-state amateur signals (from source code review)

### `js/modules/svg-base10.js`

- **`createDotArray` (lines 3-13)** — Uses `var(--accent-cyan)` for fill, no border on dots. IXL uses dots with a 1px border in a contrasting color so they read as discrete circles even when overlapping. No `font-family` on the label text. **Severity:** medium.
- **`createNumberLine` (lines 15-49)** — Uses a `linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))` for the number line itself (line 25). **Real number lines are single-color with discrete tick marks**, not a gradient bar. The orange highlight bubble (line 29) plus green answer bubble (line 36) plus purple gradient = 4 hues for one chart. **Severity:** HIGH.
- **`createHopNumberLine` (lines 53-137)** — Best-quality SVG in the codebase (it has `font-family="sans-serif"` at lines 95, 117, 131). But "sans-serif" is the generic fallback, not Open Sans. Hardcoded `#7c3aed`, `#22c55e`, `#f97316`, `#999`, `#333` — five hardcoded hex values not in any palette. **Severity:** medium.
- **`createBase10Blocks` (lines 183-245)** — All blocks are styled with `var(--accent-purple)`, `var(--accent-cyan)`, `var(--accent-green)`, `var(--accent-orange)` — but real Dienes blocks are conventionally **all the same color** (typically wood-tone or all blue). Mixing 4 colors on the same number is non-standard and confuses the place-value hierarchy. **Severity:** medium.
- **`createCountingDots` (lines 247-260)** — Dot size 12 px is fine but no border, no font-family on any future captions. **Severity:** low.

### `js/modules/svg-fractions.js`

- **`fracCircleSVG` (lines 20-79)** — Inline `filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1))` at line 74. **IXL uses NO drop shadows.** Drop shadows on flat educational vector art is a tell-tale homemade signal. Default `fillColor='#d4e5f7'` is a pastel that doesn't appear in any defined palette object. The text "${num}/${den}" at line 33 has no `font-family`. **Severity:** HIGH.
- **`fracBarHTML` (lines 82-91)** — Uses HTML `<div>` segments (not SVG), so it cannot be exported, scaled crisply, or kept consistent with the SVG circle visuals. Should be re-implemented as SVG. **Severity:** medium.
- **`fracEquationHTML` (lines 111-144)** — Mixes `var(--accent-cyan)` blue and `var(--accent-purple)` for the two operands. IXL uses the same color for both operands of a binary fraction operation; the operator differentiates them, not the color. **Severity:** medium.
- **Two parallel color systems** — `IXL_COLORS` object (lines 11-17) is defined but most functions take `fillColor` as a string parameter and never reference the object. Dead-code palette. **Severity:** low.

### `js/modules/svg-geometry.js`

- **No `font-family` declarations anywhere in the file (0 matches).** Every dimension label, every "${degrees}°", every "l=", "h=", "w=" label inherits the default browser font, which is serif on Windows and Linux. **Severity:** CRITICAL — single highest-impact fix.
- **`createAngleSVG` (lines 3-127)** — Uses `var(--accent-cyan)` for rays, `var(--accent-green)` for the arc indicator, `var(--accent-orange)` for nothing in this function but elsewhere. Three colors for a one-angle figure. IXL uses ONE color (typically the chart accent) for both rays and arc, and a single contrasting color (red) only for the right-angle marker. The clamp logic (lines 47-71) "fits the ray to the bounding box," squashing the angle visually instead of expanding the viewBox to make room — this means a 175° angle and a 30° angle render at different effective scales. **Severity:** HIGH.
- **`createTriangleSVG` (lines 195-245)** — Hard-coded font sizes 12-14 with no `font-family`, no `dominant-baseline`. Dimension labels positioned with magic offsets (`+18`, `+8`). **Severity:** medium.
- **Right-angle markers** are sometimes `<rect>` (line 148, 184), sometimes `<path>` (line 105). Inconsistent. **Severity:** low.
- **Fill colors mix `'none'`, `var(--accent-green)33` (a CSS hack appending `33` for alpha), and `rgba(255, 200, 100, 0.15)`** — three different opacity techniques in the same module. **Severity:** medium.

### `js/modules/svg-clock.js`

- This is one of the **better** files — uses `font-family="Nunito, Arial, sans-serif"` (line 92), has a defined `CLOCK_COLORS` palette (`svg-base10.js` lines 142-151). But:
- Stroke widths jump 1 → 2 → 4 → 6 within the same clock face (lines 66, 79, 96, 101). **Severity:** low.
- The "highlight ring" `stroke-dasharray="5,3"` (line 54) is fine but not standard — IXL uses solid colored borders for selection, not dashed.
- Digital clock uses `font-family:'JetBrains Mono'` (line 140) which is a developer font, not an educational digital-clock LED font. **Severity:** low.

### `js/modules/svg-factors.js`

- Already pretty good (this is the rainbow-arc factor diagram modeled after Math Monks). Uses `LINK_COLORS.pastel` for screen and `LINK_COLORS.print` for print — excellent dual-mode pattern, should be replicated elsewhere.
- But `LINK_COLORS.pastel` includes `#fdd835` (yellow) which fails 4.5:1 contrast against white. **Severity:** medium for accessibility.
- `font-size` on the digit labels uses a complex `Math.max/Math.min` formula (lines 84, 92) but no `font-family`. **Severity:** medium.

### `js/modules/gen-data-stats.js`

- **Two completely different chart-color palettes used in the same file:**
  - Lines 73-76, 185-186 (boxplot + histogram): Material Blue palette `#1565c0` / `#e3f2fd` (good — IXL-style).
  - Line 231: `chartColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']` — a Flat-UI-2014-style palette of 8 colors that breaks both the "max 6" rule and the IXL house style (uses muted pastels we don't otherwise have). **Severity:** HIGH. This palette drives bar_graph, pictograph, line_plot_fractions, tally_chart, pie_chart — i.e. **most MAP-test graphic skills**.
- **No `font-family` on a single SVG `<text>` element in the file.** **Severity:** CRITICAL.
- **Mean/median/mode/range cards** (lines 459-562) wrap the data in `linear-gradient(135deg, #4ECDC4, #45B7D1)`, `#FF6B6B → #ee5a24`, `#96CEB4 → #45B7D1` — gradient pills are a 2015 mobile-app aesthetic, not IXL-clean. **Severity:** medium.
- **Bar graph** (lines 600-625, 691-710) uses `rx="4"` rounded corners on bars. IXL uses square-cornered bars. Rounded bars are a "decorative dashboard" tell. **Severity:** low.
- **Pie chart** (line 1075) uses `stroke="white" stroke-width="2"` for slice borders — good. But labels are placed at fixed `(labelX, labelY)` with no leader-line for thin slices, so a 5% slice has its label overlap the next slice. **Severity:** medium.
- **Line plot** (lines 870-930) uses `chartColors[i % chartColors.length]` for the X marks — this means each X position gets a different color. IXL uses ONE color for all data points in a single series; color only varies between series. **Severity:** medium.
- **Tally chart** uses an emoji-style icon `${icon.repeat(numIcons)}` with `font-size:1.5rem` (line 756). Real tally charts use vertical strokes (||||) with a diagonal cross for the 5th, drawn as actual SVG strokes for crispness at any size. **Severity:** medium.

### `js/modules/gen-geometry.js`

- **213 `stroke-width` declarations and 0 `font-family` declarations.** This is the worst single file by amateur-signal density.
- **Hardcoded hex colors** for shape variants: `#e879f9`/`#c026d3` (pink), `#60a5fa`/`#2563eb` (blue), `#fbbf24`/`#d97706` (yellow), `#34d399`/`#059669` (green), `#fde68a`/`#f59e0b`, `#fecaca`/`#ef4444`, `#bfdbfe`/`#1e88e5`, `#dcfce7`/`#22c55e`, `#fef3c7`/`#f59e0b`, `#fbcfe8`/`#ec4899`, `#e9d5ff`/`#a855f7`, `#cffafe`/`#06b6d4` — **at least 12 different fill+stroke pairs across this one file**, all scattered. (Lines 64, 72, 74, 75, 437-447, 558-572, 620-657, etc.) **Severity:** CRITICAL.
- **Composite shape SVGs (lines 326-391)** use string variables `FILL`, `STROKE`, `DASH` that are defined per-shape and shadowed differently in each `if` branch — every shape's color logic lives separately. Should be a single render function with a config object.
- **Right-angle markers, height markers, dashed-edge markers** all defined inline as ad-hoc paths/rects. Should be reusable SVG `<symbol>` defs.
- Composite-shape work uses inline `style="font-weight:700; color:var(--accent-purple); font-size:1.05rem"` for titles — same pattern repeated 30+ times in this file alone.

---

## 3. Design tokens (new module to add)

Spec for `js/modules/design-tokens.js` (new file, dependency Layer 0):

```js
// js/modules/design-tokens.js — single source of truth for all SVG visuals.
// Imported by every svg-*.js and gen-*.js file that emits SVG/HTML graphics.

export const COLORS = {
    // Surfaces
    bg:        '#ffffff',
    surface:   '#f7f9fc',

    // Axes & grid
    axis:      '#212121',
    axisSoft:  '#5a6772',
    grid:      '#e6e8ec',
    gridStrong:'#cfd4db',

    // Primary chart palette (max 6 categorical hues, color-blind safe)
    primary:   '#1565c0',
    fill: [
        '#1e88e5', // 1 blue
        '#43a047', // 2 green
        '#fb8c00', // 3 orange
        '#8e24aa', // 4 purple
        '#e53935', // 5 red
        '#00897b'  // 6 teal
    ],

    // Semantic
    correct:   '#2e7d32',
    incorrect: '#c62828',
    highlight: '#fb8c00',  // for "the answer" markers / current item
    muted:     '#9aa3ad',

    // Print-mode equivalents (high contrast, B/W-safe)
    print: {
        axis: '#000', grid: '#bbb',
        fill: ['#1565c0','#2e7d32','#e65100','#6a1b9a','#b71c1c','#00695c']
    }
};

// Convert a saturated COLOR.fill[i] to its 18%-opacity wash.
export function softFill(hex) { return hex + '2E'; } // 0x2E ~= 18%

export const STROKE = {
    hair:   0.75,   // grid only
    thin:   1,      // currently never used cleanly — reserved for inner ticks
    normal: 1.5,    // outline default
    bold:   2.5,    // emphasis / answer-shape outline
    arrow:  2       // arrowhead heads on number lines
};

export const FONTS = {
    sans: '"Open Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Roboto Mono", Consolas, monospace',
    digit: '"DSEG7-Classic", "JetBrains Mono", Consolas, monospace'  // for digital clock
};

export const SIZES = {
    title:      15,
    axisLabel:  13,
    tickLabel:  11,
    annotation: 10,
    titleWeight:      700,
    axisLabelWeight:  600,
    tickLabelWeight:  400,
    annotationWeight: 500
};

export const VIEW = {
    pad: 12,        // viewBox inner padding minimum
    chartPad: 16,   // padding around plot area inside chart viewBox
    cornerRadius: 0 // bars / cards in charts: square (IXL convention)
};

// Convenience: build a <text> open tag that follows the design system.
export function svgText(x, y, content, opts = {}) {
    const {
        size = SIZES.tickLabel,
        weight = SIZES.tickLabelWeight,
        anchor = 'middle',
        baseline = 'middle',
        fill = COLORS.axis,
        rotate = null
    } = opts;
    const transform = rotate != null ? ` transform="rotate(${rotate}, ${x}, ${y})"` : '';
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="${baseline}"`
         + ` font-family='${FONTS.sans}' font-size="${size}" font-weight="${weight}"`
         + ` fill="${fill}"${transform}>${content}</text>`;
}

// Convenience: build a <line> that uses the system's stroke widths.
export function svgLine(x1, y1, x2, y2, opts = {}) {
    const { stroke = COLORS.axis, width = STROKE.normal, cap = 'butt', dash = null } = opts;
    const dashAttr = dash ? ` stroke-dasharray="${dash}"` : '';
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"`
         + ` stroke="${stroke}" stroke-width="${width}" stroke-linecap="${cap}"${dashAttr}`
         + ` vector-effect="non-scaling-stroke"/>`;
}
```

**Why a module not CSS variables?** Most SVG attribute values (stroke-width as a number, font-size in user units) cannot be set from CSS custom properties in inline SVG attributes — they must be string-interpolated at build time. So a JS module is the only place this can live.

---

## 4. Implementation roadmap (priority order)

### P1 — MAP-graphic skills (highest priority)

These are the graphics most likely to appear on a MAP test screenshot a parent shows. They are the FIRST round of refactor. Each skill below maps to existing screenshot in `audit-graphics/`. Effort estimate: S < 30 min, M ~1 hr, L ~2-3 hr.

| Skill | File / Function | Tokens to apply | Specific code changes | Effort | Acceptance |
|---|---|---|---|---|---|
| **bar_graph** | `gen-data-stats.js` lines ~600-625, 691-710 | `COLORS.fill[0]` for all bars (single color), `COLORS.grid` for gridlines, `FONTS.sans` on every `<text>`, `STROKE.normal` for axis | Delete `chartColors` rainbow array (line 231). Remove `rx="4"` from bar `<rect>`. Move value label inside top of bar when bar height > label height + 8 px. | M | Looks like an IXL "Read a bar graph" problem at 1280×600. |
| **pictograph** | `gen-data-stats.js` lines ~750-810 | `FONTS.sans`, `COLORS.axis` for category labels | Standardize key/icon row typography (currently 0.95rem inline). Use a single icon color per chart (already mostly OK). | S | Crisp Open Sans labels, no font fallback. |
| **line_plot / line_plot_fractions** | `gen-data-stats.js` lines ~870-930, 1180-1210 | `COLORS.axis` for line, `COLORS.fill[0]` for ALL X marks (not rainbow), `FONTS.sans`, `STROKE.normal` | Replace `chartColors[i % chartColors.length]` with single `COLORS.fill[0]`. Add `dominant-baseline="hanging"` to fraction labels under tick marks. | M | Single-color X stack, crisp denomination labels. |
| **tally_chart** | `gen-data-stats.js` lines ~930-1005 | `FONTS.sans`, `COLORS.axis` | Replace text-character tally with SVG strokes for each tally (4 vertical, 1 diagonal across 5). Single color from `COLORS.primary`. | M | Tallies render crisply at print and screen. |
| **pie_chart** | `gen-data-stats.js` lines ~1060-1095 | `COLORS.fill[]` array (1 per slice up to 6), white slice borders 1.5 px | Add leader-line logic for slices < 8%. Drop the gradient pill in legend. | L | IXL "Read a circle graph" parity. |
| **coordinate_q1 / coordinate_all / coordinate_graph** | `gen-geometry.js` (search "coordinate") | `COLORS.grid` hairline grid, `COLORS.axis` for axes, `COLORS.fill[4]` for plotted points, `FONTS.sans` | Currently uses `var(--bg-card)` for grid background — switch to white. Plotted-point dot diameter 8 px, with optional `(x,y)` label at +8,-8 offset using `svgText()`. | L | Indistinguishable from IXL coordinate-plane problems. |
| **area_unit_squares / perimeter_grid** | `gen-geometry.js` (search "area_unit_squares", "perimeter_grid") | `COLORS.grid` for unit squares, `softFill(COLORS.fill[1])` for shaded region, `STROKE.bold` `COLORS.fill[1]` for region outline | Strip the `var(--accent-cyan)` mixed palette. Single-color shaded region with one bold outline. | M | Area visible as a single tinted shape, not a rainbow. |
| **area / perimeter / area_perimeter** | `gen-geometry.js` (search "area_perimeter") + `svg-geometry.js` `createLabeledRectSVG` | `COLORS.fill[1]` softFill, `STROKE.normal` outline, dimension labels use `svgText()` with explicit anchors | `createLabeledRectSVG` (lines 455-482): replace the `'rgba(255, 200, 100, 0.15)'` magic fill with `softFill(COLORS.fill[2])`. | S | Clean rectangle, dimensions in Open Sans. |
| **area_triangle** | `svg-geometry.js` `createTriangleSVG` lines 195-245 | `COLORS.fill[2]`, `STROKE.normal`, `FONTS.sans` on all labels | Add `font-family='${FONTS.sans}'` to lines 239, 240. Use `svgText()` helper. Right-angle indicator uses `COLORS.incorrect` only (matches IXL). | S | "base = N" / "h = N" labels in proper sans font. |
| **composite_shapes / area_distributive_visual** | `gen-geometry.js` lines ~430-470, 555-575 | `COLORS.fill[]` indexed by shape index (consistent), `STROKE.bold`, single shared `FILL_OPACITY = 0.18` | Refactor inline `fill="#bfdbfe"` etc. into `COLORS.fill[shapeIdx]` + `softFill()`. Stroke width unified to `STROKE.bold`. | L | Composing-shapes problems read as professional, not Skittles. |
| **fraction_number_line** | wherever `fraction_number_line` is generated | `COLORS.axis`, `FONTS.sans` | Strip the gradient bar (see `createNumberLine` line 25). Single-color line, single highlight color. | M | One-color number line with sharp tick labels. |
| **identify (fractions)** | `svg-fractions.js` `fracCircleSVG` | `COLORS.fill[0]` filled, white empty, `COLORS.axis` borders, NO drop shadow | Remove `filter: drop-shadow(...)` at line 74. Add `font-family='${FONTS.sans}'` to text at line 33. | S | Flat fraction circles with crisp dividers. |
| **equiv_frac_visual** | `svg-fractions.js` (whichever combination function) | Same color for both fractions (compare via SIZE not COLOR per IXL convention) | Replace dual-color (`var(--accent-cyan)` + `var(--accent-purple)`) with single color. | M | Like IXL's equivalent-fractions visual. |
| **fraction_of_set** | wherever this generator lives + `createDotArray` | `COLORS.fill[0]` for "shaded" set members, white with `COLORS.axis` border for unshaded | Replace `var(--accent-cyan)` solid dots with bordered dots, half filled half empty as needed. | M | Set-of-dots visual that maps clearly to fraction. |
| **mixed_improper_visual** | `svg-fractions.js` `fracCircleSVG` rendered in groups | Same fixes as `identify` | Multi-circle layout uses consistent gap (`gap: 8px`). | S | Reads as ixl mixed-number visual. |
| **name_2d_shapes / name_3d_shapes** | `gen-geometry.js` lines ~50-180 | All shapes use `COLORS.fill[i]` + `softFill` + `STROKE.bold`. 3D shapes use one solid `<linearGradient>` not the ad-hoc inline gradients. | Consolidate the 8 hardcoded shape colors into `COLORS.fill[i % 6]`. | L | Shape gallery looks like a curriculum poster. |
| **classify_triangles / classify_quads** | `gen-geometry.js` (search functions) | `COLORS.fill[i]` + `STROKE.bold` outline, right-angle markers use `COLORS.incorrect` | Same color treatment as name_2d_shapes; remove parallel hardcoded palettes. | M | Polished classification figures. |
| **partition_shapes** | `gen-geometry.js` lines ~495-545 | `COLORS.fill[3]` for filled partitions, `COLORS.axis` for partition lines | Currently uses `var(--accent-cyan)` and `var(--accent-purple)`. Pick one. | S | Crisp partitioned shapes. |
| **place_value_disks** | wherever generator lives + `createBase10Blocks` | All disks SAME color but different SIZE per place value (IXL convention); `COLORS.fill[0]` for hundreds, `COLORS.fill[2]` for tens, `COLORS.fill[3]` for ones (single mapping, never varies) | Reduce 4-color rainbow to consistent 3-color place-value mapping. | M | Place-value disks read as standard Singapore-style. |
| **hundreds_chart_fill** | search the gen-counting / gen-algebraic file | `COLORS.grid` borders, `softFill(COLORS.fill[0])` for highlighted cells, `FONTS.sans` for cell numbers | Hundreds chart should look like graph paper with a few cells highlighted. | M | Indistinguishable from IXL hundreds-chart. |
| **skip_count_grid / skip_count_line** | gen-counting / gen-algebraic | Same hundreds-chart treatment; line uses `createHopNumberLine` after refactor | Make the hops use `COLORS.fill[0]` instead of `#7c3aed`. | S | Grid + number-line skip counts both polished. |
| **nl_add / nl_sub / number_line_add / number_line_sub** | `svg-base10.js` `createHopNumberLine` lines 53-137 | `COLORS.axis`, `COLORS.fill[0]` for hops, `FONTS.sans` (not "sans-serif"), `STROKE.normal` | Replace literal `"sans-serif"` strings with `FONTS.sans`. Replace `#7c3aed`, `#22c55e`, `#f97316`, `#999`, `#333` with token equivalents. | S | Best-already-decent module gets fully token-clean. |
| **identify_angles** | `svg-geometry.js` `createAngleSVG` lines 3-127 | One color for both rays + arc; `COLORS.incorrect` (red) only for the right-angle square; `FONTS.sans` for "${degrees}°" | Drop the 3-color (rays cyan / arc green / something orange) split. Expand viewBox instead of clamping rays at the boundary (rewrite lines 47-71). | L | Acute/right/obtuse angles all render at consistent ray length. |
| **symmetry** | `gen-geometry.js` (search "symmetry") | `COLORS.fill[0]` shape, `COLORS.fill[4]` (red) dashed line of symmetry, `STROKE.bold` line | Standardize colors. | M | Symmetry line is unmistakable red dashed. |
| **tape_diagram** | wherever generator lives | `softFill(COLORS.fill[0])` for tape segments, `COLORS.axis` outline, `FONTS.sans` for labels | Single-color tape, no rainbow. | M | Looks like a Singapore-math tape diagram. |
| **reading_ruler** | wherever generator lives | `COLORS.axis` for ruler body, `COLORS.fill[2]` (orange) for the measurement indicator | Crisp tick marks at 1/16" intervals using `STROKE.hair`/`STROKE.normal` per tick weight. | M | IXL "Read a ruler" parity. |
| **elapsed_visual_easy / medium** | `svg-clock.js` `createAnalogClockSVG` x 2 | Already mostly OK. Replace `Nunito, Arial` with `FONTS.sans`. | Minor token swap. | S | Two clocks side-by-side in consistent palette. |
| **arrays_groups** | wherever generator lives + `createDotArray` | `COLORS.fill[0]` dots, `COLORS.grid` group borders, `FONTS.sans` | Make groups visually distinct via spacing not color. | S | Array of dots, NOT a mosaic of colors. |

### P2 — Remaining skills

Lower-priority because they appear less often or are text-dominant. Apply tokens in passing during the relevant round below:
- All `svg-clock.js` clocks (already pretty good — just font swap).
- All `svg-factors.js` factor diagrams (replace `#fdd835` yellow with `COLORS.fill[2]` orange for accessibility).
- Box plot, histogram (already use Material palette — just need `FONTS.sans` and `svgText()`).
- Mean / median / mode / range cards (drop the gradient pills, use flat `COLORS.fill[i]`).
- L-shape / T-shape composite figures (`svg-geometry.js` `createLShapeSVG`, `createTShapeSVG`).
- Word-problem dashed shape (`svg-geometry.js` `createWordProblemShapeSVG`).
- 3D box (`svg-geometry.js` `create3DBoxSVG`).
- Counting dots (`svg-base10.js` `createCountingDots`).

---

## 5. Suggested execution order

Each round is internally **parallel-safe** (no two changes touch the same function). Each round ends with a syntax check + visual regression.

### Round 1 — Foundations (no visual change yet)
1. Create `js/modules/design-tokens.js` per spec in section 3.
2. Add `import { COLORS, STROKE, FONTS, SIZES, svgText, svgLine, softFill } from './design-tokens.js';` to every `svg-*.js` and `gen-*.js` file that emits SVG.
3. Run `node --input-type=module --check < js/modules/design-tokens.js` and one consumer.

**Expected diff:** new file + import lines only. Visual output unchanged.

### Round 2 — High-impact MAP graphics: `gen-data-stats.js` (largest single visual win)
1. Delete the rainbow `chartColors` array (line 231).
2. Refactor bar_graph (~lines 600-625, 691-710) to use `COLORS.fill[0]` and `svgText()`.
3. Refactor line_plot (~lines 870-930) — single color X marks.
4. Refactor tally chart to SVG strokes.
5. Refactor pie chart slices to use `COLORS.fill[]` cycle, add leader-line for thin slices.
6. Replace gradient pills in mean/median/mode/range (lines 459-562) with flat `COLORS.fill[i]` pills.

**Test:** open homeView in dev server, generate one of each MAP graph skill, eyeball against `audit-graphics/` screenshots.

### Round 3 — `svg-fractions.js` and `svg-base10.js`
1. `fracCircleSVG` — drop shadow removal, `svgText()` for fraction text, accept `colorIdx` parameter that picks `COLORS.fill[colorIdx]`.
2. `fracBarHTML` — re-implement as SVG using same `colorIdx` API.
3. `createNumberLine` — replace gradient with single `COLORS.primary` line, use `svgText()` for labels, `svgLine()` for tick marks.
4. `createHopNumberLine` — swap literal hex codes for tokens (lowest churn — already uses `font-family`).
5. `createBase10Blocks` — adopt single-color-per-place convention (e.g. all hundreds = `COLORS.fill[0]`, all tens = `COLORS.fill[0]` darker, all ones = `COLORS.fill[0]` darkest, OR all blocks = same wood-tone).
6. `createDotArray` / `createCountingDots` — bordered dots with `COLORS.axis` border, `softFill(COLORS.fill[0])` interior.

### Round 4 — `svg-geometry.js`
1. Add `font-family` via `svgText()` to every label in every function (createAngleSVG, createRectangleSVG, createTriangleSVG, createSquareSVG, createShapeSVG, create3DBoxSVG, createLShapeSVG, createTShapeSVG, createWordProblemShapeSVG, createLabeledRectSVG).
2. Collapse stroke widths to `STROKE.normal` (default outlines) and `STROKE.bold` (emphasis). Delete every `stroke-width="2.2"` and `"2.5"` etc.
3. Unify all opacity techniques: replace `'rgba(...)'` and `'colorXXX33'` hacks with `softFill(COLORS.fill[i])`.
4. Rewrite `createAngleSVG`'s clamp logic (lines 47-71) to expand viewBox instead of squashing rays.

### Round 5 — `gen-geometry.js` inline SVG cleanup (heaviest, do last)
1. Build a small helper inside the file: `shapeStyle(idx)` → returns `{ fill: softFill(COLORS.fill[idx % 6]), stroke: COLORS.fill[idx % 6], strokeWidth: STROKE.bold }`.
2. Convert the ~12 hardcoded shape variants (lines 64-75, 437-447, 558-572, 620-657) to use `shapeStyle()`.
3. Convert composite-shape blocks (lines 326-391) to a single render function with a config object.
4. Wrap right-angle / dashed-edge / corner-dot markers as inline `<symbol>` defs at the top of each SVG.

### Round 6 — Validation
1. Re-run audit screenshot capture (the existing capture script that generated `audit-graphics/`).
2. Save under `audit-graphics-after/` for side-by-side diff.
3. Manual eyeball comparison vs IXL screenshots in `audit-graphics/` and against IXL.com directly.
4. Run `node --input-type=module --check < js/modules/<file>.js` on every modified file.

---

## 6. How to validate

### Automated checks
- **Syntax:** `node --input-type=module --check < js/modules/<file>.js` after every modified file.
- **Token usage:** `grep -nE 'stroke-width="[0-9.]+"' js/modules/*.js` should return ONLY hits inside `design-tokens.js` after Rounds 4-5.
- **Font coverage:** `grep -c 'font-family' js/modules/svg-*.js js/modules/gen-*.js` should equal the count of `<text` open tags (every text element gets a font).
- **Hex coverage:** `grep -ohE 'fill="#[a-fA-F0-9]{3,6}"' js/modules/gen-geometry.js | sort -u | wc -l` should be ≤ 8 (allowing a couple "pure white" / "pure black" cases) after Round 5. Today it is 30+.

### Visual checks
- Re-capture all 41 `audit-graphics/` screenshots under `audit-graphics-after/`.
- Place side-by-side: `audit-graphics/<skill>.png` vs `audit-graphics-after/<skill>.png` vs an IXL screenshot for the same concept.
- Acceptance: a parent or teacher cannot tell which is the IXL screenshot at 1:1 zoom.

### Print mode
- Generate a worksheet via the print dialog after each round.
- Confirm `print-generate.js` still rendered correctly — `forPrint` branches in svg-* functions must continue to use `COLORS.print.*` palette and ink-friendly strokes.
- No drop shadows in print (already true after `fracCircleSVG` fix).

### Accessibility
- Drop final palette into Viz Palette (https://projects.susielu.com/viz-palette) and confirm color-blind safety for the 6 categorical fills.
- Confirm all text/background pairs meet 4.5:1 (sub-100% should never appear on text).

---

## Appendix A — Files this plan touches

Read-only inventory (file count × kind of change):

| File | Type of change |
|---|---|
| `js/modules/design-tokens.js` | NEW |
| `js/modules/svg-base10.js` | Refactor (createNumberLine, createHopNumberLine, createBase10Blocks, createDotArray, createCountingDots) |
| `js/modules/svg-fractions.js` | Refactor (fracCircleSVG, fracBarHTML, fracEquationHTML, fracCompareHTML; reimplement as SVG) |
| `js/modules/svg-geometry.js` | Refactor (every function — add `font-family` everywhere) |
| `js/modules/svg-clock.js` | Light touch (font swap only) |
| `js/modules/svg-factors.js` | Light touch (palette swap only) |
| `js/modules/gen-data-stats.js` | Heavy refactor (drop chartColors rainbow, fix bar/pie/line-plot/tally) |
| `js/modules/gen-geometry.js` | Heaviest refactor (213 stroke-widths, 0 fonts; dozens of inline hex pairs) |
| `js/modules/print-generate.js` | Verify forPrint paths still receive `COLORS.print.*` |

Total lines of net change estimated: ~1500-2500. No new dependencies. No build step. No HTML/CSS files modified except possibly importing Open Sans via Google Fonts in `index.html` `<head>` (single `<link>` line — not in scope of this plan, but a prerequisite if the font isn't already loaded).

---

## Appendix B — Sources consulted

- IXL — Learn graphs (https://www.ixl.com/math/graphs)
- IXL — Printable resources (https://www.ixl.com/resources/printable-resources)
- Carbon Design — Color palettes & accessibility for data viz (Medium)
- US Government Data Design Standards — Colors (xdgov.github.io)
- Accessible Color Sequences for Data Visualization (arxiv.org/pdf/2107.02270)
- MDN — SVG stroke-width
- Truman ChemLab — Preparing Graphs (axis label conventions, font sizes)
- Practical Typography (Butterick) — Grids of numbers
- Google Fonts — Open Sans
- Typewolf 2026 — Best Google Fonts
- UX Collective — Hyperlegible Sans for accessibility
- Local source review: `js/modules/svg-base10.js`, `svg-clock.js`, `svg-fractions.js`, `svg-geometry.js`, `svg-factors.js`, `gen-data-stats.js`, `gen-geometry.js`
- 41 reference screenshots in `audit-graphics/`
