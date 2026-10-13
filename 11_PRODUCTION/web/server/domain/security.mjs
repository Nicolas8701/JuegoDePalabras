import { createHash, createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function newId() {
  return randomUUID();
}

export function newToken() {
  return randomBytes(24).toString('base64url');
}

export function hashToken(token) {
  return createHash('sha256').update(String(token ?? '')).digest('hex');
}

export function newRoomCode(random = Math.random) {
  let code = '';
  for (let i = 0; i < 5; i += 1) code += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
  return code;
}

export function safePlayerName(input) {
  // Unicode letters (including Ñ/accents) are allowed, but markup, quotes,
  // SQL metacharacters, bidi controls and control characters are discarded.
  // All SQL access still uses parameterized Supabase/PostgREST requests.
  const raw = typeof input === 'string' ? input : '';
  const value = raw.normalize('NFKC').replace(/[^\p{L}\p{N} ._-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 18).trim();
  return value.length >= 2 ? value : `Jugador ${Math.floor(Math.random() * 900 + 100)}`;
}

// Room passwords never leave the server and are never stored in plain text.
// Each room uses a separate random salt; changing privacy invalidates the old hash.
export function safeRoomName(input, playerName = 'Jugador') {
  const value = String(input ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
  return value || `Sala de ${safePlayerName(playerName)}`;
}
export function validateRoomPassword(password) {
  const value = String(password ?? '');
  if (value.length < 4 || value.length > 64) {
    const e = new Error('PASSWORD_LENGTH'); e.code = e.message; e.status = 422; throw e;
  }
  return value;
}
export function hashRoomPassword(password) {
  const raw = validateRoomPassword(password);
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${salt}$${scryptSync(raw, Buffer.from(salt, 'hex'), 32).toString('hex')}`;
}
export function verifyRoomPassword(password, stored) {
  if (typeof password !== 'string' || typeof stored !== 'string') return false;
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt' || !/^[a-f0-9]{32}$/.test(parts[1]) || !/^[a-f0-9]{64}$/.test(parts[2])) return false;
  if (password.length > 64) return false;
  const candidate = scryptSync(password, Buffer.from(parts[1], 'hex'), 32);
  return timingSafeEqual(candidate, Buffer.from(parts[2], 'hex'));
}

// Cloudflare Workers Free has a strict CPU budget (10ms). The old scrypt
// password checks can take >40ms; new hosted rooms use keyed HMAC-SHA256.
// The key is a server-only secret (ROOM_PASSWORD_PEPPER recommended); database
// disclosure alone must not enable an offline password guessing attack.
// Versioned format allows legacy scrypt hashes to remain readable.
export function hashHostedRoomPassword(password, pepper) {
  const value = validateRoomPassword(password);
  if (!pepper || String(pepper).length < 24) throw Object.assign(new Error('ROOM_PASSWORD_SECRET_REQUIRED'), { code: 'ROOM_PASSWORD_SECRET_REQUIRED', status: 503 });
  const salt = randomBytes(16).toString('hex');
  const mac = createHmac('sha256', String(pepper)).update(salt).update('\0').update(value).digest('hex');
  return `hmac256$${salt}$${mac}`;
}
export function verifyHostedRoomPassword(password, stored, pepper) {
  if (typeof password !== 'string' || typeof stored !== 'string' || password.length > 64) return false;
  if (stored.startsWith('scrypt$')) return verifyRoomPassword(password, stored); // legacy only
  const match = /^hmac256\$([0-9a-f]{32})\$([0-9a-f]{64})$/.exec(stored);
  if (!match || !pepper) return false;
  const calculated = createHmac('sha256', String(pepper)).update(match[1]).update('\0').update(password).digest();
  return timingSafeEqual(calculated, Buffer.from(match[2], 'hex'));
}
