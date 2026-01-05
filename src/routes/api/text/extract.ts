import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { extractBodyText, TextExtractionOptions } from '../../../services/textExtractor.service.js';
import { textExtractSchema } from '../../../schemas/text.schema.js';
import {
  textAttemptsCounter,
  textSuccessesCounter,
  textFailuresCounter,
  textDurationHistogram,
} from '../../../plugins/metrics.js';

interface TextExtractBody {
  html: string;
  options?: TextExtractionOptions;
}

export default async function textExtractRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: TextExtractBody }>(
    '/api/text/extract',
    { schema: textExtractSchema },
    async (request: FastifyRequest<{ Body: TextExtractBody }>, reply: FastifyReply) => {
      textAttemptsCounter.inc();
      const startTime = Date.now();

      try {
        const { html, options } = request.body;

        const textData = extractBodyText(html, options);

        const processingTime = Date.now() - startTime;
        const durationSeconds = processingTime / 1000;

        textSuccessesCounter.inc();
        textDurationHistogram.observe(durationSeconds);

        return reply.status(200).send({
          success: true,
          data: textData,
          processingTime,
        });
      } catch (error: any) {
        request.log.error({ error }, 'Text extraction failed');

        const processingTime = Date.now() - startTime;
        const durationSeconds = processingTime / 1000;

        textFailuresCounter.inc();
        textDurationHistogram.observe(durationSeconds);

        const statusCode = error.statusCode || 422;
        const message = error.message || 'Failed to extract text from HTML';

        return reply.status(statusCode).send({
          success: false,
          error: 'TextExtractionError',
          message,
        });
      }
    }
  );
}
