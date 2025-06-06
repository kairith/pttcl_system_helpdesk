/** @type {import('next').NextConfig} */
const nextConfig = {
  serverActions: {
    bodySizeLimit: '5mb', // Allow up to 5 MB for Server Actions
  },
  api: {
    bodyParser: {
      sizeLimit: '5mb', // Allow up to 5 MB for API routes
    },
  },
};

export default nextConfig;