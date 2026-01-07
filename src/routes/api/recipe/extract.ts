import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { extractRecipe } from '../../../services/recipeClipper.service.js';
import { recipeExtractSchema } from '../../../schemas/recipe.schema.js';
import type { RecipeExtractionOptions } from '../../../workers/jsdom.worker.js';
import {
  recipeAttemptsCounter,
  recipeSuccessesCounter,
  recipeFailuresCounter,
  recipeDurationHistogram,
} from '../../../plugins/metrics.js';

interface RecipeExtractBody {
  html: string;
  options?: RecipeExtractionOptions;
}

export default async function recipeExtractRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: RecipeExtractBody }>(
    '/api/recipe/extract',
    { schema: recipeExtractSchema },
    async (request: FastifyRequest<{ Body: RecipeExtractBody }>, reply: FastifyReply) => {
      recipeAttemptsCounter.inc();
      const startTime = performance.now();

      try {
        const { html, options } = request.body;

        const recipeData = await extractRecipe(html, options);

        const time = performance.now() - startTime;
        const timeSeconds = time / 1000;

        recipeSuccessesCounter.inc();
        recipeDurationHistogram.observe(timeSeconds);

        return reply.status(200).send({
          success: true,
          data: recipeData,
          processingTime: time,
        });
      } catch (error: any) {
        request.log.error({ error }, 'Recipe extraction failed');

        const time = performance.now() - startTime;
        const timeSeconds = time / 1000;

        recipeFailuresCounter.inc();
        recipeDurationHistogram.observe(timeSeconds);

        const statusCode = error.statusCode || 422;
        const message = error.message || 'Failed to extract recipe from HTML';

        return reply.status(statusCode).send({
          success: false,
          error: 'RecipeExtractionError',
          message,
        });
      }
    }
  );
}
