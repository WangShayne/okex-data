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
}

module.exports = nextConfig 