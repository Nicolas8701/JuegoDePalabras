import { handleApiRequest } from '../../server/domain/api-handler.mjs';

export default async (request) => {
  const result = await handleApiRequest(request, process.env);
  return new Response(result.body, { status: result.status, headers: result.headers });
};
