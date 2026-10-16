/** Wording of the pop-up shown before a queue guest downloads their e-pass. Editors can change it on the pass. */
export const DEFAULT_TRACK_NOTICE = {
  title: 'Track your queue live',
  message: 'Your live queue link was sent to {{email}}. Open that email and tap "VIEW LIVE QUEUE" to follow your number as it moves. Download your e-pass now?',
  confirmLabel: 'Download E-Pass',
  cancelLabel: 'Not now'
};

export function fillTrackNotice(template: string, email: string): string {
  return template.replace(/{{\s*email\s*}}/gi, email);
}
