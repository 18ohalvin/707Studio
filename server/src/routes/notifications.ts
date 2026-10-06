import { Router, Request, Response } from 'express';
import { getClaims, isSuperAdminClaims } from '../auth.js';
import { accessiblePageIds, findProject } from '../access.js';
import { recentHistory, rowToProject, type HistoryKind } from '../publishing.js';

export const notificationsRouter = Router();

/**
 * GET /api/notifications — derived from project history, so there is nothing
 * extra to keep in sync. The superadmin hears about submissions waiting for
 * review; owners hear when their project was published or sent back.
 * Read/unread is tracked per device by the client (last-seen time).
 */
notificationsRouter.get('/', async (_req: Request, res: Response) => {
  const claims = getClaims(res);
  const superadmin = isSuperAdminClaims(claims);
  const kinds: HistoryKind[] = superadmin ? ['submitted'] : ['published', 'declined'];

  try {
    const allowed = await accessiblePageIds(claims);
    const entries = await recentHistory(allowed ? [...allowed] : null, kinds, 40);

    const projects = new Map<string, any>();
    for (const id of new Set(entries.map((e: any) => e.page_id))) {
      const row = await findProject(String(id));
      if (row) projects.set(String(id), rowToProject(row));
    }

    // Only a project's most recent submission can still be waiting; older ones
    // were superseded by it. (entries are newest first.)
    const latestSubmission = new Map<string, string>();
    entries.forEach((e: any) => {
      if (e.kind === 'submitted' && !latestSubmission.has(e.page_id)) latestSubmission.set(e.page_id, e.id);
    });

    const items = entries
      .filter((e: any) => projects.has(e.page_id))
      .map((e: any) => {
        const p = projects.get(e.page_id);
        const stillPending = e.kind === 'submitted' && latestSubmission.get(e.page_id) === e.id && Boolean(p.pending_update_at);
        return {
          id: e.id,
          kind: e.kind,
          project_id: e.page_id,
          project_title: p.title,
          brand_slug: p.brand_slug,
          revision: e.revision,
          live_version: e.live_version,
          // Submitted while a version was already live: an update, not a first publish.
          is_update: e.kind === 'submitted' ? Number(e.live_version || 0) > 0 : undefined,
          note: e.note || '',
          created_by: e.created_by,
          created_at: e.created_at,
          still_pending: stillPending
        };
      });

    return res.json({ success: true, data: items, pending_count: items.filter(i => i.still_pending).length });
  } catch (err: any) {
    console.error('[Notifications] Could not load:', err.message);
    return res.status(500).json({ success: false, error: 'Could not load notifications.' });
  }
});
