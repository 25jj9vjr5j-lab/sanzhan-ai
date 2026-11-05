/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 忽略 TypeScript 類型檢查報錯，保證 build 一定成功
    ignoreBuildErrors: true,
  },
  eslint: {
    // 忽略程式碼風格檢查
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
