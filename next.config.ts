import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
				protocol: "https",
				hostname: "res.cloudinary.com",
				pathname: "/dt9vr5lgf/**",
			},
			{
				protocol: "http",
				hostname: "res.cloudinary.com",
				pathname: "/dt9vr5lgf/**",
      },
      {
        protocol: "https",
				hostname: "images.pexels.com",
				pathname: "/photos/**",
			}
    ]
  }
};

export default nextConfig;
