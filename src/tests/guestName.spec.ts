import { describe, it, expect } from 'vitest';
import { guestName, type Submission } from '../components/hub/hubUtils.ts';

const sub = (form_data: Record<string, any>) => ({ form_data } as Submission);

describe('guestName', () => {
  it('rebuilds the full name when only the surname was stored', () => {
    expect(guestName(sub({ fullName: 'Decorous', 'First Name': 'Alvin', 'Last Name': 'Decorous' }))).toBe('Alvin Decorous');
  });
  it('keeps a stored full name', () => {
    expect(guestName(sub({ fullName: 'Alvin Decorous' }))).toBe('Alvin Decorous');
  });
  it('falls back to the placeholder', () => {
    expect(guestName(sub({}))).toBe('Guest Participant');
  });
});
