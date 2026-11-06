import { Pipe, PipeTransform } from '@angular/core';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** Integer cents → "$86.99". The API keeps money in cents. */
@Pipe({ name: 'price' })
export class PricePipe implements PipeTransform {
  transform(cents: number): string {
    return usd.format(cents / 100);
  }
}
