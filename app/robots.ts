import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://swift-triage-realistic-it-support-t.vercel.app';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/submit', '/knowledge', '/community', '/wiki'],
        disallow: ['/dashboard', '/dashboard/', '/api/', '/login', '/admin', '/users', '/groups', '/reports', '/insights'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
