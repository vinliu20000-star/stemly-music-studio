import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  output: isGitHubPages ? 'export' : undefined,
  assetPrefix: isGitHubPages ? '/stemly-music-studio/' : '',
  images: { unoptimized: true },
};

export default nextConfig;
