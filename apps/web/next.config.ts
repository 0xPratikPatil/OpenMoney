import type { NextConfig } from 'next';
import path from 'path';

const webSrc = path.resolve(__dirname, 'src');
const uiSrc = path.resolve(__dirname, '../../packages/openmoney-ui/src');

const nextConfig: NextConfig = {
  transpilePackages: [
    '@openmoney/shared',
    '@openmoney/config',
    '@openmoney/database',
    '@openmoney/ui',
  ],
  serverExternalPackages: ['better-auth'],
  webpack: (config) => {
    // Web app's @/lib/* and @/app/* → web/src (default)
    config.resolve.alias['@'] = webSrc;
    // openmoney-ui shadcn + domain components → packages/openmoney-ui/src
    config.resolve.alias['@/components'] = path.join(uiSrc, 'components');
    // openmoney-ui hooks + tokens
    config.resolve.alias['@/hooks'] = path.join(uiSrc, 'hooks');
    config.resolve.alias['@/tokens'] = path.join(uiSrc, 'tokens');

    return config;
  },
};

export default nextConfig;
