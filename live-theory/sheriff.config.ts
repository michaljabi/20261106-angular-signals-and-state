import { sameTag, SheriffConfig } from '@softarc/sheriff-core';

/**
 * Sheriff is scoped to the A4 mini app only (the rest of live-theory = "root", unrestricted).
 * Every folder below is a module; its public API is its index.ts (barrel).
 * Tags: domain (which feature) + type (which layer).
 */
const A4 = 'src/app/a-app-structure/a4-sheriff/app';

export const config: SheriffConfig = {
  entryFile: 'src/main.ts',
  modules: {
    [`${A4}/features/<domain>`]: ['domain:<domain>', 'type:feature'],
    [`${A4}/features/<domain>/data`]: ['domain:<domain>', 'type:data'],
    [`${A4}/features/<domain>/state`]: ['domain:<domain>', 'type:state'],
    [`${A4}/features/<domain>/ui`]: ['domain:<domain>', 'type:ui'],
    [`${A4}/shared/<type>`]: ['domain:shared', 'type:<type>'],
  },
  depRules: {
    // Everything outside A4 modules (shell, other lessons, a4 shop.ts) may use features + shared.
    root: ['type:feature', 'domain:shared', 'noTag'],

    // A5 (Nx-like libs via tsconfig path aliases) are auto-detected as untagged modules.
    // Their boundaries are Nx's job (@nx/enforce-module-boundaries), not Sheriff's.
    noTag: ['noTag'],

    // Domains: itself + shared…
    'domain:*': [sameTag, 'domain:shared'],
    // …plus one planned direction: products → cart (never cart → products).
    'domain:products': ['domain:cart'],

    // Layers
    'type:feature': ['type:feature', 'type:state', 'type:ui', 'type:data'],
    'type:state': ['type:state', 'type:data'],
    'type:ui': ['type:ui', 'type:data'],
    'type:data': ['type:data'],
  },
};
