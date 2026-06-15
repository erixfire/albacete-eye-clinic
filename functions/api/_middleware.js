import * as jose from 'jose';

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // Allow login to skip auth
  if (url.pathname === '/api/auth/login') {
    return next();
  }

  // Get token from Cookie or Authorization header
  let token = null;
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    const cookie = request.headers.get('Cookie');
    if (cookie) {
      const match = cookie.match(/auth_token=([^;]+)/);
      if (match) token = match[1];
    }
  }

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET || 'fallback-secret-change-me');
    const { payload } = await jose.jwtVerify(token, secret);
    context.data.user = payload;
    return next();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
