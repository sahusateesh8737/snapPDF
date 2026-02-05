/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/ui"],
    webpack: (config) => {
        config.externals = [...config.externals, "pg-native"];
        return config;
    },
};

module.exports = nextConfig;
