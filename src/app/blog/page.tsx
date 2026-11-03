import Link from 'next/link';
import type { Metadata } from 'next';
import { getSortedPostsData, PostData } from '@/lib/posts';
import AdSlot from '@/components/AdSlot';
import ThreadCard from '@/components/ThreadCard';

export const metadata: Metadata = {
  title: 'DevThread - All threads',
  description:
    'Browse every thread on DevThread: practical engineering writing from working backend, platform, and ML practitioners.',
  openGraph: {
    title: 'DevThread - All threads',
    description: 'Browse every thread on DevThread from working engineers.',
    type: 'website',
    siteName: 'DevThread',
  },
};

/** Distinct categories across all threads. */
function categories(posts: PostData[]): string[] {
  return Array.from(new Set(posts.map((p) => p.category))).sort();
}

interface BlogPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category } = await searchParams;
  const allPosts = await getSortedPostsData();
  const cats = categories(allPosts);
  const filtered = category
    ? allPosts.filter((p) => p.category.toLowerCase() === category.toLowerCase())
    : allPosts;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10">
          <Link
            href="/"
            className="font-display text-3xl font-bold text-foreground tracking-tight"
          >
            Dev<span className="text-accent">Thread</span>
          </Link>
          <h1 className="font-display text-2xl font-semibold text-foreground mt-3">
            All threads
          </h1>
          <p className="mt-1 text-muted">
            {filtered.length} thread{filtered.length === 1 ? '' : 's'}
            {category ? ` in ${category}` : ''}
          </p>
        </header>

        {/* Category filter bar */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted mr-1">Filter:</span>
          <Link
            href="/blog"
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              !category
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-border bg-surface text-foreground hover:border-accent hover:text-accent'
            }`}
          >
            All threads
          </Link>
          {cats.map((c) => (
            <Link
              key={c}
              href={`/blog?category=${encodeURIComponent(c)}`}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                c.toLowerCase() === category?.toLowerCase()
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-border bg-surface text-foreground hover:border-accent hover:text-accent'
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        {/* Threaded stream */}
        <section className="divide-y divide-border border-t border-border">
          {filtered.map((post) => (
            <ThreadCard key={post.id} post={post} />
          ))}
        </section>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted">No threads in this category yet.</p>
            <Link href="/blog" className="mt-3 inline-block text-sm text-accent hover:underline">
              View all threads →
            </Link>
          </div>
        )}

        <div className="mt-12">
          <AdSlot className="w-full" />
        </div>
      </div>
    </div>
  );
}