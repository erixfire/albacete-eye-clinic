import { requireAuth, logAudit, errorResponse, successResponse } from '../../_utils.js';

export async function onRequestGet(ctx) {
  const user = await requireAuth(ctx);
  if (!user) return errorResponse('Unauthorized', 401);

  const id = ctx.params.id;

  const visit = await ctx.env.DB.prepare(
    `SELECT v.*, u.name AS doctor_name, p.first_name, p.last_name, p.patient_no, p.dob, p.sex
     FROM visits v
     LEFT JOIN users u ON u.id = v.doctor_id
     LEFT JOIN patients p ON p.id = v.patient_id
     WHERE v.id = ?`
  ).bind(id).first();

  if (!visit) return errorResponse('Visit not found', 404);

  const eye_exam = await ctx.env.DB.prepare(
    `SELECT * FROM eye_exams WHERE visit_id = ? LIMIT 1`
  ).bind(id).first();

  const { results: prescriptions } = await ctx.env.DB.prepare(
    `SELECT * FROM prescriptions WHERE visit_id = ?`
  ).bind(id).all();

  await logAudit(ctx, user.id, 'view', 'visit', id);
  return successResponse({ visit, eye_exam, prescriptions });
}

export async function onRequestPut(ctx) {
  const user = await requireAuth(ctx);
  if (!user) return errorResponse('Unauthorized', 401);
  if (!['admin','doctor','nurse'].includes(user.role))
    return errorResponse('Forbidden', 403);

  const id   = ctx.params.id;
  const body = await ctx.request.json();

  await ctx.env.DB.prepare(
    `UPDATE visits SET
       visit_type=?, chief_complaint=?, diagnosis=?,
       treatment=?, notes=?, status=?, follow_up_date=?
     WHERE id=?`
  ).bind(
    body.visit_type || 'consult',
    body.chief_complaint || null,
    body.diagnosis || null,
    body.treatment || null,
    body.notes || null,
    body.status || 'seen',
    body.follow_up_date || null,
    id
  ).run();

  await logAudit(ctx, user.id, 'update', 'visit', id);
  return successResponse({ updated: true });
}
