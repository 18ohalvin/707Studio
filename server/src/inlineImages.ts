import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { resolveUploadDir } from './uploads.js';

/**
 * Move base64 images out of saved project JSON and onto disk.
 *
 * Dropping an image on the canvas stores it as a data: URL inside the widget
 * tree, and the tree is saved twice (widget_tree and pages). One banner turned
 * a project into 40 MB, which every device then re-downloaded every 10 seconds
 * while polling — slow enough that browsers gave up mid-request, so projects
 * appeared not to sync even once the database was writing correctly.
 *
 * Images are written to the uploads volume and replaced with their URL, which
 * is what /api/media/upload already does for the media library. Identical
 * images collapse onto the same file because the name is a hash of the bytes.
 */

const DATA_URL = /^data:image\/([a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/;

function extensionFor(mime: string): string {
  if (mime === 'svg+xml') return 'svg';
  if (mime === 'jpeg') return 'jpg';
  return mime.replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'png';
}

function storeDataUrl(value: string, uploadDir: string): string {
  const match = value.match(DATA_URL);
  if (!match) return value;

  try {
    const buffer = Buffer.from(match[2].replace(/\s/g, ''), 'base64');
    // Very small images cost more as a request than as inline bytes.
    if (buffer.length < 8 * 1024) return value;

    const hash = crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 16);
    const filename = `inline_${hash}.${extensionFor(match[1])}`;
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, buffer);
    }
    return `/uploads/${filename}`;
  } catch {
    // Leave the value untouched rather than losing the image.
    return value;
  }
}

/** Returns a copy with every embedded image replaced by its uploaded URL. */
export function externalizeInlineImages<T>(value: T): T {
  const uploadDir = resolveUploadDir();
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const walk = (node: any): any => {
    if (typeof node === 'string') {
      return node.startsWith('data:image/') ? storeDataUrl(node, uploadDir) : node;
    }
    if (Array.isArray(node)) return node.map(walk);
    if (node && typeof node === 'object') {
      const out: any = {};
      for (const [key, child] of Object.entries(node)) out[key] = walk(child);
      return out;
    }
    return node;
  };

  return walk(value);
}
