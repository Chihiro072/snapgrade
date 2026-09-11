/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  outputFileTracingIncludes: {
    "/api/worksheet": ["./public/fonts/NotoSansSC-VF.ttf"],
  },
}

export default nextConfig
