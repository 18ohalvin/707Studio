import { Request, Response, NextFunction } from 'express';
import { ensureDbReady, dbRequired } from './db.js';
import { isTransientDbError } from './submissionHelpers.js';

/** The answer for "the guest database cannot be reached": try again, with a hint of when. */
export function unavailable(res: Response) {
  res.setHeader('Retry-After', '2');
  return res.status(503).json({
    success: false,
    retryable: true,
    error: 'The guest database is not reachable right now — please try again in a moment.'
  });
}

/** Answers a failed request: transient database trouble is "try again" (503), anything else a plain 500. */
export function failure(res: Response, action: string, err: any) {
  console.error(`[Submissions] Could not ${action}:`, err?.message || err);
  if (res.headersSent) return;
  if (isTransientDbError(err)) return unavailable(res);
  return res.status(500).json({ success: false, error: `Could not ${action} — please try again.` });
}

/** Express 4 does not catch a rejected async handler; without this a database error would leave the request hanging. */
export type Handler = (req: Request, res: Response) => Promise<unknown>;
export const route = (action: string, fn: Handler) => (req: Request, res: Response, _next: NextFunction) => {
  fn(req, res).catch(err => failure(res, action, err));
};

/**
 * Where entries live: 'db', 'file' (development without a database), or null
 * after answering "try again". With a database in use (production, or any
 * deployment with a connection string) the database is the only store — a file
 * is never a fallback, because nothing else reads it.
 */
export async function storeFor(res: Response): Promise<'db' | 'file' | null> {
  if (await ensureDbReady()) return 'db';
  if (dbRequired()) {
    unavailable(res);
    return null;
  }
  return 'file';
}
