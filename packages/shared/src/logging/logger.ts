/**
 * Global Logging System — OpenMoney
 *
 * Enterprise-grade structured logger with:
 *  - Severity levels (trace, debug, info, warn, error, critical)
 *  - Structured metadata (requestId, provider, model, duration, userId)
 *  - Pluggable transports (console, file, HTTP/webhook)
 *  - Context-aware logging (automatically carries request IDs)
 *  - Frontend-safe (no Node.js specific imports)
 *
 * Usage:
 *   import { logger } from '@openmoney/shared';
 *   logger.info('Quote fetched', { symbol: 'AAPL', provider: 'yfinance', price: 304.99 });
 */

import type { LogLevel, LogEntry, LogTransport } from "./types";
import { ConsoleTransport } from "./transports";

const LEVEL_ORDER: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  critical: 5,
};

let _minLevel: LogLevel = "info";
let _transports: LogTransport[] = [new ConsoleTransport()];
let _globalMeta: Record<string, unknown> = {};

/** Application name injected at startup */
let _appName = "openmoney";

/* -------------------------------------------------------------------------- */
/*  Public API                                                                 */
/* -------------------------------------------------------------------------- */

export function configureLogger(opts: {
  level?: LogLevel;
  transports?: LogTransport[];
  appName?: string;
  meta?: Record<string, unknown>;
}): void {
  if (opts.level) _minLevel = opts.level;
  if (opts.transports) _transports = opts.transports;
  if (opts.appName) _appName = opts.appName;
  if (opts.meta) _globalMeta = { ..._globalMeta, ...opts.meta };
}

export function addTransport(transport: LogTransport): void {
  _transports.push(transport);
}

export function setGlobalMeta(meta: Record<string, unknown>): void {
  _globalMeta = { ..._globalMeta, ...meta };
}

/** Create a child logger with additional default metadata */
export function childLogger(meta: Record<string, unknown>): LoggerInstance {
  return createLoggerInstance(meta);
}

/* -------------------------------------------------------------------------- */
/*  Logger instance (fluent + level-gated)                                     */
/* -------------------------------------------------------------------------- */

export interface LoggerInstance {
  trace(msg: string, meta?: Record<string, unknown>): void;
  debug(msg: string, meta?: Record<string, unknown>): void;
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
  critical(msg: string, meta?: Record<string, unknown>): void;
  /** Log with an explicit level */
  log(level: LogLevel, msg: string, meta?: Record<string, unknown>): void;
}

function createLoggerInstance(defaultMeta?: Record<string, unknown>): LoggerInstance {
  const mergedMeta = { ..._globalMeta, ...defaultMeta };

  const doLog = (level: LogLevel, msg: string, meta?: Record<string, unknown>) => {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[_minLevel]) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      app: _appName,
      message: msg,
      meta: { ...mergedMeta, ...meta },
    };

    for (const transport of _transports) {
      try {
        transport.write(entry);
      } catch {
        // Transport failure must never crash the app
      }
    }
  };

  return {
    trace: (msg, meta) => doLog("trace", msg, meta),
    debug: (msg, meta) => doLog("debug", msg, meta),
    info: (msg, meta) => doLog("info", msg, meta),
    warn: (msg, meta) => doLog("warn", msg, meta),
    error: (msg, meta) => doLog("error", msg, meta),
    critical: (msg, meta) => doLog("critical", msg, meta),
    log: doLog,
  };
}

/** Root logger instance — use this directly or create a child */
export const logger: LoggerInstance = createLoggerInstance();

export type { LogLevel, LogEntry, LogTransport };
