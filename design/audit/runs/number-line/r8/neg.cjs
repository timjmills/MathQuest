const { open } = require('/home/user/mq-numberline/tests/lib/ws-harness.cjs');
const { timedHeaderCases } = require('/home/user/mq-numberline/tests/lib/refline-dots.cjs');
(async () => { const h = await open(); const f = await timedHeaderCases(h.page, { log: console.log }); console.log(f.length ? 'FAIL ' + f.length : 'PASS'); await h.close(); })();
