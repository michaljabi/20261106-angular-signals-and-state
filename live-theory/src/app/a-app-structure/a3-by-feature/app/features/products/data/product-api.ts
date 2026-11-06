import { Injectable } from '@angular/core';
import { Product } from './product';

// data/ = where data comes from (here a fake; in real life HttpClient / httpResource).
@Injectable({ providedIn: 'root' })
export class ProductApi {
  getAll(): Product[] {
    return [
      { id: 1, name: 'Klawiatura', price: 129.99 },
      { id: 2, name: 'Mysz', price: 49.5 },
      { id: 3, name: 'Monitor', price: 899 },
    ];
  }
}
