export async function onRequestGet(context) {
  const { env } = context;

  const today = new Date().toISOString().split('T')[0];

  const queries = [
    // Today's appointments count
    env.DB.prepare('SELECT COUNT(*) as count FROM appointments WHERE date(appointment_date) = date(?) AND status != \'cancelled\'').bind(today),
    // Low stock count
    env.DB.prepare('SELECT COUNT(*) as count FROM medicines WHERE stock_quantity <= reorder_level'),
    // Expiring meds count (within 30 days)
    env.DB.prepare('SELECT COUNT(*) as count FROM medicines WHERE date(expiry_date) <= date(\'now\', \'+30 days\')'),
    // Total patients
    env.DB.prepare('SELECT COUNT(*) as count FROM patients')
  ];

  const results = await env.DB.batch(queries);

  return new Response(JSON.stringify({
    today_appointments: results[0].results[0].count,
    low_stock_count: results[1].results[0].count,
    expiring_meds_count: results[2].results[0].count,
    total_patients: results[3].results[0].count
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
