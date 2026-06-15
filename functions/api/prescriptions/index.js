export async function onRequestPost(context) {
  const { env, request, data } = context;
  const body = await request.json();

  if (!body.visit_id || !body.medicine_id || !body.quantity_prescribed) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Use a transaction for prescription + stock deduction
  // D1 doesn't support complex transactions with multiple statements in a single .run() easily if we need logic in between,
  // but we can use batch() or just sequential calls since it's a prototype.
  // Actually, D1 batch is better.

  const medicine = await env.DB.prepare('SELECT stock_quantity FROM medicines WHERE id = ?').bind(body.medicine_id).first();
  if (!medicine || medicine.stock_quantity < body.quantity_prescribed) {
    return new Response(JSON.stringify({ error: 'Insufficient stock' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const statements = [
    // 1. Insert prescription
    env.DB.prepare(`
      INSERT INTO prescriptions (
        visit_id, medicine_id, dosage, frequency, duration, quantity_prescribed, instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.visit_id,
      body.medicine_id,
      body.dosage || null,
      body.frequency || null,
      body.duration || null,
      body.quantity_prescribed,
      body.instructions || null
    ),
    // 2. Deduct stock
    env.DB.prepare('UPDATE medicines SET stock_quantity = stock_quantity - ? WHERE id = ?')
      .bind(body.quantity_prescribed, body.medicine_id),
    // 3. Log transaction
    env.DB.prepare(`
      INSERT INTO inventory_transactions (
        medicine_id, transaction_type, quantity, reference_type, reference_id, performed_by, notes
      ) VALUES (?, 'out', ?, 'prescription', ?, ?, 'Prescribed during visit')
    `).bind(
      body.medicine_id,
      body.quantity_prescribed,
      body.visit_id,
      data.user.id
    )
  ];

  await env.DB.batch(statements);

  return new Response(JSON.stringify({ success: true }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}
