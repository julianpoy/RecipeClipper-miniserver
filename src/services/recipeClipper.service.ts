import { getWorkerPool } from './workerPool.service.js';
import type { RecipeData, RecipeExtractionOptions } from '../workers/jsdom.worker.js';

export async function extractRecipe(
  html: string,
  options?: RecipeExtractionOptions
): Promise<RecipeData> {
  const pool = getWorkerPool();

  const result = await pool.exec('extractRecipeWorker', [html, options]);
  return result as RecipeData;
}
