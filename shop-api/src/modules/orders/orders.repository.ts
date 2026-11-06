import { and, count, desc, eq, sql, type SQL } from 'drizzle-orm';
import type { Db, DbOrTx } from '../../db/client.js';
import { orderLines, orders, type OrderStatus } from '../../db/schema/index.js';
import { offsetOf } from '../../shared/pagination.js';
import type { OrdersQuery } from './orders.schemas.js';

const withRelations = {
  buyer: true,
  lines: { with: { product: true } },
} as const;

export class OrdersRepository {
  constructor(private readonly db: Db) {}

  async list(query: OrdersQuery, buyerId?: number) {
    const filters: SQL[] = [];
    if (buyerId !== undefined) filters.push(eq(orders.userId, buyerId));
    if (query.status) filters.push(eq(orders.status, query.status));
    const where = filters.length ? and(...filters) : undefined;

    const [items, [totalRow]] = await Promise.all([
      this.db.query.orders.findMany({
        where,
        with: withRelations,
        orderBy: [desc(orders.createdAt), desc(orders.id)],
        limit: query.pageSize,
        offset: offsetOf(query),
      }),
      this.db.select({ total: count() }).from(orders).where(where),
    ]);
    return { items, total: totalRow?.total ?? 0 };
  }

  findByUuid(uuid: string, db: DbOrTx = this.db) {
    return db.query.orders.findFirst({ where: eq(orders.uuid, uuid), with: withRelations });
  }

  /** ORD-0001, ORD-0002, … Called inside the "place order" transaction. */
  async nextNumber(db: DbOrTx): Promise<string> {
    const [row] = await db
      .select({ max: sql<number>`coalesce(max(${orders.id}), 0)` })
      .from(orders);
    return `ORD-${String((row?.max ?? 0) + 1).padStart(4, '0')}`;
  }

  async insert(
    db: DbOrTx,
    order: { number: string; userId: number },
    lines: { productId: number; quantity: number; unitPriceCents: number }[],
  ) {
    const [row] = await db.insert(orders).values(order).returning();
    await db.insert(orderLines).values(lines.map((l) => ({ ...l, orderId: row!.id })));
    return row!;
  }

  async setStatus(id: number, status: OrderStatus, db: DbOrTx = this.db): Promise<void> {
    await db.update(orders).set({ status }).where(eq(orders.id, id));
  }
}
