import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@openmoney/database';
import { config } from '@openmoney/config';

export const auth = betterAuth({
  baseURL: config.api.betterAuthUrl,
  secret: config.api.betterAuthSecret,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: true,
  },
  socialProviders: {
    ...(config.auth.github && {
      github: {
        clientId: config.auth.github.clientId,
        clientSecret: config.auth.github.clientSecret,
      },
    }),
    ...(config.auth.google && {
      google: {
        clientId: config.auth.google.clientId,
        clientSecret: config.auth.google.clientSecret,
      },
    }),
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // 1 day
    freshAge: 60 * 60,            // 1 hour
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // 1 day
    },
  },
  user: {
    changeEmail: {
      enabled: true,
    },
    deleteUser: {
      enabled: true,
    },
  },
  rateLimit: {
    window: 60, // 1 minute
    max: 100,   // 100 requests
  },
});
