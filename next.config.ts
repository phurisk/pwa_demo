import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: false, // Enable in dev for testing
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSerwist(nextConfig);
