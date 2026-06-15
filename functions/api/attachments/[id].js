export async function onRequestGet(context) {
  const { env, params } = context;
  const id = params.id;

  const attachment = await env.DB.prepare('SELECT * FROM attachments WHERE id = ?').bind(id).first();
  if (!attachment) {
    return new Response('Not Found', { status: 404 });
  }

  const file = await env.PATIENT_FILES.get(attachment.r2_key);
  if (!file) {
    return new Response('File Not Found in Storage', { status: 404 });
  }

  const headers = new Headers();
  file.writeHttpMetadata(headers);
  headers.set('etag', file.httpEtag);
  headers.set('Content-Disposition', `inline; filename="${attachment.file_name}"`);

  return new Response(file.body, { headers });
}

export async function onRequestDelete(context) {
  const { env, params } = context;
  const id = params.id;

  const attachment = await env.DB.prepare('SELECT * FROM attachments WHERE id = ?').bind(id).first();
  if (!attachment) {
    return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
  }

  // Delete from R2
  await env.PATIENT_FILES.delete(attachment.r2_key);

  // Delete from D1
  await env.DB.prepare('DELETE FROM attachments WHERE id = ?').bind(id).run();

  return new Response(null, { status: 204 });
}
