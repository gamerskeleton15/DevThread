'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { updateUserProfile } from '@/db/queries';
import { saveUploadedFile } from '@/lib/uploads';

export interface ProfileState {
  error?: string;
  success?: boolean;
}

/**
 * Update the current user's display name and/or avatar image. Returns error
 * state on validation failure; revalidates so the navbar reflects changes.
 */
export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }

  const name = String(formData.get('name') ?? '').trim();
  const avatarFile = formData.get('avatar');

  if (name && name.length > 40) {
    return { error: 'Display name must be 40 characters or fewer.' };
  }

  let avatar: string | undefined;
  if (avatarFile instanceof File && avatarFile.size > 0) {
    try {
      avatar = await saveUploadedFile(avatarFile, 'avatars');
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Avatar upload failed.' };
    }
  }

  // Reflect the anonymous default name only when the user actually cleared
  // the field. When only an avatar is uploaded, keep the existing name so a
  // profile update can't silently wipe a display name.
  const clearedName = !name;
  const nextName = clearedName ? (user.name || user.email.split('@')[0]) : name;

  const { ok } = await updateUserProfile(user.id, {
    name: nextName,
    ...(avatar ? { avatar } : {}),
  });
  if (!ok) {
    return { error: 'Could not save your profile right now. Please try again.' };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}