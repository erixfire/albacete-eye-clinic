import { requireAuth, errorResponse, successResponse } from '../../_utils.js';

export async function onRequestGet(ctx) {
  const user = await requireAuth(ctx);
  if (!user) return errorResponse('Unauthorized', 401);
  if (user.role !== 'admin') return errorResponse('Admin only', 403);

  const url = new URL(ctx.request.url);
  const entity    = url.searchParams.get('entity') || '';
  const entity_id = url.searchParams.get('entity_id') || '';
  const page      = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit     = 50;
  const offset    = (page - 1) * limit;

  let where = 'WHERE 1=1';
  const params = [];
  if (entity)    { where += ' AND a.entity = ?';    params.push(entity); }
  if (entity_id) { where += ' AND a.entity_id = ?'; params.push(entity_id); }

  const { results: [{ total }] } = await ctx.env.DB.prepare(
    `SELECT COUNT(*) AS total FROM audit_log a ${where}`
  ).bind(...params).all();

  const { results } = await ctx.env.DB.prepare(
    `SELECT a.*, u.full_name AS user_name
     FROM audit_log a
     LEFT JOIN users u ON u.id = a.user_id
     ${where}
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset).all();

  return successResponse({ logs: results, total, page, limit });
}
