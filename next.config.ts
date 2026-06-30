import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 알라딘 표지는 외부 썸네일이라 별도 최적화가 불필요하고,
    // NAT64/DNS64 환경에서 최적화기가 표지 호스트를 사설 IP로 오인해 차단하는 문제를 피한다.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.aladin.co.kr",
      },
    ],
  },
};

export default nextConfig;
