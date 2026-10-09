import { ref } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { apiFetch } from '../../services/apiClient.ts';
import { stripTextAnswers } from '../editor/guestAnswers.ts';
import { SESSIONS_ANSWER_KEY, type LivePassState } from '../editor/livePass.ts';
import type { TicketContext } from '../editor/ticket/ticketFields.ts';
import type { ActivationPage, ProjectItem } from '../../types/editor.ts';
import { accessId, guestEmail, guestName, normalizeStatus, type Submission } from './hubUtils.ts';

/**
 * Sends guests their e-ticket by email from the Campaign Hub.
 *
 * A ticket PDF lives on the guest's own phone once they download it, so there
 * is nothing on the server to forward. Instead the ticket is made again from
 * the guest's recorded entry — the same design (the campaign's live Ticket
 * page), the same details and the same Access ID / QR — here in the studio's
 * browser, one guest at a time, and handed to the server to email. The tab has
 * to stay open while it runs.
 */

export interface SendProgress {
  total: number;
  done: number;
  sent: number;
  skipped: number;
  failed: number;
  current: string;
  stopReason: string;
  finished: boolean;
}

interface Design { page: ActivationPage; context: TicketContext; passGuestType: string }

/** Statuses that hold a place; the server refuses anyone else. */
const HAS_PLACE = ['registered', 'confirmed', 'winner'];
const PLACEHOLDER_EMAIL = 'guest@activation.internal';
/** This many failures in a row means something is wrong (mail server, connection), not one bad address. */
const STOP_AFTER_FAILURES = 5;

export type Eligibility = { ok: true; project: ProjectItem } | { ok: false; why: 'status' | 'email' | 'sent' | 'design' };

