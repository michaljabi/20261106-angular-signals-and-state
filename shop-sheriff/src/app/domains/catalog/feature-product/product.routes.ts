import { Routes } from '@angular/router';
import { ProductPage } from './product-page';

export const productRoutes: Routes = [
  { path: ':slug', component: ProductPage }, // title: set by the page (product name)
];
