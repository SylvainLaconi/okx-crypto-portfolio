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

  app.register(cors, { origin: true });

  app.decorate('env', env);
  app.decorate('db', createDbClient(env.DATABASE_URL));

  app.register(healthRoutes);

  return app;
}
