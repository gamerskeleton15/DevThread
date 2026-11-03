'use client';

import Script from 'next/script';

/**
 * Google Analytics 4 (gtag.js).
 *
 * Loaded only when NEXT_PUBLIC_GA_MEASUREMENT_ID is set, and only outside the
 * dev server, so local development never leaks pageviews. The measurement ID
 * is public by design (it ships in the page source), so it comes from the env,
 * never hard-coded.
 *
 * Privacy settings:
 *   - anonymize_ip: true — GA4 still truncates the last octet by default, but
 *     this makes it explicit and is the GDPR-safe setting.
 *   - allow_ad_personalization_signals: false — disables ad personalization /
 *     cross-site tracking by default. Flip it on later if you want remarketing.
 */
export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId || process.env.NODE_ENV !== 'production') return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            anonymize_ip: true,
            allow_ad_personalization_signals: false,
          });
        `}
      </Script>
    </>
  );
}