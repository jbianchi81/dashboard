/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};
const moduleExports = {
  nextConfig,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "alerta.ina.gob.ar",
        port: "",
        pathname: "/ina/51-GEFS_WAVE/gefs_wave/gefs.wave.last.gif",
      },
    ],
  },
};

export default moduleExports;
