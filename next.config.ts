import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack to this package's directory so it doesn't pick up the
  // parent workspace's package-lock.json and infer the wrong root.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
