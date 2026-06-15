export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  const doctor_id = url.searchParams.get('doctor_id');

  let query = `
    SELECT a.*, p.full_name as patient_name, p.patient_code, u.full_name as doctor_name, s.name as specialization_name
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN users u ON a.doctor_id = u.id
    JOIN specializations s ON a.specialization_id = s.id
  `;
  let params = [];

  if (date || doctor_id) {
    query += ' WHERE ';
    const conditions = [];
    if (date) {
      conditions.push('date(a.appointment_date) = date(?)');
      params.push(date);
    }
    if (doctor_id) {
      conditions.push('a.doctor_id = ?');
      params.push(doctor_id);
    }
    query += conditions.join(' AND ');
  }

  query += ' ORDER BY a.appointment_date ASC';

  const { results } = await env.DB.prepare(query).bind(...params).all();

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const { env, request } = context;
  const body = await request.json();

  if (!body.patient_id || !body.doctor_id || !body.appointment_date || !body.specialization_id) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { results } = await env.DB.prepare(
    `INSERT INTO appointments (
      patient_id, doctor_id, specialization_id, appointment_date, notes, status
    ) VALUES (?, ?, ?, ?, ?, ?) RETURNING *`
  ).bind(
    body.patient_id,
    body.doctor_id,
    body.specialization_id,
    body.appointment_date,
    body.notes || null,
    body.status || 'scheduled'
  ).all();

  return new Response(JSON.stringify(results[0]), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}
