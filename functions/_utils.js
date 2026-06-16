export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

export function successResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

export function errorResponse(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

export async function requireAuth(ctx) {
  try {
    const res = await fetch(new URL('/api/auth/me', ctx.request.url), {
      headers: { cookie: ctx.request.headers.get('cookie') || '' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch { return null; }
}

export async function logAudit(ctx, user_id, action, entity, entity_id, details = '') {
  try {
    const ip = ctx.request.headers.get('CF-Connecting-IP') || '';
    await ctx.env.DB.prepare(
      `INSERT INTO audit_log (user_id, action, entity, entity_id, details, ip_address)
       VALUES (?,?,?,?,?,?)`
    ).bind(user_id, action, entity, entity_id, details, ip).run();
  } catch { /* non-blocking */ }
}

export async function generatePatientNo(ctx) {
  const year = new Date().getFullYear();
  const { results: [{ count }] } = await ctx.env.DB.prepare(
    `SELECT COUNT(*) AS count FROM patients WHERE patient_no LIKE ?`
  ).bind(`AEC-${year}-%`).all();
  const seq = String(count + 1).padStart(5, '0');
  return `AEC-${year}-${seq}`;
}
