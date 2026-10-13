import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';

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
  const value = String(input ?? '').trim().replace(/\s+/g, ' ').slice(0, 18);
  return value || `Jugador ${Math.floor(Math.random() * 900 + 100)}`;
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
