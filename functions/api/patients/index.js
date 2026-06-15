export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const search = url.searchParams.get('q') || '';

  let query = 'SELECT * FROM patients';
  let params = [];

  if (search) {
    query += ' WHERE full_name LIKE ? OR patient_code LIKE ? OR contact_number LIKE ?';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC';

  const { results } = await env.DB.prepare(query).bind(...params).all();

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const { env, request, data } = context;
  const body = await request.json();

  // Basic validation
  if (!body.full_name) {
    return new Response(JSON.stringify({ error: 'Full name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Generate patient code PAT-XXXXX
  const { results: countResult } = await env.DB.prepare('SELECT COUNT(*) as count FROM patients').all();
  const count = countResult[0].count + 1;
  const patient_code = `PAT-${count.toString().padStart(5, '0')}`;

  const { results } = await env.DB.prepare(
    `INSERT INTO patients (
      patient_code, full_name, date_of_birth, gender, contact_number, 
      email, address, emergency_contact_name, emergency_contact_number, 
      blood_type, known_allergies, medical_history_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
  ).bind(
    patient_code,
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
    body.medical_history_notes || null
  ).all();

  return new Response(JSON.stringify(results[0]), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}
