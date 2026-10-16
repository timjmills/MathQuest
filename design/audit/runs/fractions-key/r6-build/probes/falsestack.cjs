// r6 R5-3: screenTextLine on date / ratio / score prompts, with and without a kit picture below.
const path = require('path');
const { open } = require(path.join(process.argv[2], 'tests/lib/ws-harness.cjs'));
(async () => {
  const app = await open({ seed: 1 });
  const r = await app.page.evaluate(async () => {
    const m = await import('/js/modules/screen-cell.js');
    const T = ['Today is 3/4/2026. What day is tomorrow?', 'On 3/4 the class went to the zoo. How many days until 3/10?', 'Sam was born on March 3/4.', 'The score was 3/4 at half time.',
      'Mix paint in the ratio 2:3. How much blue?', 'A car goes 60 km/h for 2 hours.', 'Read the date 12/25 on the calendar.', 'There are 55 buttons. 1/5 of them are in a box.',
      'Ben takes 4/5 of them.', 'Calculate: 1/2 + 1/3 = ?', 'Shade 2/5 of the shape.', 'Which is greater, 3/4 or 2/3?'];
    const out = [];
    for (const kit of [false, true]) for (const t of T) {
      const host = document.createElement('div'); host.id = 'questionPaper'; host.style.cssText = 'position:absolute;left:-9999px';
      const el = document.createElement('div'); el.textContent = t; host.appendChild(el);
      if (kit) { const k = document.createElement('div'); k.className = 'k2-twin'; host.appendChild(k); }
      document.body.appendChild(host);
      m.screenTextLine(el);
      const stacked = Array.from(el.querySelectorAll('.msc-frac')).map(f => f.children[0].textContent + '|' + f.children[1].textContent);
      out.push(`${kit ? 'kit ' : 'text'}  ${t.padEnd(62)} stacked: ${stacked.join(' ') || '-'}`);
      host.remove();
    }
    return out;
  });
  console.log(r.join('\n'));
  await app.close();
})();
