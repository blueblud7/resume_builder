/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    serverComponentsExternalPackages: ['pdfjs-dist'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'canvas': 'commonjs canvas',
        'pdfjs-dist/legacy/build/pdf.js': 'commonjs pdfjs-dist/legacy/build/pdf.js',
      });
    }
    return config;
  },
};

module.exports = nextConfig;
