import { Component, afterNextRender, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CartStore } from './domains/checkout/data-access';
import { Session } from './shared/data-access';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
})
export class App {
  protected readonly session = inject(Session);
  protected readonly cart = inject(CartStore);
  private readonly router = inject(Router);

  constructor() {
    // Browser only: the server render has no session cookie, so it renders as a visitor.
    afterNextRender(() => void this.session.ensureLoaded().catch(() => null));
  }

  protected async logout(): Promise<void> {
    await this.session.logout();
    this.cart.clear(); // cart is kept per browser, not per user → do not leak it to the next login
    await this.router.navigateByUrl('/login');
  }
}
