/** @type {import('next').NextConfig} */
const nextConfig = {
  /* cPanel serves this over Apache with no Node runtime, so the whole site is
     rendered at build time and shipped as files. */
  output: "export",
  /* next/image optimisation needs a server; the markup uses plain <img> with
     explicit width/height, exactly as the original page did. */
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
