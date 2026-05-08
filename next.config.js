const path = require('path');

const supabaseHost = (() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  try {
    return supabaseUrl ? new URL(supabaseUrl).hostname : '';
  } catch {
    return '';
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['react-router-dom'],
  compiler: {
    styledComponents: true
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
  },
  images: {
    disableStaticImages: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      ...(supabaseHost
        ? [
            {
              protocol: 'https',
              hostname: supabaseHost
            }
          ]
        : [])
    ]
  },
  webpack(config) {
    config.resolve.alias['react-router-dom'] = path.resolve(__dirname, 'lib/nextRouterDomCompat.js');
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]'
      }
    });
    config.module.rules.push({
      test: /\.(woff2?|eot|ttf|otf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/fonts/[name].[hash][ext]'
      }
    });
    return config;
  },
  async redirects() {
    return [
      {
        source: '/full-stack-react',
        destination: '/courses/full-stack-react',
        permanent: true
      },
      {
        source: '/laravel-mastery',
        destination: '/courses/laravel-mastery',
        permanent: true
      },
      {
        source: '/wordpress-mastery',
        destination: '/courses/wordpress-mastery',
        permanent: true
      },
      {
        source: '/graphic-design',
        destination: '/courses/graphic-design',
        permanent: true
      },
      {
        source: '/blog',
        destination: '/blogs',
        permanent: true
      },
      {
        source: '/blog/:slug',
        destination: '/blogs/:slug',
        permanent: true
      }
    ];
  }
};

module.exports = nextConfig;
