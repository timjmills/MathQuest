// Fixture root for ws-envelope --self-test: every import form the binding walk must follow.
import { a, b as bee } from './barrel.js';            // a: export * chain; b: aliased on import
import { unused } from './unused.js';                  // imported, never referenced: NOT in the walk
import * as ns from './ns.js';                         // a used namespace: every export of ns.js
import { grp, deep, renamed } from './barrel.js';      // export * as; export * two levels; export { x as y } from
import { TABLE } from './data-leaf.js';                // a declared data leaf: the walk stops there
import { useSide } from './side-effect-user.js';       // a module whose top-level statement runs

export function main() {
    const local = { unused: 1, renamed() { return 0; } };   // keys and method names are not references
    return a() + bee + ns.x + grp.y + deep + renamed() + TABLE.k + useSide() + local.unused;
}
