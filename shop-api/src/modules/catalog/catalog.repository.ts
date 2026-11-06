import { and, asc, count, desc, eq, inArray, isNull, or, sql, type SQL } from 'drizzle-orm';
import type { Db, DbOrTx } from '../../db/client.js';
import { categories, products } from '../../db/schema/index.js';
import { offsetOf } from '../../shared/pagination.js';
import type { ProductsQuery } from './catalog.schemas.js';

type NewProduct = typeof products.$inferInsert;

const ORDER_BY = {
  name: [asc(products.name)],
  '-name': [desc(products.name)],
  price: [asc(products.priceCents), asc(products.name)],
  '-price': [desc(products.priceCents), asc(products.name)],
  newest: [desc(products.createdAt), desc(products.id)],
} as const;

/** Escapes LIKE wildcards so "%" in a search means a literal percent. */
const likeEscaped = (q: string) => `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

export class CatalogRepository {
  constructor(private readonly db: Db) {}

  listCategories() {
    return this.db.select().from(categories).orderBy(asc(categories.name));
  }

  findCategoryByUuid(uuid: string) {
    return this.db.query.categories.findFirst({ where: eq(categories.uuid, uuid) });
  }

  async listProducts(query: ProductsQuery) {
    const filters: SQL[] = [isNull(products.deletedAt)];
    if (query.category) filters.push(eq(categories.slug, query.category));
    if (query.q) {
      const pattern = likeEscaped(query.q);
      filters.push(
        or(
          sql`${products.name} LIKE ${pattern} ESCAPE '\\'`,
          sql`${products.sku} LIKE ${pattern} ESCAPE '\\'`,
        )!,
      );
    }
    const where = and(...filters);

    const [rows, [totalRow]] = await Promise.all([
      this.db
        .select({ product: products, category: categories })
        .from(products)
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .where(where)
        .orderBy(...ORDER_BY[query.sort])
        .limit(query.pageSize)
        .offset(offsetOf(query)),
      this.db
        .select({ total: count() })
        .from(products)
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .where(where),
    ]);
    return {
      items: rows.map((r) => ({ ...r.product, category: r.category })),
      total: totalRow?.total ?? 0,
    };
  }

  findActiveBySlug(slug: string) {
    return this.db.query.products.findFirst({
      where: and(eq(products.slug, slug), isNull(products.deletedAt)),
      with: { category: true },
    });
  }

  findActiveByUuid(uuid: string, db: DbOrTx = this.db) {
    return db.query.products.findFirst({
      where: and(eq(products.uuid, uuid), isNull(products.deletedAt)),
      with: { category: true },
    });
  }

  findActiveByUuids(uuids: readonly string[], db: DbOrTx = this.db) {
    if (uuids.length === 0) return Promise.resolve([]);
    return db.query.products.findMany({
      where: and(inArray(products.uuid, [...uuids]), isNull(products.deletedAt)),
    });
  }

  /** Unique across ALL products, including soft-deleted ones (the DB constraint says so too). */
  async skuExists(sku: string): Promise<boolean> {
    const row = await this.db.query.products.findFirst({
      where: eq(products.sku, sku),
      columns: { id: true },
    });
    return row !== undefined;
  }

  async slugExists(slug: string): Promise<boolean> {
    const row = await this.db.query.products.findFirst({
      where: eq(products.slug, slug),
      columns: { id: true },
    });
    return row !== undefined;
  }

  async insert(values: NewProduct) {
    const [row] = await this.db.insert(products).values(values).returning();
    return row!;
  }

  async update(id: number, values: Partial<NewProduct>): Promise<void> {
    await this.db.update(products).set(values).where(eq(products.id, id));
  }

  async softDelete(id: number): Promise<void> {
    await this.db.update(products).set({ deletedAt: new Date() }).where(eq(products.id, id));
  }

  /**
   * Atomic stock change in ONE statement: no read-then-write race.
   * Returns the new stock, or `undefined` when the change would go below 0.
   */
  async adjustStock(productId: number, delta: number, db: DbOrTx = this.db) {
    const [row] = await db
      .update(products)
      .set({ stock: sql`${products.stock} + ${delta}`, updatedAt: new Date() })
      .where(
        and(
          eq(products.id, productId),
          isNull(products.deletedAt),
          sql`${products.stock} + ${delta} >= 0`,
        ),
      )
      .returning({ uuid: products.uuid, sku: products.sku, stock: products.stock });
    return row;
  }
}
