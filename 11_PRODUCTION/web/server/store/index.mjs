import { MemoryStore } from './memory-store.mjs';
import { SupabaseStore } from './supabase-store.mjs';

let singleton;

export function getStore(env = process.env) {
  if (singleton) return singleton;
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    singleton = new SupabaseStore(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  } else {
    singleton = new MemoryStore();
  }
  return singleton;
}

export function resetStoreForTests(store) {
  singleton = store;
}
