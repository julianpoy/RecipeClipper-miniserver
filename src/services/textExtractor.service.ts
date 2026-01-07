import { getWorkerPool } from './workerPool.service.js';
import type { TextData, TextExtractionOptions } from '../workers/jsdom.worker.js';

export async function extractBodyText(
  html: string,
  options?: TextExtractionOptions
): Promise<TextData> {
  const pool = getWorkerPool();

  const result = await pool.exec('extractTextWorker', [html, options]);
  return result as TextData;
}
