import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import NavbarContainer from '@/components/NavbarContainer';
import Footer from '@/components/Footer';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import GoogleTagManager from '@/components/GoogleTagManager';

/** The production URL for devthread.site */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://devthread.site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "DevThread - Where engineers share what they've learned",
  description:
    'Practical threads from working engineers: backend, platform, and ML. No fluff, no hype — just hard-won knowledge you can apply today.',
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: '/devthread-icon.svg',
    shortcut: '/devthread-icon.svg',
    apple: '/devthread-icon.svg',
  },
  // JSON-LD structured data — helps Google surface the publication name, logo, and sitelinks
  openGraph: {
    title: 'DevThread',
    description:
      'Practical threads from working engineers: backend, platform, and ML. No fluff, no hype — just hard-won knowledge you can apply today.',
    type: 'website',
    siteName: 'DevThread',
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/devthread-logo.svg`,
        width: 320,
        height: 72,
        alt: 'DevThread',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevThread',
    description:
      'Practical threads from working engineers: backend, platform, and ML. No fluff, no hype — just hard-won knowledge you can apply today.',
    images: [`${SITE_URL}/devthread-logo.svg`],
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'DevThread',
      url: SITE_URL,
      logo: `${SITE_URL}/devthread-icon.svg`,
      sameAs: [],
      description:
        'Practical threads from working engineers: backend, platform, and ML. No fluff, no hype — just hard-won knowledge you can apply today.',
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,100..900&family=DM+Sans:opsz,wght@9..40,100..1000&family=JetBrains+Mono:opsz,wght@8..144,100..800&display=swap"
        />
        <GoogleTagManager />
      </head>
      <body>
        {process.env.NEXT_PUBLIC_GTM_ID &&
          process.env.NODE_ENV === 'production' && (
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/gtm.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
                title="Google Tag Manager"
              />
            </noscript>
          )}
        <NavbarContainer />
        <main className="min-h-screen pb-16">{children}</main>
        <Footer />
        <GoogleAnalytics />
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}