/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['localhost'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'openweathermap.org' }
    ],
    minimumCacheTTL: 31536000,        // 1 any — les imatges són immutables (UUID)
    deviceSizes: [480, 640, 960],     // Breakpoints reals de l'app (max-w-[480px])
    imageSizes: [128, 256],           // Thumbnails (112px) i grid (~240px)
  }
};

export default nextConfig;
