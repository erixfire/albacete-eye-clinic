import { requireAuth, logAudit, errorResponse, successResponse } from '../../_utils.js';

export async function onRequestGet(ctx) {
  const user = await requireAuth(ctx);
  if (!user) return errorResponse('Unauthorized', 401);

  const url    = new URL(ctx.request.url);
  const q      = (url.searchParams.get('q') || '').trim();
  const branch = url.searchParams.get('branch') || '';
  const page   = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit  = Math.min(50, parseInt(url.searchParams.get('limit') || '20'));
  const offset = (page - 1) * limit;

  let where = 'WHERE p.is_active = 1';
  const params = [];

  if (q) {
    where += ` AND (p.full_name LIKE ? OR p.patient_code LIKE ? OR p.contact_number LIKE ?)`;
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  if (branch) { where += ' AND p.branch = ?'; params.push(branch); }

  const { results: patients } = await ctx.env.DB.prepare(
    `SELECT p.id, p.patient_code, p.full_name, p.date_of_birth, p.gender,
            p.contact_number, p.email, p.branch, p.photo_url, p.created_at,
            (SELECT COUNT(*) FROM visits v WHERE v.patient_id = p.id) AS visit_count,
            (SELECT v.visit_date FROM visits v WHERE v.patient_id = p.id
             ORDER BY v.visit_date DESC LIMIT 1) AS last_visit
     FROM patients p ${where}
     ORDER BY p.full_name ASC
     LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset).all();

  const { results: [{ total }] } = await ctx.env.DB.prepare(
    `SELECT COUNT(*) AS total FROM patients p ${where}`
  ).bind(...params).all();

  await logAudit(ctx, user.id, 'view', 'patient_list', 0, `q=${q}`);
  return successResponse({ patients, total, page, limit });
}

export async function onRequestPost(ctx) {
  const user = await requireAuth(ctx);
  if (!user) return errorResponse('Unauthorized', 401);
  if (!['admin','doctor','nurse','frontdesk'].includes(user.role))
    return errorResponse('Forbidden', 403);

  const body = await ctx.request.json();
  if (!body.full_name?.trim())
    return errorResponse('full_name is required', 400);

  // Generate patient_code: AEC-YYYY-NNNNN
  const year = new Date().getFullYear();
  const { results: [{ count }] } = await ctx.env.DB.prepare(
    `SELECT COUNT(*) AS count FROM patients WHERE patient_code LIKE ?`
  ).bind(`AEC-${year}-%`).all();
  const patient_code = `AEC-${year}-${String(count + 1).padStart(5, '0')}`;

  const { meta } = await ctx.env.DB.prepare(
    `INSERT INTO patients
       (patient_code, full_name, date_of_birth, gender, civil_status,
        contact_number, email, address, city,
        emergency_contact_name, emergency_contact_number, emergency_relation,
        blood_type, known_allergies, medical_history_notes,
        philhealth_no, branch)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    patient_code,
    body.full_name.trim(),
    body.date_of_birth || null,
    body.gender || null,
    body.civil_status || null,
    body.contact_number || null,
    body.email || null,
    body.address || null,
    body.city || null,
    body.emergency_contact_name || null,
    body.emergency_contact_number || null,
    body.emergency_relation || null,
    body.blood_type || null,
    body.known_allergies || null,
    body.medical_history_notes || null,
    body.philhealth_no || null,
    body.branch || 'jaro'
  ).run();

  const id = meta.last_row_id;
  await logAudit(ctx, user.id, 'create', 'patient', id, body.full_name);
  return successResponse({ id, patient_code }, 201);
}
