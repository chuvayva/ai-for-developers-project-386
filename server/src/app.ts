import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import healthRoutes from './routes/health.ts';

export function build(opts: FastifyServerOptions = {}): FastifyInstance {
  const app = Fastify(opts);

  app.register(healthRoutes, { prefix: '/api' });

  return app;
}
