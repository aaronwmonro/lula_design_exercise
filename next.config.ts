import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.circlek.com",
        pathname: "/themes/custom/circlek/images/special-page/history-and-timeline/**",
      },
      {
        protocol: "https",
        hostname: "1000logos.net",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
