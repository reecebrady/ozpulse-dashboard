import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ozpulse/ui", "@ozpulse/shared", "@ozpulse/map-engine"],
};

export default nextConfig;
