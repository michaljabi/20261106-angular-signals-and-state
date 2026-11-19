import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-wishlist-toggle',
  template: `
    <button
      type="button"
      class="btn btn-sm"
      [class.btn-danger]="active()"
      [class.btn-outline-danger]="!active()"
      [attr.aria-pressed]="active()"
      [attr.aria-label]="active() ? 'Remove from wishlist' : 'Add to wishlist'"
      (click)="addToList.emit()"
    >
      {{ active() ? '♥' : '♡' }}
    </button>
  `,
})
export class WishlistToggle {
  // @Input()
  readonly active = input(false);
  // @Output()
  readonly addToList = output<void>();

  // RUNTIME Exception - widoczny będzie w konsoli przeglądarki (f12) narzędzia DevTools
  // throwError() {
  //   throw new Error('!');
  // }
}
