const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['localhost:9002'],
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'storage.googleapis.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn2.fptshop.com.vn', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.fptshop.com.vn', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.googleapis.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.amazonaws.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.cloudfront.net', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.imgur.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.githubusercontent.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.cdnjs.cloudflare.com', port: '', pathname: '/**' },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;


