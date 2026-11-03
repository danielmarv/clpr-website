import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The plumbing explainer is a static Astro build in public/plumbing/. Its pages link to each
  // other with relative URLs (developers/ and ../), so the general page must be served AT
  // /plumbing/ with the trailing slash. trailingSlash: true makes Next redirect /plumbing to
  // /plumbing/ (and /plumbing/developers to /plumbing/developers/); the rewrites then serve the
  // static index.html files at those directory URLs.
  trailingSlash: true,
  // The governance page shows the members' GitHub avatars, optimized on the server.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com", pathname: "/**" }],
  },
  async rewrites() {
    return [
      { source: "/plumbing/", destination: "/plumbing/index.html" },
      { source: "/plumbing/developers/", destination: "/plumbing/developers/index.html" },
    ];
  },
};

export default nextConfig;
