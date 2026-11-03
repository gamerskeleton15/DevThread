import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { saveUploadedFile } from '@/lib/uploads';

export const runtime = 'nodejs';

/**
 * Accepts a single `file` (multipart/form-data) and stores it under
 * `public/uploads/inline/`. Returns the public URL so the client can insert
 * `![alt](/uploads/inline/…)` into the markdown body.
 * Requires an authenticated session.
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  let url: string;
  try {
    const fd = await request.formData();
    const file = fd.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }
    url = await saveUploadedFile(file, 'inline');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ url });
}