import { describe, it, expect } from 'vitest';
import {
  PLACEHOLDER_EMAIL, emailKeyOf, clientKeyOf, publicEntry, stripInternal, isTransientDbError
} from '../../server/src/submissionHelpers.ts';

describe('recognising the same guest', () => {
  it('ignores case and surrounding spaces in an email', () => {
    expect(emailKeyOf('  Rian@Atmos.CO ')).toBe('rian@atmos.co');
    expect(emailKeyOf('rian@atmos.co')).toBe(emailKeyOf('RIAN@ATMOS.CO'));
  });

  it('has nothing to recognise when there is no real email', () => {
    expect(emailKeyOf(PLACEHOLDER_EMAIL)).toBeNull();
    expect(emailKeyOf('Guest@Activation.Internal')).toBeNull();
    expect(emailKeyOf('')).toBeNull();
    expect(emailKeyOf(undefined)).toBeNull();
    expect(emailKeyOf('   ')).toBeNull();
  });

  it('accepts only well-formed per-visit keys', () => {
    expect(clientKeyOf('3f2b8c1e-9d4a-4c7e-8a55-0b1e2f3a4b5c')).toBe('3f2b8c1e-9d4a-4c7e-8a55-0b1e2f3a4b5c');
    expect(clientKeyOf('short')).toBeNull();
    expect(clientKeyOf('has spaces in it here')).toBeNull();
    expect(clientKeyOf("x'; DROP TABLE submissions;--")).toBeNull();
    expect(clientKeyOf('a'.repeat(101))).toBeNull();
    expect(clientKeyOf(12345678)).toBeNull();
    expect(clientKeyOf(null)).toBeNull();
  });
});

describe('what the public endpoint returns', () => {
  const row = {
    id: 'sub-1', ticket_code: '061026-1136-ABCD', status: 'registered', submission_type: 'raffle', created_at: '2026-10-06T00:00:00Z',
    ip_address: '203.0.113.9', user_agent: 'Mozilla/5.0', email_key: 'rian@atmos.co', client_key: 'abc12345',
    form_data: { fullName: 'Rian', email: 'rian@atmos.co', 'WhatsApp Number': '81234567890', 'Guest Type': 'VIP', 'Access Valid For': [{ label: 'Day 1' }], favouriteBrand: 'x' }
  };

  it('carries what the pass prints and nothing about the person beyond it', () => {
    const out: any = publicEntry(row);
    expect(out.ticket_code).toBe('061026-1136-ABCD');
    expect(out.form_data).toEqual({ fullName: 'Rian', email: 'rian@atmos.co', 'Guest Type': 'VIP', 'Access Valid For': [{ label: 'Day 1' }] });
    expect(out).not.toHaveProperty('ip_address');
    expect(out).not.toHaveProperty('user_agent');
    expect(out.form_data).not.toHaveProperty('WhatsApp Number');
  });

  it('reads answers stored as text', () => {
    const out: any = publicEntry({ ...row, form_data: JSON.stringify(row.form_data) });
    expect(out.form_data.fullName).toBe('Rian');
  });

  it('keeps the database bookkeeping keys away from staff views', () => {
    const out: any = stripInternal(row);
    expect(out).not.toHaveProperty('email_key');
    expect(out).not.toHaveProperty('client_key');
    expect(out.ticket_code).toBe('061026-1136-ABCD');
  });
});

describe('telling a passing database problem from a bug', () => {
  it('treats dropped connections, restarts and exhausted pools as "try again"', () => {
    for (const err of [
      { code: 'ECONNREFUSED' }, { code: 'ECONNRESET' }, { code: '57P01' }, { code: '57P03' }, { code: '08006' },
      { code: '53300' }, { code: '40P01' }, { code: '55P03' },
      new Error('Connection terminated unexpectedly'), new Error('timeout exceeded when trying to connect'),
      new Error('the database system is starting up'), new Error('sorry, too many clients already')
    ]) {
      expect(isTransientDbError(err), JSON.stringify(err)).toBe(true);
    }
  });

  it('does not hide real bugs behind "try again"', () => {
    for (const err of [
      { code: '42703', message: 'column "x" does not exist' }, { code: '23505', message: 'duplicate key' },
      { code: '22P02', message: 'invalid input syntax' }, new Error('Cannot read properties of undefined')
    ]) {
      expect(isTransientDbError(err), JSON.stringify(err)).toBe(false);
    }
  });
});
