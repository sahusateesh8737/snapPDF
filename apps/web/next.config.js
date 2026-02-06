/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/ui"],
    webpack: (config) => {
        config.externals = [...config.externals, "pg-native"];
        config.resolve.alias.canvas = false;
        return config;
    },
};

module.exports = nextConfig;
