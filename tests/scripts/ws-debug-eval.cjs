// Development aid (P12): evaluate a JS expression in the booted app and print the result.
//   node tests/scripts/ws-debug-eval.cjs "window.generateQuestionFor({category:'x',skill:'y'}).text"
// The expression may use `await`. Not a gate.
const { open } = require('../lib/ws-harness.cjs');
(async () => {
    const app = await open({ seed: 3 });
    const src = process.argv[2];
    const out = await app.page.evaluate(new Function(`return (async () => { return (${src}); })();`));
    console.log(typeof out === 'string' ? out : JSON.stringify(out, null, 1));
    await app.close();
})();
