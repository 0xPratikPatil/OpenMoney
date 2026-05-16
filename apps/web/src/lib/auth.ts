import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { prisma } from '@openmoney/database';
import { config } from '@openmoney/config';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disabled until SMTP is configured
    autoSignIn: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      // TODO: Replace with real email provider (Resend, Postmark, etc.)
      console.log(`[DEV] Verification email for ${user.email}: ${url}`);
    },
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
      maxAge: 60 * 60 * 24,
    },
  },
  user: {
    changeEmail: { enabled: true },
    deleteUser: { enabled: true },
  },
  rateLimit: {
    window: 60,
    max: 100,
  },
  plugins: [nextCookies()],
});
