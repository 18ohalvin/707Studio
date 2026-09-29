import path from 'path';
import fs from 'fs';

/**
 * Where uploaded media is written.
 *
 * In production this must point at a mounted volume (UPLOAD_DIR), otherwise
 * every uploaded image lives inside the container and disappears on the next
 * deploy. Locally it keeps the previous behaviour of writing into the repo's
 * public/uploads so Vite serves them during development.
 */
export function resolveUploadDir(): string {
  if (process.env.UPLOAD_DIR) {
    return path.resolve(process.env.UPLOAD_DIR);
  }

  const cwdPublic = path.resolve(process.cwd(), 'public');
  return fs.existsSync(cwdPublic)
    ? path.join(cwdPublic, 'uploads')
    : path.resolve(process.cwd(), '../public/uploads');
}
