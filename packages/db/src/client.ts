import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

export function createDbClient(databaseUrl: string) {
  const queryClient = postgres(databaseUrl, { connect_timeout: 5 });
  return drizzle(queryClient, { schema });
}

export type Database = ReturnType<typeof createDbClient>;
