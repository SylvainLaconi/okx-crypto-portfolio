import { healthResponseSchema } from '@repo/contracts';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';

describe('GET /health', () => {
  it('returns a payload matching the health contract', async () => {
    const app = buildApp({
      env: {
        APP_ENV: 'local',
        PORT: 3001,
        DATABASE_URL: 'postgres://user:pass@localhost:5432/unreachable',
        COMMIT_SHA: 'test-sha',
      },
    });

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(() => healthResponseSchema.parse(response.json())).not.toThrow();
    expect(response.json()).toMatchObject({
      environment: 'local',
      commit: 'test-sha',
    });

    await app.close();
  });
});
