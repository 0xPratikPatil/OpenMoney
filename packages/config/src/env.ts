/**
 * Typed environment variable reader with defaults and required checks.
 * Uses Bun.env natively, falls back to process.env for Node compat.
 */

export interface Env {
  // Core
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_URL: string;
  REDIS_URL: string;

  // API Gateway
  PORT: number;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;

  // OAuth
  GITHUB_ID?: string;
  GITHUB_SECRET?: string;
  GOOGLE_ID?: string;
  GOOGLE_SECRET?: string;

  // Frontend
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_WS_URL: string;

  // Ingestion
  YFINANCE_ENABLED: boolean;
  YFINANCE_RATE_LIMIT_MS: number;
  POLYGON_API_KEY?: string;
  ALPHA_VANTAGE_API_KEY?: string;

  // Quant
  QUANT_PYTHON_URL: string;

  // Notification
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  FROM_EMAIL?: string;

  // Monitoring
  SENTRY_DSN?: string;
  OTEL_EXPORTER_OTLP_ENDPOINT?: string;
}

interface EnvField {
  required?: boolean;
  default?: string;
  description?: string;
}

type EnvSchema = Record<keyof Env, EnvField>;

const envSchema: EnvSchema = {
  NODE_ENV: { required: true, default: 'development' },
  DATABASE_URL: { required: true, default: 'postgres://postgres:postgres@localhost:5432/openmoney' },
  REDIS_URL: { required: true, default: 'redis://localhost:6379' },
  PORT: { required: false, default: '4000' },
  BETTER_AUTH_SECRET: { required: true, default: '' },
  BETTER_AUTH_URL: { required: true, default: 'http://localhost:4000' },
  GITHUB_ID: { required: false },
  GITHUB_SECRET: { required: false },
  GOOGLE_ID: { required: false },
  GOOGLE_SECRET: { required: false },
  NEXT_PUBLIC_API_URL: { required: false, default: 'http://localhost:4000' },
  NEXT_PUBLIC_WS_URL: { required: false, default: 'ws://localhost:4000' },
  YFINANCE_ENABLED: { required: false, default: 'true' },
  YFINANCE_RATE_LIMIT_MS: { required: false, default: '2000' },
  POLYGON_API_KEY: { required: false },
  ALPHA_VANTAGE_API_KEY: { required: false },
  QUANT_PYTHON_URL: { required: false, default: 'http://localhost:5000' },
  SMTP_HOST: { required: false },
  SMTP_PORT: { required: false },
  SMTP_USER: { required: false },
  SMTP_PASS: { required: false },
  FROM_EMAIL: { required: false },
  SENTRY_DSN: { required: false },
  OTEL_EXPORTER_OTLP_ENDPOINT: { required: false },
};

function getEnvSource(): Record<string, string | undefined> {
  // Bun has Bun.env, Node has process.env
  try {
    if (typeof Bun !== 'undefined' && Bun.env) {
      return Bun.env as Record<string, string | undefined>;
    }
  } catch {
    // Bun not available, fall through to process.env
  }
  return process.env as Record<string, string | undefined>;
}

function parseValue(value: string, key: keyof Env): Env[keyof Env] {
  const schema = envSchema[key];
  if (!schema) return value as Env[keyof Env];

  // Try to detect type from the default value
  const defaultStr = schema.default;
  if (defaultStr === 'true' || defaultStr === 'false') {
    return (value === 'true') as Env[keyof Env];
  }
  if (/^\d+$/.test(value) && defaultStr && /^\d+$/.test(defaultStr)) {
    return Number(value) as Env[keyof Env];
  }
  return value as Env[keyof Env];
}

function loadEnv(): Env {
  const source = getEnvSource();
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(envSchema) as (keyof Env)[]) {
    const schema = envSchema[key];
    const rawValue = source[key as string] ?? schema.default ?? '';

    if (!rawValue && schema.required) {
      // In development, warn instead of throwing for missing required vars
      if (source['NODE_ENV'] === 'production') {
        throw new Error(`Missing required environment variable: ${key}`);
      }
      console.warn(`[config] Warning: Missing required env var: ${key}. Using empty string.`);
    }

    result[key as string] = parseValue(rawValue, key);
  }

  return result as unknown as Env;
}

export const env = loadEnv();
