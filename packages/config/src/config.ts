import { env } from './env';

export interface AppConfig {
  app: {
    name: string;
    version: string;
    nodeEnv: string;
    isDev: boolean;
    isProd: boolean;
  };
  database: {
    url: string;
  };
  redis: {
    url: string;
  };
  api: {
    port: number;
    betterAuthSecret: string;
    betterAuthUrl: string;
    corsOrigins: string[];
  };
  auth: {
    github: { clientId: string; clientSecret: string } | null;
    google: { clientId: string; clientSecret: string } | null;
  };
  ingestion: {
    yfinanceEnabled: boolean;
    yfinanceRateLimitMs: number;
    polygonApiKey: string | null;
    alphaVantageApiKey: string | null;
  };
  quant: {
    pythonUrl: string;
  };
  notification: {
    smtp: { host: string; port: number; user: string; pass: string } | null;
    fromEmail: string | null;
  };
  monitoring: {
    sentryDsn: string | null;
    otelEndpoint: string | null;
  };
}

export const config: AppConfig = {
  app: {
    name: 'OpenMoney',
    version: '0.1.0',
    nodeEnv: env.NODE_ENV,
    isDev: env.NODE_ENV === 'development',
    isProd: env.NODE_ENV === 'production',
  },
  database: {
    url: env.DATABASE_URL,
  },
  redis: {
    url: env.REDIS_URL,
  },
  api: {
    port: env.PORT,
    betterAuthSecret: env.BETTER_AUTH_SECRET,
    betterAuthUrl: env.BETTER_AUTH_URL,
    corsOrigins: ['http://localhost:3000', 'http://localhost:3001'],
  },
  auth: {
    github:
      env.GITHUB_ID && env.GITHUB_SECRET
        ? { clientId: env.GITHUB_ID, clientSecret: env.GITHUB_SECRET }
        : null,
    google:
      env.GOOGLE_ID && env.GOOGLE_SECRET
        ? { clientId: env.GOOGLE_ID, clientSecret: env.GOOGLE_SECRET }
        : null,
  },
  ingestion: {
    yfinanceEnabled: env.YFINANCE_ENABLED,
    yfinanceRateLimitMs: env.YFINANCE_RATE_LIMIT_MS,
    polygonApiKey: env.POLYGON_API_KEY ?? null,
    alphaVantageApiKey: env.ALPHA_VANTAGE_API_KEY ?? null,
  },
  quant: {
    pythonUrl: env.QUANT_PYTHON_URL,
  },
  notification: {
    smtp:
      env.SMTP_HOST && env.SMTP_PORT
        ? {
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            user: env.SMTP_USER ?? '',
            pass: env.SMTP_PASS ?? '',
          }
        : null,
    fromEmail: env.FROM_EMAIL ?? null,
  },
  monitoring: {
    sentryDsn: env.SENTRY_DSN ?? null,
    otelEndpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT ?? null,
  },
};
