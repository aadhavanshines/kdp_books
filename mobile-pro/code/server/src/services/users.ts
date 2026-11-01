import type { Address, AddressInput, ArtName, User } from '@pro/api/types';

import type { DB } from '../db';
import { badRequest, notFound } from '../lib/errors';
import { LOCALITIES } from '../lib/geo';
import { newId } from '../lib/ids';
import { iso } from '../lib/time';

export interface UserRow {
  id: string;
  phone: string;
  name: string;
  email: string;
  handle: string;
  avatar: string | null;
  bio: string;
  website: string | null;
  verified: number;
  created_at: number;
}

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    handle: row.handle,
    avatar: row.avatar as ArtName | null,
    createdAt: iso(row.created_at),
  };
}

export function getUserRow(db: DB, id: string): UserRow {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
  if (!row) throw notFound('User');
  return row;
}

/** Signs in an existing customer by phone, or creates a new one. */
export function findOrCreateByPhone(db: DB, phone: string, now: number): { user: UserRow; isNew: boolean } {
  const existing = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as UserRow | undefined;
  if (existing) return { user: existing, isNew: false };
  const id = newId('u');
  let handle = `northbay_${phone.slice(-4)}`;
  for (let i = 2; db.prepare('SELECT 1 FROM users WHERE handle = ?').get(handle); i++) handle = `northbay_${phone.slice(-4)}_${i}`;
  db.prepare(
    `INSERT INTO users (id, phone, name, email, handle, avatar, bio, website, verified, created_at)
     VALUES (?, ?, ?, ?, ?, NULL, '', NULL, 0, ?)`,
  ).run(id, phone, 'Northbay customer', `${handle}@northbay.example`, handle, now);
  return { user: getUserRow(db, id), isNew: true };
}

interface AddressRow {
  id: string;
  user_id: string;
  label: string;
  recipient: string;
  line1: string;
  line2: string;
  landmark: string | null;
  locality: string;
  city: string;
  pincode: string;
  x: number;
  y: number;
  is_default: number;
}

const toAddress = (r: AddressRow): Address => ({
  id: r.id,
  label: r.label,
  recipient: r.recipient,
  line1: r.line1,
  line2: r.line2,
  landmark: r.landmark,
  locality: r.locality,
  city: r.city,
  pincode: r.pincode,
  location: { x: r.x, y: r.y },
  isDefault: r.is_default === 1,
});

export function listAddresses(db: DB, userId: string): Address[] {
  return (
    db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at ASC').all(userId) as AddressRow[]
  ).map(toAddress);
}

export function getAddress(db: DB, userId: string, id: string): Address {
  const row = db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(id, userId) as AddressRow | undefined;
  if (!row) throw notFound('Address');
  return toAddress(row);
}

export function defaultAddress(db: DB, userId: string | null): Address | null {
  if (!userId) return null;
  return listAddresses(db, userId)[0] ?? null;
}

export function saveAddress(db: DB, userId: string, input: AddressInput, now: number, id?: string): Address {
  const place = LOCALITIES[input.locality];
  if (!place) throw badRequest(`We do not deliver to "${input.locality}" yet`, { localities: Object.keys(LOCALITIES) });
  const user = getUserRow(db, userId);
  const isFirst = listAddresses(db, userId).length === 0;
  const makeDefault = input.isDefault ?? isFirst;
  const tx = db.transaction(() => {
    if (makeDefault) db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(userId);
    const values = {
      id: id ?? newId('addr'),
      userId,
      label: input.label,
      recipient: input.recipient ?? user.name,
      line1: input.line1,
      line2: input.line2 ?? '',
      landmark: input.landmark ?? null,
      locality: input.locality,
      pincode: input.pincode || place.pincode,
      x: place.x,
      y: place.y,
      isDefault: makeDefault ? 1 : 0,
      now,
    };
    if (id) {
      getAddress(db, userId, id);
      db.prepare(
        `UPDATE addresses SET label=@label, recipient=@recipient, line1=@line1, line2=@line2, landmark=@landmark,
           locality=@locality, pincode=@pincode, x=@x, y=@y, is_default=CASE WHEN @isDefault = 1 THEN 1 ELSE is_default END
         WHERE id=@id AND user_id=@userId`,
      ).run(values);
    } else {
      db.prepare(
        `INSERT INTO addresses (id, user_id, label, recipient, line1, line2, landmark, locality, city, pincode, x, y, is_default, created_at)
         VALUES (@id, @userId, @label, @recipient, @line1, @line2, @landmark, @locality, 'Northbay', @pincode, @x, @y, @isDefault, @now)`,
      ).run(values);
    }
    return values.id;
  });
  return getAddress(db, userId, tx());
}

export function deleteAddress(db: DB, userId: string, id: string): void {
  const address = getAddress(db, userId, id);
  db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(id, userId);
  if (address.isDefault) {
    const next = db.prepare('SELECT id FROM addresses WHERE user_id = ? ORDER BY created_at LIMIT 1').get(userId) as
      | { id: string }
      | undefined;
    if (next) db.prepare('UPDATE addresses SET is_default = 1 WHERE id = ?').run(next.id);
  }
}
