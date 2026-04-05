/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["svix"],
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      // Supabase storage (user uploads, community media, event covers)
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      // Clerk hosted profile images
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
    ],
  },
};

export default nextConfig;
