'use client';

import Script from 'next/script';

/**
 * Google Tag Manager container — script half.
 *
 * Loaded only when NEXT_PUBLIC_GTM_ID is set, and only outside the dev server,
 * so local development never fires tags. The container ID is public by design
 * (it ships in the page source), so it comes from the env, never hard-coded.
 *
 * Rendered in <head>. The matching <noscript> iframe lives in <body> (see the
 * root layout) so the preview/debugger works for users without JavaScript.
 */
export default function GoogleTagManager() {
  const id = process.env.NEXT_PUBLIC_GTM_ID;
  if (!id || process.env.NODE_ENV !== 'production') return null;

  return (
    <Script id="gtm" strategy="afterInteractive">
      {`
        (function(w,d,s,l,i){
          w[l]=w[l]||[];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        })(window,document,'script','dataLayer');
      `}
    </Script>
  );
}