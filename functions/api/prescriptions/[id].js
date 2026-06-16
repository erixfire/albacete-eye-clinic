import { requireAuth, errorResponse, successResponse } from '../../_utils.js';

export async function onRequestGet(ctx) {
  const user = await requireAuth(ctx);
  if (!user) return errorResponse('Unauthorized', 401);

  const id = ctx.params.id;

  const rx = await ctx.env.DB.prepare(`
    SELECT
      pr.*,
      p.full_name        AS patient_name,
      p.patient_code,
      p.date_of_birth,
      p.gender,
      p.address,
      p.philhealth_no,
      u.full_name        AS doctor_name,
      v.visit_date,
      v.chief_complaint,
      v.diagnosis
    FROM prescriptions pr
    JOIN patients  p ON p.id = pr.patient_id
    JOIN users     u ON u.id = pr.doctor_id
    LEFT JOIN visits v ON v.id = pr.visit_id
    WHERE pr.id = ?
  `).bind(id).first();

  if (!rx) return errorResponse('Prescription not found', 404);
  return successResponse(rx);
}
