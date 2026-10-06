import fs from 'fs';
import path from 'path';

function getStorageDir(): string {
  if (process.env.DATA_DIR) {
    return path.resolve(process.env.DATA_DIR);
  }
  // Resolve relative to server root directory (one level up from src/dist)
  const currentDir = typeof __dirname !== 'undefined' ? __dirname : path.resolve(process.cwd(), 'src');
  const serverDir = path.resolve(currentDir, '..');
  const serverDataDir = path.join(serverDir, 'data');
  if (fs.existsSync(serverDataDir)) {
    return serverDataDir;
  }
  const cwdDataDir = path.resolve(process.cwd(), 'data');
  if (fs.existsSync(cwdDataDir)) {
    return cwdDataDir;
  }
  return serverDataDir;
}

const DATA_DIR = getStorageDir();

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.warn('[FileStorage] Could not create data directory:', e);
  }
}

export function readDataFile<T>(filename: string, defaultValue: T): T {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      if (raw && raw.trim()) {
        return JSON.parse(raw) as T;
      }
    }
  } catch (e) {
    console.warn(`[FileStorage] Error reading ${filename}:`, e);
  }
  return defaultValue;
}

export function writeDataFile<T>(filename: string, data: T): void {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch (e) {
    console.warn(`[FileStorage] Error writing ${filename}:`, e);
  }
}

/**
 * Moves a data file aside (never deletes it) once its contents have been
 * imported elsewhere, so it is not imported twice and stays as a backup.
 * Returns the new path, or null when there was no such file.
 */
export function archiveDataFile(filename: string, label: string): string | null {
  const from = path.join(DATA_DIR, filename);
  if (!fs.existsSync(from)) return null;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const to = path.join(DATA_DIR, `${path.parse(filename).name}.${label}-${stamp}${path.extname(filename)}`);
  fs.renameSync(from, to);
  return to;
}
