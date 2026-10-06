import type { InjectionKey } from 'vue';

/**
 * Guest data a Ticket page can place. Values are filled in per guest when the
 * PDF is made; in the editor they show sample data in the real format.
 */
export type TicketFieldKey =
  | 'guestName' | 'accessId' | 'guestType' | 'email' | 'venue'
  | 'eventTitle' | 'qr' | 'sessions' | 'brandLogo';

export const TICKET_FIELDS: ReadonlyArray<{ key: TicketFieldKey; label: string; caption: string; solo?: boolean }> = [
  { key: 'qr', label: 'QR Code', caption: '', solo: true },
  { key: 'guestName', label: 'Guest Name', caption: 'GUEST NAME' },
  { key: 'accessId', label: 'Access ID', caption: 'ACCESS ID' },
  { key: 'guestType', label: 'Guest Type', caption: 'GUEST TYPE' },
  { key: 'venue', label: 'Venue', caption: 'VENUE' },
  { key: 'email', label: 'Email', caption: 'EMAIL' },
  { key: 'eventTitle', label: 'Event Title', caption: 'EVENT' },
  { key: 'sessions', label: 'Access Valid For', caption: 'ACCESS VALID FOR', solo: true },
  { key: 'brandLogo', label: 'Brand Logo', caption: '', solo: true }
];

export function ticketFieldMeta(key: string) {
  return TICKET_FIELDS.find(f => f.key === key) || TICKET_FIELDS[1];
}

/** 9:16 — a phone screen, so the ticket reads well saved to a camera roll. */
export const TICKET_CANVAS = { width: 340, height: 604 };

/** PDF sheet in the same 9:16 proportion, in millimetres. */
export const TICKET_PAPER = { width: 90, height: 160 };

/**
 * What a Ticket page needs from the rest of the campaign when it is rendered
 * on its own (for the PDF): the Ticket Summary widget (venue, guest type,
 * fallback sessions), the brand logo and the campaign title.
 */
export interface TicketContext {
  passWidget: any | null;
  logoUrl: string;
  campaignTitle: string;
}

export const TICKET_CONTEXT_KEY: InjectionKey<TicketContext> = Symbol('ticketContext');

/** The layout a new Ticket page starts with. */
export function defaultTicketWidgets(): { type: 'TicketField' | 'TextBanner'; props: Record<string, any> }[] {
  return [
    { type: 'TicketField', props: { fields: ['brandLogo'], align: 'left' } },
    { type: 'TextBanner', props: { text: 'ACCESS PASS', placeholder: 'WRITE YOUR TEXT HERE', typographyStyle: 'headline-2', fontSize: '24px', fontWeight: 'medium', textAlign: 'left', color: '#000000' } },
    { type: 'TicketField', props: { fields: ['qr'], align: 'left' } },
    { type: 'TicketField', props: { fields: ['guestName', 'guestType'], align: 'left' } },
    { type: 'TicketField', props: { fields: ['accessId', 'venue'], align: 'left' } },
    { type: 'TicketField', props: { fields: ['sessions'], align: 'left' } }
  ];
}

/**
 * On a live page: the campaign's Ticket page and its context, provided by
 * PublicDropView (the Ticket page is not one of the funnel pages the guest
 * walks through, so the artboard cannot find it on its own).
 */
export interface TicketSource {
  page: any | null;
  context: TicketContext;
}

export const TICKET_SOURCE_KEY: InjectionKey<TicketSource> = Symbol('ticketSource');
