import { config } from '@openmoney/config';
import { prisma } from '@openmoney/database';
import { YFinanceAdapter } from './adapters/yfinance';
import { Pipeline } from './pipeline';

console.log(`[ingestion] Starting OpenMoney ingestion pipeline...`);
console.log(`[ingestion] NODE_ENV=${config.app.nodeEnv}`);
console.log(`[ingestion] yfinance enabled: ${config.ingestion.yfinanceEnabled}`);

const pipeline = new Pipeline();

async function startAdapters() {
  if (config.ingestion.yfinanceEnabled) {
    const yf = new YFinanceAdapter({
      rateLimitMs: config.ingestion.yfinanceRateLimitMs,
    });
    pipeline.registerAdapter('yfinance', yf);
    console.log('[ingestion] YFinance adapter registered');
  }

  // Start processing loop
  await pipeline.start();
}

startAdapters().catch((err) => {
  console.error('[ingestion] Fatal error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[ingestion] Shutting down...');
  await pipeline.stop();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[ingestion] Shutting down...');
  await pipeline.stop();
  await prisma.$disconnect();
  process.exit(0);
});
