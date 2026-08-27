import { healthResponseSchema } from '@repo/contracts';
import { sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    let database: 'connected' | 'disconnected' = 'disconnected';

    try {
      await app.db.execute(sql`select 1`);
      database = 'connected';
    } catch (error) {
      app.log.error(error, 'health check database ping failed');
    }

    return healthResponseSchema.parse({
      status: database === 'connected' ? 'ok' : 'error',
      database,
      environment: app.env.APP_ENV,
      commit: app.env.COMMIT_SHA,
    });
  });
}
