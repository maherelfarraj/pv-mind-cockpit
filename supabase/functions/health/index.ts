export const handler = (): Response =>
  new Response(JSON.stringify({ status: 'ok' }), {
    headers: {
      'content-type': 'application/json'
    }
  });
