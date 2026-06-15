export async function onRequestPost(context) {
  const { env } = context;
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 
        'Content-Type': 'application/json',
        'Set-Cookie': `auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${env.ENVIRONMENT === 'production' ? '; Secure' : ''}`
    },
  });
}
