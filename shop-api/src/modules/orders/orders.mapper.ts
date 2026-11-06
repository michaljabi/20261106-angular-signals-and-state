import type { orderLines, orders, products, users } from '../../db/schema/index.js';
import type { OrderStatus } from '../../db/schema/index.js';
import { toUserRef, type UserRefDto } from '../users/users.mapper.js';

type OrderWithRelations = typeof orders.$inferSelect & {
  buyer: typeof users.$inferSelect;
  lines: (typeof orderLines.$inferSelect & { product: typeof products.$inferSelect })[];
};

export interface OrderLineDto {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  /** Price at the time of ordering (snapshot), USD cents. */
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface OrderDto {
  id: string;
  number: string;
  status: OrderStatus;
  createdAt: string;
  buyer: UserRefDto;
  lines: OrderLineDto[];
  totalCents: number;
}

export function toOrderDto(o: OrderWithRelations): OrderDto {
  const lines = o.lines.map((l) => ({
    productId: l.product.uuid,
    sku: l.product.sku,
    name: l.product.name,
    quantity: l.quantity,
    unitPriceCents: l.unitPriceCents,
    lineTotalCents: l.unitPriceCents * l.quantity,
  }));
  return {
    id: o.uuid,
    number: o.number,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    buyer: toUserRef(o.buyer),
    lines,
    totalCents: lines.reduce((sum, l) => sum + l.lineTotalCents, 0),
  };
}
