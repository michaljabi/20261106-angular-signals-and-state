import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';

// Test next to the code, same base name + .spec.
describe('CartService', () => {
  it('adds products and derives count + total', () => {
    const cart = TestBed.inject(CartService);
    const mouse = { id: 2, name: 'Mysz', price: 49.5 };

    cart.add(mouse);
    cart.add(mouse);

    expect(cart.items()).toEqual([{ product: mouse, quantity: 2 }]);
    expect(cart.count()).toBe(2);
    expect(cart.total()).toBe(99);
  });
});
