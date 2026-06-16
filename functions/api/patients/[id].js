import { requireAuth, logAudit, errorResponse, successResponse } from '../../_utils.js';

export async function onRequestGet(ctx) {
  const user = await requireAuth(ctx);
  if (!user) return errorResponse('Unauthorized', 401);

  const id = ctx.params.id;

  const patient = await ctx.env.DB.prepare(
    `SELECT * FROM patients WHERE id = ? AND is_active = 1`
  ).bind(id).first();

  if (!patient) return errorResponse('Patient not found', 404);

  const { results: visits } = await ctx.env.DB.prepare(
    `SELECT v.*, u.name AS doctor_name
     FROM visits v
     LEFT JOIN users u ON u.id = v.doctor_id
     WHERE v.patient_id = ?
     ORDER BY v.visit_date DESC LIMIT 50`
  ).bind(id).all();

  const { results: prescriptions } = await ctx.env.DB.prepare(
    `SELECT rx.*, u.name AS doctor_name
     FROM prescriptions rx
     LEFT JOIN users u ON u.id = rx.doctor_id
     WHERE rx.patient_id = ?
     ORDER BY rx.rx_date DESC LIMIT 20`
  ).bind(id).all();

  const { results: procedures } = await ctx.env.DB.prepare(
    `SELECT pr.*, u.name AS doctor_name
     FROM procedures pr
     LEFT JOIN users u ON u.id = pr.doctor_id
     WHERE pr.patient_id = ?
     ORDER BY pr.procedure_date DESC`
  ).bind(id).all();

  const { results: documents } = await ctx.env.DB.prepare(
    `SELECT d.*, u.name AS uploader_name
     FROM documents d
     LEFT JOIN users u ON u.id = d.uploader_id
     WHERE d.patient_id = ?
     ORDER BY d.created_at DESC`
  ).bind(id).all();

  const { results: eye_exams } = await ctx.env.DB.prepare(
    `SELECT * FROM eye_exams WHERE patient_id = ? ORDER BY exam_date DESC LIMIT 10`
  ).bind(id).all();

  await logAudit(ctx, user.id, 'view', 'patient', id);

  return successResponse({ patient, visits, prescriptions, procedures, documents, eye_exams });
}

export async function onRequestPut(ctx) {
  const user = await requireAuth(ctx);
  if (!user) return errorResponse('Unauthorized', 401);
  if (!['admin','doctor','nurse','frontdesk'].includes(user.role))
    return errorResponse('Forbidden', 403);

  const id = ctx.params.id;
  const body = await ctx.request.json();

  const existing = await ctx.env.DB.prepare(`SELECT id FROM patients WHERE id = ?`).bind(id).first();
  if (!existing) return errorResponse('Patient not found', 404);

  await ctx.env.DB.prepare(
    `UPDATE patients SET
       first_name=?, last_name=?, middle_name=?, dob=?, sex=?, civil_status=?,
       phone=?, email=?, address=?, city=?, emergency_name=?, emergency_phone=?,
       emergency_relation=?, blood_type=?, allergies=?, medical_history=?,
       philhealth_no=?, branch=?, updated_at=datetime('now')
     WHERE id=?`
  ).bind(
    body.first_name, body.last_name, body.middle_name || '',
    body.dob || null, body.sex || null, body.civil_status || null,
    body.phone || null, body.email || null, body.address || null,
    body.city || null, body.emergency_name || null, body.emergency_phone || null,
    body.emergency_relation || null, body.blood_type || null,
    body.allergies || null, body.medical_history || null,
    body.philhealth_no || null, body.branch || 'jaro',
    id
  ).run();

  await logAudit(ctx, user.id, 'update', 'patient', id);
  return successResponse({ updated: true });
}

export async function onRequestDelete(ctx) {
  const user = await requireAuth(ctx);
  if (!user) return errorResponse('Unauthorized', 401);
  if (user.role !== 'admin') return errorResponse('Admin only', 403);

  const id = ctx.params.id;
  await ctx.env.DB.prepare(`UPDATE patients SET is_active=0, updated_at=datetime('now') WHERE id=?`).bind(id).run();
  await logAudit(ctx, user.id, 'delete', 'patient', id);
  return successResponse({ deleted: true });
}
