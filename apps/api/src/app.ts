import cors from '@fastify/cors';
import type { ApiEnv } from '@repo/config/env';
import { createDbClient, type Database } from '@repo/db';
import Fastify, { type FastifyInstance } from 'fastify';
import { healthRoutes } from './routes/health.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
    env: ApiEnv;
  }
}

export interface AppOptions {
  env: ApiEnv;
}

export function buildApp({ env }: AppOptions): FastifyInstance {
  const app = Fastify({ logger: true });

  // Wildcard origin is fine while the API has no auth/cookies to protect.
  // Restrict to the real frontend origin once auth lands (M4+, cf. docs/decisions.md).
  app.register(cors, { origin: true });

  const db = createDbClient(env.DATABASE_URL);
  app.decorate('env', env);
  app.decorate('db', db);
  app.addHook('onClose', async () => {
    await db.$client.end();
  });

  app.register(healthRoutes);

  return app;
}
