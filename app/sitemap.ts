/**
 * Sitemap Generator
 * Automatically generates sitemap.xml for SEO
 */

import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://swift-triage-realistic-it-support-t.vercel.app';
  const currentDate = new Date();

  return [
    // Homepage
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // Login Page
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Submit Ticket Page
    {
      url: `${baseUrl}/submit`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // Knowledge Base
    {
      url: `${baseUrl}/knowledge`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // Community
    {
      url: `${baseUrl}/community`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.6,
    },
    // Wiki
    {
      url: `${baseUrl}/wiki`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    // Dashboard (public info page, not the actual dashboard)
    {
      url: `${baseUrl}/dashboard-demo`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // Add more static pages here as they are created
    // {
    //   url: `${baseUrl}/features`,
    //   lastModified: currentDate,
    //   changeFrequency: 'monthly',
    //   priority: 0.8,
    // },
    // {
    //   url: `${baseUrl}/pricing`,
    //   lastModified: currentDate,
    //   changeFrequency: 'monthly',
    //   priority: 0.8,
    // },
    // {
    //   url: `${baseUrl}/about`,
    //   lastModified: currentDate,
    //   changeFrequency: 'monthly',
    //   priority: 0.6,
    // },
    // {
    //   url: `${baseUrl}/contact`,
    //   lastModified: currentDate,
    //   changeFrequency: 'monthly',
    //   priority: 0.7,
    // },
    // Blog posts (if applicable)
    // {
    //   url: `${baseUrl}/blog`,
    //   lastModified: currentDate,
    //   changeFrequency: 'weekly',
    //   priority: 0.7,
    // },
  ];
}
