/**
 * Regenerate public/sitemap.xml from the MDX frontmatter in content/posts/.
 * Run: npx tsx scripts/generate-sitemap.ts
 *
 * Reads each post's `date` and `slug` from its frontmatter so the sitemap
 * stays in sync with the content instead of being hand-maintained.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const postsDir = path.join(process.cwd(), 'content', 'posts');
const outPath = path.join(process.cwd(), 'public', 'sitemap.xml');

/**
 * Site URL. Reads NEXT_PUBLIC_SITE_URL from the environment (falling back to
 * the placeholder) so the sitemap stays correct when the real domain is set.
 * Trailing slash is stripped so `loc` values are always clean.
 */
const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://devthread.site'
).replace(/\/$/, '');

interface UrlEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

const PAGES: UrlEntry[] = [
  { loc: '/', lastmod: new Date().toISOString().slice(0, 10), changefreq: 'weekly', priority: '1.0' },
  { loc: '/about', lastmod: new Date().toISOString().slice(0, 10), changefreq: 'monthly', priority: '0.8' },
  { loc: '/contact', lastmod: new Date().toISOString().slice(0, 10), changefreq: 'monthly', priority: '0.8' },
  { loc: '/privacy-policy', lastmod: new Date().toISOString().slice(0, 10), changefreq: 'monthly', priority: '0.7' },
  { loc: '/terms', lastmod: new Date().toISOString().slice(0, 10), changefreq: 'monthly', priority: '0.7' },
  { loc: '/disclaimer', lastmod: new Date().toISOString().slice(0, 10), changefreq: 'monthly', priority: '0.7' },
  { loc: '/blog', lastmod: new Date().toISOString().slice(0, 10), changefreq: 'weekly', priority: '0.9' },
];

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function main() {
  const entries: UrlEntry[] = [...PAGES];

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.mdx'));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { data } = matter(raw);
    const slug = (data.slug as string) ?? file.replace(/\.mdx$/, '');
    const date = (data.date as string) ?? new Date().toISOString().slice(0, 10);
    entries.push({
      loc: `${SITE}/blog/${slug}`,
      lastmod: date,
      changefreq: 'weekly',
      priority: '0.9',
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${esc(e.loc)}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  fs.writeFileSync(outPath, xml);
  console.log(`Wrote ${entries.length} URLs to ${outPath}`);
}

main();