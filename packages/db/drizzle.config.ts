import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // biome-ignore lint/style/noNonNullAssertion: drizzle-kit CLI requires DATABASE_URL to be set in its own shell env
    url: process.env.DATABASE_URL!,
  },
});
