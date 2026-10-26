import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: `next build` writes plain files to ./out (hosted on Cloudflare).
  // Switch to "standalone" once the private side needs a real server (docs/HOSTING.md).
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
  // Dev only: lets a phone on the home Wi-Fi load the dev server at this PC's LAN address.
  allowedDevOrigins: ["192.168.178.20"],
  images: {
    // The image optimizer needs a server; with a static export images are served as-is.
    unoptimized: true,
  },
};

export default nextConfig;
