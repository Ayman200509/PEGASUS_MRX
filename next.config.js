/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'pegasus1337.store',
            },
            {
                protocol: 'https',
                hostname: 'localhost',
            },
        ],
    },
    output: "standalone",
    serverExternalPackages: ['unzipper', '@aws-sdk/client-s3'],
    experimental: {
        serverComponentsExternalPackages: ['unzipper', '@aws-sdk/client-s3'],
    },
};

module.exports = nextConfig;
