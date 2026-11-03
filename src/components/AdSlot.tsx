'use client';

/**
 * AdSense publisher ID, e.g. `ca-pub-XXXXXXXXXXXXXXXX`. Reads from env. When
 * unset, no ads load and the component shows a placeholder instead. Set
 * `NEXT_PUBLIC_ADSENSE_CLIENT` once your AdSense account is approved.
 */
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '';
// Detect if we are in development mode to show visual placeholders
const IS_DEV = process.env.NODE_ENV === 'development';

interface AdSlotProps {
  className?: string;
  adFormat?: string;
  adSlotId?: string;
}

/**
 * Renders a Google AdSense unit (`ins.adsbygoogle`) when a publisher ID is
 * configured, or a neutral placeholder otherwise.
 *
 * How it works: the adsbygoogle.js script is loaded once in the root layout
 * with the client ID in its URL, so the script **auto-fills every
 * `<ins class="adsbygoogle">`** on the page. That means this component does
 * NOT call `adsbygoogle.push()` — doing so would fill the same slot twice and
 * trigger "All 'ins' elements already have ads in them."
 */
const AdSlot: React.FC<AdSlotProps> = ({
  className = '',
  adFormat = 'auto',
  adSlotId = '',
}) => {
  // Show a visual placeholder during development or when client ID is missing.
  if (!ADSENSE_CLIENT || IS_DEV) {
    return (
      <div className={`w-full min-h-[100px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 p-4 ${className}`}>
        <span className="font-semibold text-sm">Google AdSense Placeholder</span>
        <span className="text-xs">Client: {ADSENSE_CLIENT || 'Missing'} | Slot: {adSlotId || 'Auto'}</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle block w-full"
        // NOTE: do NOT set data-ad-client here. The client ID is already in
        // the adsbygoogle.js script URL in the layout, so the script auto-fills
        // this <ins> on load. Setting it here too would double-fill the slot.
        data-ad-slot={adSlotId || undefined}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSlot;