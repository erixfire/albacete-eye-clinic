import { requireAuth, logAudit, generatePatientNo, corsHeaders, errorResponse, successResponse } from '../../_utils.js';

export async function onRequestGet(ctx) {
  const user = await requireAuth(ctx);
  if (!user) return errorResponse('Unauthorized', 401);

  const url = new URL(ctx.request.url);
  const q      = (url.searchParams.get('q') || '').trim();
  const branch = url.searchParams.get('branch') || '';
  const page   = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit  = Math.min(50, parseInt(url.searchParams.get('limit') || '20'));
  const offset = (page - 1) * limit;

  let where = 'WHERE p.is_active = 1';
  const params = [];

  if (q) {
    where += ` AND (p.first_name LIKE ? OR p.last_name LIKE ? OR p.patient_no LIKE ? OR p.phone LIKE ?)`;
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }
  if (branch) {
    where += ' AND p.branch = ?';
    params.push(branch);
  }

  const { results: patients } = await ctx.env.DB.prepare(
    `SELECT p.id, p.patient_no, p.first_name, p.last_name, p.middle_name,
            p.dob, p.sex, p.phone, p.email, p.branch, p.photo_url,
            p.created_at,
            (SELECT COUNT(*) FROM visits v WHERE v.patient_id = p.id) AS visit_count,
            (SELECT v.visit_date FROM visits v WHERE v.patient_id = p.id ORDER BY v.visit_date DESC LIMIT 1) AS last_visit
     FROM patients p ${where}
     ORDER BY p.last_name ASC, p.first_name ASC
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
  const { first_name, last_name } = body;
  if (!first_name?.trim() || !last_name?.trim())
    return errorResponse('first_name and last_name are required', 400);

  const patient_no = await generatePatientNo(ctx);

  const { meta } = await ctx.env.DB.prepare(
    `INSERT INTO patients
       (patient_no, first_name, last_name, middle_name, dob, sex, civil_status,
        phone, email, address, city, emergency_name, emergency_phone,
        emergency_relation, blood_type, allergies, medical_history,
        philhealth_no, branch)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    patient_no,
    first_name.trim(),
    last_name.trim(),
    body.middle_name || '',
    body.dob || null,
    body.sex || null,
    body.civil_status || null,
    body.phone || null,
    body.email || null,
    body.address || null,
    body.city || null,
    body.emergency_name || null,
    body.emergency_phone || null,
    body.emergency_relation || null,
    body.blood_type || null,
    body.allergies || null,
    body.medical_history || null,
    body.philhealth_no || null,
    body.branch || 'jaro'
  ).run();

  const id = meta.last_row_id;
  await logAudit(ctx, user.id, 'create', 'patient', id, `${first_name} ${last_name}`);

  return successResponse({ id, patient_no }, 201);
}
