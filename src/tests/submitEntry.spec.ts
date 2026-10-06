import { describe, it, expect, vi } from 'vitest';
import { postEntry, createEntryKeyring, RETRY_DELAYS_MS } from '../services/submitEntry.ts';

const payload = { page_id: 'proj-1', submission_type: 'raffle', form_data: { fullName: 'Rian', email: 'rian@atmos.co' } };
const ok = (code = '061026-1136-ABCD') =>
  new Response(JSON.stringify({ success: true, data: { ticket_code: code, form_data: { fullName: 'Rian' } } }), { status: 201 });
const status = (code: number, body: object = {}) => new Response(JSON.stringify({ success: false, ...body }), { status: code });
const noWait = async () => {};

describe('sending a guest registration', () => {
  it('returns the entry on the first try', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(ok());
    const out = await postEntry(payload, 'key-aaaaaaaa', { fetchImpl: fetchImpl as any, sleep: noWait });
    expect(out).toMatchObject({ ok: true, duplicate: false });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('rides out a database restart: 503s are retried, with the same key every time', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(status(503, { retryable: true }))
      .mockResolvedValueOnce(status(503, { retryable: true }))
      .mockResolvedValueOnce(ok());
    const retries: number[] = [];
    const out = await postEntry(payload, 'key-bbbbbbbb', { fetchImpl: fetchImpl as any, sleep: noWait, onRetry: n => retries.push(n) });
    expect(out.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(retries).toEqual([1, 2]);
    const keys = fetchImpl.mock.calls.map(call => JSON.parse(call[1].body).client_key);
    expect(new Set(keys)).toEqual(new Set(['key-bbbbbbbb']));
  });

  it('retries a dropped connection too', async () => {
    const fetchImpl = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValueOnce(ok());
    const out = await postEntry(payload, 'key-cccccccc', { fetchImpl: fetchImpl as any, sleep: noWait });
    expect(out.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('retries a server error, which may be a connection that dropped mid-query', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(status(500, { error: 'boom' })).mockResolvedValueOnce(ok());
    expect((await postEntry(payload, 'key-dddddddd', { fetchImpl: fetchImpl as any, sleep: noWait })).ok).toBe(true);
  });

  it('does not retry an entry the server refused', async () => {
    for (const code of [400, 404, 413]) {
      const fetchImpl = vi.fn().mockResolvedValue(status(code, { error: 'Full name and email are required.' }));
      const out = await postEntry(payload, 'key-eeeeeeee', { fetchImpl: fetchImpl as any, sleep: noWait });
      expect(out).toEqual({ ok: false, message: 'Full name and email are required.', retryable: false });
      expect(fetchImpl).toHaveBeenCalledTimes(1);
    }
  });

  it('gives up after the last retry and says it can be tried again', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(status(503, { error: 'The guest database is not reachable right now.' }));
    const out = await postEntry(payload, 'key-ffffffff', { fetchImpl: fetchImpl as any, sleep: noWait });
    expect(out).toMatchObject({ ok: false, retryable: true });
    expect(fetchImpl).toHaveBeenCalledTimes(RETRY_DELAYS_MS.length + 1);
  });

  it('waits longer between each retry', async () => {
    const waits: number[] = [];
    const fetchImpl = vi.fn().mockResolvedValue(status(503));
    await postEntry(payload, 'key-gggggggg', { fetchImpl: fetchImpl as any, sleep: async ms => { waits.push(ms); } });
    expect(waits).toEqual(RETRY_DELAYS_MS);
    expect([...waits].sort((a, b) => a - b)).toEqual(waits);
  });

  it('reports a repeat registration as such', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, duplicate: true, data: { ticket_code: 'X' } }), { status: 200 }));
    expect(await postEntry(payload, 'key-hhhhhhhh', { fetchImpl: fetchImpl as any, sleep: noWait })).toMatchObject({ ok: true, duplicate: true });
  });
});

describe('the key of a registration', () => {
  it('stays the same for the same answers and changes when they do', () => {
    let n = 0;
    const keyring = createEntryKeyring(() => `key-${++n}-xxxxxxxx`);
    const a = keyring.keyFor({ fullName: 'Rian', email: 'a@x.co' });
    expect(keyring.keyFor({ fullName: 'Rian', email: 'a@x.co' })).toBe(a); // a retry / second tap
    const b = keyring.keyFor({ fullName: 'Rian', email: 'b@x.co' });       // corrected the email
    expect(b).not.toBe(a);
    expect(keyring.keyFor({ fullName: 'Rian', email: 'b@x.co' })).toBe(b);
  });

  it('starts over for a new visit', () => {
    let n = 0;
    const keyring = createEntryKeyring(() => `key-${++n}-xxxxxxxx`);
    const first = keyring.keyFor({ fullName: 'A' });
    keyring.reset();
    expect(keyring.keyFor({ fullName: 'A' })).not.toBe(first);
  });

  it('produces keys the server accepts', async () => {
    const { newClientKey } = await import('../services/submitEntry.ts');
    const { clientKeyOf } = await import('../../server/src/submissionHelpers.ts');
    expect(clientKeyOf(newClientKey())).not.toBeNull();
  });
});
