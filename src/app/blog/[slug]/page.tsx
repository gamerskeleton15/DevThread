import Link from 'next/link';
import { getPostData, getAllPostIds } from '@/lib/posts';
import AdSlot from '@/components/AdSlot';
import AuthorBox from '@/components/AuthorBox';
import KeyTakeaway from '@/components/KeyTakeaway';

export async function generateStaticParams() {
  return await getAllPostIds();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const postData = await getPostData(slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://devthread.site';
  return {
    title: `${postData.title} - DevThread`,
    description: postData.description,
    openGraph: {
      title: postData.title,
      description: postData.description,
      type: 'article',
      publishedTime: postData.date,
      authors: [postData.author],
      images: [
        {
          url: postData.coverImage,
          width: 800,
          height: 600,
          alt: postData.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: postData.title,
      description: postData.description,
      images: [postData.coverImage],
    },
    // JSON-LD Article schema — gives Google rich-snippet eligibility for the
    // headline, date, author and main image.
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: postData.title,
        description: postData.description,
        author: {
          '@type': 'Person',
          name: postData.author,
        },
        datePublished: postData.date,
        publisher: {
          '@type': 'Organization',
          name: 'DevThread',
          url: siteUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/devthread-icon.svg`,
          },
        },
        mainEntityOfPage: `${siteUrl}/blog/${slug}`,
        image: postData.coverImage,
      }),
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const postData = await getPostData(slug);

  return (
    <article className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/blog"
          className="text-sm font-medium text-accent hover:underline inline-flex items-center gap-1 mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to all threads
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-accent-soft text-accent">
              {postData.category}
            </span>
            {postData.isUserContent && (
              <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-success-soft text-success">
                Community thread
              </span>
            )}
            <span className="text-sm text-muted">
              {new Date(postData.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
            {postData.title}
          </h1>

          <p className="text-lg text-muted">{postData.description}</p>
        </header>

        {/* Key Takeaway — the DevThread signature callout */}
        <KeyTakeaway />

        {postData.coverImage && (
          <div className="mb-8 rounded-2xl overflow-hidden border border-border">
            <img
              src={postData.coverImage}
              alt={postData.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        <div
          className="prose prose-lg max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        />

        <AuthorBox author={postData.author} date={postData.date} />

        <div className="my-12">
          <AdSlot className="w-full" />
        </div>

        <div className="text-center">
          <Link
            href="/blog"
            className="text-sm font-medium text-accent hover:underline inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to all threads
          </Link>
        </div>
      </div>
    </article>
  );
}