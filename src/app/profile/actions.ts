'use server';

import { v2 as cloudinary } from 'cloudinary';
import { updateProfileInDb } from '@/db/queries'; // Adjust to your actual DB query helper
import { revalidatePath } from 'next/cache';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function updateProfile(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const file = formData.get('avatar') as File | null;
  let avatarUrl: string | undefined;

  // Upload avatar to Cloudinary if a new file was selected
  if (file && file.size > 0) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      folder: 'devthread_avatars',
    });

    avatarUrl = uploadResult.secure_url;
  }

  // Update Postgres database record with new name and Cloudinary avatar URL
  await updateProfileInDb({ name, avatar: avatarUrl });

  revalidatePath('/profile');
  return { success: true };
}