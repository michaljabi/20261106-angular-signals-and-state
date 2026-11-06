import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createTestApp, PASSWORD, USERS } from './helpers.js';

const { app, loginAs } = await createTestApp();

describe('auth', () => {
  it('logs in, sets an httpOnly session cookie and returns the user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: USERS.buyer, password: PASSWORD })
      .expect(200);

    expect(res.body).toMatchObject({ email: USERS.buyer, role: 'buyer' });
    expect(res.body).not.toHaveProperty('passwordHash');
    const cookie = String(res.headers['set-cookie']);
    expect(cookie).toMatch(/sid=/);
    expect(cookie).toMatch(/HttpOnly/i);
  });

  it('rejects a wrong password with 401 problem+json', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: USERS.buyer, password: 'nope' })
      .expect(401);
    expect(res.headers['content-type']).toMatch(/application\/problem\+json/);
    expect(res.body).toMatchObject({ status: 401, title: 'Unauthorized' });
  });

  it('validates the body with zod (400 + field errors)', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email' }).expect(400);
    expect(res.body.errors.map((e: { path: string }) => e.path)).toEqual(
      expect.arrayContaining(['email', 'password']),
    );
  });

  it('GET /me needs a session; logout ends it', async () => {
    await request(app).get('/api/auth/me').expect(401);
    const agent = await loginAs(USERS.buyer2);
    await agent.get('/api/auth/me').expect(200);
    await agent.post('/api/auth/logout').expect(204);
    await agent.get('/api/auth/me').expect(401);
  });
});
