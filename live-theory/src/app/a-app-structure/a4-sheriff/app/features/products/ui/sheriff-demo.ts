/**
 * Sheriff demo – uncomment ONE line: the IDE and `pnpm lint` report it.
 * `ng build` still passes – TypeScript knows nothing about module boundaries.
 */

// export { Cart } from '../../cart/state/cart'; // ❌ deep import – past cart/index.ts
// export { Cart } from '../../cart'; // ❌ type:ui → type:feature (presentational must not reach state)
// export { ProductCatalog } from '../state'; // ❌ type:ui → type:state

// export { ProductList } from './'; // ✅ type:ui → type:ui

export {};
