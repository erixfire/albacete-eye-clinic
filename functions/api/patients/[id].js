export async function onRequestGet(context) {
  const { env, params } = context;
  const id = params.id;

  const patient = await env.DB.prepare('SELECT * FROM patients WHERE id = ?').bind(id).first();

  if (!patient) {
    return new Response(JSON.stringify({ error: 'Patient not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get visit history
  const visits = await env.DB.prepare(`
    SELECT v.*, u.full_name as doctor_name, s.name as specialization_name
    FROM visits v
    JOIN users u ON v.doctor_id = u.id
    JOIN specializations s ON v.specialization_id = s.id
    WHERE v.patient_id = ?
    ORDER BY v.visit_date DESC
  `).bind(id).all();

  patient.visits = visits.results;

  return new Response(JSON.stringify(patient), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPut(context) {
  const { env, params, request } = context;
  const id = params.id;
  const body = await request.json();

  if (!body.full_name) {
    return new Response(JSON.stringify({ error: 'Full name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await env.DB.prepare(
    `UPDATE patients SET 
      full_name = ?, date_of_birth = ?, gender = ?, contact_number = ?, 
      email = ?, address = ?, emergency_contact_name = ?, emergency_contact_number = ?, 
      blood_type = ?, known_allergies = ?, medical_history_notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`
  ).bind(
    body.full_name,
    body.date_of_birth || null,
    body.gender || null,
    body.contact_number || null,
    body.email || null,
    body.address || null,
    body.emergency_contact_name || null,
    body.emergency_contact_number || null,
    body.blood_type || null,
    body.known_allergies || null,
    body.medical_history_notes || null,
    id
  ).run();

  const updated = await env.DB.prepare('SELECT * FROM patients WHERE id = ?').bind(id).first();

  return new Response(JSON.stringify(updated), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestDelete(context) {
  const { env, params, data } = context;
  const id = params.id;

  // Admin only check
  if (data.user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await env.DB.prepare('DELETE FROM patients WHERE id = ?').bind(id).run();

  return new Response(null, { status: 204 });
}
