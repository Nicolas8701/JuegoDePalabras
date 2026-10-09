import { MemoryStore } from './memory-store.mjs';
import { SupabaseStore } from './supabase-store.mjs';

let singleton;

export function getStore(env = process.env) {
  if (singleton) return singleton;
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    singleton = new SupabaseStore(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  } else if (env.NETLIFY || env.AWS_LAMBDA_FUNCTION_NAME) {
    const e = new Error('BACKEND_NOT_CONFIGURED'); e.code = e.message; e.status = 503; throw e;
  } else {
    singleton = new MemoryStore();
  }
  return singleton;
}

export function resetStoreForTests(store) {
  singleton = store;
}
