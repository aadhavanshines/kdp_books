/** Small crypto helpers on Web Crypto, available in Node 20+, Deno and browsers. */

const encoder = new TextEncoder();

export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Compares two strings in time that doesn't depend on where they differ. */
export function timingSafeEqual(a: string, b: string): boolean {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  let diff = left.length ^ right.length;
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }
  return diff === 0;
}

/** A random URL-safe id such as "k3j9x0q2m1v8a7b4". */
export function randomId(bytes = 12): string {
  const values = crypto.getRandomValues(new Uint8Array(bytes));
  return [...values].map((b) => (b % 36).toString(36)).join('');
}
