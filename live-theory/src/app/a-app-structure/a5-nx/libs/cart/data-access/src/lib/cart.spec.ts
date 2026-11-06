import { TestBed } from '@angular/core/testing';
import { Cart } from './cart';

describe('Cart (A5)', () => {
  it('adds products and derives count + total', () => {
    const cart = TestBed.inject(Cart);
    const mouse = { id: 2, name: 'Mysz', price: 49.5 };

    cart.add(mouse);
    cart.add(mouse);

    expect(cart.items()).toEqual([{ ...mouse, quantity: 2 }]);
    expect(cart.count()).toBe(2);
    expect(cart.total()).toBe(99);
  });
});
