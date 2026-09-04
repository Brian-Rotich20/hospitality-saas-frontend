/** @type {import('next').NextConfig} */
// Browser API calls stay on this origin and are proxied by the rewrite below.
// This avoids CORS and preserves frontend session cookies.
const backendUrl = (
  process.env.BACKEND_URL ||
  'https://hospitality-saas-platform.onrender.com'
).replace(/\/+$/, '');

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com'    },
      { protocol: 'https', hostname: '*.cloudinary.com'      },
      { protocol: 'https', hostname: 'images.unsplash.com'   },
    ],
    formats:     ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes:  [16, 32, 48, 64, 96, 128, 256, 384],
  },

  async rewrites() {
    return [
      {
        source:      '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/api/:path*',  // ✅ fixed — was missing leading slash
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff'      },
          { key: 'X-Frame-Options',        value: 'SAMEORIGIN'   },
          { key: 'X-XSS-Protection',       value: '1; mode=block'},
        ],
      },
    ];
  },
};

module.exports = nextConfig;
