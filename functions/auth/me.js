// GET /auth/me — returns current session's admin info or 401

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Accept,Cookie',
};
const json = (d, s = 200) =>
  new Response(JSON.stringify(d), {
    status: s,
    headers: { 'Content-Type': 'application/json;charset=utf-8', ...CORS },
  });

function getToken(req) {
  const c = req.headers.get('Cookie') || '';
  return c.match(/(?:^|;\s*)session=([^;]+)/)?.[1] || null;
}

export const onRequestOptions = () => new Response(null, { status: 204, headers: CORS });

export async function onRequestGet({ request, env }) {
  const token = getToken(request);
  if (!token) return json({ error: 'Not authenticated' }, 401);

  const now = new Date().toISOString();
  try {
    const admin = await env.DB
      .prepare(`SELECT a.id, a.username, a.full_name, a.role
                FROM sessions s JOIN admins a ON a.id = s.admin_id
                WHERE s.token=? AND s.expires_at>? LIMIT 1`)
      .bind(token, now).first();

    if (!admin) return json({ error: 'Session expired or invalid' }, 401);
    return json({ admin });
  } catch (e) {
    console.error('GET /auth/me error:', e.message);
    return json({ error: 'Internal error' }, 500);
  }
}
