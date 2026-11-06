import { Routes } from '@angular/router';

// Mini-app routes: each feature lazy-loaded via its barrel.
export const SHOP_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/products').then((m) => m.PRODUCTS_ROUTES),
  },
];
