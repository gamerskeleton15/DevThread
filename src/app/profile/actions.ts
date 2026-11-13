'use server';

import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/auth';
import { updateUserProfile } from '@/db/queries';

async function signCloudinaryUpload(params: Record<string, string>, apiSecret: string): Promise<string> {
  const payload =
    Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&') + apiSecret;

  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function updateProfile(arg1: FormData | unknown, arg2?: FormData) {
  const formData = arg1 instanceof FormData ? arg1 : arg2;
  if (!formData) {
    return { error: 'Invalid form submission.' };
  }

  const user = await getSessionUser();
  if (!user) {
    return { error: 'You must be logged in to update your profile.' };
  }

  const name = String(formData.get('name') ?? '').trim() || user.name;
  const file = formData.get('avatar') as File | null;
  let avatarUrl = user.avatar;

  if (file && file.size > 0) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const apiKey = process.env.CLOUDINARY_API_KEY!;
    const apiSecret = process.env.CLOUDINARY_API_SECRET!;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = 'devthread_avatars';

    const signature = await signCloudinaryUpload({ folder, timestamp }, apiSecret);

    const uploadBody = new FormData();
    uploadBody.append('file', file);
    uploadBody.append('api_key', apiKey);
    uploadBody.append('timestamp', timestamp);
    uploadBody.append('folder', folder);
    uploadBody.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: uploadBody,
    });

    if (!res.ok) {
      return { error: 'Avatar upload to Cloudinary failed.' };
    }

    const data = (await res.json()) as { secure_url: string };
    avatarUrl = data.secure_url;
  }

  // Verify the argument order of updateUserProfile in src/db/queries.ts
  await updateUserProfile(user.id, name, avatarUrl);

  revalidatePath('/profile');
  revalidatePath('/');
  return { success: true };
}
