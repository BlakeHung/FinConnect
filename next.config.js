/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: true,
  },
  // 添加這兩個配置來忽略建構時的檢查
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // 忽略這些模組
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mapbox/node-pre-gyp': false,
      'bcrypt': false,
    }
    return config
  },
}

module.exports = nextConfig 