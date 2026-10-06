/**
 * Brand slugs become the first segment of every public campaign URL
 * (/<brand>/<campaign>). These names are already taken by the studio itself or
 * by the server's own paths, so a brand using one would have its links shadowed
 * by an app screen or served a file instead of the campaign.
 * Keep in sync with src/constants/reservedSlugs.ts.
 */
export const RESERVED_SLUGS = [
  'admin', 'api', 'app', 'assets', 'editor', 'hub', 'login', 'logout', 'manage',
  'settings', 'signin', 'signup', 'static', 'superadmin', 'uploads', 'favicon.ico', 'robots.txt'
];

export function normalizeSlug(value: string): string {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9_-]+/g, '-').replace(/(^-+|-+$)/g, '');
}

export function isReservedSlug(value: string): boolean {
  return RESERVED_SLUGS.includes(normalizeSlug(value));
}
