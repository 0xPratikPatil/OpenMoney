/**
 * TypeScript Quant Engine
 *
 * Orchestrates quant computations:
 * - Listens to Redis pub/sub for data update events
 * - Calls Python FastAPI microservice for heavy computations
 * - Implements lightweight logic in TypeScript
 * - Caches results in Redis
 * - Generates signals in PostgreSQL
 */

import { config } from '@openmoney/config';
import { prisma } from '@openmoney/database';
import { QuantClient } from './client';
import { SignalGenerator } from './signals';
// RiskService available for future risk metric computation use

console.log(`[quant-engine] Starting OpenMoney quant engine...`);
console.log(`[quant-engine] Python microservice: ${config.quant.pythonUrl}`);

const quantClient = new QuantClient(config.quant.pythonUrl);
const signalGenerator = new SignalGenerator(quantClient);

async function evaluateAllPortfolios() {
  console.log('[quant-engine] Evaluating all portfolios...');

  const portfolios = await prisma.portfolio.findMany({
    include: {
      positions: { where: { isOpen: true } },
    },
  });

  for (const portfolio of portfolios) {
    try {
      const signals = await signalGenerator.generateForPortfolio(portfolio);
      console.log(`[quant-engine] Portfolio ${portfolio.id}: ${signals.length} signals generated`);
    } catch (err) {
      console.error(`[quant-engine] Error evaluating portfolio ${portfolio.id}:`, err);
    }
  }
}

// Run on startup, then every 6 hours
await evaluateAllPortfolios();
setInterval(evaluateAllPortfolios, 6 * 60 * 60 * 1000);

// Graceful shutdown
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
