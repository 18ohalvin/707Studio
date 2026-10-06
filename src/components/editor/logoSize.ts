/**
 * Brand logo height. Uploaded logos come in every size, so the height is the
 * editor's to set (width follows the logo's own proportions).
 */
export const LOGO_HEIGHT = { min: 16, max: 200, default: 48 } as const;
export const TICKET_LOGO_HEIGHT = { min: 12, max: 160, default: 22 } as const;

export function clampLogoHeight(value: unknown, range: { min: number; max: number; default: number } = LOGO_HEIGHT): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return range.default;
  return Math.min(range.max, Math.max(range.min, Math.round(n)));
}

/** Image width to request from the server: enough for a 3× phone screen at this height. */
export function logoImageWidth(height: number): number {
  return height <= 48 ? 640 : 1080;
}
