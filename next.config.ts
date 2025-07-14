/** @type {import('next').NextConfig} */

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',         // Access APIs via /api/
        destination: '/backend/api/:path*', // Serve from backend/api/
      },
      {
        source: '/pages/:path*',       // Access pages via /pages/
        destination: '/frontend/pages/:path*', // Serve from frontend/pages/ internally
      },
      {
        source: '/',                   // Redirect root to /pages/
        destination: '/pages',         // Serve the home page
      },
    ];
  },
  serverActions: {
    bodySizeLimit: '15mb',
  },
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

export default nextConfig;
