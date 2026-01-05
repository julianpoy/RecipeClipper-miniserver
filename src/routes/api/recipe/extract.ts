import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { extractRecipe, RecipeExtractionOptions } from '../../../services/recipeClipper.service.js';
import { recipeExtractSchema } from '../../../schemas/recipe.schema.js';
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
      const startTime = Date.now();

      try {
        const { html, options } = request.body;

        const recipeData = await extractRecipe(html, options);

        const processingTime = Date.now() - startTime;
        const durationSeconds = processingTime / 1000;

        recipeSuccessesCounter.inc();
        recipeDurationHistogram.observe(durationSeconds);

        return reply.status(200).send({
          success: true,
          data: recipeData,
          processingTime,
        });
      } catch (error: any) {
        request.log.error({ error }, 'Recipe extraction failed');

        const processingTime = Date.now() - startTime;
        const durationSeconds = processingTime / 1000;

        recipeFailuresCounter.inc();
        recipeDurationHistogram.observe(durationSeconds);

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
