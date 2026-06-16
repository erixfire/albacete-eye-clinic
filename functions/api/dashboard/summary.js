import { successResponse, errorResponse, requireAuth } from '../../_utils.js';

export async function onRequestGet(context) {
  const { env } = context;
  const user = await requireAuth(context);
  if (!user) return errorResponse('Unauthorized', 401);

  const today = new Date().toISOString().split('T')[0];

  // Run all stats in parallel via batch
  const [countResults, recentVisits, lowStockItems] = await Promise.all([
    env.DB.batch([
      // Today's scheduled appointments (staff table)
      env.DB.prepare(
        `SELECT COUNT(*) as count FROM appointments
         WHERE date(appointment_date) = date(?)
         AND status NOT IN ('cancelled','done')
         AND patient_id IS NOT NULL`
      ).bind(today),

      // Total active patients
      env.DB.prepare(
        `SELECT COUNT(*) as count FROM patients WHERE is_active = 1`
      ),

      // Low stock medicines
      env.DB.prepare(
        `SELECT COUNT(*) as count FROM medicines WHERE stock_quantity <= reorder_level`
      ),

      // Expiring within 30 days
      env.DB.prepare(
        `SELECT COUNT(*) as count FROM medicines WHERE date(expiry_date) <= date('now', '+30 days') AND stock_quantity > 0`
      ),

      // Today's completed or in-progress visits
      env.DB.prepare(
        `SELECT COUNT(*) as count FROM visits WHERE date(visit_date) = date(?)`
      ).bind(today),

      // Pending public booking requests
      env.DB.prepare(
        `SELECT COUNT(*) as count FROM appointments WHERE status = 'pending' AND patient_id IS NULL`
      ),
    ]),

    // Last 5 visits with patient name
    env.DB.prepare(
      `SELECT v.id, v.visit_date, v.chief_complaint, v.status,
              p.full_name as patient_name, p.id as patient_id, p.patient_code,
              u.full_name as doctor_name
       FROM visits v
       JOIN patients p ON v.patient_id = p.id
       LEFT JOIN users u ON v.doctor_id = u.id
       ORDER BY v.visit_date DESC
       LIMIT 5`
    ).all(),

    // Low stock items list (top 5)
    env.DB.prepare(
      `SELECT id, name, stock_quantity, reorder_level, unit
       FROM medicines
       WHERE stock_quantity <= reorder_level
       ORDER BY stock_quantity ASC
       LIMIT 5`
    ).all(),
  ]);

  return successResponse({
    today_appointments:    countResults[0].results[0].count,
    total_patients:        countResults[1].results[0].count,
    low_stock_count:       countResults[2].results[0].count,
    expiring_meds_count:   countResults[3].results[0].count,
    today_visits:          countResults[4].results[0].count,
    pending_requests:      countResults[5].results[0].count,
    recent_visits:         recentVisits.results  || [],
    low_stock_items:       lowStockItems.results || [],
  });
}
