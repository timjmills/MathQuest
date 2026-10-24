import { dead } from './dead.js';
export const b = 2;
export function other() { return dead(); }           // b.js is used, but not other(): dead.js is NOT reached
