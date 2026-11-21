// Backtest mutation for ws-my-worksheets ORGANISE "Send as a set" (critic r1 F6): My sets keeps only the newest set, so a
// Send as a set that loses the other sets must FAIL the check.
(() => {
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
        if (k === 'mq_teacher_sets') { try { const a = JSON.parse(v); if (Array.isArray(a)) v = JSON.stringify(a.slice(0, 1)); } catch (e) { /* as written */ } }
        return orig.call(this, k, v);
    };
})();
