export async function onRequestGet(context) {
  const { env, params } = context;
  const visit_id = params.id;

  const eyeExam = await env.DB.prepare('SELECT * FROM eye_exams WHERE visit_id = ?').bind(visit_id).first();

  if (!eyeExam) {
    return new Response(JSON.stringify({ error: 'Eye exam not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(eyeExam), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const { env, params, request } = context;
  const visit_id = params.id;
  const body = await request.json();

  // Check if exists
  const existing = await env.DB.prepare('SELECT id FROM eye_exams WHERE visit_id = ?').bind(visit_id).first();

  let result;
  if (existing) {
    result = await env.DB.prepare(
      `UPDATE eye_exams SET 
        va_right_uncorrected = ?, va_right_corrected = ?, va_left_uncorrected = ?, va_left_corrected = ?,
        iop_right = ?, iop_left = ?, refraction_right = ?, refraction_left = ?,
        anterior_segment_right = ?, anterior_segment_left = ?, fundus_right = ?, fundus_left = ?,
        pupil_exam = ?, color_vision_test = ?, additional_notes = ?
      WHERE visit_id = ? RETURNING *`
    ).bind(
      body.va_right_uncorrected || null,
      body.va_right_corrected || null,
      body.va_left_uncorrected || null,
      body.va_left_corrected || null,
      body.iop_right || null,
      body.iop_left || null,
      body.refraction_right || null,
      body.refraction_left || null,
      body.anterior_segment_right || null,
      body.anterior_segment_left || null,
      body.fundus_right || null,
      body.fundus_left || null,
      body.pupil_exam || null,
      body.color_vision_test || null,
      body.additional_notes || null,
      visit_id
    ).all();
  } else {
    result = await env.DB.prepare(
      `INSERT INTO eye_exams (
        visit_id, va_right_uncorrected, va_right_corrected, va_left_uncorrected, va_left_corrected,
        iop_right, iop_left, refraction_right, refraction_left,
        anterior_segment_right, anterior_segment_left, fundus_right, fundus_left,
        pupil_exam, color_vision_test, additional_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
    ).bind(
      visit_id,
      body.va_right_uncorrected || null,
      body.va_right_corrected || null,
      body.va_left_uncorrected || null,
      body.va_left_corrected || null,
      body.iop_right || null,
      body.iop_left || null,
      body.refraction_right || null,
      body.refraction_left || null,
      body.anterior_segment_right || null,
      body.anterior_segment_left || null,
      body.fundus_right || null,
      body.fundus_left || null,
      body.pupil_exam || null,
      body.color_vision_test || null,
      body.additional_notes || null
    ).all();
  }

  return new Response(JSON.stringify(result.results[0]), {
    status: existing ? 200 : 201,
    headers: { 'Content-Type': 'application/json' },
  });
}
