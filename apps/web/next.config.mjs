/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@treasury/agent", "@treasury/data", "@treasury/ui-tokens", "@treasury/ui-web"],
};

export default nextConfig;
