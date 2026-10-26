import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
  // Dev only: lets a phone on the home Wi-Fi load the dev server at this PC's LAN address.
  allowedDevOrigins: ["192.168.178.20"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
