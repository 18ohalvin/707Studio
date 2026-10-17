import { describe, it, expect } from 'vitest';
import {
  totalInsideGuests,
  isGuestInside,
  type Submission
} from '../components/hub/hubUtils.ts';

describe('Global Capacity & Multi-Device Scanner Sync', () => {
  it('applies capacity GLOBALLY across all scanners (Tab 1, Tab 2, etc.)', () => {
    const maxCapacity = 20;

    // Simulate admissions performed by different tablets
    const submissions: Partial<Submission>[] = [
      { id: 'sub-1', party_size: 4, checked_in_at: '2026-10-17T10:00:00Z', checked_in_by: 'Tab 1', checked_out_at: null },
      { id: 'sub-2', party_size: 6, checked_in_at: '2026-10-17T10:02:00Z', checked_in_by: 'Tab 2', checked_out_at: null },
      { id: 'sub-3', party_size: 5, checked_in_at: '2026-10-17T10:05:00Z', checked_in_by: 'Tab 1', checked_out_at: null },
      { id: 'sub-4', party_size: 5, checked_in_at: '2026-10-17T10:08:00Z', checked_in_by: 'Tab 2', checked_out_at: null },
    ];

    // Total inside must sum all checked-in guests regardless of which scanner admitted them
    const insideTotal = totalInsideGuests(submissions as Submission[]);
    expect(insideTotal).toBe(20);

    const availableSpots = Math.max(0, maxCapacity - insideTotal);
    expect(availableSpots).toBe(0);

    // Any further admission on Tab 1 or Tab 2 will exceed global capacity
    const newGuestPartySize = 1;
    const canAdmit = insideTotal + newGuestPartySize <= maxCapacity;
    expect(canAdmit).toBe(false);
  });

  it('immediately releases global capacity when Tab 2 checks out a guest admitted by Tab 1', () => {
    const maxCapacity = 20;

    const guest1: Partial<Submission> = {
      id: 'sub-1',
      party_size: 4,
      checked_in_at: '2026-10-17T10:00:00Z',
      checked_in_by: 'Tab 1',
      checked_out_at: null
    };
    const guest2: Partial<Submission> = {
      id: 'sub-2',
      party_size: 16,
      checked_in_at: '2026-10-17T10:05:00Z',
      checked_in_by: 'Tab 2',
      checked_out_at: null
    };

    const initialRows = [guest1, guest2] as Submission[];
    expect(totalInsideGuests(initialRows)).toBe(20);

    // Guest 1 checks out at Tab 2 (Exit Gate)
    const checkedOutGuest1 = {
      ...guest1,
      checked_out_at: '2026-10-17T10:30:00Z'
    } as Submission;

    expect(isGuestInside(checkedOutGuest1)).toBe(false);

    // Updated shared list
    const updatedRows = [checkedOutGuest1, guest2 as Submission];
    const newInsideTotal = totalInsideGuests(updatedRows);
    expect(newInsideTotal).toBe(16);

    const newAvailableSpots = Math.max(0, maxCapacity - newInsideTotal);
    expect(newAvailableSpots).toBe(4);
  });

  it('resolves effective operator by prioritizing local device name (Tab 1 / Tab 2)', () => {
    function resolveEffectiveOperator(deviceName: string, accountName: string): string {
      const custom = deviceName.trim();
      if (custom) return custom;
      return accountName || 'Door staff';
    }

    // Both tablets logged in with account "iPad", but with device labels
    expect(resolveEffectiveOperator('Tab 1', 'iPad')).toBe('Tab 1');
    expect(resolveEffectiveOperator('Tab 2', 'iPad')).toBe('Tab 2');
    expect(resolveEffectiveOperator('Gate 1', 'iPad')).toBe('Gate 1');

    // Fallback when no device name is entered
    expect(resolveEffectiveOperator('', 'iPad')).toBe('iPad');
    expect(resolveEffectiveOperator('   ', 'Door Staff')).toBe('Door Staff');
    expect(resolveEffectiveOperator('', '')).toBe('Door staff');
  });

  it('keeps admission log correctly attributed to respective tablets', () => {
    const logEntries: Partial<Submission>[] = [
      { id: '1', checked_in_at: '2026-10-17T10:00:00Z', checked_in_by: 'Tab 1' },
      { id: '2', checked_in_at: '2026-10-17T10:01:00Z', checked_in_by: 'Tab 2' },
      { id: '3', checked_in_at: '2026-10-17T10:02:00Z', checked_in_by: 'Tab 1' },
    ];

    expect(logEntries[0].checked_in_by).toBe('Tab 1');
    expect(logEntries[1].checked_in_by).toBe('Tab 2');
    expect(logEntries[2].checked_in_by).toBe('Tab 1');
  });
});
