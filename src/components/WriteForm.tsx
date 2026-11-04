'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { createPost } from '@/app/write/actions';

/**
 * Create (and, when `initialPost` is passed, edit) a post. Editing posts a
 * hidden `slug` field so the server upserts the user's existing post rather
 * than creating a duplicate.
 */
export default function WriteForm({
  initialPost,
}: {
  initialPost?: {
    slug: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    coverImage: string;
    content: string;
  };
}) {
  const editing = Boolean(initialPost);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(false);
  const [imageError, setImageError] = useState('');
  const [formError, setFormError] = useState('');

  async function handleInsertImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setImageError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Upload failed.');
      }
      const textarea = contentRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const snippet = `![image](${data.url})`;
        textarea.value =
          textarea.value.slice(0, start) +
          snippet +
          textarea.value.slice(end);
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + snippet.length;
      }
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setFormError('');

    try {
      const formData = new FormData(e.currentTarget);
      
      // Handle the cover image upload first if a new one is selected
      const coverFile = coverInputRef.current?.files?.[0];
      if (coverFile) {
        const fd = new FormData();
        fd.append('file', coverFile);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        
        if (!res.ok || !data.url) {
          throw new Error(data.error || 'Cover image upload failed.');
        }
        
        // Remove the local file from formData and add the Cloudinary URL
        formData.delete('cover');
        formData.append('coverImage', data.url);
      } else if (editing && initialPost?.coverImage) {
        formData.append('coverImage', initialPost.coverImage);
      }

      // Now call the server action with the updated form data
      const result = await createPost({}, formData);
      if (result?.error) {
        throw new Error(result.error);
      }
      
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save post.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href={editing ? '/profile' : '/'} className="text-accent hover:underline text-sm">
            ← Back to {editing ? 'your profile' : 'home'}
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-foreground font-display tracking-tight">
              {editing ? 'Edit post' : 'Write a post'}
            </h1>
            <p className="mt-1 text-muted">
              {editing
                ? `Editing “${initialPost?.title}”. Markdown is supported.`
                : 'Publish a new article to the blog. Markdown is supported.'}
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {formError}
              </div>
            )}

            {editing && (
              <input type="hidden" name="slug" value={initialPost?.slug} />
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                defaultValue={initialPost?.title}
                placeholder="Your article title"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
                Short description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                defaultValue={initialPost?.description}
                placeholder="A one-line summary (shown on the blog list)"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="cover" className="block text-sm font-medium text-foreground mb-1">
                Cover image{' '}
                <span className="font-normal text-muted">
                  {editing
                    ? '(leave empty to keep the current image)'
                    : '(required)'}
                </span>
              </label>
              <input
                ref={coverInputRef}
                type="file"
                id="cover"
                name="cover"
                accept="image/*"
                required={!editing}
                className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent-soft file:text-accent hover:file:bg-accent-soft/80"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  defaultValue={initialPost?.category}
                  placeholder="e.g. Programming"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-foreground mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  defaultValue={initialPost?.tags.join(', ')}
                  placeholder="comma, separated, tags"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="content" className="block text-sm font-medium text-foreground">
                  Content (Markdown)
                </label>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={busy}
                  className="text-sm font-medium text-accent hover:text-accent disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {busy ? 'Uploading…' : 'Insert image'}
                </button>
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleInsertImage}
              />
              {imageError && (
                <div className="mt-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  {imageError}
                </div>
              )}
              <textarea
                id="content"
                name="content"
                ref={contentRef}
                required
                rows={12}
                defaultValue={initialPost?.content}
                placeholder={"## Your heading\n\nWrite your article in Markdown here."}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-mono text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Link
                href={editing ? '/profile' : '/blog'}
                className="px-5 py-3 text-sm font-medium text-muted border border-border hover:bg-background rounded-lg transition-colors duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={pending}
                className="px-6 py-3 text-white font-semibold bg-accent hover:opacity-90 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pending ? (editing ? 'Saving…' : 'Publishing…') : editing ? 'Save changes' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}