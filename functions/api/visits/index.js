export async function onRequestPost(context) {
  const { env, request, data } = context;
  const body = await request.json();

  if (!body.patient_id || !body.specialization_id) {
    return new Response(JSON.stringify({ error: 'Patient ID and Specialization ID are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const doctor_id = body.doctor_id || data.user.id;

  const { results } = await env.DB.prepare(
    `INSERT INTO visits (
      patient_id, doctor_id, specialization_id, chief_complaint, 
      diagnosis, treatment_plan, notes, follow_up_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
  ).bind(
    body.patient_id,
    doctor_id,
    body.specialization_id,
    body.chief_complaint || null,
    body.diagnosis || null,
    body.treatment_plan || null,
    body.notes || null,
    body.follow_up_date || null
  ).all();

  return new Response(JSON.stringify(results[0]), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}
