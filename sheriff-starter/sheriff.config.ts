import { SheriffConfig } from '@softarc/sheriff-core';

/**
  * Minimal configuration for Sheriff
  * Assigns the 'noTag' tag to all modules and
  * allows all modules to depend on each other.
  */

export const config: SheriffConfig = {
  enableBarrelLess: true,
  entryFile: 'src/main.ts',
  modules: {
    'src/app/features/<feature>': 'feature:<feature>',
    //'src/app/features/catalog': 'feature:catalog',
    'src/app/shared': 'shared',
  }, // apply tags to your modules
  depRules: {
    // root is a virtual module, which contains all files not being part
    // of any module, e.g. application shell, main.ts, etc.
    root: ['feature:*', 'shared'],
    'feature:catalog': ['feature:cart', 'shared'],
    'feature:cart': ['shared'],
    shared: [],
  },
};
