import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ENV } from '../config/environment.js';

export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: ENV.NODE_ENV,
    });
  });
}
