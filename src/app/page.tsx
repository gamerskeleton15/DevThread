import Link from 'next/link';
import type { Metadata } from 'next';
import { getSortedPostsData, PostData } from '@/lib/posts';
import NewsletterForm from '@/components/NewsletterForm';
import AdSlot from '@/components/AdSlot';
import ThreadCard from '@/components/ThreadCard';

export const metadata: Metadata = {
  title: 'DevThread - Where engineers share what they\'ve learned',
  description:
    'Practical threads from working engineers: backend, platform, and ML. No fluff, no hype — just hard-won knowledge you can apply today.',
  openGraph: {
    title: 'DevThread',
    description:
      'Practical threads from working engineers. No fluff, no hype — just hard-won knowledge you can apply today.',
    type: 'website',
    siteName: 'DevThread',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevThread',
    description:
      'Practical threads from working engineers. No fluff, no hype — just hard-won knowledge you can apply today.',
  },
};

/** All distinct categories across the thread, sorted alphabetically. */
function categories(posts: PostData[]): string[] {
  return Array.from(new Set(posts.map((p) => p.category))).sort();
}

/** Posts with at least one comment in the last 7 days (simulated by recency). */
function activeThreads(posts: PostData[]): PostData[] {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return posts
    .filter((p) => new Date(p.date).getTime() > sevenDaysAgo)
    .slice(0, 3);
}

export default async function Home() {
  const allPosts = await getSortedPostsData();
  const cats = categories(allPosts);
  const active = activeThreads(allPosts);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header — no hero banner, just the publication intro */}
        <header className="mb-10">
          <Link href="/" className="font-display text-3xl font-bold text-foreground tracking-tight">
            Dev<span className="text-accent">Thread</span>
          </Link>
          <p className="mt-2 text-muted max-w-2xl">
            Practical threads from working engineers. Backend, platform, and ML — no
            fluff, no hype, just hard-won knowledge you can apply today.
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-10">
          {/* Main stream */}
          <main>
            {/* Category filter bar */}
            <div className="mb-8 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted mr-1">Filter:</span>
              <Link
                href="/blog"
                className="px-3 py-1 rounded-full text-sm border border-border bg-surface hover:border-accent hover:text-accent transition-colors"
              >
                All threads
              </Link>
              {cats.map((c) => (
                <Link
                  key={c}
                  href={`/blog?category=${encodeURIComponent(c)}`}
                  className="px-3 py-1 rounded-full text-sm border border-border bg-surface hover:border-accent hover:text-accent transition-colors"
                >
                  {c}
                </Link>
              ))}
            </div>

            {/* Threaded stream */}
            <section className="divide-y divide-border border-t border-border">
              {allPosts.map((post) => (
                <ThreadCard key={post.id} post={post} />
              ))}
            </section>

            {allPosts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted">No threads yet. Check back soon.</p>
              </div>
            )}

            {/* AdSense slot mid-stream */}
            <div className="mt-12">
              <AdSlot className="w-full" />
            </div>

            {/* Weekly roundup CTA */}
            <section className="mt-16 bg-surface border border-border rounded-2xl p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <p className="text-sm font-medium text-accent uppercase tracking-wider mb-1">
                    Weekly Thread Roundup
                  </p>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    The best threads of the week, distilled.
                  </h2>
                  <p className="mt-2 text-muted max-w-xl">
                    One actionable thread per day, five days a week. No filler.
                  </p>
                </div>
                <NewsletterForm />
              </div>
            </section>
          </main>

          {/* Sidebar: Active discussions */}
          <aside className="mt-12 lg:mt-0">
            <div className="sticky top-24 space-y-6">
              <div className="bg-surface border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
                  </span>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Active discussions
                  </h3>
                </div>
                <p className="text-sm text-muted mb-4">
                  Threads with fresh replies this week.
                </p>
                <ul className="space-y-4">
                  {active.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group block"
                      >
                        <p className="font-medium text-foreground group-hover:text-accent transition-colors line-clamp-2">
                          {post.title}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {post.category} · active now
                        </p>
                      </Link>
                    </li>
                  ))}
                  {active.length === 0 && (
                    <li className="text-sm text-muted">No active threads yet.</li>
                  )}
                </ul>
              </div>

              {/* Write for us CTA */}
              <div className="bg-accent-soft border border-accent/20 rounded-2xl p-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  Write for DevThread
                </h3>
                <p className="text-sm text-muted mb-4">
                  Got a hard-won lesson from the trenches? We publish it.
                </p>
                <Link
                  href="/write"
                  className="inline-block text-sm font-medium text-accent hover:underline"
                >
                  Share your thread →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}