import type { Pool, PoolClient } from 'pg';
import { isTransientDbError } from './submissionHelpers.js';

/**
 * Borrows a connection for work that needs several statements on the same one
 * (a transaction), and always hands it back.
 *
 * node-postgres leaves a borrowed connection's 'error' event to the caller: if
 * the database drops the connection while it is borrowed and nothing is
 * listening, the event is thrown and the whole server process exits. That
 * happens exactly when the database restarts in the middle of a registration,
 * the moment the server most needs to stay up. So a listener is attached for
 * as long as the connection is borrowed, and a connection that was lost (or
 * failed in a way that suggests it was) is thrown away instead of being put
 * back into the pool.
 */
export async function withClient<T>(pool: Pool, work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  let broken = false;
  const onError = (err: Error) => {
    broken = true;
    console.warn('[DB] A connection was lost while in use:', err.message);
  };
  client.on('error', onError);
  try {
    return await work(client);
  } catch (err) {
    if (isTransientDbError(err)) broken = true;
    throw err;
  } finally {
    client.removeListener('error', onError);
    client.release(broken);
  }
}
