/**
 * Cloudflare Pages Function: POST /api/appointments
 * Saves a booking request into D1 and optionally sends an email via MailChannels.
 *
 * D1 binding name: DB  (configure in Cloudflare dashboard or wrangler.toml)
 * Required D1 table: appointment_requests (created by schema.sql)
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  /* ── CORS preflight ── */
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  /* ── Parse body ── */
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const { nombre, apellidos, telefono, email, servicio, fecha, turno, notas } = body;

  /* ── Basic validation ── */
  if (!nombre?.trim() || !telefono?.trim() || !servicio?.trim()) {
    return new Response(JSON.stringify({ error: 'Missing required fields: nombre, telefono, servicio' }), {
      status: 422,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  /* ── Persist to D1 ── */
  try {
    await env.DB.prepare(
      `INSERT INTO appointment_requests
         (nombre, apellidos, telefono, email, servicio, fecha_preferida, turno, notas, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      nombre.trim(),
      apellidos?.trim() ?? '',
      telefono.trim(),
      email?.trim() ?? '',
      servicio.trim(),
      fecha ?? null,
      turno ?? null,
      notas?.trim() ?? ''
    ).run();
  } catch (err) {
    console.error('D1 insert error:', err);
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  /* ── Optional: send email notification via MailChannels ── */
  if (env.NOTIFY_EMAIL) {
    try {
      await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: env.NOTIFY_EMAIL }] }],
          from: { email: 'no-reply@clinica-albacete.es', name: 'Clínica Oftalmológica Albacete' },
          subject: `Nueva cita: ${nombre} — ${servicio}`,
          content: [{
            type: 'text/plain',
            value: `Nueva solicitud de cita:\n\nNombre: ${nombre} ${apellidos}\nTeléfono: ${telefono}\nEmail: ${email}\nServicio: ${servicio}\nFecha preferida: ${fecha ?? 'Sin preferencia'}\nTurno: ${turno ?? 'Sin preferencia'}\nNotas: ${notas ?? '-'}`,
          }],
        }),
      });
    } catch (emailErr) {
      // Non-fatal — appointment is already saved
      console.warn('Email notification failed:', emailErr);
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 201,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

/* ── CORS preflight handler ── */
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
