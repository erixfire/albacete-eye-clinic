export async function onRequestPut(context) {
  const { env, params, request } = context;
  const id = params.id;
  const body = await request.json();

  if (!body.name) {
    return new Response(JSON.stringify({ error: 'Medicine name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await env.DB.prepare(
    `UPDATE medicines SET 
      name = ?, generic_name = ?, category = ?, manufacturer = ?, 
      supplier_id = ?, unit = ?, unit_price = ?, reorder_level = ?, 
      batch_number = ?, expiry_date = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`
  ).bind(
    body.name,
    body.generic_name || null,
    body.category || null,
    body.manufacturer || null,
    body.supplier_id || null,
    body.unit || null,
    body.unit_price || 0,
    body.reorder_level || 10,
    body.batch_number || null,
    body.expiry_date || null,
    id
  ).run();

  const updated = await env.DB.prepare('SELECT * FROM medicines WHERE id = ?').bind(id).first();

  return new Response(JSON.stringify(updated), {
    headers: { 'Content-Type': 'application/json' },
  });
}
