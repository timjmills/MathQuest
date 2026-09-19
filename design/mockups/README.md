# Printable mock-up pack

Standalone A4 mock-ups of every MathQuest sheet type, drawn with the values in
`WORKSHEET_DESIGN_STANDARD.md`. **No app code is involved** — this pack exists so the look can be
printed, marked up and approved before anything is built into the app. Once approved,
`kit/sheet-kit.css` becomes `css/sheet-kit.css` and `kit/kit.mjs` becomes the seed of `js/modules/sheet/`.

```
node design/mockups/build.cjs          # build everything -> out/*.html, out/pdf/*.pdf, out/png/*-pN.png
node design/mockups/build.cjs 03       # only pages/03-*.mjs
node design/mockups/build.cjs --no-pdf # faster: HTML + PNG previews only
```

The build fails a file when Andika did not load, when a page overflows its A4 sheet, or when
anything sticks out of its cell.

## Layout

| Path | What |
|---|---|
| `kit/sheet-kit.css` | Tokens (S/M/L, the two looks, line weights, the one grey), page frame, header, bands, cell grid, labels, stacked arithmetic, facts, equations, blanks, strips |
| `kit/kit.mjs` | String-template helpers: `page`, `instruction`, `grid`, `cell`, `label`, `band`, `dayBand`, `stack`, `fact`, `equation`, `line` / `box` / `circle`, `frac`, `sideStrip`, `withStrip`, `steps`, `doc`, `rng` / `int` |
| `pages/NN-name.mjs` | One file per group of sheets; `export default doc(title, [page(...), ...], extraCss)` |
| `out/` | Build output (git-ignored) |
| `_specimen/` | Andika specimen and the digit-variant comparison |

## Rules for a page file

- Import from `../kit/kit.mjs`. Anything the kit lacks goes in the page file: local helper functions,
  and CSS passed as the third argument of `doc()` (class names prefixed with the file number, e.g.
  `.p07-schema`). Do not edit the kit from a page file — propose kit changes in a comment at the top.
- Every page passes a `note` (shown on screen above the sheet, hidden in print) saying what the
  sheet demonstrates and which options are on.
- Ink is `#000`, paper `#fff`, grey `#949494` only. Stroke widths only 0.5 / 0.75 / 1 / 1.5 / 2.25 pt.
  No emoji, no colour, no shadows, no gradients. Pictures are simple in-house inline SVG line art.
- All content is original. Never copy wording, stories, titles or art from the reference workbooks.
- Units are mm and pt. The body is 186 mm wide; with the full header it is 236 mm tall.
