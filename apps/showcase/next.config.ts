import type { NextConfig } from 'next';
import path from 'path';

const uiSrc = path.resolve(__dirname, '../../packages/openmoney-ui/src');

const nextConfig: NextConfig = {
  transpilePackages: ['@openmoney/ui'],
  webpack: (config) => {
    config.resolve.alias['@/components'] = path.join(uiSrc, 'components');
    config.resolve.alias['@/hooks'] = path.join(uiSrc, 'hooks');
    config.resolve.alias['@/tokens'] = path.join(uiSrc, 'tokens');
    config.resolve.alias['@/lib'] = path.join(uiSrc, 'lib');
    return config;
  },
};

export default nextConfig;
