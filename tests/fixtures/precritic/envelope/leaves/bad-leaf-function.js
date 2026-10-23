// BAD: a declared data leaf that exports a function.
export const TABLE = Object.freeze({ add: 'Add.' });
export function lookup(k) { return TABLE[k]; }
