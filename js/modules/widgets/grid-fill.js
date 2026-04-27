// grid-fill widget — generic interactive grid where blank cells become
// per-cell numeric inputs that the student fills in. No global "Type answer"
// box — each cell live-validates green/red via wireBoxValidation, and when
// every blank is correct the question auto-advances after a 400ms debounce.
//
// Question contract:
//   q.answerType = 'grid-fill'
//   q.gridFill = {
//       cells: [{ row, col, value, blank }, ...],
//       rows: <int>,
//       cols: <int>,
//       label?:      string  (header tag, e.g. "x 6 Grid")
//       cellWidth?:  number  (px, default 110)
//       cellHeight?: number  (px, default 110)
//   }
//   q.text = '...'    (rendered above the grid by question-render.js)
//   q.ans  = [<expected blank values>]  (legacy compat)
//
// Pure module — no globals attached, no DOM mutation outside `container`.
// Live coloring + auto-advance are handled by the wireBoxValidation extension
// in question-render.js (which understands the .gf-cell selector).

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function renderGridFill(q, container) {
    if (!container) return;
    container.innerHTML = '';

    const gf = q && q.gridFill;
    if (!gf || !Array.isArray(gf.cells) || !gf.rows || !gf.cols) {
        container.textContent = 'Invalid grid-fill question.';
        return;
    }

    const cellW = Number(gf.cellWidth)  > 0 ? Number(gf.cellWidth)  : 110;
    const cellH = Number(gf.cellHeight) > 0 ? Number(gf.cellHeight) : 110;

    // Index cells by row/col for stable lookup during render.
    const byKey = new Map();
    gf.cells.forEach(c => byKey.set(`${c.row},${c.col}`, c));

    // Host wrapper.
    const host = document.createElement('div');
    host.className = 'gf-host';

    // Optional label header (chunky pill above grid).
    if (gf.label) {
        const lab = document.createElement('div');
        lab.className = 'gf-label';
        lab.textContent = gf.label;
        host.appendChild(lab);
    }

    // Grid. Use minmax(0, ${cellW}px) so columns shrink below cellW when the
    // host card is narrower than `cols * cellW` (otherwise high-column-count
    // grids — counting-by-12, 10x10 hundreds chart — overflow MAP cards).
    // The CSS .gf-tile rule provides clamp(40px, 7vw, 72px) as a min/max,
    // and we no longer hard-set tile.style.width/height so that clamp wins
    // on narrow viewports while still respecting cellW on wider ones.
    const grid = document.createElement('div');
    grid.className = 'gf-grid';
    grid.style.width = '100%';
    grid.style.gridTemplateColumns = `repeat(${gf.cols}, minmax(0, ${cellW}px))`;
    grid.style.gridTemplateRows = `repeat(${gf.rows}, minmax(0, ${cellH}px))`;
    grid.style.justifyContent = 'center';

    for (let r = 0; r < gf.rows; r++) {
        for (let c = 0; c < gf.cols; c++) {
            const cell = byKey.get(`${r},${c}`);
            const tile = document.createElement('div');
            tile.className = 'gf-tile';
            tile.style.maxWidth = cellW + 'px';
            tile.style.maxHeight = cellH + 'px';
            tile.style.aspectRatio = '1 / 1';

            if (!cell) {
                // Empty placeholder cell — keeps layout intact for sparse grids.
                tile.classList.add('gf-tile-empty');
            } else if (cell.blank) {
                tile.classList.add('gf-tile-blank');
                const input = document.createElement('input');
                input.type = 'text';
                input.inputMode = 'numeric';
                input.className = 'gf-cell';
                input.maxLength = 4;
                input.dataset.row = String(r);
                input.dataset.col = String(c);
                input.setAttribute('aria-label',
                    `Row ${r + 1}, Column ${c + 1} blank`);
                input.placeholder = '_';
                tile.appendChild(input);
            } else {
                tile.classList.add('gf-tile-filled');
                tile.textContent = String(cell.value);
            }

            grid.appendChild(tile);
        }
    }
    host.appendChild(grid);
    container.appendChild(host);

    // Collect blank inputs in document order for nav.
    const blanks = Array.from(host.querySelectorAll('input.gf-cell'));

    // Auto-focus first blank.
    if (blanks.length > 0) {
        // Defer focus to next frame so the parent renderer's .display = "block"
        // toggle has settled and the input is visible/focusable.
        setTimeout(() => { try { blanks[0].focus(); } catch (_) {} }, 0);
    }

    // Keyboard navigation: Tab handled natively; Enter delegates to the
    // global submit flow (wireBoxValidation auto-advances anyway, but Enter
    // is still useful for accessibility); arrow keys move between blanks
    // in document order (row-major).
    const focusBlankAt = (idx) => {
        if (idx < 0 || idx >= blanks.length) return;
        try { blanks[idx].focus(); blanks[idx].select?.(); } catch (_) {}
    };

    blanks.forEach((inp, idx) => {
        inp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (typeof window.submitAnswer === 'function') {
                    // Only used if wireBoxValidation hasn't already advanced.
                    window.submitAnswer();
                }
                return;
            }
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                focusBlankAt(idx + 1);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                focusBlankAt(idx - 1);
            }
        });
    });

    return host;
}
