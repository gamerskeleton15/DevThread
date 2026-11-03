import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

export type UploadFolder = 'covers' | 'avatars' | 'inline';

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

/**
 * Identify an image by its magic bytes rather than trusting the client-supplied
 * MIME type. A renamed `.php`/`.html` file keeps its real bytes, so sniffing is
 * the only reliable gate against content-type spoofing.
 */
function sniffImageType(buf: Buffer): string | null {
  if (buf.length < 4) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return 'image/gif';
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return 'image/webp';
  // SVG is text; accept only a leading <svg or <?xml ... <svg prefix.
  const head = buf.slice(0, 64).toString('latin1').trimStart().toLowerCase();
  if (head.startsWith('<svg') || head.startsWith('<?xml') && head.includes('<svg')) {
    return 'image/svg+xml';
  }
  return null;
}

/**
 * Save an uploaded image file into `public/uploads/<folder>` and return the
 * public URL path (e.g. `/uploads/covers/a1b2c3.jpg`). Server-only.
 *
 * Validation: the file must be an allowed image type (verified by magic bytes,
 * not by the client-supplied MIME type) and within the size limit. Throws an
 * Error the caller should surface to the user.
 */
export async function saveUploadedFile(
  file: File,
  folder: UploadFolder
): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error('Image must be 4MB or smaller.');
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const detected = sniffImageType(bytes);
  if (!detected) {
    throw new Error('Please upload a valid image (JPEG, PNG, GIF, WebP, or SVG).');
  }

  const ext = EXT_BY_TYPE[detected] ?? 'bin';
  const name = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}.${ext}`;

  const uploadRoot = path.join(process.cwd(), 'public', 'uploads');
  const dir = path.join(uploadRoot, folder);
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(path.join(dir, name), bytes);

  return `/uploads/${folder}/${name}`;
}