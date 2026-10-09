// Wave 1 lane C2: "defaults stay exactly as today". Prints a digest of count_by_tables items (defaults, the old fill / jumps /
// order / onePage options, and old ticked tables) for the tree it is run against; run it on the base commit and on the
// branch (MQ_ROOT=<other checkout>) and the two outputs must be identical.
//   /tmp/mq-browser-run.sh node tests/scripts/wave1-c2-defaults.cjs > /tmp/new.txt
//   MQ_ROOT=/path/to/base /tmp/mq-browser-run.sh node tests/scripts/wave1-c2-defaults.cjs > /tmp/old.txt ; diff /tmp/old.txt /tmp/new.txt
const { open } = require('../lib/ws-harness.cjs');
const CASES = [{}, { fill: 'one' }, { fill: 'half' }, { jumps: 15 }, { order: 'mixed' }, { missing: 80 }, { shape: 'hex' }, { constant: [7, 8] }, { constant: [3] }, { constant: [4, 5, 6], order: 'mixed' },
  { onePage: true }, { onePage: true, fill: 'one', missing: 100 }];
(async () => {
  const app = await open({ seed: 1 });
  const out = await app.page.evaluate((cases) => {
    const res = [];
    for (const opts of cases) {
      const items = [];
      for (let i = 0; i < 16; i++) {
        const q = window.generateQuestionFor({ category: 'multiplication', skill: 'count_by_tables', range: 100, opts, seed: 5000 + i, itemIndex: i });
        items.push([q.text, q.ans, JSON.stringify(q.cell && q.cell.payload)].join(' | '));
      }
      res.push(JSON.stringify(opts) + '\n' + items.join('\n'));
    }
    return res.join('\n\n');
  }, CASES);
  console.log(out);
  await app.close();
})().catch((e) => { console.error(e); process.exit(1); });
