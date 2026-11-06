/**
 * Signals work outside components too (plain TS, no Angular app).
 * Run: pnpm example:c01
 */
import { signal } from '@angular/core';

const count = signal(10);
const readonlyCount = count.asReadonly();

console.log(count());

count.set(20);
console.log(count(), readonlyCount());

count.update((value) => value + 12);
console.log('count', count());
console.log('readonlyCount', readonlyCount());
