import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { performance } from 'perf_hooks';
import { extractBodyText } from '../../../services/textExtractor.service.js';
import { textExtractSchema } from '../../../schemas/text.schema.js';
import {
  textAttemptsCounter,
  textSuccessesCounter,
  textFailuresCounter,
  textDurationHistogram,
} from '../../../plugins/metrics.js';
import type { TextExtractionOptions } from '../../../workers/jsdom.worker.js';

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
      const startTime = performance.now();

      try {
        const { html, options } = request.body;

        const textData = await extractBodyText(html, options);

        const time = performance.now() - startTime;
        const timeSeconds = time / 1000;

        textSuccessesCounter.inc();
        textDurationHistogram.observe(timeSeconds);

        return reply.status(200).send({
          success: true,
          data: textData,
          processingTime: time,
        });
      } catch (error: any) {
        request.log.error({ error }, 'Text extraction failed');

        const time = performance.now() - startTime;
        const timeSeconds = time / 1000;

        textFailuresCounter.inc();
        textDurationHistogram.observe(timeSeconds);

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
