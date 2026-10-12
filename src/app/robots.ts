import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/charities', '/draws', '/winners', '/faq', '/terms', '/privacy', '/rules'],
        disallow: ['/admin/', '/api/', '/dashboard/', '/scores/', '/subscription/', '/profile/'],
      },
    ],
    sitemap: 'https://digitalheroes.app/sitemap.xml',
  };
}
