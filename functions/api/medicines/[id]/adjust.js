import { requireAuth, errorResponse, successResponse, logAudit } from '../../../_utils.js';

// POST /api/medicines/:id/adjust
// body: { delta: number (positive=add, negative=dispense), reason: string }
export async function onRequestPost(ctx) {
  const user = await requireAuth(ctx);
  if (!user) return errorResponse('Unauthorized', 401);
  if (!['admin', 'pharmacist'].includes(user.role)) return errorResponse('Forbidden', 403);

  const id   = ctx.params.id;
  const body = await ctx.request.json();

  const delta  = Number(body.delta);
  const reason = (body.reason || '').trim();

  if (!Number.isFinite(delta) || delta === 0) return errorResponse('delta must be a non-zero number', 400);
  if (!reason) return errorResponse('reason is required', 400);

  const med = await ctx.env.DB.prepare('SELECT * FROM medicines WHERE id = ?').bind(id).first();
  if (!med) return errorResponse('Medicine not found', 404);

  const newQty = med.stock_quantity + delta;
  if (newQty < 0) return errorResponse(`Cannot reduce below 0. Current stock: ${med.stock_quantity}`, 400);

  await ctx.env.DB.prepare(
    `UPDATE medicines SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).bind(newQty, id).run();

  // Log the transaction
  await ctx.env.DB.prepare(`
    INSERT INTO medicine_transactions (medicine_id, user_id, delta, reason, stock_before, stock_after)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, user.id, delta, reason, med.stock_quantity, newQty).run();

  await logAudit(ctx, user.id, delta > 0 ? 'STOCK_IN' : 'STOCK_OUT', 'medicine', id,
    `${delta > 0 ? '+' : ''}${delta} (${reason}). ${med.stock_quantity} → ${newQty}`);

  const updated = await ctx.env.DB.prepare('SELECT * FROM medicines WHERE id = ?').bind(id).first();
  return successResponse({ medicine: updated, transaction: { delta, reason, stock_before: med.stock_quantity, stock_after: newQty } });
}
