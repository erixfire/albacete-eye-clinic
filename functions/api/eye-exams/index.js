import { requireAuth, logAudit, errorResponse, successResponse } from '../../_utils.js';

export async function onRequestPost(ctx) {
  const user = await requireAuth(ctx);
  if (!user) return errorResponse('Unauthorized', 401);
  if (!['admin','doctor','nurse'].includes(user.role))
    return errorResponse('Forbidden', 403);

  const body = await ctx.request.json();
  if (!body.visit_id || !body.patient_id)
    return errorResponse('visit_id and patient_id are required', 400);

  // Upsert: delete existing exam for this visit then insert
  await ctx.env.DB.prepare(`DELETE FROM eye_exams WHERE visit_id = ?`).bind(body.visit_id).run();

  const { meta } = await ctx.env.DB.prepare(
    `INSERT INTO eye_exams
       (visit_id, patient_id, exam_date,
        va_od_distance, va_os_distance, va_od_near, va_os_near,
        ref_od_sphere, ref_od_cylinder, ref_od_axis,
        ref_os_sphere, ref_os_cylinder, ref_os_axis, ref_add,
        iop_od, iop_os, iop_method,
        slit_lamp_od, slit_lamp_os, fundus_od, fundus_os,
        oct_notes, color_vision, confrontation, extra_notes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    body.visit_id, body.patient_id,
    body.exam_date || new Date().toISOString().split('T')[0],
    body.va_od_distance || null, body.va_os_distance || null,
    body.va_od_near || null,     body.va_os_near || null,
    body.ref_od_sphere ?? null,  body.ref_od_cylinder ?? null, body.ref_od_axis ?? null,
    body.ref_os_sphere ?? null,  body.ref_os_cylinder ?? null, body.ref_os_axis ?? null, body.ref_add ?? null,
    body.iop_od ?? null,         body.iop_os ?? null,          body.iop_method || 'non-contact',
    body.slit_lamp_od || null,   body.slit_lamp_os || null,
    body.fundus_od || null,      body.fundus_os || null,
    body.oct_notes || null,      body.color_vision || null,
    body.confrontation || null,  body.extra_notes || null
  ).run();

  await logAudit(ctx, user.id, 'create', 'eye_exam', meta.last_row_id, `visit=${body.visit_id}`);
  return successResponse({ id: meta.last_row_id }, 201);
}
