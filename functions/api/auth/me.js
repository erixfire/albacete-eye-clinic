export async function onRequestGet(context) {
  const { data } = context;
  return new Response(JSON.stringify({ user: data.user }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
