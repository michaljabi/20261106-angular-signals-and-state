import { TestBed } from '@angular/core/testing';
import { WishlistStore } from './wishlist-store';

describe('WishlistStore', () => {
  let service: WishlistStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WishlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
