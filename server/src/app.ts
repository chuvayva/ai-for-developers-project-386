import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import { registerErrorHandling } from './errors.ts';
import eventTypeRoutes from './routes/event-types.ts';
import healthRoutes from './routes/health.ts';
import { createStore } from './store.ts';

export function build(opts: FastifyServerOptions = {}): FastifyInstance {
  const app = Fastify({
    ...opts,
    // The contract's types are exact: the string "30" is not a duration.
    ajv: { customOptions: { coerceTypes: false } },
  });

  registerErrorHandling(app);

  // One store for each app, so every `build()` starts empty.
  const store = createStore();

  app.register(healthRoutes, { prefix: '/api' });
  app.register(eventTypeRoutes, { prefix: '/api', store });

  return app;
}
