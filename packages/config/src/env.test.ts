import { describe, expect, it } from 'vitest';
import { loadApiEnv } from './env.js';

const validEnv = {
  DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
};

describe('loadApiEnv', () => {
  it('applies defaults when optional vars are missing', () => {
    const env = loadApiEnv(validEnv);

    expect(env).toEqual({
      APP_ENV: 'local',
      PORT: 3001,
      DATABASE_URL: validEnv.DATABASE_URL,
      COMMIT_SHA: 'local',
    });
  });

  it('coerces PORT from a string', () => {
    const env = loadApiEnv({ ...validEnv, PORT: '4000' });
    expect(env.PORT).toBe(4000);
  });

  it('accepts explicit APP_ENV and COMMIT_SHA', () => {
    const env = loadApiEnv({ ...validEnv, APP_ENV: 'preview', COMMIT_SHA: 'abc123' });
    expect(env.APP_ENV).toBe('preview');
    expect(env.COMMIT_SHA).toBe('abc123');
  });

  it('throws a readable error when DATABASE_URL is missing', () => {
    expect(() => loadApiEnv({})).toThrow(/DATABASE_URL/);
  });

  it('throws when DATABASE_URL is not a valid URL', () => {
    expect(() => loadApiEnv({ DATABASE_URL: 'not-a-url' })).toThrow(/DATABASE_URL/);
  });

  it('throws when APP_ENV is not one of the allowed values', () => {
    expect(() => loadApiEnv({ ...validEnv, APP_ENV: 'staging' })).toThrow(/APP_ENV/);
  });
});
