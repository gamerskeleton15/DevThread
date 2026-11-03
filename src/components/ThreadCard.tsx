import Link from 'next/link';
import { PostData } from '@/lib/posts';

interface ThreadCardProps {
  post: PostData;
}

/** Approximate read time for a ~900-word article. */
function readTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

/** Two-letter initials from an author name. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function ThreadCard({ post }: ThreadCardProps) {
  const authorInitial = initials(post.author || 'U');
  const dateLabel = new Date(post.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  // tags may arrive as a JSON string when the pooler returns raw JSONB
  const tags: string[] = Array.isArray(post.tags)
    ? post.tags
    : (typeof post.tags === 'string' ? JSON.parse(post.tags || '[]') : []);

  return (
    <article className="group py-5 px-1 hover:bg-surface/60 -mx-1 rounded-lg transition-colors">
      <div className="flex gap-4">
        {/* Author avatar column */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-success text-white flex items-center justify-center text-xs font-semibold">
            {authorInitial}
          </div>
        </div>

        {/* Content column */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted mb-1">
            <Link
              href={`/profile`}
              className="font-medium text-foreground hover:text-accent transition-colors"
            >
              {post.author}
            </Link>
            <span>·</span>
            <span>{dateLabel}</span>
            <span>·</span>
            <span className="font-mono text-xs">{readTime(post.description || post.title)} min</span>
            <span className="ml-auto">
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Discussion
              </span>
            </span>
          </div>

          <Link href={`/blog/${post.slug}`} className="block">
            <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-accent transition-colors leading-snug">
              {post.title}
            </h3>
          </Link>

          <p className="mt-1 text-muted line-clamp-2 max-w-3xl">
            {post.description}
          </p>

          <div className="mt-3 flex items-center gap-3">
            <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-accent-soft text-accent">
              {post.category}
            </span>
            {tags.length > 0 && (
              <div className="flex items-center gap-1.5">
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
            <span className="ml-auto text-xs text-muted group-hover:text-accent transition-colors">
              Read thread →
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}