import { requireAuth, logAudit, errorResponse, successResponse } from '../../_utils.js';

export async function onRequestPost(ctx) {
  const user = await requireAuth(ctx);
  if (!user) return errorResponse('Unauthorized', 401);
  if (!['admin','doctor'].includes(user.role))
    return errorResponse('Forbidden', 403);

  const body = await ctx.request.json();
  if (!body.visit_id || !body.patient_id)
    return errorResponse('visit_id and patient_id are required', 400);

  const { meta } = await ctx.env.DB.prepare(
    `INSERT INTO prescriptions
       (visit_id, patient_id, doctor_id, rx_date,
        glasses_od_sphere, glasses_od_cylinder, glasses_od_axis,
        glasses_os_sphere, glasses_os_cylinder, glasses_os_axis,
        glasses_add, glasses_pd, glasses_notes,
        medications, instructions)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    body.visit_id, body.patient_id, user.id,
    body.rx_date || new Date().toISOString().split('T')[0],
    body.glasses_od_sphere ?? null,  body.glasses_od_cylinder ?? null, body.glasses_od_axis ?? null,
    body.glasses_os_sphere ?? null,  body.glasses_os_cylinder ?? null, body.glasses_os_axis ?? null,
    body.glasses_add ?? null,        body.glasses_pd || null,          body.glasses_notes || null,
    body.medications ? JSON.stringify(body.medications) : null,
    body.instructions || null
  ).run();

  await logAudit(ctx, user.id, 'create', 'prescription', meta.last_row_id, `visit=${body.visit_id}`);
  return successResponse({ id: meta.last_row_id }, 201);
}
