import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@openmoney/shared', '@openmoney/config'],
  serverExternalPackages: ['better-auth'],
};

export default nextConfig;
