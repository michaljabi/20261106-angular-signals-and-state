import { computed, Service, signal } from '@angular/core';
import { WishlistDetails } from '../util';

@Service()
export class WishlistStore {
  private _slugs = signal<string[]>([]);
  private _details = signal<WishlistDetails>({
    name: '',
    description: '',
    giftSlug: ''
  })

  slugs = this._slugs.asReadonly();
  details = this._details.asReadonly();
  // ---
  count = computed(() => this._slugs().length);


  toggleOnList(slug: string) {
    this._slugs.update((sl) => (this.has(slug) ? sl.filter((s) => s !== slug) : [...sl, slug]));
  }

  has(lookFor: string): boolean {
    return this._slugs().includes(lookFor);
  }

  saveDetails(wishlistDetails: WishlistDetails) {
    this._details.set({ ...wishlistDetails });
  }
}
