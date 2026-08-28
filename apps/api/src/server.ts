import { loadApiEnv } from '@repo/config/env';
import { buildApp } from './app.js';

const env = loadApiEnv();
const app = buildApp({ env });

app.listen({ port: env.PORT, host: '0.0.0.0' }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    app.close().finally(() => process.exit(0));
  });
}
