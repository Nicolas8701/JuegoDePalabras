// Same authoritative HTTP API as local/Netlify; only the transport changes.
import { handleApiRequest } from '../server/domain/api-handler.mjs';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      // Never allow ephemeral MemoryStore in a distributed Worker isolate.
      const result = await handleApiRequest(request, { ...env, CF_WORKER: '1' });
      return new Response(result.body, { status: result.status, headers: result.headers });
    }
    return env.ASSETS.fetch(request);
  }
};
