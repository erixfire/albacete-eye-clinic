import { requireAuth, errorResponse, successResponse } from '../../_utils.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  const user = await requireAuth(context);
  if (!user) return errorResponse('Unauthorized', 401);

  const url = new URL(request.url);
  const date      = url.searchParams.get('date');
  const doctor_id = url.searchParams.get('doctor_id');
  const status    = url.searchParams.get('status');

  let where = 'WHERE a.patient_id IS NOT NULL';
  const params = [];

  if (date)      { where += ' AND date(a.appointment_date) = date(?)'; params.push(date); }
  if (doctor_id) { where += ' AND a.doctor_id = ?';                    params.push(doctor_id); }
  if (status)    { where += ' AND a.status = ?';                       params.push(status); }

  const query = `
    SELECT a.*, p.full_name as patient_name, p.patient_code,
           u.full_name as doctor_name
    FROM appointments a
    LEFT JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users u    ON a.doctor_id  = u.id
    ${where}
    ORDER BY a.appointment_date ASC
  `;

  const { results } = await env.DB.prepare(query).bind(...params).all();
  return successResponse(results);
}

export async function onRequestPost(context) {
  const { env, request } = context;
  const user = await requireAuth(context);
  if (!user) return errorResponse('Unauthorized', 401);
  if (!['admin', 'frontdesk', 'nurse', 'doctor'].includes(user.role))
    return errorResponse('Forbidden', 403);

  const body = await request.json();

  if (!body.patient_id || !body.doctor_id || !body.appointment_date)
    return errorResponse('patient_id, doctor_id, and appointment_date are required', 400);

  const { meta } = await env.DB.prepare(
    `INSERT INTO appointments
       (patient_id, doctor_id, specialization_id, appointment_date, notes, status)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(
    body.patient_id,
    body.doctor_id,
    body.specialization_id || null,
    body.appointment_date,
    body.notes || null,
    body.status || 'scheduled'
  ).run();

  return successResponse({ id: meta.last_row_id }, 201);
}
