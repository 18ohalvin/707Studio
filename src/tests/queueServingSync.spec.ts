import { describe, it, expect } from 'vitest';
import { type Submission } from '../components/hub/hubUtils.ts';

function computeNextCalledNumber(
  currentCalled: number,
  guest: Partial<Submission> | null,
  serverCalled?: number
): number {
  const sCalled = Number(serverCalled);
  const qNum = Number(guest?.queue_number) || Number((guest as any)?.answers?.queue_number) || 0;
  const next = sCalled > 0 ? sCalled : (qNum > 0 ? Math.max(currentCalled, qNum) : currentCalled);
  return next > currentCalled ? next : currentCalled;
}

describe('Queue Serving Sync on Check-in (Option A)', () => {
  it('automatically syncs currentCalledNumber to admitted guest queue number when guest is higher', () => {
    const currentCalled = 1;
    const guest: Partial<Submission> = { queue_number: 5 };
    const next = computeNextCalledNumber(currentCalled, guest);
    expect(next).toBe(5);
  });

  it('does not rewind currentCalledNumber if a guest arrives late/out of order', () => {
    const currentCalled = 7;
    const lateGuest: Partial<Submission> = { queue_number: 4 };
    const next = computeNextCalledNumber(currentCalled, lateGuest);
    expect(next).toBe(7);
  });

  it('prefers server-authoritative currentCalledNumber when returned', () => {
    const currentCalled = 2;
    const guest: Partial<Submission> = { queue_number: 3 };
    const next = computeNextCalledNumber(currentCalled, guest, 4);
    expect(next).toBe(4);
  });

  it('does not modify currentCalledNumber if admitted guest has no queue number', () => {
    const currentCalled = 8;
    const walkInGuest: Partial<Submission> = { queue_number: undefined };
    const next = computeNextCalledNumber(currentCalled, walkInGuest);
    expect(next).toBe(8);
  });

  it('handles null guest safely without error', () => {
    const currentCalled = 3;
    const next = computeNextCalledNumber(currentCalled, null);
    expect(next).toBe(3);
  });
});
