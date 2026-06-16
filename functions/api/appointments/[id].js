import { successResponse, errorResponse, requireAuth } from '../../_utils.js';

export async function onRequestGet(context) {
  const { env, params } = context;
  const user = await requireAuth(context);
  if (!user) return errorResponse('Unauthorized', 401);

  const id = params.id;
  const row = await env.DB.prepare(`
    SELECT a.*, p.full_name as patient_name, p.patient_code, u.full_name as doctor_name, s.name as specialization_name
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN users u ON a.doctor_id = u.id
    JOIN specializations s ON a.specialization_id = s.id
    WHERE a.id = ?
  `).bind(id).first();

  if (!row) return errorResponse('Appointment not found', 404);
  return successResponse(row);
}

export async function onRequestPut(context) {
  const { env, params, request } = context;
  const user = await requireAuth(context);
  if (!user) return errorResponse('Unauthorized', 401);

  const id = params.id;
  const body = await request.json();

  if (!body.status) return errorResponse('Status is required', 400);

  await env.DB.prepare(
    'UPDATE appointments SET status = ?, notes = ? WHERE id = ?'
  ).bind(body.status, body.notes || null, id).run();

  const updated = await env.DB.prepare(`
    SELECT a.*, p.full_name as patient_name, p.patient_code, u.full_name as doctor_name, s.name as specialization_name
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN users u ON a.doctor_id = u.id
    JOIN specializations s ON a.specialization_id = s.id
    WHERE a.id = ?
  `).bind(id).first();

  return successResponse(updated);
}

export async function onRequestDelete(context) {
  const { env, params } = context;
  const user = await requireAuth(context);
  if (!user) return errorResponse('Unauthorized', 401);

  if (!['admin', 'frontdesk'].includes(user.role)) {
    return errorResponse('Forbidden', 403);
  }

  const id = params.id;
  const existing = await env.DB.prepare('SELECT id FROM appointments WHERE id = ?').bind(id).first();
  if (!existing) return errorResponse('Appointment not found', 404);

  await env.DB.prepare(
    "UPDATE appointments SET status = 'cancelled' WHERE id = ?"
  ).bind(id).run();

  return successResponse({ success: true, id: Number(id) });
}
