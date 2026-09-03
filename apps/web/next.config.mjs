/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@treasury/agent", "@treasury/data"],
};

export default nextConfig;
