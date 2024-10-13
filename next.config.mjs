/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/firebase-auth-sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Security-Policy',
            // Allow the Firebase SDK to communicate with Firebase Auth
            value: "default-src 'self' *.googleapis.com; script-src 'self'",
          },
        ],
      },
    ]
  },
  webpack: (config) => {
    config.module.rules.push(
      {
        test: /\.md$/,
        loader: 'frontmatter-markdown-loader',
        options: { mode: ['react-component'] }
      }
    )
    return config
  },
  redirects: () => {
    return [
      {
        source: '/admin',
        destination: '/admin/index.html',
        permanent: true,
      },
    ]
  },
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
