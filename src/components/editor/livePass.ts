import type { InjectionKey } from 'vue';

/** A session/option the guest picked, as printed under "Access valid for". */
export interface PassSession {
  label: string;
  sublabel?: string;
  description?: string;
}

/** Answer key that carries the guest's picked sessions in the submission. */
export const SESSIONS_ANSWER_KEY = 'Access Valid For';

/**
 * The guest's real e-pass on a published page, provided by PublicDropView and
 * read by the GuestEPass widget. Kept apart from the widget props so the pass
 * never shows the editor's placeholder Access ID as if it were a real one —
 * a guest holding that code would be turned away at the door.
 */
export interface LivePassState {
  status: 'idle' | 'pending' | 'ready' | 'error';
  /** Server-issued Access ID. */
  code: string;
  /** The guest as recorded by the server — what the door staff will see too. */
  guestName: string;
  email: string;
  guestType: string;
  /** Registered, but on the waitlist: no place yet, and the door will not admit the code. */
  waitlisted: boolean;
  /** Sessions the guest picked, as recorded — the pass and its PDF print exactly these. */
  sessions: PassSession[];
  error: string;
  retry: () => void;
}

export const LIVE_PASS_KEY: InjectionKey<LivePassState> = Symbol('livePass');
