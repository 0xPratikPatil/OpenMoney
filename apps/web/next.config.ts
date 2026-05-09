import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@openmoney/shared',
    '@openmoney/config',
    '@openmoney/database',
    '@openmoney/ui',
  ],
  serverExternalPackages: ['better-auth'],
  webpack: (config) => {
    const uiSrc = path.resolve(__dirname, '../../packages/openmoney-ui/src');
    const webSrc = path.resolve(__dirname, 'src');

    // @openmoney/ui uses @/ path aliases for internal shadcn components
    config.resolve.alias['@'] = uiSrc;

    // Web app's own @/lib imports
    config.resolve.alias['@/lib/api'] = path.resolve(webSrc, 'lib/api');
    config.resolve.alias['@/lib/auth-client'] = path.resolve(webSrc, 'lib/auth-client');
    config.resolve.alias['@/lib/auth'] = path.resolve(webSrc, 'lib/auth');
    config.resolve.alias['@/lib/utils'] = path.resolve(webSrc, 'lib/utils');

    return config;
  },
};

export default nextConfig;
