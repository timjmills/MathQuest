// INK measurement for the sheet tests: what a critic measures on the PNG, measured on the page.
//
// inkScan(page, docHtml) renders a printable sheet document (print-sheet.js `sheetDocument`) in a
// fresh tab at 96 dpi with print media, hides the cell labels (a. / 1 / Model: they sit in the
// cell's corner and are not the problem's ink), screenshots it and, for every grid cell, finds the
// bounding box of the dark pixels inside its borders. It returns per cell the empty BANDS - top,
// bottom, left, right - as fractions of the cell's height / width (RUBRIC H13: a band of 30 % or
// more is wasted space), the cell's size, and per page the STRIP under the last grid as a fraction
// of the body (the space between the instruction line and the footer).
//
//   const { inkScan } = require('../lib/ws-ink.cjs');
//   const r = await inkScan(page, window.sheetDocument(res.pupilHtml, 'x'));
//   r.pages[0].cells -> [{x, y, w, h, top, bottom, left, right, empty}], r.pages[0].strip
'use strict';

async function inkScan(page, docHtml, { dark = 140 } = {}) {
    const tab = await page.browser().newPage();
    try {
        await tab.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
        await tab.goto(page.url(), { waitUntil: 'domcontentloaded' });
        await tab.emulateMediaType('print');
        await tab.setContent(docHtml, { waitUntil: 'networkidle0', timeout: 60000 });
        await tab.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
        await tab.evaluate(() => document.fonts && document.fonts.ready);
        await tab.addStyleTag({ content: '.ws-letter,.ws-tab,.ws-modeltab,[data-ws-label]{visibility:hidden!important}' });
        await new Promise((r) => setTimeout(r, 150));
        const geo = await tab.evaluate(() => {
            const R = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; };
            return Array.from(document.querySelectorAll('.ws-page')).map((pg) => {
                const grids = Array.from(pg.querySelectorAll('.ws-grid'));
                const cells = grids.flatMap((g) => Array.from(g.children).filter((c) => c.classList.contains('ws-cell') && !c.classList.contains('blankrun')).map(R));
                const foot = pg.querySelector('.ws-foot');
                const instr = pg.querySelector('.ws-instr, .ws-instruction, [data-ws-instr]');
                const gr = grids.map(R);
                return {
                    page: R(pg), cells,
                    gridTop: gr.length ? Math.min(...gr.map((g) => g.y)) : null,
                    gridBottom: gr.length ? Math.max(...gr.map((g) => g.y + g.h)) : null,
                    footTop: foot ? R(foot).y : null,
                    instrTop: instr ? R(instr).y : null,
                };
            });
        });
        const shot = await tab.screenshot({ fullPage: true, encoding: 'base64' });
        const scanned = await tab.evaluate(async ({ shot, geo, dark }) => {
            const img = new Image();
            await new Promise((ok, no) => { img.onload = ok; img.onerror = no; img.src = 'data:image/png;base64,' + shot; });
            const cv = document.createElement('canvas');
            cv.width = img.width; cv.height = img.height;
            const cx = cv.getContext('2d');
            cx.drawImage(img, 0, 0);
            const data = cx.getImageData(0, 0, cv.width, cv.height).data;
            const isInk = (x, y) => { const i = (y * cv.width + x) * 4; return (data[i] + data[i + 1] + data[i + 2]) / 3 < dark; };
            return geo.map((pg) => {
                const cells = pg.cells.map((c) => {
                    // inside the cell's own rules: 3 px in from each side
                    const x0 = Math.ceil(c.x + 3), x1 = Math.floor(c.x + c.w - 3), y0 = Math.ceil(c.y + 3), y1 = Math.floor(c.y + c.h - 3);
                    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
                    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
                        if (!isInk(x, y)) continue;
                        if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
                    }
                    if (minX === Infinity) return Object.assign({}, c, { empty: true });
                    return Object.assign({}, c, {
                        empty: false, inkW: maxX - minX + 1, inkH: maxY - minY + 1,
                        top: (minY - c.y) / c.h, bottom: (c.y + c.h - 1 - maxY) / c.h,
                        left: (minX - c.x) / c.w, right: (c.x + c.w - 1 - maxX) / c.w,
                    });
                });
                const bodyTop = pg.gridTop;
                const strip = pg.footTop !== null && pg.gridBottom !== null && bodyTop !== null
                    ? Math.max(0, (pg.footTop - pg.gridBottom) / (pg.footTop - bodyTop)) : null;
                return { cells, strip, gridTop: pg.gridTop, gridBottom: pg.gridBottom, footTop: pg.footTop };
            });
        }, { shot, geo, dark });
        return { pages: scanned };
    } finally { await tab.close(); }
}

/** Worst bands over a page's cells: {top, bottom, side (max of left/right), rowsH: distinct row heights}. */
function worst(pg) {
    const cs = pg.cells.filter((c) => !c.empty);
    const max = (k) => Math.max(0, ...cs.map((c) => c[k]));
    return {
        n: pg.cells.length, top: max('top'), bottom: max('bottom'), side: Math.max(max('left'), max('right')),
        rowsH: [...new Set(pg.cells.map((c) => Math.round(c.h)))].sort((a, b) => a - b),
        strip: pg.strip,
    };
}

module.exports = { inkScan, worst };
