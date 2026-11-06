import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PricePipe } from '../../shared';
import { CartStore } from './cart-store';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, PricePipe],
  template: `
    <h1 class="h3 mb-4">Cart</h1>

    @if (cart.lines().length === 0) {
      <p class="text-body-secondary">Your cart is empty. <a routerLink="/">Browse products</a></p>
    } @else {
      <ul class="list-group mb-3">
        @for (line of cart.lines(); track line.id) {
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>{{ line.quantity }} × {{ line.name }}</span>
            <span>
              {{ line.priceCents * line.quantity | price }}
              <button
                type="button"
                class="btn btn-sm btn-link text-danger"
                [attr.aria-label]="'Remove ' + line.name"
                (click)="cart.remove(line.id)"
              >
                ✕
              </button>
            </span>
          </li>
        }
      </ul>
      <p class="d-flex justify-content-between fw-semibold">
        <span>Total</span><span>{{ cart.totalCents() | price }}</span>
      </p>
      <button type="button" class="btn btn-outline-secondary" (click)="cart.clear()">
        Clear cart
      </button>
    }

    <div class="alert alert-warning" tabindex="1" (click)="addExclamation()" (keydown.enter)="addExclamation()">{{ dropText() }}</div>
  `,
  // changeDetection: ChangeDetectionStrategy.Eager,
})
export class CartPage {
  protected readonly cart = inject(CartStore);

  protected readonly dropText = signal('Drop something in to this basket');

  // protected someText = '??';

  constructor() {
    setTimeout(() => {
      //
      // this.someText = '!!';
      this.dropText.set('Drop something!');
    }, 3000);
  }

  addExclamation() {
    this.dropText.set(this.dropText() + '!');
    // this.dropText.update((t) => t + '!');
  }
}

/*
### 4. Zmiana wartości sygnału

4.1 Po kliknięciu w ten tekst
<div class="alert alert-warining">Drop something in to this basket</div>
4.2 Za każdym kliknięciem dopisuj `!` na koniec tekstu
4.3 Po kliku na UI będzie: Drop something in to this basket!
   po kolejnym Drop something in to this basket!!
   po kolejnym Drop something in to this basket!!!
   etc....

 */

