import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/setor-sampah",
        destination: "/dashboard/setor",
        permanent: false,
      },
      {
        source: "/setor",
        destination: "/dashboard/setor",
        permanent: false,
      },
      {
        source: "/dashboard/setor-sampah",
        destination: "/dashboard/setor",
        permanent: false,
      },
      {
        source: "/riwayat",
        destination: "/dashboard/riwayat",
        permanent: false,
      },
      {
        source: "/saldo",
        destination: "/dashboard/saldo",
        permanent: false,
      },
      {
        source: "/insight",
        destination: "/dashboard/insight",
        permanent: false,
      },
      {
        source: "/register",
        destination: "/daftar",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
