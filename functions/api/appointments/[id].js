export async function onRequestPut(context) {
  const { env, params, request } = context;
  const id = params.id;
  const body = await request.json();

  if (!body.status) {
    return new Response(JSON.stringify({ error: 'Status is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await env.DB.prepare(
    'UPDATE appointments SET status = ?, notes = ? WHERE id = ?'
  ).bind(body.status, body.notes || null, id).run();

  const updated = await env.DB.prepare('SELECT * FROM appointments WHERE id = ?').bind(id).first();

  return new Response(JSON.stringify(updated), {
    headers: { 'Content-Type': 'application/json' },
  });
}
