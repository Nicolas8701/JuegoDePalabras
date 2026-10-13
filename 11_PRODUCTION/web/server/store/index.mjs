import { MemoryStore } from './memory-store.mjs';
import { SupabaseStore } from './supabase-store.mjs';

// The test setter remains available, but cloud deployments must fail closed.
let singleton;
let singletonSignature;

export function getStore(env = process.env) {
  const hosted = Boolean(env.CF_WORKER || env.NETLIFY || env.AWS_LAMBDA_FUNCTION_NAME);
  const configured = Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
  if (hosted && !configured) {
    const e = new Error('BACKEND_NOT_CONFIGURED');
    e.code = e.message; e.status = 503; throw e;
  }
  if (singletonSignature === 'test') return singleton;
  if (configured) {
    const signature = `${env.SUPABASE_URL}|${env.SUPABASE_SERVICE_ROLE_KEY}|${env.ROOM_PASSWORD_PEPPER ?? ''}`;
    if (singleton && singletonSignature === signature) return singleton;
    singleton = new SupabaseStore(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, env.ROOM_PASSWORD_PEPPER);
    singletonSignature = signature;
    return singleton;
  }
  if (!singleton || singletonSignature !== 'memory') {
    singleton = new MemoryStore(); singletonSignature = 'memory';
  }
  return singleton;
}

export function resetStoreForTests(store) {
  singleton = store; singletonSignature = 'test';
}
