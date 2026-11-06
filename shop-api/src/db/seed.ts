import { sql } from 'drizzle-orm';
import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import { hashPassword } from '../shared/password.js';
import type { Db } from './client.js';
import {
  ORDER_STATUSES,
  ROLES,
  articleProducts,
  articles,
  categories,
  orderLines,
  orders,
  products,
  sessions,
  users,
} from './schema/index.js';

/**
 * Seed data lives in `seed/db.json` (json-server style: one array per table).
 * Records point at each other by natural keys (email, slug, sku, order number).
 * This loader validates the file with zod, resolves keys to internal ids,
 * generates UUIDs (schema defaults) and hashes passwords, all in one transaction.
 */

const isoDate = z.iso.datetime().transform((s) => new Date(s));
const nullableDate = isoDate.nullable();

const SeedSchema = z.object({
  users: z.array(
    z.object({
      email: z.email(),
      name: z.string(),
      role: z.enum(ROLES),
      password: z.string().min(8),
      deletedAt: nullableDate,
    }),
  ),
  categories: z.array(z.object({ slug: z.string(), name: z.string() })),
  products: z.array(
    z.object({
      sku: z.string(),
      slug: z.string(),
      name: z.string(),
      description: z.string(),
      priceCents: z.number().int().min(0),
      stock: z.number().int().min(0),
      category: z.string(),
      deletedAt: nullableDate,
    }),
  ),
  orders: z.array(
    z.object({
      number: z.string(),
      buyer: z.email(),
      status: z.enum(ORDER_STATUSES),
      createdAt: isoDate,
    }),
  ),
  orderLines: z.array(
    z.object({
      order: z.string(),
      product: z.string(),
      quantity: z.number().int().positive(),
      unitPriceCents: z.number().int().min(0),
    }),
  ),
  articles: z.array(
    z.object({
      slug: z.string(),
      title: z.string(),
      excerpt: z.string(),
      body: z.string(),
      createdAt: isoDate,
      publishedAt: isoDate,
    }),
  ),
  articleProducts: z.array(z.object({ article: z.string(), product: z.string() })),
});
export type SeedData = z.infer<typeof SeedSchema>;

const SEED_FILE = new URL('../../seed/db.json', import.meta.url);
/** Fixed "catalog created" time, so `sort=newest` is the same on every machine. */
const CATALOG_EPOCH = Date.parse('2026-09-01T08:00:00.000Z');

export async function loadSeedFile(): Promise<SeedData> {
  return SeedSchema.parse(JSON.parse(await readFile(SEED_FILE, 'utf8')));
}

/** bcrypt is slow on purpose; cache per process so tests that reseed often stay fast. */
const hashCache = new Map<string, string>();
async function cachedHash(email: string, password: string) {
  const key = `${email}\0${password}`;
  let hash = hashCache.get(key);
  if (!hash) {
    hash = await hashPassword(password);
    hashCache.set(key, hash);
  }
  return hash;
}

/** Map lookup that fails loudly on a broken reference in db.json. */
function ref<T>(map: Map<string, T>, key: string, what: string): T {
  const value = map.get(key);
  if (value === undefined) throw new Error(`Seed: unknown ${what} "${key}"`);
  return value;
}

/** Deletes all data and inserts the seed. Schema must already be migrated. */
export async function seedDatabase(db: Db, data?: SeedData): Promise<void> {
  const seed = data ?? (await loadSeedFile());
  const passwordHashes = await Promise.all(seed.users.map((u) => cachedHash(u.email, u.password)));

  await db.transaction(async (tx) => {
    // Children first (foreign keys).
    for (const table of [
      sessions,
      articleProducts,
      articles,
      orderLines,
      orders,
      products,
      categories,
      users,
    ]) {
      await tx.delete(table);
    }
    await tx.run(sql`DELETE FROM sqlite_sequence`);

    const userIds = new Map<string, number>();
    for (const [i, u] of seed.users.entries()) {
      const [row] = await tx
        .insert(users)
        .values({
          email: u.email,
          name: u.name,
          role: u.role,
          passwordHash: passwordHashes[i]!,
          createdAt: new Date(CATALOG_EPOCH),
          deletedAt: u.deletedAt,
        })
        .returning({ id: users.id });
      userIds.set(u.email, row!.id);
    }

    const categoryIds = new Map<string, number>();
    for (const c of seed.categories) {
      const [row] = await tx.insert(categories).values(c).returning({ id: categories.id });
      categoryIds.set(c.slug, row!.id);
    }

    const productIds = new Map<string, number>();
    for (const [i, p] of seed.products.entries()) {
      const at = new Date(CATALOG_EPOCH + i * 60_000);
      const [row] = await tx
        .insert(products)
        .values({
          sku: p.sku,
          slug: p.slug,
          name: p.name,
          description: p.description,
          priceCents: p.priceCents,
          stock: p.stock,
          categoryId: ref(categoryIds, p.category, 'category'),
          createdAt: at,
          updatedAt: at,
          deletedAt: p.deletedAt,
        })
        .returning({ id: products.id });
      productIds.set(p.sku, row!.id);
    }

    const orderIds = new Map<string, number>();
    for (const o of seed.orders) {
      const [row] = await tx
        .insert(orders)
        .values({
          number: o.number,
          userId: ref(userIds, o.buyer, 'user'),
          status: o.status,
          createdAt: o.createdAt,
          updatedAt: o.createdAt,
        })
        .returning({ id: orders.id });
      orderIds.set(o.number, row!.id);
    }

    if (seed.orderLines.length) {
      await tx.insert(orderLines).values(
        seed.orderLines.map((l) => ({
          orderId: ref(orderIds, l.order, 'order'),
          productId: ref(productIds, l.product, 'product'),
          quantity: l.quantity,
          unitPriceCents: l.unitPriceCents,
        })),
      );
    }

    const articleIds = new Map<string, number>();
    for (const a of seed.articles) {
      const [row] = await tx
        .insert(articles)
        .values({
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt,
          body: a.body,
          createdAt: a.createdAt,
          updatedAt: a.publishedAt,
          publishedAt: a.publishedAt,
        })
        .returning({ id: articles.id });
      articleIds.set(a.slug, row!.id);
    }

    if (seed.articleProducts.length) {
      await tx.insert(articleProducts).values(
        seed.articleProducts.map((l) => ({
          articleId: ref(articleIds, l.article, 'article'),
          productId: ref(productIds, l.product, 'product'),
        })),
      );
    }
  });
}
