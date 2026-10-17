const path = require('path');
const { open } = require(path.join(process.argv[2], 'tests/lib/ws-harness.cjs'));
(async () => { const app = await open({ seed: 1 });
  const r = await app.page.evaluate(async () => { const o = await window.buildSheet({ role: 'more-practice', letters: ['A', 'B'], sections: [{ skills: [{ categoryId: 'fractions', skillId: 'fraction_of_set' }] }], size: 'S', look: 'ican', key: true, seed: 5 });
    return { pupil: (o.pupilHtml.match(/Form [A-J][^<]*/g) || []), key: (o.keyHtml.match(/Form [A-J][^<]*/g) || []) }; });
  console.log(JSON.stringify(r)); await app.close(); })();
