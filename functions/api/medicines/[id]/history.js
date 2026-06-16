import { requireAuth, errorResponse, successResponse } from '../../../_utils.js';

// GET /api/medicines/:id/history
export async function onRequestGet(ctx) {
  const user = await requireAuth(ctx);
  if (!user) return errorResponse('Unauthorized', 401);
  if (!['admin', 'pharmacist'].includes(user.role)) return errorResponse('Forbidden', 403);

  const id = ctx.params.id;

  const med = await ctx.env.DB.prepare('SELECT id, name FROM medicines WHERE id = ?').bind(id).first();
  if (!med) return errorResponse('Medicine not found', 404);

  const { results } = await ctx.env.DB.prepare(`
    SELECT mt.*, u.full_name as user_name
    FROM medicine_transactions mt
    LEFT JOIN users u ON u.id = mt.user_id
    WHERE mt.medicine_id = ?
    ORDER BY mt.created_at DESC
    LIMIT 50
  `).bind(id).all();

  return successResponse({ medicine: med, transactions: results });
}
