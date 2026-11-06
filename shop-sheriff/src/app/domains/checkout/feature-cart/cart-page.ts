import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { ServerEvents } from '../../../shared/data-access';
import { PageHeader, PricePipe, ProblemAlert } from '../../../shared/ui';
import { ProblemDetails, toProblem } from '../../../shared/util';
import { CartStore, OrdersApi } from '../data-access';
import { QuantityStepper } from '../ui';
import { StockConflict, toStockConflict } from '../util';

/** Smart component: reads the cart store, places the order, handles the 409. */
@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, PageHeader, PricePipe, ProblemAlert, QuantityStepper],
  templateUrl: './cart-page.html',
})
export class CartPage {
  protected readonly cart = inject(CartStore);
  private readonly orders = inject(OrdersApi);
  private readonly router = inject(Router);

  protected readonly placing = signal(false);
  protected readonly problem = signal<ProblemDetails | null>(null);
  /** Derived, not stored twice: a 409 problem is also a stock conflict. */
  protected readonly conflict = computed(() => {
    const problem = this.problem();
    return problem ? toStockConflict(problem) : null;
  });
  /** Lines where the known stock is lower than the quantity (live stock went down). */
  protected readonly shortLines = computed(() =>
    this.cart.lines().filter((l) => l.quantity > l.stock),
  );

  constructor() {
    // Someone else bought (or staff restocked): keep the "available" numbers fresh.
    inject(ServerEvents)
      .on('stock.changed')
      .pipe(takeUntilDestroyed())
      .subscribe(({ productId, stock }) => this.cart.updateStock(productId, stock));
  }

  protected setQuantity(productId: string, quantity: number): void {
    this.problem.set(null);
    this.cart.setQuantity(productId, quantity);
  }

  protected remove(productId: string): void {
    this.problem.set(null);
    this.cart.remove(productId);
  }

  /** "Set to available": accept what the server said is left. */
  protected fitToStock(conflict: StockConflict): void {
    this.cart.fitToStock(conflict.productId, conflict.available);
    this.problem.set(null);
  }

  protected async placeOrder(): Promise<void> {
    // We still send a cart with known shortages: the server is the source of truth for stock,
    // and its 409 tells us exactly what is missing.
    this.placing.set(true);
    this.problem.set(null);
    try {
      const order = await this.orders.place(this.cart.lines());
      this.cart.clear();
      await this.router.navigate(['/my-orders'], { queryParams: { placed: order.number } });
    } catch (error) {
      this.problem.set(toProblem(error));
    } finally {
      this.placing.set(false);
    }
  }
}
