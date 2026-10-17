import { describe, it, expect } from 'vitest';
import {
  getTodayDateStrings,
  extractSubmissionDate,
  isSubmissionForToday,
  findGuestsByShortCode,
  type Submission
} from '../components/hub/hubUtils.ts';

const mockGuest = (
  id: string,
  code: string,
  name: string,
  formData: Record<string, any> = {},
  extra: Partial<Submission> = {}
): Submission => ({
  id,
  page_id: 'p1',
  brand_slug: 'atmos',
  submission_type: 'raffle',
  status: 'registered',
  created_at: '2026-10-17T09:00:00Z',
  ticket_code: code,
  form_data: {
    fullName: name,
    email: `${id}@example.com`,
    ...formData
  },
  ...extra
});

describe('Door Scanner Date Filtering for Rolling / Multi-day Events', () => {
  const refDate = new Date('2026-10-17T12:00:00Z'); // Fixed reference date: 17 Oct 2026

  it('formats reference date into iso, full, and short forms accurately', () => {
    const dates = getTodayDateStrings(refDate);
    expect(dates.iso).toBe('2026-10-17');
    expect(dates.formatted).toBe('17 October 2026');
    expect(dates.formattedShort).toBe('17 Oct 2026');
  });

  it('correctly extracts submission target event date', () => {
    const gIso = mockGuest('1', 'T-001', 'Alice', { event_iso_date: '2026-10-17' });
    expect(extractSubmissionDate(gIso)).toBe('2026-10-17');

    const gNamed = mockGuest('2', 'T-002', 'Bob', { event_date: '18 October 2026' });
    expect(extractSubmissionDate(gNamed)).toBe('18 October 2026');

    const gSession = mockGuest('3', 'T-003', 'Charlie', {
      selected_sessions: [{ sublabel: '19 Oct 2026 · 14:00 - 16:00' }]
    });
    expect(extractSubmissionDate(gSession)).toBe('19 Oct 2026 · 14:00 - 16:00');
  });

  it('verifies submission is for today when event_iso_date matches', () => {
    const todayGuest = mockGuest('1', 'T-001', 'Alice', { event_iso_date: '2026-10-17' });
    const tomorrowGuest = mockGuest('2', 'T-002', 'Bob', { event_iso_date: '2026-10-18' });

    expect(isSubmissionForToday(todayGuest, refDate)).toBe(true);
    expect(isSubmissionForToday(tomorrowGuest, refDate)).toBe(false);
  });

  it('verifies submission is for today when event_date text matches', () => {
    const todayLong = mockGuest('1', 'T-001', 'Alice', { event_date: '17 October 2026' });
    const todayShort = mockGuest('2', 'T-002', 'Bob', { event_date: '17 Oct 2026' });
    const yesterday = mockGuest('3', 'T-003', 'Charlie', { event_date: '16 October 2026' });

    expect(isSubmissionForToday(todayLong, refDate)).toBe(true);
    expect(isSubmissionForToday(todayShort, refDate)).toBe(true);
    expect(isSubmissionForToday(yesterday, refDate)).toBe(false);
  });

  it('verifies submission is for today via session sublabels', () => {
    const todaySession = mockGuest('1', 'T-001', 'Alice', {
      selected_sessions: [{ sublabel: '17 Oct 2026 · 10:00' }]
    });
    const tomorrowSession = mockGuest('2', 'T-002', 'Bob', {
      selected_sessions: [{ sublabel: '18 Oct 2026 · 10:00' }]
    });

    expect(isSubmissionForToday(todaySession, refDate)).toBe(true);
    expect(isSubmissionForToday(tomorrowSession, refDate)).toBe(false);
  });

  it('falls back to created_at when no explicit event_date field exists', () => {
    const todayCreated = mockGuest('1', 'T-001', 'Alice', {}, { created_at: '2026-10-17T08:30:00Z' });
    const oldCreated = mockGuest('2', 'T-002', 'Bob', {}, { created_at: '2026-10-10T08:30:00Z' });

    expect(isSubmissionForToday(todayCreated, refDate)).toBe(true);
    expect(isSubmissionForToday(oldCreated, refDate)).toBe(false);
  });

  it('ensures short code candidate search only searches active (today) rows', () => {
    const todayRows = [
      mockGuest('a', '171026-1100-888A', 'Today Guest A', { event_iso_date: '2026-10-17' }),
      mockGuest('b', '181026-1100-888A', 'Tomorrow Guest B', { event_iso_date: '2026-10-18' }),
      mockGuest('c', '171026-1200-999B', 'Today Guest C', { event_iso_date: '2026-10-17' })
    ];

    // Filter to active rows as DoorScanner does
    const activeRows = todayRows.filter(r => isSubmissionForToday(r, refDate));
    expect(activeRows.length).toBe(2);
    expect(activeRows.map(r => r.id)).toEqual(['a', 'c']);

    // Lookup 888A on activeRows yields only Today Guest A
    const hits = findGuestsByShortCode(activeRows, '888A');
    expect(hits.length).toBe(1);
    expect(hits[0].guest.id).toBe('a');
  });
});
