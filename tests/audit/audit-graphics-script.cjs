// Graphics audit script: render priority MAP-relevant skills and screenshot their visual area
// Read-only, output goes to ./audit-graphics/
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, 'audit-graphics');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Priority MAP-relevant skills to capture
const PRIORITY_SKILLS = [
    // Data & Stats (high priority)
    'bar_graph', 'pictograph', 'line_plot', 'tally_chart', 'line_plot_fractions', 'pie_chart',
    // Coordinate plane
    'coordinate_q1', 'coordinate_all', 'coordinate_graph',
    // Area / Perimeter / Geometry
    'area_unit_squares', 'perimeter_grid', 'area', 'perimeter', 'area_perimeter',
    'composite_shapes', 'volume', 'area_distributive_visual', 'area_triangle',
    // Time / Clock
    'time_to_hour', 'time_to_5min', 'elapsed_visual_easy', 'elapsed_visual_medium',
    // Fractions
    'identify', 'equiv_frac_visual', 'fraction_of_set', 'mixed_improper_visual',
    'fraction_number_line', 'compare_frac_visual',
    // Number lines
    'number_line_add', 'number_line_sub', 'nl_add', 'nl_sub',
    // Shapes
    'name_2d_shapes', 'name_3d_shapes', 'classify_triangles', 'classify_quads', 'partition_shapes',
    // Place value visuals
    'place_value_disks', 'base_ten_blocks', 'expanded_form',
    // Other visuals
    'tape_diagram', 'arrays_groups', 'skip_count_grid', 'skip_count_line',
    'identify_angles', 'symmetry', 'reading_ruler',
    'hundreds_chart_fill', 'function_table'
];

(async () => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 600, deviceScaleFactor: 2 });

    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    console.log('Loading app...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });

    // Build skill→category map
    await page.evaluate(() => {
        const skillCatMap = {};
        if (window.SKILLS) {
            for (const [catId, catSkills] of Object.entries(window.SKILLS)) {
                if (!Array.isArray(catSkills)) continue;
                for (const s of catSkills) if (s && s.v) skillCatMap[s.v] = catId;
            }
        }
        window._skillCatMap = skillCatMap;
    });

    const results = [];

    for (const skill of PRIORITY_SKILLS) {
        try {
            // Generate question (try multiple times to get one with a visual)
            const data = await page.evaluate((s) => {
                const cat = window._skillCatMap[s];
                if (!cat) return { ok: false, error: 'skill not found' };
                window.state.skill = s;
                window.state.category = cat;
                window.state.range = 100;
                window.state.decimalPlaces = 0;
                let q = null;
                for (let i = 0; i < 8; i++) {
                    try { q = window.generateQuestion(); } catch (e) { return { ok: false, error: e.message }; }
                    if (q && q.visual) break;
                }
                if (!q) return { ok: false, error: 'no question generated' };
                return {
                    ok: true,
                    text: q.text || '',
                    visual: q.visual || '',
                    hasVisual: !!q.visual,
                    printFormat: q.printFormat || ''
                };
            }, skill);

            if (!data.ok) {
                console.log(`[SKIP] ${skill}: ${data.error}`);
                results.push({ skill, status: 'skip', reason: data.error });
                continue;
            }
            if (!data.hasVisual) {
                console.log(`[NO-VISUAL] ${skill}`);
                results.push({ skill, status: 'no-visual' });
                continue;
            }

            // Render visual into a clean container for screenshot
            await page.evaluate((d) => {
                let div = document.getElementById('__audit_render');
                if (!div) {
                    div = document.createElement('div');
                    div.id = '__audit_render';
                    div.style.cssText = 'position:fixed;top:0;left:0;width:1280px;min-height:200px;background:#fff;padding:24px;font-family:Nunito,Arial,sans-serif;z-index:99999;color:#1A202C;';
                    document.body.appendChild(div);
                }
                div.innerHTML = `
                    <div style="font-size:12px;color:#888;margin-bottom:8px;font-family:monospace;">${d.skill || ''} | printFormat=${d.printFormat}</div>
                    <div style="font-size:18px;font-weight:600;margin-bottom:12px;">${d.text}</div>
                    <div>${d.visual}</div>
                `;
            }, { ...data, skill });

            await new Promise(r => setTimeout(r, 250));

            const el = await page.$('#__audit_render');
            const outFile = path.join(OUT_DIR, `${skill}.png`);
            await el.screenshot({ path: outFile });
            console.log(`[OK] ${skill} -> ${outFile}`);
            results.push({ skill, status: 'ok', file: outFile, printFormat: data.printFormat });
        } catch (e) {
            console.log(`[ERROR] ${skill}: ${e.message}`);
            results.push({ skill, status: 'error', error: e.message });
        }
    }

    fs.writeFileSync(path.join(OUT_DIR, '_index.json'), JSON.stringify(results, null, 2));
    console.log(`\nDone. ${results.filter(r => r.status === 'ok').length}/${PRIORITY_SKILLS.length} captured.`);
    console.log(`Page errors: ${errors.length}`);
    if (errors.length) errors.slice(0, 5).forEach(e => console.log('  ' + e));

    await browser.close();
})();
