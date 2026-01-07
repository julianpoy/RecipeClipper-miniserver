import workerpool, { type Pool } from 'workerpool';
import { cpus } from 'os';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ENV } from '../config/environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let pool: Pool | null = null;

export function getWorkerPool(): Pool {
  if (!pool) {
    const workerPath = join(__dirname, '../workers/jsdom.worker.js');

    pool = workerpool.pool(workerPath, {
      minWorkers: ENV.WORKER_POOL_MIN_WORKERS,
      maxWorkers: ENV.WORKER_POOL_MAX_WORKERS || cpus().length,
      workerType: 'auto',
    });
  }

  return pool;
}

export function getPoolStats() {
  if (!pool) {
    return {
      totalWorkers: 0,
      busyWorkers: 0,
      idleWorkers: 0,
      pendingTasks: 0,
      activeTasks: 0,
    };
  }

  const stats = pool.stats();
  return {
    totalWorkers: stats.totalWorkers,
    busyWorkers: stats.busyWorkers,
    idleWorkers: stats.idleWorkers,
    pendingTasks: stats.pendingTasks,
    activeTasks: stats.activeTasks,
  };
}

export async function terminateWorkerPool(): Promise<void> {
  if (pool) {
    await pool.terminate();
    pool = null;
  }
}
