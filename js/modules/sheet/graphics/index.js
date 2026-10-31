// js/modules/sheet/graphics/index.js
// THE GRAPHIC LIBRARY (design/GRAPHIC_LIBRARY.md; design/audit/VISUAL_QUALITY.md 4.3, VQ-4).
//
// One drawing per representation, written once for paper (mm / pt) and its screen twin
// (--mq-k2 px): token-driven sizes S / M / L, ink and the single grey from tokens.js, strokes from
// the closed ladder, Andika with proportional digits. A cell template DRAWS FROM HERE; it does not
// redraw a representation the library has. New entries are added here and catalogued in
// GRAPHIC_LIBRARY.md (id, what it shows, vocabulary, function, sizes approved, where used, critic
// evidence).
//
// Pure modules (SCC-01). Import through sheet/index.js (`graphics`) or a cell imports the entry file.

// ---- entries built for the library (visual-quality lane, 2026-10-31)
export { numberBond, BOND_SIDE } from './number-bond.js';
export { factTriangle, factTriangleSize, TRIANGLE_SIDE } from './fact-triangle.js';
export { answerArea, boxW, BOX_H } from './answer-area.js';
export { sentenceFrame, sentenceFrameWidthMm, CIRCLE_D } from './sentence-frame.js';
export { partWholeBar, BAR_SEG_H } from './part-whole-bar.js';
export { INK, GREY, PAPER, stroke, NUM_FEATURES } from './units.js';

// ---- approved drawings that already exist in their templates: RE-EXPORTED, never redrawn
export { frameHTML as tenFrame } from '../cells/tenframe.js';
export { barMini } from '../cells/word-work.js';
export { faceSVG as clockFace, coinSVG as coin, coinRow, noteSVG as note } from '../cells/tmkit.js';
export { fracModelSVG as fractionModel } from '../cells/frac-model.js';
export { valueLineSVG as numberLine } from '../cells/value-line.js';
export { rulerSVG as ruler, thermometerSVG as thermometer } from '../cells/figures.js';
