// POST /auth/logout — clears the session cookie and removes from DB

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Accept,Cookie',
};
const json = (d, s = 200, extra = {}) =>
  new Response(JSON.stringify(d), {
    status: s,
    headers: { 'Content-Type': 'application/json;charset=utf-8', ...CORS, ...extra },
  });

function getToken(req) {
  const c = req.headers.get('Cookie') || '';
  return c.match(/(?:^|;\s*)session=([^;]+)/)?.[1] || null;
}

export const onRequestOptions = () => new Response(null, { status: 204, headers: CORS });

export async function onRequestPost({ request, env }) {
  const token = getToken(request);
  if (token) {
    try {
      await env.DB.prepare('DELETE FROM sessions WHERE token=?').bind(token).run();
    } catch { /* best effort */ }
  }
  const expiredCookie = 'session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0';
  return json({ ok: true }, 200, { 'Set-Cookie': expiredCookie });
}
