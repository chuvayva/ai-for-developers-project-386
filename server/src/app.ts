import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import { registerErrorHandling } from './errors.ts';
import eventTypeRoutes from './routes/event-types.ts';
import healthRoutes from './routes/health.ts';
import slotRoutes from './routes/slots.ts';
import { createStore } from './store.ts';

/** Reads the current moment. */
export type Clock = () => Date;

export type AppOptions = FastifyServerOptions & {
  /** The clock of the app. Tests set it. The default is the system clock. */
  now?: Clock;
};

export function build(opts: AppOptions = {}): FastifyInstance {
  const { now = () => new Date(), ...fastifyOptions } = opts;

  const app = Fastify({
    ...fastifyOptions,
    // The contract's types are exact: the string "30" is not a duration.
    ajv: { customOptions: { coerceTypes: false } },
  });

  registerErrorHandling(app);

  // One store for each app, so every `build()` starts empty.
  const store = createStore();

  app.register(healthRoutes, { prefix: '/api' });
  app.register(eventTypeRoutes, { prefix: '/api', store });
  app.register(slotRoutes, { prefix: '/api', store, now });

  return app;
}
