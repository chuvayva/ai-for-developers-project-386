import { expect, test } from 'vitest';
import { build } from './app.ts';

test('GET /api/health responds with ok', async () => {
  const app = build();

  const response = await app.inject({ method: 'GET', url: '/api/health' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({ status: 'ok' });
});
