export async function onRequestPost(context) {
  const { env, params, request, data } = context;
  const patient_id = params.id;
  
  const formData = await request.formData();
  const file = formData.get('file');
  const description = formData.get('description') || '';
  const visit_id = formData.get('visit_id') || null;

  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const file_name = file.name;
  const file_type = file.type;
  const r2_key = `${patient_id}/${crypto.randomUUID()}-${file_name}`;

  // Upload to R2
  await env.PATIENT_FILES.put(r2_key, file.stream(), {
    httpMetadata: { contentType: file_type },
  });

  // Save metadata to D1
  const { results } = await env.DB.prepare(
    `INSERT INTO attachments (
      patient_id, visit_id, file_name, file_type, r2_key, description, uploaded_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`
  ).bind(
    patient_id,
    visit_id,
    file_name,
    file_type,
    r2_key,
    description,
    data.user.id
  ).all();

  return new Response(JSON.stringify(results[0]), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestGet(context) {
  const { env, params } = context;
  const patient_id = params.id;

  const { results } = await env.DB.prepare(
    'SELECT * FROM attachments WHERE patient_id = ? ORDER BY uploaded_at DESC'
  ).bind(patient_id).all();

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
}
