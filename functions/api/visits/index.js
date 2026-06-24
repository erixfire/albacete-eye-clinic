import { requireAuth, logAudit, errorResponse, successResponse } from '../../_utils.js';

export async function onRequestGet(ctx) {
  const user = await requireAuth(ctx);
  if (!user) return errorResponse('Unauthorized', 401);

  const url       = new URL(ctx.request.url);
  const patient_id = url.searchParams.get('patient_id');
  const date       = url.searchParams.get('date');
  const status     = url.searchParams.get('status');
  const page       = Math.max(1, parseInt(url.searchParams.get('page')  || '1'));
  const limit      = Math.min(50, parseInt(url.searchParams.get('limit') || '20'));
  const offset     = (page - 1) * limit;

  let where = 'WHERE 1=1';
  const params = [];

  if (patient_id) { where += ' AND v.patient_id = ?'; params.push(patient_id); }
  if (date)       { where += ' AND v.visit_date = ?';  params.push(date); }
  if (status)     { where += ' AND v.status = ?';      params.push(status); }

  const { results } = await ctx.env.DB.prepare(
    `SELECT v.*, u.full_name AS doctor_name,
            p.full_name AS patient_name, p.patient_code
     FROM visits v
     LEFT JOIN users u    ON u.id = v.doctor_id
     LEFT JOIN patients p ON p.id = v.patient_id
     ${where}
     ORDER BY v.visit_date DESC, v.id DESC
     LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset).all();

  const { results: [{ total }] } = await ctx.env.DB.prepare(
    `SELECT COUNT(*) AS total FROM visits v ${where}`
  ).bind(...params).all();

  return successResponse({ visits: results, total, page, limit });
}

export async function onRequestPost(ctx) {
  const user = await requireAuth(ctx);
  if (!user) return errorResponse('Unauthorized', 401);
  if (!['admin','doctor','nurse'].includes(user.role))
    return errorResponse('Forbidden', 403);

  const body = await ctx.request.json();
  if (!body.patient_id) return errorResponse('patient_id is required', 400);

  const doctor_id = body.doctor_id || user.id;

  const { meta } = await ctx.env.DB.prepare(
    `INSERT INTO visits
       (patient_id, doctor_id, visit_date, visit_type, chief_complaint,
        diagnosis, treatment, notes, status, follow_up_date)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    body.patient_id, doctor_id,
    body.visit_date || new Date().toISOString().split('T')[0],
    body.visit_type || 'consult',
    body.chief_complaint || null,
    body.diagnosis || null,
    body.treatment || null,
    body.notes || null,
    body.status || 'seen',
    body.follow_up_date || null
  ).run();

  const id = meta.last_row_id;
  await logAudit(ctx, user.id, 'create', 'visit', id, `patient_id=${body.patient_id}`);
  return successResponse({ id }, 201);
}
