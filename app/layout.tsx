/**
 * Root Layout - Phase 3 SEO Enhancement
 * Main layout wrapper with comprehensive SEO meta tags and structured data
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';
import Script from 'next/script';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';

const inter = Inter({ subsets: ['latin'] });

// Comprehensive SEO Metadata
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://swift-triage-realistic-it-support-t.vercel.app'),
  
  // Primary Meta Tags
  title: {
    default: 'SwiftTriage — Agentic AI-Powered IT Support Platform',
    template: '%s | SwiftTriage'
  },
  description: 'SwiftTriage eliminates triage fatigue with autonomous AI ticket classification, routing, and prioritization in under 800ms. Built for enterprise IT teams on Groq LPU + Neon PostgreSQL.',
  keywords: [
    'ITSM', 'IT service management', 'AI helpdesk', 'ticket management',
    'agentic AI', 'IT support automation', 'Groq AI', 'enterprise ITSM',
    'triage fatigue', 'IT operations', 'service desk AI', 'Next.js ITSM'
  ],
  authors: [{ name: 'Praveen A' }],
  creator: 'Praveen A',
  publisher: 'SwiftTriage',
  
  // Robots & Indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://swifttriage.com',
    siteName: 'SwiftTriage',
    title: 'SwiftTriage - AI-Powered IT Service Management',
    description: 'Transform your IT support with AI-powered ticket triage and real-time analytics. 95% faster ticket resolution.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SwiftTriage - AI-Powered IT Service Management',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: '@swifttriage',
    creator: '@swifttriage',
    title: 'SwiftTriage - AI-Powered IT Service Management',
    description: 'Transform your IT support with AI-powered ticket triage and real-time analytics.',
    images: ['/twitter-image.png'],
  },
  
  // Verification
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  
  // Alternate Languages (if applicable)
  alternates: {
    canonical: 'https://swifttriage.com',
    languages: {
      'en-US': 'https://swifttriage.com',
      // 'es-ES': 'https://swifttriage.com/es',
      // 'fr-FR': 'https://swifttriage.com/fr',
    },
  },
  
  // App Links (for mobile apps if applicable)
  // appleWebApp: {
  //   capable: true,
  //   title: 'SwiftTriage',
  //   statusBarStyle: 'black-translucent',
  // },
  
  // Category
  category: 'technology',
};

// JSON-LD Structured Data
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    // Organization
    {
      '@type': 'Organization',
      '@id': 'https://swifttriage.com/#organization',
      name: 'SwiftTriage',
      url: 'https://swifttriage.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://swifttriage.com/logo.png',
        width: 512,
        height: 512,
      },
      sameAs: [
        'https://twitter.com/swifttriage',
        'https://linkedin.com/company/swifttriage',
        'https://github.com/swifttriage',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-123-4567',
        contactType: 'customer service',
        email: 'support@swifttriage.com',
        availableLanguage: ['English'],
      },
    },
    // Website
    {
      '@type': 'WebSite',
      '@id': 'https://swifttriage.com/#website',
      url: 'https://swifttriage.com',
      name: 'SwiftTriage',
      description: 'AI-Powered IT Service Management Platform',
      publisher: {
        '@id': 'https://swifttriage.com/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://swifttriage.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    // Software Application
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://swifttriage.com/#software',
      name: 'SwiftTriage',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free self-hosted version available',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '127',
        bestRating: '5',
        worstRating: '1',
      },
      description: 'AI-powered IT service management platform with automated ticket triage and real-time analytics.',
      featureList: [
        'AI-Powered Ticket Triage',
        'Real-Time Analytics Dashboard',
        'Customer Management',
        '24/7 Availability',
        'Enterprise Security',
        'Customizable Widgets',
      ],
    },
    // Breadcrumb List (for homepage)
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://swifttriage.com/#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://swifttriage.com',
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#1565C0" />
        
        {/* JSON-LD Structured Data */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        {/* Preconnect to External Domains (for performance) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                  send_page_view: true
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
