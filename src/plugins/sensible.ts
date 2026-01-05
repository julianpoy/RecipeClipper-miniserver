import { FastifyInstance } from 'fastify';
import sensible from '@fastify/sensible';

export default async function sensiblePlugin(fastify: FastifyInstance) {
  await fastify.register(sensible);
}
