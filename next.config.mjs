/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', '@prisma/client'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve Node.js modules on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bcryptjs: false,
        '@prisma/client': false,
        crypto: false,
        stream: false,
        buffer: false,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
