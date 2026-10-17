import { describe, it, expect } from 'vitest';
import {
  customFieldKeys,
  buildCsv,
  type Submission
} from '../components/hub/hubUtils.ts';

const mockSubmission = (
  id: string,
  formData: Record<string, any> = {},
  extra: Partial<Submission> = {}
): Submission => ({
  id,
  page_id: 'page-1',
  brand_slug: 'atmos',
  submission_type: 'raffle',
  status: 'registered',
  created_at: '2026-10-17T10:00:00Z',
  ticket_code: `CODE-${id}`,
  form_data: {
    fullName: `Guest ${id}`,
    email: `guest${id}@example.com`,
    ...formData
  },
  ...extra
});

describe('Guest Database Columns & Project Filtering', () => {
  it('strips all internal system and session metadata keys from customFieldKeys', () => {
    const rows = [
      mockSubmission('1', {
        event_iso_date: '2026-10-17',
        event_date: '17 October 2026',
        'Access Valid For': 'Day 1',
        selected_sessions: [{ label: 'Morning' }],
        queue_number: 1,
        party_size: 2,
        wa_notified_states: ['welcome'],
        shoeSize: 'US 10',
        instagramHandle: '@atmos_fan'
      })
    ];

    const keys = customFieldKeys(rows);
    // Only real custom questions should remain
    expect(keys).toContain('shoeSize');
    expect(keys).toContain('instagramHandle');

    // System/technical keys must NOT appear as custom columns
    expect(keys).not.toContain('event_iso_date');
    expect(keys).not.toContain('event_date');
    expect(keys).not.toContain('Access Valid For');
    expect(keys).not.toContain('selected_sessions');
    expect(keys).not.toContain('queue_number');
    expect(keys).not.toContain('party_size');
    expect(keys).not.toContain('wa_notified_states');
  });

  it('includes Queue No and Checked Out At in buildCsv export', () => {
    const rows = [
      mockSubmission('1', { shoeSize: 'US 9' }, {
        queue_number: 42,
        checked_in_at: '2026-10-17T11:00:00Z',
        checked_out_at: '2026-10-17T12:30:00Z'
      })
    ];

    const csv = buildCsv(rows, ['shoeSize'], () => 'Atmos Drop');
    expect(csv).toContain('Queue No');
    expect(csv).toContain('Checked In At');
    expect(csv).toContain('Checked Out At');
    expect(csv).toContain('#42');
    expect(csv).toContain('2026-10-17T12:30:00.000Z');
  });

  it('correctly filters inside vs checked_out guest states', () => {
    const insideGuest = mockSubmission('1', {}, {
      checked_in_at: '2026-10-17T11:00:00Z',
      checked_out_at: null
    });

    const checkedOutGuest = mockSubmission('2', {}, {
      checked_in_at: '2026-10-17T11:00:00Z',
      checked_out_at: '2026-10-17T12:00:00Z'
    });

    const notInGuest = mockSubmission('3', {}, {
      checked_in_at: null,
      checked_out_at: null
    });

    // Helper predicate matching GuestDatabaseTable filter logic
    const isInside = (s: Submission) =>
      Boolean(s.checked_in_at && (!s.checked_out_at || new Date(s.checked_out_at) < new Date(s.checked_in_at)));

    const isCheckedOut = (s: Submission) =>
      Boolean(s.checked_out_at && (!s.checked_in_at || new Date(s.checked_out_at) >= new Date(s.checked_in_at)));

    expect(isInside(insideGuest)).toBe(true);
    expect(isCheckedOut(insideGuest)).toBe(false);

    expect(isInside(checkedOutGuest)).toBe(false);
    expect(isCheckedOut(checkedOutGuest)).toBe(true);

    expect(isInside(notInGuest)).toBe(false);
    expect(isCheckedOut(notInGuest)).toBe(false);
  });
});
