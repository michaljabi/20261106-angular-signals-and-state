import { Pipe, PipeTransform } from '@angular/core';

// shared/ = dumb, reusable, no business state. Pipe keeps its type: price-pipe.ts / PricePipe.
@Pipe({ name: 'price' })
export class PricePipe implements PipeTransform {
  transform(value: number): string {
    return `${value.toFixed(2)} zł`;
  }
}
