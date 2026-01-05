import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { register } from '../plugins/metrics.js';

export default async function metricsRoutes(fastify: FastifyInstance) {
  fastify.get('/metrics', async (_request: FastifyRequest, reply: FastifyReply) => {
    const metrics = await register.metrics();
    reply.type('text/plain').send(metrics);
  });
}
