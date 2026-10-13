import { getStore } from '../store/index.mjs';

function json(status, data) {
  return { status, body: JSON.stringify(data), headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } };
}

function parseRoute(request) {
  const url = new URL(request.url, 'http://localhost');
  const fromQuery = url.searchParams.get('route');
  const raw = fromQuery ? `/api/${fromQuery}` : url.pathname;
  return raw.replace(/\/+$/, '') || '/';
}

async function bodyOf(request) {
  if (request.method === 'GET' || request.method === 'HEAD') return {};
  const text = await request.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { throw Object.assign(new Error('INVALID_JSON'), { code: 'INVALID_JSON', status: 400 }); }
}

function sessionFrom(url, body) {
  return {
    playerId: body.playerId ?? url.searchParams.get('playerId'),
    token: body.token ?? url.searchParams.get('token')
  };
}

async function handleApiRequestCore(request, env = process.env) {
  const url = new URL(request.url, 'http://localhost');
  const route = parseRoute(request);
  try {
    const store = getStore(env);
    if (request.method === 'GET' && route === '/api/health') {
      const storage = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY ? 'supabase' : 'memory';
      if (url.searchParams.get('deep') === '1' && storage === 'supabase') {
        return json(200, { ok: true, store: storage, schema: await store.checkSchema() });
      }
      return json(200, { ok: true, store: storage, deepChecked: false });
    }
    if (request.method === 'GET' && route === '/api/rooms') {
      return json(200, { rooms: await store.listPublicRooms() });
    }
    if (request.method === 'POST' && route === '/api/rooms') {
      const body = await bodyOf(request);
      return json(201, await store.createRoom(body));
    }
    if (request.method === 'POST' && route === '/api/rooms/join') {
      const body = await bodyOf(request);
      return json(200, await store.joinRoom(body));
    }

    const match = route.match(/^\/api\/rooms\/([^/]+)\/(state|ready|start|guess|rematch|forfeit|leave|finish|privacy)$/);
    if (match) {
      const [, roomId, action] = match;
      const body = await bodyOf(request);
      const session = sessionFrom(url, body);
      const args = { roomId, ...session, ...body };
      if (action === 'state' && (request.method === 'GET' || request.method === 'POST')) return json(200, await store.getRoomState(args));
      if (action === 'privacy' && request.method === 'POST') return json(200, await store.updateRoomPrivacy(args));
      if (action === 'ready' && request.method === 'POST') return json(200, await store.setReady(args));
      if (action === 'start' && request.method === 'POST') return json(200, await store.startRound(args));
      if (action === 'guess' && request.method === 'POST') return json(200, await store.submitGuess(args));
      if (action === 'rematch' && request.method === 'POST') return json(200, await store.rematch(args));
      if (action === 'forfeit' && request.method === 'POST') return json(200, await store.forfeit(args));
      if (action === 'leave' && request.method === 'POST') return json(200, await store.leaveRoom(args));
      if (action === 'finish' && request.method === 'POST') return json(200, await store.finishRound(args));
    }
    return json(404, { error: 'NOT_FOUND' });
  } catch (error) {
    const code = error?.code || error?.message || 'INTERNAL_ERROR';
    const status = Number(error?.status) || 500;
    if (status >= 500) console.error('[api]', error);
    return json(status, { error: code });
  }
}

export async function handleApiRequest(request, env = process.env) {
  const start = performance.now();
  const result = await handleApiRequestCore(request, env);
  // Measures time inside our Function (not network RTT). Visible in browser DevTools.
  const duration = Math.max(0, performance.now() - start).toFixed(1);
  return { ...result, headers: { ...result.headers,
    'server-timing': `api;dur=${duration}`,
    'x-palabra-arena-build': '0.2.4-dev'
  } };
}
