import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createTestApp, USERS } from './helpers.js';

const { app, loginAs } = await createTestApp();

describe('articles (read-only)', () => {
  it('lists all articles, newest first, paged', async () => {
    const res = await request(app).get('/api/articles?pageSize=50').expect(200);
    expect(res.body.total).toBe(7);
    expect(res.body.items[0]).toMatchObject({ slug: 'desk-cable-management' });
    expect(res.body.items[0]).not.toHaveProperty('body');

    const page2 = await request(app).get('/api/articles?pageSize=5&page=2').expect(200);
    expect(page2.body.items).toHaveLength(2);
  });

  it('filters by product slug', async () => {
    const res = await request(app).get('/api/articles?product=pixelia-34-ultrawide-monitor');
    expect(res.body.items.map((a: { slug: string }) => a.slug)).toEqual([
      'choosing-a-monitor-for-coding',
    ]);
  });

  it('one article by slug, with linked products; unknown → 404', async () => {
    const res = await request(app).get('/api/articles/remote-meeting-kit').expect(200);
    expect(res.body).toMatchObject({ slug: 'remote-meeting-kit', title: expect.any(String) });
    expect(res.body.products.length).toBeGreaterThan(0);
    await request(app).get('/api/articles/no-such-article').expect(404);
  });

  it('no write API: POST is not routed, even for admin', async () => {
    const admin = await loginAs(USERS.admin);
    await admin.post('/api/articles').send({ title: 'x' }).expect(404);
  });
});

describe('dev tools', () => {
  it('?_fail and ?_delay simulate errors and latency', async () => {
    await request(app).get('/api/categories?_fail=503').expect(503);
    const start = Date.now();
    await request(app).get('/api/categories?_delay=200').expect(200);
    expect(Date.now() - start).toBeGreaterThanOrEqual(190);
  });
});
