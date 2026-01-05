import { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';

export default async function helmetPlugin(fastify: FastifyInstance) {
  await fastify.register(helmet, {
    global: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });
}
