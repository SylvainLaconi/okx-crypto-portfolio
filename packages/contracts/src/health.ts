import { z } from 'zod';

export const healthResponseSchema = z.object({
  status: z.enum(['ok', 'error']),
  database: z.enum(['connected', 'disconnected']),
  environment: z.enum(['local', 'preview', 'production']),
  commit: z.string(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