export function useTicketSender() {
  const editorStore = useEditorStore();
  const progress = ref<SendProgress | null>(null);
  let cancelled = false;
  const designs = new Map<string, Promise<Design | null>>();

  function projectOf(pageId: string): ProjectItem | null {
    return editorStore.userProjects.find(p => p.id === pageId || (p.pages || []).some(pg => pg.id === pageId)) || null;
  }

  /** The campaign's live Ticket page and the details printed around it, as a guest sees them. */
  function loadDesign(project: ProjectItem): Promise<Design | null> {
    let pending = designs.get(project.id);
    if (!pending) {
      pending = (async () => {
        const res = await apiFetch(`/api/pages/${encodeURIComponent(project.brand_slug)}/${encodeURIComponent(project.slug)}`);
        if (!res.ok) return null;
        const item = (await res.json())?.data;
        const pages: ActivationPage[] = Array.isArray(item?.pages) ? stripTextAnswers(item.pages) : [];
        const page = pages.find(p => p.kind === 'ticket');
        if (!page) return null;
        const widgets = pages.flatMap(p => p.widget_tree || []);
        const pass = widgets.find((w: any) => w.type === 'GuestEPass') || null;
        const hero = widgets.find((w: any) => w.type === 'HeroDrop' && w.props?.brandLogoUrl);
        return {
          page,
          context: {
            passWidget: pass,
            logoUrl: pass?.props?.brandLogoUrl || hero?.props?.brandLogoUrl || '',
            campaignTitle: item.title || project.title || ''
          },
          passGuestType: pass ? String(pass.props?.guestType || 'Public') : ''
        };
      })().catch(() => null);
      designs.set(project.id, pending);
    }
    return pending;
  }

  function eligibility(row: Submission): Eligibility {
    if (!HAS_PLACE.includes(normalizeStatus(row.status))) return { ok: false, why: 'status' };
    const email = guestEmail(row);
    if (!email || email === PLACEHOLDER_EMAIL) return { ok: false, why: 'email' };
    if (row.ticket_emailed_at) return { ok: false, why: 'sent' };
    const project = projectOf(row.page_id);
    return project ? { ok: true, project } : { ok: false, why: 'design' };
  }

  function livePassFor(row: Submission, design: Design): LivePassState {
    const form = row.form_data || {};
    const sessions = form[SESSIONS_ANSWER_KEY];
    return {
      status: 'ready',
      waitlisted: false,
      code: String(row.ticket_code || ''),
      guestName: guestName(row) === 'Guest Participant' ? '' : guestName(row),
      email: guestEmail(row),
      guestType: String(form['Guest Type'] || design.passGuestType || ''),
      sessions: Array.isArray(sessions) ? sessions.filter((x: any) => x && typeof x === 'object' && x.label) : [],
      error: '',
      retry: () => {}
    };
  }

  function warnOnLeave(e: BeforeUnloadEvent) {
    e.preventDefault();
    e.returnValue = '';
  }

  async function run(rows: Submission[], onSent: (id: string) => void): Promise<SendProgress> {
    cancelled = false;
    const state: SendProgress = { total: rows.length, done: 0, sent: 0, skipped: 0, failed: 0, current: '', stopReason: '', finished: false };
    progress.value = state;
    window.addEventListener('beforeunload', warnOnLeave);
    let failuresInRow = 0;

    try {
      const { renderTicketPdfBlob } = await import('../editor/ticket/ticketPdf.ts');
      for (const row of rows) {
        if (cancelled) { state.stopReason = 'Stopped.'; break; }
        state.current = guestName(row) || accessId(row);
        const check = eligibility(row);
        if (!check.ok) { state.skipped++; state.done++; continue; }
        const design = await loadDesign(check.project);
        if (!design) { state.skipped++; state.done++; continue; }

        try {
          const blob = await renderTicketPdfBlob({
            page: design.page,
            context: design.context,
            livePass: livePassFor(row, design),
            fileName: 'ticket.pdf'
          });
          const res = await apiFetch(`/api/submissions/${encodeURIComponent(row.id)}/send-ticket`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/pdf' },
            body: blob
          });
          const json = await res.json().catch(() => null);
          const result = json?.result;
          if (res.ok && result === 'sent') {
            state.sent++;
            failuresInRow = 0;
            onSent(row.id);
          } else if (res.ok && (result === 'already_sent' || result === 'no_place' || result === 'no_email')) {
            state.skipped++;
          } else if (res.ok && result === 'mail_off') {
            state.stopReason = 'Email sending is switched off on the server, so nothing was sent.';
            break;
          } else {
            throw new Error(json?.error || `HTTP ${res.status}`);
          }
        } catch (err: any) {
          console.warn(`[TicketSender] Could not send the ticket to ${row.id}:`, err?.message || err);
          state.failed++;
          failuresInRow++;
          if (failuresInRow >= STOP_AFTER_FAILURES) {
            state.stopReason = `Stopped after ${STOP_AFTER_FAILURES} failures in a row — check the connection and the mail server, then run it again. Guests already sent are skipped.`;
            break;
          }
        }
        state.done++;
      }
    } finally {
      window.removeEventListener('beforeunload', warnOnLeave);
      state.current = '';
      state.finished = true;
    }
    return state;
  }

  /**
   * Makes and stores the ticket PDFs of guests who are about to be taken off the waitlist, without
   * emailing anyone, so the email that goes out when their status changes already carries the PDF.
   * Guests whose PDF could not be made are returned in `failed`; the caller decides what to do.
   */
  async function storeTickets(rows: Submission[], onStep?: (done: number, total: number) => void): Promise<{ failed: string[]; cancelled: boolean }> {
    cancelled = false;
    const failed: string[] = [];
    window.addEventListener('beforeunload', warnOnLeave);
    try {
      const { renderTicketPdfBlob } = await import('../editor/ticket/ticketPdf.ts');
      for (const [i, row] of rows.entries()) {
        if (cancelled) return { failed, cancelled: true };
        onStep?.(i, rows.length);
        try {
          const project = projectOf(row.page_id);
          const design = project ? await loadDesign(project) : null;
          if (!design) throw new Error('no ticket design');
          const blob = await renderTicketPdfBlob({
            page: design.page,
            context: design.context,
            livePass: livePassFor(row, design),
            fileName: 'ticket.pdf'
          });
          const res = await apiFetch(`/api/submissions/${encodeURIComponent(row.id)}/send-ticket?store_only=1`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/pdf' },
            body: blob
          });
          const json = await res.json().catch(() => null);
          if (!res.ok || json?.result !== 'stored') throw new Error(json?.error || `HTTP ${res.status}`);
        } catch (err: any) {
          console.warn(`[TicketSender] Could not prepare the ticket of ${row.id}:`, err?.message || err);
          failed.push(row.id);
        }
      }
      onStep?.(rows.length, rows.length);
      return { failed, cancelled: false };
    } finally {
      window.removeEventListener('beforeunload', warnOnLeave);
    }
  }

  return {
    progress,
    eligibility,
    run,
    storeTickets,
    cancel: () => { cancelled = true; },
    dismiss: () => { progress.value = null; }
  };
}
