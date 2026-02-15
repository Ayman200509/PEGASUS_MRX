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
};

module.exports = nextConfig;
