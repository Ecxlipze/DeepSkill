const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://deepskills.pk';

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ['/admin/*', '/admin/blog/*', '/student/*', '/teacher/*', '/api/*', '/login', '/profile', '/server-sitemap.xml'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/blog', '/student', '/teacher', '/api', '/login', '/profile']
      }
    ]
  }
};
