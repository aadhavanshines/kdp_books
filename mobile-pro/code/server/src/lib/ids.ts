import { randomBytes } from 'node:crypto';

/** "ord_k3j9x2m1q8" style ids. */
export function newId(prefix: string): string {
  return `${prefix}_${randomBytes(6).toString('base64url').replace(/[-_]/g, 'x').toLowerCase()}`;
}

export function orderNumber(app: 'platter' | 'cartly' | 'minutely'): string {
  const prefix = { platter: 'PLT', cartly: 'CRT', minutely: 'MNT' }[app];
  return `${prefix}-${100000 + (randomBytes(4).readUInt32BE(0) % 900000)}`;
}
