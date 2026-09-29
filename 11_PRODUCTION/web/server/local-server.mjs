import http from 'node:http';
import { handleApiRequest } from './domain/api-handler.mjs';

const port = Number(process.env.PORT || 8788);

const server = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  const request = new Request(`http://127.0.0.1:${port}${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : body
  });
  const result = await handleApiRequest(request, { ...process.env, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' });
  res.writeHead(result.status, {
    ...result.headers,
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'GET,POST,OPTIONS'
  });
  res.end(result.body);
});

server.listen(port, '127.0.0.1', () => console.log(`Palabra Arena API local: http://127.0.0.1:${port}`));
