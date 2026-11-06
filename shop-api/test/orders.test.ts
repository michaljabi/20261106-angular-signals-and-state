import { beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, productBySku, USERS } from './helpers.js';

const { app, loginAs, reset } = await createTestApp();

describe('orders', () => {
  beforeEach(() => reset());

  it('places an order: stock goes down, price is snapshotted', async () => {
    const buyer = await loginAs(USERS.buyer);
    const kb = await productBySku(app, 'KB-0001');

    const res = await buyer
      .post('/api/orders')
      .send({ lines: [{ productId: kb.id, quantity: 2 }] })
      .expect(201);

    expect(res.body).toMatchObject({ number: 'ORD-0016', status: 'new' });
    expect(res.body.totalCents).toBe(kb.priceCents * 2);
    expect((await productBySku(app, 'KB-0001')).stock).toBe(kb.stock - 2);
  });

  it('is all-or-nothing: one short line → 409 and no stock changes', async () => {
    const buyer = await loginAs(USERS.buyer);
    const kb = await productBySku(app, 'KB-0001'); // plenty
    const trackball = await productBySku(app, 'MS-0005'); // stock 1

    const res = await buyer
      .post('/api/orders')
      .send({
        lines: [
          { productId: kb.id, quantity: 1 },
          { productId: trackball.id, quantity: 3 },
        ],
      })
      .expect(409);

    expect(res.body).toMatchObject({ sku: 'MS-0005', requested: 3, available: 1 });
    expect((await productBySku(app, 'KB-0001')).stock).toBe(kb.stock); // rolled back
  });

  it('buyers see only their own orders; staff see all', async () => {
    const jan = await loginAs(USERS.buyer);
    const own = await jan.get('/api/orders?pageSize=50').expect(200);
    expect(own.body.total).toBe(5);

    const staff = await loginAs(USERS.stockManager);
    const all = await staff.get('/api/orders?pageSize=50').expect(200);
    expect(all.body.total).toBe(15);
  });

  it('cancel puts stock back; shipping needs staff; shipped cannot be cancelled', async () => {
    const buyer = await loginAs(USERS.buyer);
    const kb = await productBySku(app, 'KB-0002');
    const order = (
      await buyer.post('/api/orders').send({ lines: [{ productId: kb.id, quantity: 1 }] })
    ).body;

    await buyer.post(`/api/orders/${order.id}/ship`).expect(403);
    await buyer.post(`/api/orders/${order.id}/cancel`).expect(200);
    expect((await productBySku(app, 'KB-0002')).stock).toBe(kb.stock);

    const order2 = (
      await buyer.post('/api/orders').send({ lines: [{ productId: kb.id, quantity: 1 }] })
    ).body;
    const staff = await loginAs(USERS.stockManager);
    await staff.post(`/api/orders/${order2.id}/ship`).expect(200);
    await buyer.post(`/api/orders/${order2.id}/cancel`).expect(409);
  });

  it("another buyer's order is 404, not 403", async () => {
    const ola = await loginAs(USERS.buyer2);
    const olaOrder = (await ola.get('/api/orders')).body.items[0];
    const jan = await loginAs(USERS.buyer);
    await jan.get(`/api/orders/${olaOrder.id}`).expect(404);
  });
});
