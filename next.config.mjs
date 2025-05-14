/** @type {import('next').NextConfig} */
const nextConfig = {
  // export settings for GitHub Pages
  output: "export",
  basePath: "/jarvis",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
