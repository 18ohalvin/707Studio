/**
 * Brand slugs that would collide with studio screens or server paths in the
 * public URL /<brand>/<campaign>. The server enforces this list
 * (server/src/reservedSlugs.ts); it is repeated here only to explain the
 * problem in the form before submitting.
 */
export const RESERVED_SLUGS = [
  'admin', 'api', 'app', 'assets', 'editor', 'hub', 'login', 'logout', 'manage',
  'settings', 'signin', 'signup', 'static', 'superadmin', 'uploads', 'favicon.ico', 'robots.txt'
];

export function isReservedSlug(value: string): boolean {
  const slug = String(value || '').toLowerCase().trim().replace(/[^a-z0-9_-]+/g, '-').replace(/(^-+|-+$)/g, '');
  return RESERVED_SLUGS.includes(slug);
}
