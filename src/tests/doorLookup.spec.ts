import { describe, it, expect } from 'vitest';
import { findGuestsByShortCode, codeTail, phoneTail, type Submission } from '../components/hub/hubUtils.ts';

const guest = (id: string, code: string, name: string, phone = '', extra: Partial<Submission> = {}): Submission => ({
  id, page_id: 'p1', brand_slug: 'atmos', submission_type: 'raffle', status: 'registered', created_at: '2026-10-08T10:00:00Z',
  ticket_code: code, form_data: { fullName: name, email: `${id}@x.co`, ...(phone ? { 'WhatsApp Number': phone } : {}) }, ...extra
});

const rows = [
  guest('a', '061026-1103-487T', 'Faturrahman', '85960219683'),
  guest('b', '061026-1105-K7QM', 'Nadia Pratama', '81234560001'),
  guest('c', '071026-0900-K7QM', 'Dimas Wijaya', '81299990002'),
  guest('d', '071026-0901-9QRZ', 'Sari Dewi', '81200009683'),
  guest('e', '071026-0902-ABCD', 'Dup Guest', '', { duplicate_of: 'a' })
];

describe('door lookup by short code', () => {
  it('finds a guest by the last four characters of the Access ID, any case', () => {
    expect(findGuestsByShortCode(rows, '487t').map(m => m.guest.id)).toEqual(['a']);
    expect(findGuestsByShortCode(rows, '487T')[0].via).toBe('code');
  });

  it('returns every guest who shares the ending, so the door can pick', () => {
    expect(findGuestsByShortCode(rows, 'K7QM').map(m => m.guest.id).sort()).toEqual(['b', 'c']);
  });

  it('finds by the last digits of the WhatsApp number', () => {
    const hits = findGuestsByShortCode(rows, '9683');
    expect(hits.map(m => m.guest.id).sort()).toEqual(['a', 'd']);
    expect(hits.every(m => m.via === 'phone')).toBe(true);
  });

  it('a whole Access ID, with or without dashes, matches exactly one guest', () => {
    expect(findGuestsByShortCode(rows, '061026-1103-487T').map(m => m.guest.id)).toEqual(['a']);
    expect(findGuestsByShortCode(rows, '0610261103487t').map(m => m.guest.id)).toEqual(['a']);
  });

  it('finds by part of the name, after code and phone matches', () => {
    expect(findGuestsByShortCode(rows, 'nadia').map(m => m.guest.id)).toEqual(['b']);
  });

  it('waits for three characters and never lists a guest registered twice', () => {
    expect(findGuestsByShortCode(rows, '48')).toEqual([]);
    expect(findGuestsByShortCode(rows, 'ABCD')).toEqual([]);
  });

  it('lists guests who are not inside yet before those already in', () => {
    const list = [
      guest('x', '011026-1000-ZZ11', 'Aaron', '', { checked_in_at: '2026-10-08T11:00:00Z' }),
      guest('y', '021026-1001-QQ11', 'Zed')
    ];
    expect(findGuestsByShortCode(list, 'Z11').length).toBe(1);
    expect(findGuestsByShortCode(list, 'Q11')[0].guest.id).toBe('y');
    const both = [
      guest('x', '011026-1000-AB11', 'Aaron', '', { checked_in_at: '2026-10-08T11:00:00Z' }),
      guest('y', '021026-1001-CD11', 'Zed')
    ];
    expect(findGuestsByShortCode(both, 'ab11').map(m => m.guest.id)).toEqual(['x']);
    const shared = [
      guest('x', '011026-1000-AA77', 'Aaron', '', { checked_in_at: '2026-10-08T11:00:00Z' }),
      guest('y', '021026-1001-BA77', 'Zed')
    ];
    expect(findGuestsByShortCode(shared, 'A77').map(m => m.guest.id)).toEqual(['y', 'x']);
  });

  it('shows the tails door staff read out', () => {
    expect(codeTail(rows[0])).toBe('487T');
    expect(phoneTail(rows[0])).toBe('9683');
    expect(phoneTail(rows[4])).toBe('');
  });
});
