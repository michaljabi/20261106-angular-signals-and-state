import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Catalog',
    loadComponent: () => import('./features/catalog').then((m) => m.CatalogPage),
  },
  {
    path: 'cart',
    title: 'Cart',
    loadComponent: () => import('./features/cart').then((m) => m.CartPage),
  },
  { path: '**', redirectTo: '' },
];
