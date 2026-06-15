export async function onRequestPost(context) {
  const { env, params, request, data } = context;
  const id = params.id;
  const body = await request.json();

  if (!body.quantity || !body.transaction_type) {
    return new Response(JSON.stringify({ error: 'Quantity and transaction type are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const medicine = await env.DB.prepare('SELECT stock_quantity FROM medicines WHERE id = ?').bind(id).first();
  if (!medicine) {
    return new Response(JSON.stringify({ error: 'Medicine not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let newQuantity;
  if (body.transaction_type === 'in') {
    newQuantity = medicine.stock_quantity + body.quantity;
  } else if (body.transaction_type === 'out') {
    newQuantity = medicine.stock_quantity - body.quantity;
  } else if (body.transaction_type === 'adjustment') {
    newQuantity = body.quantity; // In adjustment, quantity is the new target or the diff? 
    // Let's assume quantity is the delta for adjustment too, or we can use a separate field.
    // Let's stick to quantity as delta for now.
    newQuantity = medicine.stock_quantity + body.quantity;
  }

  // Update medicine stock
  await env.DB.prepare('UPDATE medicines SET stock_quantity = ? WHERE id = ?').bind(newQuantity, id).run();

  // Log transaction
  await env.DB.prepare(
    `INSERT INTO inventory_transactions (
      medicine_id, transaction_type, quantity, reference_type, performed_by, notes
    ) VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    body.transaction_type,
    body.quantity,
    body.reference_type || 'manual',
    data.user.id,
    body.notes || null
  ).run();

  return new Response(JSON.stringify({ stock_quantity: newQuantity }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
