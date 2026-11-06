import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createTestApp, productBySku, USERS } from './helpers.js';

const { app, loginAs } = await createTestApp();

describe('catalog', () => {
  it('lists products with paging (soft-deleted product hidden)', async () => {
    const res = await request(app).get('/api/products?page=1&pageSize=12').expect(200);
    expect(res.body).toMatchObject({ page: 1, pageSize: 12, total: 39 });
    expect(res.body.items).toHaveLength(12);
    expect(res.body.items[0]).not.toHaveProperty('categoryId'); // internal ids never leak
  });

  it('filters by category and sorts by price', async () => {
    const res = await request(app)
      .get('/api/products?category=monitors&sort=-price')
      .expect(200);
    const prices = res.body.items.map((p: { priceCents: number }) => p.priceCents);
    expect(res.body.total).toBe(8);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  it('returns a product by slug and 404 for a soft-deleted one', async () => {
    await request(app).get('/api/products/typeforge-tkl-mechanical-keyboard').expect(200);
    await request(app).get('/api/products/linkwell-usb-a-to-usb-c-cable-1m').expect(404);
  });

  it('sku-available: staff only; taken SKU (even deleted) is not available', async () => {
    await request(app).get('/api/products/sku-available?sku=KB-0001').expect(401);
    const buyer = await loginAs(USERS.buyer);
    await buyer.get('/api/products/sku-available?sku=KB-0001').expect(403);

    const staff = await loginAs(USERS.stockManager);
    const taken = await staff.get('/api/products/sku-available?sku=CB-0008').expect(200);
    expect(taken.body).toEqual({ sku: 'CB-0008', available: false });
    const free = await staff.get('/api/products/sku-available?sku=kb-0999').expect(200);
    expect(free.body).toEqual({ sku: 'KB-0999', available: true });
  });

  it('stock cannot go below 0 (409)', async () => {
    const staff = await loginAs(USERS.stockManager);
    const product = await productBySku(app, 'MS-0005'); // stock 1
    await staff.patch(`/api/products/${product.id}/stock`).send({ delta: -2 }).expect(409);
    const ok = await staff.patch(`/api/products/${product.id}/stock`).send({ delta: 4 }).expect(200);
    expect(ok.body.stock).toBe(5);
  });
});
