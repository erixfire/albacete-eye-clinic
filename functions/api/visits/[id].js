export async function onRequestGet(context) {
  const { env, params } = context;
  const id = params.id;

  const visit = await env.DB.prepare(`
    SELECT v.*, u.full_name as doctor_name, s.name as specialization_name, p.full_name as patient_name, p.patient_code
    FROM visits v
    JOIN users u ON v.doctor_id = u.id
    JOIN specializations s ON v.specialization_id = s.id
    JOIN patients p ON v.patient_id = p.id
    WHERE v.id = ?
  `).bind(id).first();

  if (!visit) {
    return new Response(JSON.stringify({ error: 'Visit not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get eye exam if exists
  const eyeExam = await env.DB.prepare('SELECT * FROM eye_exams WHERE visit_id = ?').bind(id).first();
  visit.eye_exam = eyeExam;

  // Get prescriptions
  const prescriptions = await env.DB.prepare(`
    SELECT pr.*, m.name as medicine_name, m.generic_name
    FROM prescriptions pr
    JOIN medicines m ON pr.medicine_id = m.id
    WHERE pr.visit_id = ?
  `).bind(id).all();
  visit.prescriptions = prescriptions.results;

  return new Response(JSON.stringify(visit), {
    headers: { 'Content-Type': 'application/json' },
  });
}
