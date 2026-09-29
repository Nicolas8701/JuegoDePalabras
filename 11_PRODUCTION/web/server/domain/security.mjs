import { createHash, randomBytes, randomUUID } from 'node:crypto';

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
