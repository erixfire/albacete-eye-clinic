import { successResponse, errorResponse, requireAuth, generatePatientNo, logAudit } from '../../_utils.js';

// POST /api/appointments/convert
// Converts a public appointment request (flat appointments table) into:
//   1. A real patient record (if patient_id not supplied)
//   2. A scheduled appointment (staff appointments table)
export async function onRequestPost(context) {
  const { env, request } = context;
  const user = await requireAuth(context);
  if (!user) return errorResponse('Unauthorized', 401);
  if (!['admin', 'frontdesk', 'nurse'].includes(user.role)) return errorResponse('Forbidden', 403);

  const body = await request.json();
  const { request_id, patient_id, doctor_id, specialization_id, appointment_date, notes } = body;

  if (!request_id || !doctor_id || !specialization_id || !appointment_date) {
    return errorResponse('request_id, doctor_id, specialization_id, appointment_date are required', 400);
  }

  // Fetch the raw public request
  const req = await env.DB.prepare(
    `SELECT * FROM appointments WHERE id = ? AND status = 'pending'`
  ).bind(request_id).first();
  if (!req) return errorResponse('Pending appointment request not found', 404);

  let finalPatientId = patient_id || null;

  // Auto-create patient if no patient_id supplied
  if (!finalPatientId) {
    const patientCode = await generatePatientNo(context);

    const { results: [newPatient] } = await env.DB.prepare(`
      INSERT INTO patients (patient_code, full_name, contact_number, branch)
      VALUES (?, ?, ?, ?) RETURNING id
    `).bind(
      patientCode,
      (req.name || 'Unknown').trim(),
      req.phone || null,
      'jaro'
    ).all();

    finalPatientId = newPatient.id;
  }

  // Create the scheduled appointment record
  const { results: [appt] } = await env.DB.prepare(`
    INSERT INTO appointments (patient_id, doctor_id, specialization_id, appointment_date, notes, status)
    VALUES (?, ?, ?, ?, ?, 'scheduled') RETURNING *
  `).bind(
    finalPatientId,
    doctor_id,
    specialization_id,
    appointment_date,
    notes || req.reason || null
  ).all();

  // Mark the original public request as confirmed
  await env.DB.prepare(
    `UPDATE appointments SET status = 'confirmed' WHERE id = ?`
  ).bind(request_id).run();

  await logAudit(
    context, user.id, 'CONVERT_REQUEST', 'appointment', appt.id,
    `Converted public request #${request_id} → patient #${finalPatientId}`
  );

  return successResponse({ appointment: appt, patient_id: finalPatientId }, 201);
}
