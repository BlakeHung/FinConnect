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
    domains: ['uploadthing.com', 'utfs.io'],
  },
  experimental: {
    // 在 Next.js 14+ 中，serverActions 已經是預設功能
    // 所以我們可以完全移除這個設定
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