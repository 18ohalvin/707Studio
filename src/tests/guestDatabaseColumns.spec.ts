import { describe, it, expect } from 'vitest';
import {
  customFieldKeys,
  buildCsv,
  type Submission
} from '../components/hub/hubUtils.ts';
import {
  extractProjectFormSchema,
  resolveFieldValue,
  formatSchemaAnswer,
  archivedAnswerKeys,
  extractDocuments,
  isImageDocument,
  fieldFilterOptions
} from '../components/hub/formSchema.ts';
import type { ActivationPage } from '../types/editor.ts';

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

  it('extracts dynamic schema columns across pages in exact Editor order', () => {
    const pages = [
      {
        id: 'p1',
        page_name: 'Page 1: Form',
        widget_tree: [
          {
            id: 'rf_1',
            type: 'RegistrationForm',
            props: {
              fields: [
                { id: 'f_fn', name: 'Full Name*', type: 'text', required: true },
                { id: 'f_em', name: 'Email Address*', type: 'email', required: true },
                { id: 'f_wa', name: 'WhatsApp Number*', type: 'tel', countryCode: '+62', required: true },
                { id: 'f_dob', name: 'Date', type: 'date', required: true },
                { id: 'f_gender', name: 'Gender*', type: 'text', required: true },
                { id: 'f_doc', name: 'Upload Receipt*', type: 'file', required: true }
              ]
            }
          }
        ]
      },
      {
        id: 'p2',
        page_name: 'Page 2: Sessions',
        widget_tree: [
          {
            id: 'mc_1',
            type: 'MultipleChoice',
            props: {
              question: 'Choose Session',
              options: [
                { id: 'opt1', label: 'Morning Run' },
                { id: 'opt2', label: 'Evening Panel' }
              ]
            }
          },
          {
            id: 'doc_1',
            type: 'DocumentUpload',
            props: { title: 'ID Card', fieldName: 'id_card_file' }
          },
          {
            id: 'hidden_1',
            type: 'FieldInput',
            isHidden: true,
            props: { label: 'Hidden Note', inputType: 'text' }
          }
        ]
      },
      {
        id: 'p_ticket',
        kind: 'ticket',
        page_name: 'Ticket PDF',
        widget_tree: [{ id: 'tf_1', type: 'TicketField', props: { fields: ['guestName'] } }]
      }
    ] as unknown as ActivationPage[];

    const schema = extractProjectFormSchema(pages);
    expect(schema.map(f => f.label)).toEqual([
      'Full Name',
      'Email Address',
      'WhatsApp Number',
      'Date',
      'Gender',
      'Upload Receipt',
      'Choose Session',
      'ID Card'
    ]);
    expect(schema.find(f => f.fieldId === 'f_dob')?.kind).toBe('date');
    expect(schema.find(f => f.fieldId === 'f_gender')?.kind).toBe('select');
    expect(schema.find(f => f.fieldId === 'f_gender')?.options).toEqual(['Female', 'Male', 'Custom']);
    expect(schema.find(f => f.fieldId === 'f_doc')?.kind).toBe('file');
    expect(schema.find(f => f.widgetId === 'mc_1')?.options).toEqual(['Morning Run', 'Evening Panel']);
    expect(schema.find(f => f.widgetId === 'doc_1')?.kind).toBe('file');
  });

  it('resolves renamed fields via _field_map and avoids Atmos fallback leakage on other brands', () => {
    const pages = [
      {
        id: 'p1',
        widget_tree: [
          {
            id: 'rf_1',
            type: 'RegistrationForm',
            props: {
              fields: [
                { id: 'f_ig', name: 'Instagram Username', type: 'text' }
              ]
            }
          },
          {
            id: 'mc_1',
            type: 'MultipleChoice',
            props: {
              question: 'Preferred Court',
              options: [{ id: 'a', label: 'Court A' }]
            }
          }
        ]
      }
    ] as unknown as ActivationPage[];

    const schema = extractProjectFormSchema(pages);
    const igField = schema[0];
    const mcField = schema[1];

    // Row submitted when label was "IG Handle"
    const renamedRow = mockSubmission('10', {
      'IG Handle': '@on_runner',
      _field_map: { [igField.key]: 'IG Handle' }
    }, { brand_slug: 'on-running', page_id: 'proj-on-999' });

    expect(resolveFieldValue(renamedRow, igField)).toBe('@on_runner');
    expect(formatSchemaAnswer(renamedRow, mcField)).toBe('');
    expect(archivedAnswerKeys([renamedRow], schema)).toEqual([]);

    // Custom column named "Date" must NOT be dropped by customFieldKeys
    const dateKeys = customFieldKeys([mockSubmission('11', { Date: '1998-05-12' })]);
    expect(dateKeys).toContain('Date');
  });

  it('extracts document previews and schema facet filter options cleanly', () => {
    const docs = extractDocuments([
      { url: '/uploads/documents/receipt.jpg', name: 'receipt.jpg', type: 'image/jpeg' },
      { url: '/uploads/documents/waiver.pdf', name: 'waiver.pdf', type: 'application/pdf' }
    ]);
    expect(docs).toHaveLength(2);
    expect(isImageDocument(docs[0])).toBe(true);
    expect(isImageDocument(docs[1])).toBe(false);

    const schema = extractProjectFormSchema([
      {
        id: 'p1',
        widget_tree: [
          {
            id: 'mc_1',
            type: 'MultipleChoice',
            props: { question: 'Size', options: [{ id: 'm', label: 'M' }, { id: 'l', label: 'L' }] }
          }
        ]
      }
    ] as unknown as ActivationPage[]);

    const opts = fieldFilterOptions(schema[0], [mockSubmission('1', { Size: ['XL'] })]);
    expect(opts).toEqual(['M', 'L', 'XL']);

    const csv = buildCsv(
      [mockSubmission('1', { Size: ['M'], _field_map: { 'mc:mc_1': 'Size' } }, { brand_slug: 'brand-x', page_id: 'p1' })],
      [{ key: 'mc:mc_1', label: 'Size', getValue: (s) => formatSchemaAnswer(s, schema[0]) }],
      () => 'Brand X'
    );
    expect(csv).toContain(',Size,');
    expect(csv).toContain(',M,');
    expect(csv).not.toContain('5K RUN');
  });
});
