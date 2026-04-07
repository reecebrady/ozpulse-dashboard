import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ozpulse/shared-types", "@ozpulse/data-fetchers"],
};

export default nextConfig;
