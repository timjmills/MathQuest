// A barrel: passes names through; it defines nothing, so it is never listed.
export * from './chain1.js';
export { b } from './b.js';
export * as grp from './grp.js';
export { orig as renamed } from './aliased.js';
import './side.js';                                     // a bare registration import: not followed
export { never } from './never.js';                    // re-exported but never used
