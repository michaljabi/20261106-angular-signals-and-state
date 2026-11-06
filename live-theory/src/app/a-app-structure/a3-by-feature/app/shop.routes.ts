import { Routes } from '@angular/router';

// Mini-app routes: each feature lazy-loaded via its routes file.
export const SHOP_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/products/products.routes').then((m) => m.PRODUCTS_ROUTES),
  },
];
