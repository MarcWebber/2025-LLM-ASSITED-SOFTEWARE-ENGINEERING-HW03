/** @type {import('next').NextConfig} */
const nextConfig = {
    // --- 关键添加 ---
    // 这会创建一个 .next/standalone 文件夹，
    // 里面包含了运行应用所需的最少文件 (包括 server.js 和 node_modules)。
    output: 'standalone',
    // -----------------

    reactStrictMode: false,
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;