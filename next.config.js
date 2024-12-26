/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.okx.com',
                pathname: '/cdn/oksupport/asset/currency/icon/**',
            },
        ],
    },
    typescript: {
        // 在生产构建时忽略类型检查错误
        ignoreBuildErrors: true,
    },
    experimental: {
        trace: false
    }
}

module.exports = nextConfig 