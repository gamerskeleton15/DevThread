import Link from 'next/link';
import Image from 'next/image';
import { PostData } from '@/lib/posts';

interface ThreadCardProps {
  post: PostData;
}

type ExtendedPostData = PostData & {
  image?: string;
  coverImage?: string;
  contentHtml?: string;
  rawMarkdown?: string;
  content?: string;
  readingTime?: number;
};

/** Approximate read time based on plain-text word count (~200 wpm). */
function readTime(rawText: string): number {
  const plainText = rawText
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#>*_~`[\]()!-]/g, ' ')
    .trim();
  if (!plainText) return 1;
  const words = plainText.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/** Two-letter initials from author name. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function ThreadCard({ post }: ThreadCardProps) {
  const extendedPost = post as ExtendedPostData;
  const authorInitial = initials(post.author || 'DevThread');
  const dateLabel = new Date(post.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const tags: string[] = Array.isArray(post.tags)
    ? post.tags
    : typeof post.tags === 'string'
    ? JSON.parse(post.tags || '[]')
    : [];

  const imageUrl = extendedPost.image || extendedPost.coverImage;
  const bodySource =
    extendedPost.contentHtml ||
    extendedPost.rawMarkdown ||
    extendedPost.content ||
    post.description ||
    post.title;
  const minutes =
    extendedPost.readingTime && extendedPost.readingTime > 0
      ? extendedPost.readingTime
      : readTime(bodySource);

  return (
    <article className="group py-6 px-3 hover:bg-surface/80 -mx-3 rounded-2xl transition-all duration-200">
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Optional Article Thumbnail (Cloudinary / Static) */}
        {imageUrl ? (
          <Link
            href={`/blog/${post.slug}`}
            className="w-full sm:w-44 h-28 relative rounded-xl overflow-hidden bg-surface border border-border shrink-0 group-hover:border-accent/40 transition-colors"
          >
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, 176px"
            />
          </Link>
        ) : null}

        {/* Content Column */}
        <div className="min-w-0 flex-1">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-accent to-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                {authorInitial}
              </div>
              <span className="font-medium text-foreground">{post.author || 'DevThread'}</span>
            </div>
            <span>·</span>
            <time dateTime={post.date}>{dateLabel}</time>
            <span>·</span>
            <span className="font-mono">{minutes} min read</span>
          </div>

          {/* Title */}
          <Link href={`/blog/${post.slug}`} className="block group-hover:translate-x-0.5 transition-transform">
            <h3 className="font-display text-xl font-bold text-foreground group-hover:text-accent transition-colors leading-snug">
              {post.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="mt-2 text-sm text-muted line-clamp-2 leading-relaxed">
            {post.description}
          </p>

          {/* Footer / Taxonomy Badges */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-md bg-accent-soft text-accent border border-accent/10">
              {post.category}
            </span>
            {tags.length > 0 && (
              <div className="flex items-center gap-2">
                {tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs text-muted">
                    #{tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="text-xs text-muted">+{tags.length - 3}</span>
                )}
              </div>
            )}
            <span className="ml-auto text-xs font-medium text-muted group-hover:text-accent transition-colors flex items-center gap-1">
              Read thread
              <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
