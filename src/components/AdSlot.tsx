'use client';

/**
 * AdSense publisher ID, e.g. `ca-pub-XXXXXXXXXXXXXXXX`.
 * Must be available at `next build` time via `NEXT_PUBLIC_ADSENSE_CLIENT`.
 */
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '';
const IS_DEV = process.env.NODE_ENV === 'development';

interface AdSlotProps {
  className?: string;
  adFormat?: string;
  adSlotId?: string;
}

/**
 * Renders a Google AdSense display unit (`ins.adsbygoogle`) when both
 * `NEXT_PUBLIC_ADSENSE_CLIENT` and a specific `adSlotId` are configured.
 *
 * - In development: shows a dashed layout placeholder.
 * - In production: returns `null` if unconfigured or when relying solely on
 *   AdSense Auto Ads, preventing debug banners and blank gaps during review.
 */
const AdSlot: React.FC<AdSlotProps> = ({
  className = '',
  adFormat = 'auto',
  adSlotId = '',
}) => {
  if (IS_DEV) {
    return (
      <div
        className={`w-full min-h-[100px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 p-4 ${className}`}
      >
        <span className="font-semibold text-sm">Google AdSense Placeholder</span>
        <span className="text-xs">
          Client: {ADSENSE_CLIENT || 'Missing'} | Slot: {adSlotId || 'Auto'}
        </span>
      </div>
    );
  }

  if (!ADSENSE_CLIENT || !adSlotId) {
    return null;
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle block w-full"
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={adSlotId}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSlot;
