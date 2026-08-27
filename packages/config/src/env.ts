import { z } from 'zod';

const apiEnvSchema = z.object({
  APP_ENV: z.enum(['local', 'preview', 'production']).default('local'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.url(),
  COMMIT_SHA: z.string().default('local'),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export function loadApiEnv(source: NodeJS.ProcessEnv = process.env): ApiEnv {
  const result = apiEnvSchema.safeParse(source);

  if (!result.success) {
    const issues = result.error.issues.map(
      (issue) => `- ${issue.path.join('.')}: ${issue.message}`,
    );
    throw new Error(`Invalid environment configuration:\n${issues.join('\n')}`);
  }

  return result.data;
}
