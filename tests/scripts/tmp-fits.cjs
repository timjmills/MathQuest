const { open } = require('../lib/ws-harness.cjs');
(async () => {
    const app = await open({ seed: 7 });
    for (const key of process.argv[2].split(',')) {
        const [c, s] = key.split(':');
        for (const size of ['S', 'L']) {
            const r = await app.page.evaluate(async (c, s, size) => {
                const o = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: c, skillId: s, opts: {} }] }], size, look: 'ican', key: true, seed: 11 });
                return JSON.stringify(o.fits || o.meta || Object.keys(o)).slice(0, 700);
            }, c, s, size);
            console.log(key, size, r);
        }
    }
    await app.close();
})();
