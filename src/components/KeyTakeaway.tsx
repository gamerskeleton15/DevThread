import { PostData } from '@/lib/posts';

interface KeyTakeawayProps {
  post?: PostData;
  takeaway?: string;
}

/**
 * The DevThread signature callout: a single actionable sentence from the
 * author, displayed at the top of every article. Falls back to the post
 * description when no explicit takeaway is set.
 */
export default function KeyTakeaway({ post, takeaway }: KeyTakeawayProps) {
  const text = takeaway ?? post?.takeaway ?? post?.description;
  if (!text) return null;

  return (
    <div className="key-takeaway rounded-xl p-5 mb-8 flex gap-4 items-start">
      <span
        aria-hidden="true"
        className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">
          Key takeaway
        </p>
        <p className="text-foreground font-medium leading-relaxed">{text}</p>
      </div>
    </div>
  );
}