export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const lowStock = url.searchParams.get('lowStock') === 'true';
  const expiring = url.searchParams.get('expiring') === 'true';

  let query = 'SELECT m.*, s.name as supplier_name FROM medicines m LEFT JOIN suppliers s ON m.supplier_id = s.id';
  let conditions = [];
  let params = [];

  if (lowStock) {
    conditions.push('m.stock_quantity <= m.reorder_level');
  }
  if (expiring) {
    // Expiring within 3 months
    conditions.push('date(m.expiry_date) <= date(\'now\', \'+3 months\')');
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY m.name ASC';

  const { results } = await env.DB.prepare(query).bind(...params).all();

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const { env, request } = context;
  const body = await request.json();

  if (!body.name) {
    return new Response(JSON.stringify({ error: 'Medicine name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { results } = await env.DB.prepare(
    `INSERT INTO medicines (
      name, generic_name, category, manufacturer, supplier_id, unit, unit_price, 
      stock_quantity, reorder_level, batch_number, expiry_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
  ).bind(
    body.name,
    body.generic_name || null,
    body.category || null,
    body.manufacturer || null,
    body.supplier_id || null,
    body.unit || null,
    body.unit_price || 0,
    body.stock_quantity || 0,
    body.reorder_level || 10,
    body.batch_number || null,
    body.expiry_date || null
  ).all();

  return new Response(JSON.stringify(results[0]), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}
